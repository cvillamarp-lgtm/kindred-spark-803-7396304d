import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS")
    return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { script, title, theme } = await req.json();

    if (!script && !title && !theme) {
      return new Response(
        JSON.stringify({ error: "Se requiere un guión, título o tema" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Eres un director creativo editorial. Extraes contenido de guiones de podcast para producir 15 piezas visuales para redes sociales.

Tu tarea: dado un guión, título o tema de un episodio de podcast, debes extraer y generar:
1. thesis: La tesis central del episodio (1-2 oraciones)
2. keyPhrases: 6 frases clave cortas y contundentes
3. pieceCopy: Un objeto con el copy específico para cada una de las 15 piezas visuales

Las 15 piezas son:
1. Portada 1:1 — necesita: frase principal (2 líneas)
2. Lanzamiento 4:5 — necesita: titular en 3 partes
3. Reel cover 9:16 — necesita: titular corto (2 líneas)
4. Story lanzamiento 9:16 — necesita: titular (3 líneas)
5. Story quote 9:16 — necesita: frase larga en 2 partes
6. Quote feed 4:5 — necesita: frase corta (3 líneas)
7. Carrusel 1 (portada) — necesita: titular (2 líneas)
8. Carrusel 2 — necesita: idea única (2 líneas)
9. Carrusel 3 — necesita: frase tensión partes A y B
10. Carrusel 4 — necesita: frase de impacto + concepto memorable
11. Carrusel 5 — necesita: frase clave (3 líneas)
12. Carrusel 6 — necesita: frase clave + continuación
13. Carrusel 7 — necesita: clímax emocional (3 líneas)
14. Carrusel 8 CTA — copy fijo: GUÁRDALO / COMPÁRTELO / ESCUCHA EL EPISODIO
15. Highlight cover — solo número de episodio

IMPORTANTE:
- Las frases deben ser CONTUNDENTES, CORTAS y EDITORIALES
- Estilo psicológico, íntimo, sobrio — NO motivacional genérico
- Extraer las ideas más poderosas del contenido
- Cada pieza tiene un propósito diferente en el funnel

Responde SOLO en JSON válido con esta estructura exacta:
{
  "thesis": "...",
  "keyPhrases": ["frase1", "frase2", ...],
  "pieceCopy": {
    "1": ["línea1", "línea2"],
    "2": ["parte1", "parte2", "parte3"],
    "3": ["titular", "línea2"],
    "4": ["titular", "línea2", "línea3"],
    "5": ["parte1", "parte2 continuación"],
    "6": ["línea1", "línea2", "línea3"],
    "7": ["titular", "continuación"],
    "8": ["idea", "línea2"],
    "9": ["parte A", "parte B"],
    "10": ["impacto", "concepto"],
    "11": ["frase", "línea2", "línea3"],
    "12": ["frase", "continuación"],
    "13": ["clímax", "línea2", "línea3"],
    "14": ["GUÁRDALO", "COMPÁRTELO"],
    "15": ["XX"]
  }
}`;

    const content = [
      title ? `Título: ${title}` : "",
      theme ? `Tema: ${theme}` : "",
      script ? `Guión:\n${script}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Extrae el contenido para las 15 piezas visuales de este episodio:\n\n${content.substring(0, 8000)}`,
            },
          ],
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Límite de uso alcanzado" }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Error del servicio de IA" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const aiResult = await response.json();
    const rawContent =
      aiResult.choices?.[0]?.message?.content || "{}";

    // Parse JSON, handling possible markdown wrapping
    let parsed;
    try {
      const cleaned = rawContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { error: "No se pudo parsear la respuesta de IA", raw: rawContent };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-content error:", e);
    return new Response(
      JSON.stringify({
        error: e instanceof Error ? e.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
