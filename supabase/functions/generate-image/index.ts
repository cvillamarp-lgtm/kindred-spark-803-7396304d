import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const HOST_REFERENCE_URL = "https://knjhhmqthkpucfxpdhxj.supabase.co/storage/v1/object/public/generated-images/host-reference.png";

const AMTME_BRAND_PROMPT = `INSTRUCCIÓN MAESTRA DE IMAGEN — AMTME (A MÍ TAMPOCO ME EXPLICARON)

PALETA OFICIAL (ÚNICA PERMITIDA):
- Cobalt Blue (principal): #1A1AE6
- Cobalt oscuro (hover/sombra): #1212A0
- Cream / Marfil (tipografía): #F5F0E8
- Amarillo editorial (acento/dominante): #F2C84B
- Negro editorial (base oscura): #0A0A0A
- Blanco limpio (fondos claros): #FFFFFF
- Grises permitidos: #2A2A2A / #555555 / #999999

REGLAS CROMÁTICAS OBLIGATORIAS:
— Solo se usan colores de la paleta oficial. Cualquier color no autorizado es ERROR de producción.
— Máximo 3 colores activos por pieza.
— El amarillo (#F2C84B) solo va en el elemento dominante tipográfico.
— El cobalt azul (#1A1AE6) es el color estructural y de fondo.
— El cream (#F5F0E8) es el color por defecto de la tipografía sobre cobalt.
— No usar glow ni sombra de color activo.

TIPOGRAFÍA:
— Sans serif editorial contemporánea (Inter, Neue Haas, Aktiv Grotesk, Helvetica Neue).
— Jerarquía: 100% / 72% / 60% / 52% / 45% / 38%.
— Tracking dominante: −10 a 0. Tracking CTA: +20 a +30.
— No usar cursivas. No duplicar dominantes. Máx. 2 pesos por bloque.

COMPOSICIÓN:
— Retícula 12 columnas, márgenes 90px, gutter 24px.
— Un solo dominante claro por pieza.
— Balance texto-imagen: la tipografía NO puede tapar la cara del host.
— Máximo 4 grupos visuales, sin elementos flotantes.
— Espacio negativo activo.
— Orden de lectura: Dominante → Contexto → Complemento → Subtítulo → CTA → Firma/logos.

FOTOGRAFÍA DEL HOST (OBLIGATORIO):
— La foto de referencia adjunta es el host real del podcast. PRESERVAR sus rasgos faciales exactos, complexión y apariencia.
— Lente 85mm, f/4, ISO 100. Iluminación frontal suave + relleno lateral.
— Expresión natural, no posada, íntima. Piel realista, sin retoque excesivo.
— La cara del host es el eje visual. Ojos en tercio superior o línea media.
— Acabado cinematográfico, nivel revista editorial.

ELEMENTOS FIJOS EN TODA PIEZA:
— A MÍ TAMPOCO ME EXPLICARON (siempre mayúsculas)
— Ep. XX — (formato de número de episodio)
— CHRISTIAN VILLAMAR (firma, opacidad 85%, escala mínima)
— Logos Spotify + Apple Podcasts (escala 90%, alineados)
— PODCAST (tag, tracking +40, mayúsculas, pequeño)

SAFE ZONES (1080×1350): X 90–990 / Y 120–1230
SAFE ZONES (1080×1080): X 90–990 / Y 90–990
Ningún texto ni elemento visual puede salir de estas coordenadas.

PROHIBIDO:
— Distorsión gran angular, sombras duras, saturación excesiva, filtros artificiales
— Glow, 3D, biseles, gradientes, stickers
— Retoque plástico, estética de red social genérica
— Cursivas, micro-firmas tipo Barra de Navidad
— Colores fuera de la paleta oficial

ESTÁNDAR: La pieza debe entenderse en menos de 0.7 segundos en scroll móvil. Si hay duda sobre un elemento, ajustar. El estándar AMTME es editorial premium.`;

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

    // Always include host reference as first image
    const allReferenceImages = [HOST_REFERENCE_URL, ...(referenceImages || [])];

    const buildContent = (textContent: string, extraImageUrl?: string): any => {
      const parts: any[] = [{ type: "text", text: textContent }];
      // Always add host reference first
      for (const refImg of allReferenceImages) {
        parts.push({ type: "image_url", image_url: { url: refImg } });
      }
      if (extraImageUrl) {
        parts.push({ type: "image_url", image_url: { url: extraImageUrl } });
      }
      return parts;
    };

    let messages: any[];

    if (mode === "edit" && editImageUrl) {
      const editText = `${AMTME_BRAND_PROMPT}\n\nLa PRIMERA foto de referencia es SIEMPRE el host del podcast — debe aparecer con su apariencia exacta, rasgos faciales y complexión. ${allReferenceImages.length > 2 ? "Las fotos adicionales muestran otras personas que también deben aparecer. " : ""}Edita esta imagen: ${prompt}`;
      messages = [{ role: "user", content: buildContent(editText, editImageUrl) }];
    } else {
      const enhancedPrompt = `${AMTME_BRAND_PROMPT}\n\nLa PRIMERA foto de referencia es SIEMPRE el host del podcast — genera la imagen con esta persona exacta, preservando sus rasgos faciales, barba y complexión. ${allReferenceImages.length > 2 ? "Las fotos adicionales muestran otras personas que también deben aparecer. " : ""}Crear: ${prompt}. Artwork editorial premium de podcast, visualmente impactante, diseño moderno.`;
      messages = [{ role: "user", content: buildContent(enhancedPrompt) }];
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
