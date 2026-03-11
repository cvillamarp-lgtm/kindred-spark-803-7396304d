import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { script } = await req.json();

    if (!script || script.trim().length < 50) {
      return new Response(JSON.stringify({ error: "El guión es demasiado corto para analizar" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `Eres un estratega de contenido del podcast "A Mi Tampoco Me Explicaron" (AMTME).
Tu tarea: analizar un guión de podcast y extraer los datos necesarios para producir 15 piezas visuales.
Devuelve ÚNICAMENTE un objeto JSON válido. Sin explicaciones, sin markdown, sin bloques de código.

REGLAS DEL COPY GENERADO:
- MAYÚSCULAS para titulares principales
- Máximo 4-5 palabras por línea
- Frases cortas, directas, con peso emocional
- Estilo: sobrio, editorial, psicológico, sin exclamaciones ni emojis
- Los campos de continuación (linea2, linea3, etc.) pueden ser vacíos si no son necesarios

El JSON debe tener EXACTAMENTE esta estructura:
{
  "seccionA": {
    "numeroEpisodio": "número de 2 dígitos extraído del guión, o '00' si no se menciona",
    "tesisCentral": "la idea núcleo del episodio en 1-2 oraciones directas",
    "frasesClaves": ["frase corta 1", "frase corta 2", "frase corta 3", "frase corta 4", "frase corta 5"]
  },
  "seccionB": {
    "portada": { "linea1": "TITULAR PRINCIPAL", "linea2": "CONTINUACIÓN O VACÍO" },
    "lanzamiento": { "titular1": "LÍNEA 1", "titular2": "LÍNEA 2", "titular3": "LÍNEA 3 O VACÍO" },
    "reel": { "titular": "TITULAR IMPACTANTE CORTO", "linea2": "COMPLEMENTO O VACÍO" },
    "story_lanzamiento": { "titular": "TITULAR", "linea2": "LÍNEA 2", "linea3": "LÍNEA 3 O VACÍO" },
    "story_quote": { "parte1": "FRASE EMOCIONAL PARTE 1", "parte2": "FRASE EMOCIONAL PARTE 2" },
    "quote_feed": { "frase": "FRASE GUARDABLE", "linea2": "CONTINUACIÓN", "linea3": "CIERRE O VACÍO" },
    "slide1": { "titular": "PREGUNTA O TITULAR QUE INVITE A DESLIZAR", "linea2": "COMPLEMENTO O VACÍO" },
    "slide2": { "idea": "CONCEPTO ÚNICO", "linea2": "DESARROLLO BREVE" },
    "slide3": { "parteA": "TENSIÓN PARTE A", "parteB": "CONTRASTE PARTE B" },
    "slide4": { "impacto": "FRASE DE IMPACTO", "concepto": "NOMBRE DEL CONCEPTO CLAVE" },
    "slide5": { "frase": "FRASE CLAVE", "linea2": "CONTINUACIÓN", "linea3": "CIERRE" },
    "slide6": { "frase": "FRASE CONTUNDENTE", "linea2": "COMPLEMENTO" },
    "slide7": { "climax": "FRASE MÁS PODEROSA DEL EPISODIO", "linea2": "CONTINUACIÓN", "linea3": "RESOLUCIÓN" },
    "slide8": {},
    "highlight": { "numero": "mismo número que seccionA.numeroEpisodio" }
  }
}`;

    const userPrompt = `Analiza este guión de podcast y extrae el copy para todas las piezas visuales:\n\n${script.substring(0, 8000)}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Límite de uso alcanzado, intenta de nuevo más tarde." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados." }), {
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
    const rawContent: string = data.choices?.[0]?.message?.content ?? "";

    const cleaned = rawContent
      .replace(/^```json?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse error. Raw content:", rawContent);
      return new Response(JSON.stringify({ error: "La IA no devolvió un JSON válido. Intenta de nuevo." }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("extract-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
