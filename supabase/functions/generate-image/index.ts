import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const AMTME_BRAND_PROMPT = `Brand identity: AMTME podcast ("A mi tampoco me explicaron"). 
Style: dark navy backgrounds (#0A0B14), premium minimal aesthetic, editorial photography look.
Color palette: deep navy (#0B1120), electric blue accents (#2563EB), warm gold (#D4A853), teal (#0D9488), sand (#C2B280).
Typography feel: clean geometric sans-serif (Space Grotesk style), bold headlines.
Mood: authoritative yet approachable, premium but accessible, modern Latin American professional.
Visual language: clean compositions, dramatic lighting, subtle gradients, high contrast.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseAuth.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { prompt, mode, imageUrl: editImageUrl, episodeId, referenceImages } = body;
    
    if (!prompt && mode !== "edit") throw new Error("Prompt is required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let messages: any[];

    // Build content parts with reference images
    const buildContentWithRefs = (textContent: string, extraImageUrl?: string): any => {
      const hasRefs = referenceImages && referenceImages.length > 0;
      if (!hasRefs && !extraImageUrl) return textContent;
      
      const parts: any[] = [{ type: "text", text: textContent }];
      if (extraImageUrl) {
        parts.push({ type: "image_url", image_url: { url: extraImageUrl } });
      }
      if (hasRefs) {
        for (const refImg of referenceImages) {
          parts.push({ type: "image_url", image_url: { url: refImg } });
        }
      }
      return parts;
    };

    if (mode === "edit" && editImageUrl) {
      const editText = `${AMTME_BRAND_PROMPT}\n\nThe FIRST reference photo is ALWAYS the podcast host — he must appear in the image with his exact appearance, facial features, and build. ${referenceImages?.length > 1 ? "Additional reference photos show other people who should also appear. " : ""}Edit this image: ${prompt}`;
      messages = [{ role: "user", content: buildContentWithRefs(editText, editImageUrl) }];
    } else {
      const hostNote = referenceImages?.length ? "The FIRST reference photo is ALWAYS the podcast host — generate the image featuring this exact person with his appearance, facial features, beard, and build. " : "";
      const guestNote = referenceImages?.length > 1 ? "Additional reference photos show other people who should also appear in the image. " : "";
      const enhancedPrompt = `${AMTME_BRAND_PROMPT}\n\n${hostNote}${guestNote}Create: ${prompt}. Professional podcast artwork, visually striking, modern design.`;
      messages = [{ role: "user", content: buildContentWithRefs(enhancedPrompt) }];
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages,
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de uso alcanzado, intenta de nuevo más tarde." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Agrega fondos en Settings → Workspace → Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const imageDataUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const text = data.choices?.[0]?.message?.content || "";

    if (!imageDataUrl) {
      return new Response(JSON.stringify({ error: "No se pudo generar la imagen" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store in Supabase Storage
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Ensure bucket exists
    const { error: bucketError } = await supabase.storage.createBucket("generated-images", {
      public: true,
      fileSizeLimit: 10485760,
    });
    if (bucketError && !bucketError.message.includes("already exists")) {
      console.error("Bucket error:", bucketError);
    }

    // Decode base64 and upload
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    const fileName = `img_${Date.now()}.png`;

    const { error: uploadError } = await supabase.storage
      .from("generated-images")
      .upload(fileName, binaryData, { contentType: "image/png", upsert: true });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(JSON.stringify({ imageUrl: imageDataUrl, text, stored: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: publicUrlData } = supabase.storage.from("generated-images").getPublicUrl(fileName);
    const finalUrl = publicUrlData.publicUrl;

    // If episodeId provided, update episode cover
    if (episodeId) {
      const { error: updateError } = await supabase
        .from("episodes")
        .update({ cover_image_url: finalUrl })
        .eq("id", episodeId);
      if (updateError) console.error("Episode update error:", updateError);
    }

    return new Response(JSON.stringify({
      imageUrl: finalUrl,
      text,
      stored: true,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-image error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
