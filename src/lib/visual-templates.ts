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
  podcast: "A Mi Tampoco Me Explicaron",
  host: "Christian Villamar · @yosoyvillamar",
  palette: {
    ink: "#282828",
    paper: "#F9F6EF",
    cobalt: "#193497",
    green: "#EAFF00",
  },
  colorRules: [
    "Prohibido usar cualquier color fuera de esta paleta",
    "Prohibido negro puro dominante — usar INK",
    "Prohibido blanco puro dominante — usar PAPER",
    "Verde solo como microacento (máx. 1 elemento por pieza)",
    "Prohibido #1400FF",
  ],
  typography: [
    "Sans serif editorial contemporánea (ej: Inter, Neue Haas, Aktiv Grotesk, Helvetica Neue)",
    "Black / ExtraBold para titulares",
    "Medium / Regular para soporte",
    "Máx. 2 estilos tipográficos por pieza",
    "Máx. 3 niveles jerárquicos",
    "Prohibido: cursivas, serif, lettering decorativo",
  ],
  hostDescription:
    "Hombre real, edad aparente 30–42, expresión sobria y contenida. Natural, honesto, editorial — no stock, no caricatura, no dramatizado. Conservar estructura facial, postura tranquila, presencia masculina general.",
  aesthetic:
    "Editorial · contemporánea · limpia · psicológica · sobria · íntima · memorable",
  allowedEffects:
    "Grano editorial muy sutil / bloques sólidos / filetes finos / subrayados / cajas limpias",
  prohibitedEffects:
    "Glow / sombras dramáticas / 3D / biseles / stickers / gradientes llamativos / motivacional barato",
  readyChecklist: [
    "Formato exacto respetado",
    "Safe zones respetadas",
    "Solo la paleta indicada",
    "Host natural y editorial",
    "Comunica en menos de 2 segundos",
    "Funciona en miniatura",
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

CONTEXTO DE MARCA FIJO
Podcast: ${BRAND_CONTEXT.podcast}
Host: ${BRAND_CONTEXT.host}

PALETA ÚNICA PERMITIDA
INK ${BRAND_CONTEXT.palette.ink}  |  PAPER ${BRAND_CONTEXT.palette.paper}  |  COBALT ${BRAND_CONTEXT.palette.cobalt}  |  HIGHLIGHTER GREEN ${BRAND_CONTEXT.palette.green}

REGLAS DE COLOR
${BRAND_CONTEXT.colorRules.map((r) => `— ${r}`).join("\n")}

TIPOGRAFÍA
${BRAND_CONTEXT.typography.map((t) => `— ${t}`).join("\n")}

HOST
— ${BRAND_CONTEXT.hostDescription}

ESTÉTICA OBLIGATORIA
— ${BRAND_CONTEXT.aesthetic}

EFECTOS PERMITIDOS
— ${BRAND_CONTEXT.allowedEffects}

EFECTOS PROHIBIDOS
— ${BRAND_CONTEXT.prohibitedEffects}

DEFINICIÓN DE LISTO
${BRAND_CONTEXT.readyChecklist.map((c) => `— ${c}`).join("\n")}`;
}
