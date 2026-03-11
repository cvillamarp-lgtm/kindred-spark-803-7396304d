import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { toast } from "sonner";

// ─── TIPOS ────────────────────────────────────────────────────────────────────

interface EpisodeData {
  numero: string;
  tesis: string;
  copy_portada: string;
  copy_lanzamiento: string;
  copy_reel: string;
  copy_story_lanzamiento: string;
  copy_story_quote: string;
  copy_quote_feed: string;
  copy_slide1: string;
  copy_slide2: string;
  copy_slide3: string;
  copy_slide4: string;
  copy_slide5: string;
  copy_slide6: string;
  copy_slide7: string;
  copy_slide8: string;
  copy_highlight: string;
}

interface Pieza {
  id: string;
  nombre: string;
  formato: string;
  px: string;
  safeZone: string;
  composicion: string;
  copyKey: keyof EpisodeData;
}

// ─── SISTEMA FIJO DE PIEZAS ───────────────────────────────────────────────────

const PIEZAS: Pieza[] = [
  {
    id: "portada",
    nombre: "Portada Episodio",
    formato: "Feed 1:1",
    px: "1080×1080 px",
    safeZone: "Margen interno mínimo 80 px por lado",
    composicion:
      "Portada autónoma legible en miniatura. Jerarquía: (1) frase principal, (2) host, (3) EP.XX / nombre del podcast. Host con presencia editorial limpia, centrado o ligeramente desplazado. Espacio negativo generoso. Verde solo como microacento en EP.XX, subrayado o etiqueta.",
    copyKey: "copy_portada",
  },
  {
    id: "lanzamiento",
    nombre: "Lanzamiento Principal",
    formato: "Feed 4:5",
    px: "1080×1350 px",
    safeZone: "x: 72–1008 px · y: 90–1260 px",
    composicion:
      "Pieza de anuncio principal. Jerarquía: (1) titular dominante, (2) host, (3) señal de lanzamiento, (4) EP.XX / Instagram. Host ocupa zona fuerte sin competir con titular. Verde como acento mínimo en 'NUEVO EPISODIO' o barra/etiqueta. Seria, editorial, muy clara.",
    copyKey: "copy_lanzamiento",
  },
  {
    id: "reel",
    nombre: "Reel Cover",
    formato: "9:16",
    px: "1080×1920 px",
    safeZone: "x: 90–990 px · y: 250–1670 px. Rostro y titular dentro del área central compatible con recorte 4:5.",
    composicion:
      "Portada vertical limpia, contundente, legible tanto en story como en crop de feed. Jerarquía: (1) titular corto, (2) host, (3) EP.XX / marca. Encuadre editorial vertical. Evitar texto largo. Título debe leerse instantáneamente.",
    copyKey: "copy_reel",
  },
  {
    id: "story_lanzamiento",
    nombre: "Story de Lanzamiento",
    formato: "9:16",
    px: "1080×1920 px",
    safeZone: "Laterales: 90 px · Superior: 250 px · Inferior: 250 px",
    composicion:
      "Lectura en segundos. Jerarquía: (1) titular, (2) CTA, (3) host, (4) EP.XX / usuario. Verde solo para CTA o 'NUEVO EPISODIO'. No saturar. Mucho espacio negativo.",
    copyKey: "copy_story_lanzamiento",
  },
  {
    id: "story_quote",
    nombre: "Story Quote",
    formato: "9:16",
    px: "1080×1920 px",
    safeZone: "Laterales: 90 px · Superior: 250 px · Inferior: 250 px",
    composicion:
      "Pieza centrada en la frase. Host secundario o como recorte sutil. Prioridad: lectura emocional del quote. Mucha contención visual. Puede usarse línea fina, caja o acento mínimo en verde.",
    copyKey: "copy_story_quote",
  },
  {
    id: "quote_feed",
    nombre: "Quote Feed",
    formato: "Feed 4:5",
    px: "1080×1350 px",
    safeZone: "x: 72–1008 px · y: 90–1260 px",
    composicion:
      "Frase dominante. Marca pequeña. Host muy sutil o ausente si la pieza funciona mejor tipográfica. Sensación editorial guardable y compartible.",
    copyKey: "copy_quote_feed",
  },
  {
    id: "slide1",
    nombre: "Carrusel — Slide 1 (Portada)",
    formato: "Feed 1:1",
    px: "1080×1080 px",
    safeZone: "Margen interno mínimo 80 px por lado",
    composicion:
      "Portada autónoma del carrusel. Jerarquía: (1) titular, (2) host, (3) numeración / episodio.",
    copyKey: "copy_slide1",
  },
  {
    id: "slide2",
    nombre: "Carrusel — Slide 2",
    formato: "Feed 1:1",
    px: "1080×1080 px",
    safeZone: "Margen interno mínimo 80 px por lado",
    composicion: "Una sola idea visual. Máxima contundencia. Puede ser muy tipográfico.",
    copyKey: "copy_slide2",
  },
  {
    id: "slide3",
    nombre: "Carrusel — Slide 3",
    formato: "Feed 1:1",
    px: "1080×1080 px",
    safeZone: "Margen interno mínimo 80 px por lado",
    composicion:
      "Organizar el texto para expresar tensión y loop. Usar separación de bloques para reforzar distancia entre ideas.",
    copyKey: "copy_slide3",
  },
  {
    id: "slide4",
    nombre: "Carrusel — Slide 4",
    formato: "Feed 1:1",
    px: "1080×1080 px",
    safeZone: "Margen interno mínimo 80 px por lado",
    composicion:
      "Dar protagonismo a la frase de impacto central. Verde como acento mínimo si ayuda a memorabilidad.",
    copyKey: "copy_slide4",
  },
  {
    id: "slide5",
    nombre: "Carrusel — Slide 5",
    formato: "Feed 1:1",
    px: "1080×1080 px",
    safeZone: "Margen interno mínimo 80 px por lado",
    composicion: "Muy tipográfico. Sobrio. Directo.",
    copyKey: "copy_slide5",
  },
  {
    id: "slide6",
    nombre: "Carrusel — Slide 6",
    formato: "Feed 1:1",
    px: "1080×1080 px",
    safeZone: "Margen interno mínimo 80 px por lado",
    composicion: "Bloques tipográficos tensos. Alta legibilidad.",
    copyKey: "copy_slide6",
  },
  {
    id: "slide7",
    nombre: "Carrusel — Slide 7",
    formato: "Feed 1:1",
    px: "1080×1080 px",
    safeZone: "Margen interno mínimo 80 px por lado",
    composicion:
      "Clímax emocional del carrusel. Más espacio negativo. Máxima contención.",
    copyKey: "copy_slide7",
  },
  {
    id: "slide8",
    nombre: "Carrusel — Slide 8 (CTA Final)",
    formato: "Feed 1:1",
    px: "1080×1080 px",
    safeZone: "Margen interno mínimo 80 px por lado",
    composicion:
      "Cierre claro. CTA directo. Verde solo como acento puntual.",
    copyKey: "copy_slide8",
  },
  {
    id: "highlight",
    nombre: "Highlight Cover",
    formato: "Feed 1:1",
    px: "1080×1080 px",
    safeZone: "Elemento principal centrado dentro de zona circular segura amplia",
    composicion:
      "Sin texto largo. Solo número del episodio o 'EP'. Diseño mínimo reconocible en miniatura. Fondo COBALT (#193497) o PAPER (#F9F6EF). Acento verde solo si mejora reconocimiento.",
    copyKey: "copy_highlight",
  },
];

// ─── INSTRUCCIÓN MAESTRA FIJA ─────────────────────────────────────────────────

const INSTRUCCION_FIJA = `
PALETA ÚNICA PERMITIDA (SOLO ESTOS COLORES — cualquier color fuera = ERROR de producción)
COBALT #1A1AE6 · COBALT DARK #1212A0 · CREAM #F5F0E8 · AMARILLO #F2C84B · NEGRO #0A0A0A · BLANCO #FFFFFF · GRIS SECUNDARIO #CCCCCC · GRIS FIRMA #888888

REGLAS DE COLOR
- Máximo 3 colores activos por pieza (fondo + cream + amarillo)
- El amarillo (#F2C84B) SOLO va en el elemento dominante tipográfico (nivel 1)
- El cobalt azul (#1A1AE6) es color estructural y de fondo
- El cream (#F5F0E8) es tipografía por defecto sobre cobalt o negro
- El negro editorial (#0A0A0A) como fondo alternativo
- No usar glow ni sombra de color activo
- Amarillo: saturación −10%, sin glow
- Cobalt fondo: luminosidad −5% para mayor peso visual

ESTÉTICA OBLIGATORIA
Editorial · contemporánea · limpia · psicológica · sobria · íntima · memorable · emocionalmente madura
La pieza debe entenderse en menos de 0.7 segundos en scroll móvil

SISTEMA TIPOGRÁFICO (6 NIVELES)
Nivel 1 — Dominante: 100% (72-88px), Black/ExtraBold, #F2C84B, tracking −10 a 0, interlineado −8% a −10%
Nivel 2 — Secundario: 72% (52-64px), Bold/SemiBold, #F5F0E8, tracking +10
Nivel 3 — Terciario: 60% (44-52px), Medium/Regular, #F5F0E8, tracking +10 a +15
Nivel 4 — Subtítulo: 52% (36-44px), Regular/Light, #CCCCCC, tracking +15
Nivel 5 — CTA: 45% (32-38px), Medium/Condensado, #F5F0E8 opacidad 90%, tracking +20 a +30
Nivel 6 — Firma/Logos: 38% (24-28px), Light, #888888 opacidad 85%, tracking +30 a +40

REGLAS TIPOGRÁFICAS
Sans serif editorial contemporánea. No usar cursivas. No duplicar dominantes. Máx. 2 pesos por bloque. Mayúsculas siempre.

HOST (OBLIGATORIO — usar foto de referencia)
Hombre latino, 35–42 años, barba corta, tatuaje brazo izquierdo visible, cap verde.
Lente 85mm, f/4, ISO 100. Iluminación frontal suave. Expresión natural, íntima, no posada.
Piel realista, sin retoque excesivo. Acabado cinematográfico editorial.
IMAGEN 01: Sentado al revés en silla de madera, camiseta blanca AMTME, fondo negro #0A0A0A.
IMAGEN 02: Sentado en suelo, camiseta azul AMTME, fondo cobalt #1A1AE6 o negro #0A0A0A.

COMPOSICIÓN
Retícula 12 columnas, márgenes 90px, gutter 24px. Un solo dominante claro. Máximo 4 grupos visuales.
Tipografía NO puede tapar la cara del host. Mínimo 40px entre grupos. Espacio negativo activo.
Orden lectura: Dominante → Contexto → Complemento → Subtítulo → CTA → Firma/logos.

SAFE ZONES
1080×1080: X 90–990 / Y 90–990
1080×1350: X 90–990 / Y 120–1230
1080×1920: X 90–990 / Y 250–1670

ELEMENTOS FIJOS
- A MÍ TAMPOCO ME EXPLICARON (siempre mayúsculas)
- Ep. XX — (formato número episodio)
- CHRISTIAN VILLAMAR (firma, #888888, opacidad 85%, tracking +30)
- Logos Spotify + Apple Podcasts (blanco #FFFFFF, escala 90%, alineados, separación 24px)
- PODCAST (tag, tracking +40, mayúsculas)

EFECTOS PERMITIDOS
Grano editorial muy sutil · bloques sólidos · filetes finos · subrayados · cajas limpias · recortes precisos

EFECTOS PROHIBIDOS
Glow · sombras dramáticas · 3D · biseles · stickers · gradientes · motivacional barato · gran angular · saturación excesiva · filtros artificiales · retoque plástico · estética genérica · cursivas

DEFINICIÓN DE LISTO
- Safe zones respetadas · Solo paleta AMTME · Un solo dominante en #F2C84B
- Escala tipográfica correcta · Host en eje áureo · Se entiende en <0.7s
- Nombre, Ep. XX, firma y logos presentes · Sin cursivas · Lista para publicar
`.trim();

// ─── GENERADOR DE PROMPT ──────────────────────────────────────────────────────

function generarPrompt(pieza: Pieza, data: EpisodeData): string {
  const copy = data[pieza.copyKey] || "[COPY PENDIENTE]";
  return `OBJETIVO
Crear UNA SOLA pieza visual final del episodio ${data.numero} de "A Mi Tampoco Me Explicaron".
No crear variantes. No crear múltiples formatos. No crear sistema completo.
Solo producir la pieza especificada en "PIEZA OBJETIVO".

PIEZA OBJETIVO
${pieza.nombre} — ${pieza.formato}

FORMATO
${pieza.px}

SAFE ZONES OBLIGATORIAS
${pieza.safeZone}

CONTEXTO DE MARCA
Podcast: A Mi Tampoco Me Explicaron
Host: Christian Villamar
Instagram: @yosoyvillamar
Episodio: ${data.numero}

TESIS CENTRAL DEL EPISODIO
"${data.tesis}"

${INSTRUCCION_FIJA}

COPY OBLIGATORIO DE LA PIEZA
${copy}

COMPOSICIÓN
${pieza.composicion}`;
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────

const EMPTY_DATA: EpisodeData = {
  numero: "",
  tesis: "",
  copy_portada: "",
  copy_lanzamiento: "",
  copy_reel: "",
  copy_story_lanzamiento: "",
  copy_story_quote: "",
  copy_quote_feed: "",
  copy_slide1: "",
  copy_slide2: "",
  copy_slide3: "",
  copy_slide4: "",
  copy_slide5: "",
  copy_slide6: "",
  copy_slide7: "",
  copy_slide8: "",
  copy_highlight: "",
};

const COPY_LABELS: { key: keyof EpisodeData; label: string; placeholder: string }[] = [
  { key: "copy_portada", label: "Copy — Portada 1:1", placeholder: "EL FINAL REAL\nES CUANDO\nEL ANSIOSO\nSE APAGA\n\nEP. XX\nA MI TAMPOCO ME EXPLICARON" },
  { key: "copy_lanzamiento", label: "Copy — Lanzamiento 4:5", placeholder: "EL FINAL REAL\nNO ES CUANDO\nSE VA\n\nES CUANDO\nTÚ TE APAGAS\n\nNUEVO EPISODIO\nEP. XX\n@yosoyvillamar" },
  { key: "copy_reel", label: "Copy — Reel Cover", placeholder: "EL FINAL REAL\nES CUANDO\nTE APAGAS\n\nEP. XX\nA MI TAMPOCO ME EXPLICARON" },
  { key: "copy_story_lanzamiento", label: "Copy — Story Lanzamiento", placeholder: "NUEVO EPISODIO\n\nTITULO CORTO\n\nESCÚCHALO YA\nEP. XX\n@yosoyvillamar" },
  { key: "copy_story_quote", label: "Copy — Story Quote", placeholder: "FRASE EMOCIONAL\nDEL EPISODIO.\n\nEP. XX\nA MI TAMPOCO ME EXPLICARON" },
  { key: "copy_quote_feed", label: "Copy — Quote Feed 4:5", placeholder: "FRASE CORTA\nY CONTUNDENTE\n\nEP. XX\nA MI TAMPOCO ME EXPLICARON" },
  { key: "copy_slide1", label: "Copy — Slide 1 (Portada carrusel)", placeholder: "FRASE DE\nANCLAJE\n\n01\nEP. XX" },
  { key: "copy_slide2", label: "Copy — Slide 2", placeholder: "IDEA\nIMPACTO\n\n02" },
  { key: "copy_slide3", label: "Copy — Slide 3", placeholder: "CUANDO X\nY CUANDO X\nZ\n\n03" },
  { key: "copy_slide4", label: "Copy — Slide 4", placeholder: "FRASE\nDE IMPACTO\n\n04" },
  { key: "copy_slide5", label: "Copy — Slide 5", placeholder: "FRASE\nSOBRIA\n\n05" },
  { key: "copy_slide6", label: "Copy — Slide 6", placeholder: "BLOQUE\nTENSO\n\n06" },
  { key: "copy_slide7", label: "Copy — Slide 7 (Clímax)", placeholder: "FRASE\nFINAL\nEMOCIONAL\n\n07" },
  { key: "copy_slide8", label: "Copy — Slide 8 (CTA)", placeholder: "GUÁRDALO\nCOMPÁRTELO\n\nESCUCHA\nEL EPISODIO XX\n\n@yosoyvillamar\n\n08" },
  { key: "copy_highlight", label: "Copy — Highlight Cover", placeholder: "XX" },
];

export default function VisualPromptGenerator() {
  const [data, setData] = useState<EpisodeData>(EMPTY_DATA);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>("portada");
  const [copiedAll, setCopiedAll] = useState(false);
  const [showCopyForm, setShowCopyForm] = useState(false);

  const update = (key: keyof EpisodeData, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const copyPrompt = (pieza: Pieza) => {
    const prompt = generarPrompt(pieza, data);
    navigator.clipboard.writeText(prompt);
    setCopiedId(pieza.id);
    toast.success(`Prompt de "${pieza.nombre}" copiado`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const copyAll = () => {
    const all = PIEZAS.map(
      (p, i) => `${"─".repeat(60)}\nPIEZA ${i + 1} DE 15\n${"─".repeat(60)}\n\n${generarPrompt(p, data)}`
    ).join("\n\n\n");
    navigator.clipboard.writeText(all);
    setCopiedAll(true);
    toast.success("Los 15 prompts copiados");
    setTimeout(() => setCopiedAll(false), 2500);
  };

  const isReady = data.numero.trim() && data.tesis.trim();

  return (
    <div className="page-container animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Generador de Prompts Visuales</h1>
          <p className="page-subtitle">
            Completa los datos del episodio y obtén las 15 instrucciones listas para tu generador de imágenes.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {PIEZAS.length} piezas
        </Badge>
      </div>

      {/* Paso 1 — Datos base */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">1</span>
            Datos del episodio
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Número del episodio *</Label>
              <Input
                placeholder="Ej: EP. 14"
                value={data.numero}
                onChange={(e) => update("numero", e.target.value)}
                className="font-mono"
              />
            </div>
            <div>
              <Label>Tesis central del episodio *</Label>
              <Textarea
                placeholder="Ej: El final real no es cuando se va. Es cuando tú te apagas."
                value={data.tesis}
                onChange={(e) => update("tesis", e.target.value)}
                rows={2}
                className="resize-none text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Paso 2 — Copy por pieza */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">2</span>
              Copy de cada pieza
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowCopyForm((v) => !v)}
            >
              {showCopyForm ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              {showCopyForm ? "Ocultar" : "Mostrar campos"}
            </Button>
          </div>
        </CardHeader>
        {showCopyForm && (
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Escribe el copy exacto que debe aparecer en cada pieza, tal como lo quieres tipografiado. Usa saltos de línea para separar bloques.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COPY_LABELS.map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label className="text-xs">{label}</Label>
                  <Textarea
                    placeholder={placeholder}
                    value={data[key]}
                    onChange={(e) => update(key, e.target.value)}
                    rows={4}
                    className="resize-y text-xs font-mono"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Paso 3 — Prompts generados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">3</span>
            <span className="text-sm font-semibold text-foreground">Prompts generados</span>
          </div>
          <Button
            size="sm"
            onClick={copyAll}
            disabled={!isReady}
            className="gap-2"
          >
            {copiedAll ? <Check className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
            {copiedAll ? "Copiados" : "Copiar los 15"}
          </Button>
        </div>

        {!isReady && (
          <div className="surface p-4 text-center text-sm text-muted-foreground">
            Completa el número y la tesis del episodio para generar los prompts.
          </div>
        )}

        {isReady && (
          <div className="space-y-2">
            {PIEZAS.map((pieza, idx) => {
              const isExpanded = expandedId === pieza.id;
              const prompt = generarPrompt(pieza, data);
              return (
                <Card key={pieza.id} className="overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-secondary/40 transition-colors text-left"
                    onClick={() => setExpandedId(isExpanded ? null : pieza.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-muted-foreground w-6">{String(idx + 1).padStart(2, "0")}</span>
                      <div>
                        <p className="text-sm font-medium text-foreground">{pieza.nombre}</p>
                        <p className="text-[11px] text-muted-foreground">{pieza.formato} · {pieza.px}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyPrompt(pieza);
                        }}
                      >
                        {copiedId === pieza.id ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        {copiedId === pieza.id ? "Copiado" : "Copiar"}
                      </Button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-5 pb-4 pt-1 border-t border-border">
                      <pre className="text-xs text-foreground/80 font-mono whitespace-pre-wrap leading-relaxed bg-secondary/30 rounded-lg p-4 overflow-x-auto">
                        {prompt}
                      </pre>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}