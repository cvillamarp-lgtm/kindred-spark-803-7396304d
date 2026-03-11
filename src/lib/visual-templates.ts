// Plantilla Maestra de Producción Visual AMTME — 15 piezas

export interface VisualPiece {
  id: number;
  name: string;
  shortName: string;
  format: string;
  width: number;
  height: number;
  safeZones: string;
  copyTemplate: string[];
  compositionNotes: string;
}

export const BRAND_CONTEXT = {
  podcast: "A MÍ TAMPOCO ME EXPLICARON",
  host: "CHRISTIAN VILLAMAR · @yosoyvillamar",
  hostReferenceUrl: "https://knjhhmqthkpucfxpdhxj.supabase.co/storage/v1/object/public/generated-images/host-reference.png",
  palette: {
    cobalt: "#1A1AE6",
    cobaltDark: "#1212A0",
    cream: "#F5F0E8",
    yellow: "#F2C84B",
    black: "#0A0A0A",
    white: "#FFFFFF",
    grayDark: "#2A2A2A",
    grayMid: "#555555",
    grayLight: "#999999",
  },
  colorRules: [
    "Solo se usan los colores de la paleta oficial AMTME — cualquier color no autorizado es error de producción",
    "Máximo 3 colores activos por pieza",
    "El amarillo (#F2C84B) solo va en el elemento dominante tipográfico",
    "El cobalt azul (#1A1AE6) es el color estructural y de fondo",
    "El cream (#F5F0E8) es el color por defecto de la tipografía sobre cobalt",
    "El negro editorial (#0A0A0A) se usa en fondos claros o texto sobre claro",
    "No usar glow ni sombra de color activo",
    "Amarillo editorial: saturación −10%, sin glow, solo en dominante",
    "Azul cobalt: luminosidad −5% para mayor peso visual",
  ],
  typography: [
    "Sans serif editorial contemporánea (ej: Inter, Neue Haas, Aktiv Grotesk, Helvetica Neue)",
    "Jerarquía de escala: 100% / 72% / 60% / 52% / 45% / 38%",
    "Tracking dominante: −10 a 0 (compacto, impacto editorial)",
    "Tracking CTA: +20 a +30 (aireado, no publicitario)",
    "Interlineado dominante: −8 a −10% (mayor densidad visual)",
    "No usar cursivas en ningún elemento de marca",
    "No mezclar más de 2 pesos en un mismo bloque",
    "No duplicar dominantes: solo un elemento puede ser el dominante",
    "Máx. 12-16 palabras por línea de texto",
  ],
  hostDescription:
    "Hombre latino, 35-42 años, barba corta, complexión natural. Expresión natural, no posada, íntima. Piel realista, textura nítida, sin retoque excesivo. Lente 85mm, f/4, ISO 100. Iluminación frontal suave + relleno lateral leve. Acabado cinematográfico, nivel revista editorial. La cara del host es el eje visual; ojos en tercio superior o línea media. Mover host: +40px arriba / +20px derecha para eje áureo.",
  aesthetic:
    "Editorial · contemporánea · limpia · psicológica · sobria · íntima · memorable. La pieza debe entenderse en menos de 0.7 segundos en scroll móvil.",
  composition: [
    "Retícula obligatoria de 12 columnas, márgenes exteriores 90px, gutter 24px",
    "Un solo dominante claro por pieza — no hay competencia de jerarquías",
    "Balance texto-imagen: la tipografía no puede tapar la cara del host",
    "Máximo 4 grupos visuales por pieza, sin elementos flotantes",
    "Espacio negativo activo: no es vacío, es respiración",
    "Orden de lectura: 1→Dominante emocional 2→Contexto/pregunta 3→Complemento 4→Subtítulo 5→CTA 6→Logos/firma",
  ],
  fixedElements: [
    "Nombre del podcast: A MÍ TAMPOCO ME EXPLICARON — siempre en mayúsculas",
    "Número de episodio: formato Ep. XX —",
    "Firma del host: CHRISTIAN VILLAMAR · opacidad 85% · escala mínima",
    "Logos: Spotify + Apple Podcasts · escala 90% · alineados",
    "Tag: PODCAST · tracking +40 · mayúsculas · pequeño",
  ],
  allowedEffects:
    "Grano editorial muy sutil / bloques sólidos / filetes finos / subrayados / cajas limpias",
  prohibitedEffects:
    "Glow / sombras dramáticas / 3D / biseles / stickers / gradientes llamativos / motivacional barato / gran angular / saturación excesiva / filtros artificiales / retoque plástico / estética de red social genérica",
  readyChecklist: [
    "Resolución correcta para formato de destino",
    "Safe zones respetadas en todos los ejes",
    "Solo paleta AMTME — sin colores no autorizados",
    "Un solo dominante claro",
    "Host en eje áureo, ojos en tercio superior",
    "Se entiende en 0.5s en scroll",
    "Escala tipográfica proporcional aplicada",
    "Nombre del podcast, Ep. XX, firma y logos presentes",
    "Sin cursivas, sin micro-firmas tipo Barra de Navidad",
    "Lista para publicar",
  ],
};

export const VISUAL_PIECES: VisualPiece[] = [
  {
    id: 1,
    name: "Portada Episodio",
    shortName: "Portada",
    format: "Feed 1:1",
    width: 1080,
    height: 1080,
    safeZones: "80 px todos los lados",
    copyTemplate: [
      "[FRASE PRINCIPAL EPISODIO]",
      "[LÍNEA 2]",
      "",
      "EP. XX",
      "A MI TAMPOCO ME EXPLICARON",
    ],
    compositionNotes:
      "Jerarquía: 1) frase principal  2) host  3) EP. XX / nombre del podcast. Host con presencia editorial limpia. Centrado o ligeramente desplazado. Espacio negativo generoso. Verde solo como microacento en EP. XX o etiqueta. Legible en miniatura de Spotify y feed.",
  },
  {
    id: 2,
    name: "Lanzamiento Principal",
    shortName: "Lanzamiento",
    format: "Feed 4:5",
    width: 1080,
    height: 1350,
    safeZones: "x: 72–1008  ·  y: 90–1260",
    copyTemplate: [
      "[TITULAR PARTE 1]",
      "[TITULAR PARTE 2]",
      "[TITULAR PARTE 3]",
      "",
      "NUEVO EPISODIO",
      "EP. XX",
      "@yosoyvillamar",
    ],
    compositionNotes:
      "Jerarquía: 1) titular dominante  2) host  3) señal lanzamiento  4) EP. XX / Instagram. Host fuerte pero sin competir con el titular. Verde solo en 'NUEVO EPISODIO' o barra/etiqueta. Seria, editorial, muy clara.",
  },
  {
    id: 3,
    name: "Reel Cover",
    shortName: "Reel",
    format: "9:16",
    width: 1080,
    height: 1920,
    safeZones: "x: 90–990  ·  y: 250–1670",
    copyTemplate: [
      "[TITULAR CORTO]",
      "[LÍNEA 2]",
      "",
      "EP. XX",
      "A MI TAMPOCO ME EXPLICARON",
    ],
    compositionNotes:
      "Encuadre editorial vertical. Titular legible en crop 4:5 de feed. Jerarquía: 1) titular  2) host  3) EP. XX / marca. Evitar texto largo. El título se lee instantáneamente.",
  },
  {
    id: 4,
    name: "Story de Lanzamiento",
    shortName: "Story Launch",
    format: "9:16",
    width: 1080,
    height: 1920,
    safeZones: "Laterales: 90 px  ·  Superior: 250 px  ·  Inferior: 250 px",
    copyTemplate: [
      "NUEVO EPISODIO",
      "",
      "[TITULAR]",
      "[LÍNEA 2]",
      "[LÍNEA 3]",
      "",
      "ESCÚCHALO YA",
      "EP. XX",
      "@yosoyvillamar",
    ],
    compositionNotes:
      "Jerarquía: 1) titular  2) CTA  3) host  4) EP. XX / usuario. Verde solo en CTA o 'NUEVO EPISODIO'. No saturar. Mucho espacio negativo. Lee en segundos.",
  },
  {
    id: 5,
    name: "Story Quote",
    shortName: "Story Quote",
    format: "9:16",
    width: 1080,
    height: 1920,
    safeZones: "Laterales: 90 px  ·  Superior: 250 px  ·  Inferior: 250 px",
    copyTemplate: [
      "[FRASE LARGA PARTE 1]",
      "",
      "[FRASE LARGA PARTE 2]",
      "[CONTINUACIÓN]",
      "",
      "EP. XX",
      "A MI TAMPOCO ME EXPLICARON",
    ],
    compositionNotes:
      "Pieza centrada en la frase. Prioridad es la lectura emocional del quote. Host puede aparecer de forma secundaria o como recorte sutil. Mucha contención visual. Línea fina, caja o acento mínimo en verde.",
  },
  {
    id: 6,
    name: "Quote Feed",
    shortName: "Quote Feed",
    format: "Feed 4:5",
    width: 1080,
    height: 1350,
    safeZones: "x: 72–1008  ·  y: 90–1260",
    copyTemplate: [
      "[FRASE CORTA]",
      "[LÍNEA 2]",
      "[LÍNEA 3]",
      "",
      "EP. XX",
      "A MI TAMPOCO ME EXPLICARON",
    ],
    compositionNotes:
      "La frase es dominante. La marca queda pequeña. Host puede ir muy sutil o no aparecer si la pieza funciona mejor tipográfica. Sensación editorial, guardable y compartible.",
  },
  {
    id: 7,
    name: "Carrusel Slide 1 — Portada",
    shortName: "Carrusel 1",
    format: "1:1",
    width: 1080,
    height: 1080,
    safeZones: "80 px todos los lados",
    copyTemplate: ["[TITULAR SLIDE 1]", "[CONTINUACIÓN]", "", "01", "EP. XX"],
    compositionNotes:
      "Portada autónoma del carrusel. Jerarquía: 1) titular  2) host  3) numeración / episodio.",
  },
  {
    id: 8,
    name: "Carrusel Slide 2",
    shortName: "Carrusel 2",
    format: "1:1",
    width: 1080,
    height: 1080,
    safeZones: "80 px todos los lados",
    copyTemplate: ["[IDEA ÚNICA]", "[LÍNEA 2]", "", "02"],
    compositionNotes:
      "Una sola idea visual. Máxima contundencia. Puede ser muy tipográfico.",
  },
  {
    id: 9,
    name: "Carrusel Slide 3",
    shortName: "Carrusel 3",
    format: "1:1",
    width: 1080,
    height: 1080,
    safeZones: "80 px todos los lados",
    copyTemplate: [
      "[FRASE TENSIÓN — PARTE A]",
      "",
      "[FRASE TENSIÓN — PARTE B]",
      "",
      "03",
    ],
    compositionNotes:
      "Organizar el texto para expresar tensión o loop. Separación de bloques para reforzar distancia o contraste.",
  },
  {
    id: 10,
    name: "Carrusel Slide 4",
    shortName: "Carrusel 4",
    format: "1:1",
    width: 1080,
    height: 1080,
    safeZones: "80 px todos los lados",
    copyTemplate: ["[FRASE DE IMPACTO]", "[CONCEPTO MEMORABLE]", "", "04"],
    compositionNotes:
      "Dar protagonismo al concepto memorable. Verde como acento mínimo si ayuda a memorabilidad.",
  },
  {
    id: 11,
    name: "Carrusel Slide 5",
    shortName: "Carrusel 5",
    format: "1:1",
    width: 1080,
    height: 1080,
    safeZones: "80 px todos los lados",
    copyTemplate: ["[FRASE CLAVE 2]", "[LÍNEA 2]", "[LÍNEA 3]", "", "05"],
    compositionNotes: "Muy tipográfico. Sobrio. Directo.",
  },
  {
    id: 12,
    name: "Carrusel Slide 6",
    shortName: "Carrusel 6",
    format: "1:1",
    width: 1080,
    height: 1080,
    safeZones: "80 px todos los lados",
    copyTemplate: ["[FRASE CLAVE 3]", "[CONTINUACIÓN]", "", "06"],
    compositionNotes: "Bloques tipográficos tensos. Alta legibilidad.",
  },
  {
    id: 13,
    name: "Carrusel Slide 7",
    shortName: "Carrusel 7",
    format: "1:1",
    width: 1080,
    height: 1080,
    safeZones: "80 px todos los lados",
    copyTemplate: [
      "[CLÍMAX EMOCIONAL]",
      "[LÍNEA 2]",
      "[LÍNEA 3]",
      "",
      "07",
    ],
    compositionNotes:
      "Clímax emocional del carrusel. Más espacio negativo. La frase más poderosa del episodio va aquí.",
  },
  {
    id: 14,
    name: "Carrusel Slide 8 — CTA Final",
    shortName: "Carrusel CTA",
    format: "1:1",
    width: 1080,
    height: 1080,
    safeZones: "80 px todos los lados",
    copyTemplate: [
      "GUÁRDALO",
      "COMPÁRTELO",
      "",
      "ESCUCHA",
      "EL EPISODIO XX",
      "",
      "@yosoyvillamar",
      "08",
    ],
    compositionNotes:
      "Cierre claro. CTA directo. Verde solo como acento puntual en el CTA principal.",
  },
  {
    id: 15,
    name: "Highlight Cover",
    shortName: "Highlight",
    format: "1:1",
    width: 1080,
    height: 1080,
    safeZones: "Elemento principal centrado en zona circular segura amplia",
    copyTemplate: ["XX", "(solo número de episodio)"],
    compositionNotes:
      "Sin texto largo. Solo número o 'EP'. Diseño mínimo, reconocible en miniatura. Fondo COBALT o PAPER. Verde solo si mejora reconocimiento.",
  },
];

export const PRODUCTION_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

export interface EpisodeInput {
  number: string;
  thesis: string;
  keyPhrases: string[];
}

/**
 * Build a full prompt for a single piece, replacing variables.
 */
export function buildPiecePrompt(piece: VisualPiece, input: EpisodeInput, copyLines: string[]): string {
  const epNum = input.number.padStart(2, "0");
  const copy = copyLines.map((l) => l.replace(/XX/g, epNum)).join("\n");

  return `Crear UNA SOLA pieza visual final. No crear variantes. No crear múltiples formatos. Solo producir la pieza especificada en PIEZA OBJETIVO.

PIEZA OBJETIVO: ${String(piece.id).padStart(2, "0")} — ${piece.name} — ${piece.format}
${piece.width} × ${piece.height} px  ·  Safe zones: ${piece.safeZones}

COPY:
${copy}

COMPOSICIÓN
${piece.compositionNotes}
${BRAND_CONTEXT.composition.map((c) => `— ${c}`).join("\n")}

CONTEXTO DE MARCA FIJO
Podcast: ${BRAND_CONTEXT.podcast}
Host: ${BRAND_CONTEXT.host}

PALETA ÚNICA PERMITIDA
COBALT ${BRAND_CONTEXT.palette.cobalt}  |  COBALT DARK ${BRAND_CONTEXT.palette.cobaltDark}  |  CREAM ${BRAND_CONTEXT.palette.cream}  |  AMARILLO ${BRAND_CONTEXT.palette.yellow}  |  NEGRO ${BRAND_CONTEXT.palette.black}  |  BLANCO ${BRAND_CONTEXT.palette.white}

REGLAS DE COLOR
${BRAND_CONTEXT.colorRules.map((r) => `— ${r}`).join("\n")}

TIPOGRAFÍA
${BRAND_CONTEXT.typography.map((t) => `— ${t}`).join("\n")}

HOST (OBLIGATORIO — usar foto de referencia adjunta)
— ${BRAND_CONTEXT.hostDescription}

ELEMENTOS FIJOS
${BRAND_CONTEXT.fixedElements.map((e) => `— ${e}`).join("\n")}

ESTÉTICA OBLIGATORIA
— ${BRAND_CONTEXT.aesthetic}

EFECTOS PERMITIDOS
— ${BRAND_CONTEXT.allowedEffects}

EFECTOS PROHIBIDOS
— ${BRAND_CONTEXT.prohibitedEffects}

DEFINICIÓN DE LISTO
${BRAND_CONTEXT.readyChecklist.map((c) => `— ${c}`).join("\n")}`;
}
