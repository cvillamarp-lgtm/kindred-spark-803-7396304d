import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wand2, Copy, Check, RotateCcw, ImageIcon, Loader2, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const SECTIONS = [
  {
    id: "subject",
    label: "Sujeto",
    options: ["Hombre", "Mujer", "Pareja", "Grupo", "Producto", "Objeto", "Animal", "Personaje", "Figura abstracta"],
  },
  {
    id: "pose",
    label: "Acción / Pose",
    options: ["De pie", "Sentado", "Caminando", "Mirando a cámara", "Perfil", "Tres cuartos", "Sonriendo", "Serio", "Pensativo", "Sosteniendo algo", "Relajado", "Desafiante"],
  },
  {
    id: "shot",
    label: "Plano",
    options: ["Plano detalle", "Primer plano", "Plano medio", "Plano americano", "Cuerpo entero", "Cenital", "Wide shot"],
  },
  {
    id: "angle",
    label: "Ángulo",
    options: ["Frontal", "Contrapicado", "Picado", "Cenital", "A la altura de los ojos", "Tres cuartos", "Lateral / perfil"],
  },
  {
    id: "lens",
    label: "Lente",
    options: ["24mm gran angular", "35mm editorial", "50mm natural", "85mm retrato", "100mm macro", "Teleobjetivo"],
  },
  {
    id: "composition",
    label: "Composición",
    options: ["Centrada", "Simétrica", "Regla de tercios", "Minimalista", "Mucho aire negativo", "Diagonal", "Superposición de capas", "Sujeto dominante"],
  },
  {
    id: "lighting",
    label: "Iluminación",
    options: ["Luz suave difusa", "Luz dura", "Contraluz", "Luz lateral", "Beauty light", "Rim light", "Cinematográfica", "Flash directo", "Luz natural ventana", "High-key", "Low-key dramático"],
  },
  {
    id: "palette",
    label: "Paleta / Color",
    options: ["Cálida", "Fría", "Neutra", "Monocromática", "Complementaria", "Saturada", "Desaturada", "Pastel", "Luxury minimal", "Neon"],
  },
  {
    id: "background",
    label: "Fondo",
    options: ["Fondo liso", "Seamless studio", "Pared texturizada", "Interior minimalista", "Calle urbana", "Naturaleza", "Set editorial", "Fondo degradado", "Entorno futurista", "Podcast studio"],
  },
  {
    id: "style",
    label: "Estilo visual",
    options: ["Fotografía comercial", "Editorial de moda", "Campaña publicitaria", "Documental", "Cinematográfica", "Hiperrealista", "3D render", "Retro", "Futurista", "Minimalista", "Maximalista"],
  },
  {
    id: "emotion",
    label: "Emoción / Intención",
    options: ["Bienvenida", "Autoridad", "Cercanía", "Lujo", "Confianza", "Energía", "Calma", "Aspiracional", "Premium", "Disruptiva", "Juvenil", "Íntima"],
  },
  {
    id: "finish",
    label: "Acabado",
    options: ["Clean retouching", "Glossy finish", "Film grain", "Sharpened", "Soft bloom", "Neon glow", "HDR look", "Matte finish", "Luxury retouch", "Editorial contrast"],
  },
  {
    id: "format",
    label: "Formato",
    options: ["Portada cuadrada", "Vertical 4:5", "Story 9:16", "Banner horizontal", "Hero image web", "Thumbnail YouTube", "Poster 2:3", "Portada Spotify"],
  },
  {
    id: "depth",
    label: "Profundidad de campo",
    options: ["Shallow depth of field", "Background blur", "Everything in focus", "Selective focus", "Macro focus falloff", "Bokeh suave"],
  },
  {
    id: "motion",
    label: "Movimiento",
    options: ["Estática", "Congelada", "Motion blur", "Cabello en movimiento", "Tela flotando", "Salpicaduras", "Gesto espontáneo"],
  },
  {
    id: "realism",
    label: "Nivel de realismo",
    options: ["Ultra realistic", "Stylized realistic", "Dreamy", "Painterly", "Flat graphic", "Surreal"],
  },
  {
    id: "graphics",
    label: "Elementos gráficos",
    options: ["Tipografía integrada", "Doodles", "Flechas", "Íconos", "Ondas de audio", "Stickers", "Glow", "Marcos", "Overlays", "Grain", "Degradados"],
  },
  {
    id: "clothing",
    label: "Vestuario",
    options: ["Casual", "Smart casual", "Formal", "Deportivo", "Streetwear", "Lujo silencioso", "Editorial fashion", "Uniforme de marca"],
  },
  {
    id: "skin",
    label: "Maquillaje / Piel",
    options: ["Natural skin", "Polished retouching", "Matte skin", "Dewy skin", "Barba cuidada", "Cabello pulido", "Maquillaje clean", "Maquillaje editorial"],
  },
  {
    id: "texture",
    label: "Textura / Material",
    options: ["Mate", "Glossy", "Metálico", "Vidrio", "Terciopelo", "Denim", "Plástico translúcido", "Húmedo", "Granulado", "Seda", "Concreto"],
  },
];

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

export default function PromptBuilder() {
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const toggle = (sectionId: string, option: string) => {
    setSelections((prev) => {
      const current = prev[sectionId] || [];
      const exists = current.includes(option);
      return {
        ...prev,
        [sectionId]: exists ? current.filter((o) => o !== option) : [...current, option],
      };
    });
  };

  const totalSelected = Object.values(selections).reduce((sum, arr) => sum + arr.length, 0);

  const buildPrompt = () => {
    const parts: string[] = [];
    SECTIONS.forEach((section) => {
      const selected = selections[section.id];
      if (selected && selected.length > 0) {
        parts.push(selected.join(", "));
      }
    });
    return parts.join(", ");
  };

  const prompt = buildPrompt();

  const copyPrompt = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt);
    setCopied(true);
    toast.success("Prompt copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setSelections({});
    toast("Selecciones limpiadas");
  };

  const generateImage = async () => {
    if (!prompt) {
      toast.error("Selecciona al menos un parámetro para generar");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const newImage: GeneratedImage = {
        url: data.imageUrl,
        prompt,
        timestamp: Date.now(),
      };
      setGeneratedImages((prev) => [newImage, ...prev]);
      setSelectedImage(newImage);
      toast.success("¡Imagen generada exitosamente!");
    } catch (e: any) {
      console.error("Image generation error:", e);
      toast.error(e.message || "Error al generar la imagen");
    } finally {
      setGenerating(false);
    }
  };

  const downloadImage = async (img: GeneratedImage) => {
    try {
      const response = await fetch(img.url);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `amtme-${img.timestamp}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Imagen descargada");
    } catch {
      // Fallback: open in new tab
      window.open(img.url, "_blank");
    }
  };

  const removeImage = (timestamp: number) => {
    setGeneratedImages((prev) => prev.filter((i) => i.timestamp !== timestamp));
    if (selectedImage?.timestamp === timestamp) setSelectedImage(null);
    toast("Imagen eliminada de la galería");
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Prompt Builder</h1>
          <p className="page-subtitle">
            Construye tu prompt y genera imágenes con IA
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {totalSelected} parámetros
          </Badge>
          <Button variant="outline" size="sm" onClick={reset}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Limpiar
          </Button>
        </div>
      </div>

      {/* Prompt preview + Generate */}
      {prompt && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Wand2 className="h-4 w-4 text-primary" />
                Prompt generado
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={copyPrompt}>
                  {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
                <Button size="sm" onClick={generateImage} disabled={generating}>
                  {generating ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <ImageIcon className="h-3.5 w-3.5 mr-1" />
                  )}
                  {generating ? "Generando..." : "Generar imagen"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground/80 leading-relaxed font-mono bg-card rounded-lg p-3 border">
              {prompt}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generated images gallery */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Imágenes generadas ({generatedImages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {generatedImages.map((img) => (
                <div
                  key={img.timestamp}
                  className={`group relative rounded-lg overflow-hidden border cursor-pointer transition-all ${
                    selectedImage?.timestamp === img.timestamp
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/40"
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img
                    src={img.url}
                    alt="Generated"
                    className="w-full aspect-square object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1.5 p-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); downloadImage(img); }}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={(e) => { e.stopPropagation(); removeImage(img.timestamp); }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Selected image detail */}
            {selectedImage && (
              <div className="mt-4 p-4 bg-secondary rounded-lg space-y-3">
                <img
                  src={selectedImage.url}
                  alt="Selected"
                  className="w-full max-w-lg mx-auto rounded-lg border border-border"
                />
                <p className="text-xs text-muted-foreground font-mono line-clamp-3">
                  {selectedImage.prompt}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button size="sm" variant="outline" onClick={() => downloadImage(selectedImage)}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Descargar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    navigator.clipboard.writeText(selectedImage.url);
                    toast.success("URL copiada");
                  }}>
                    <Copy className="h-3.5 w-3.5 mr-1" />
                    Copiar URL
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {SECTIONS.map((section) => {
          const selected = selections[section.id] || [];
          return (
            <Card key={section.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">{section.label}</CardTitle>
                  {selected.length > 0 && (
                    <Badge variant="default" className="text-[10px]">
                      {selected.length}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {section.options.map((option) => {
                    const isSelected = selected.includes(option);
                    return (
                      <button
                        key={option}
                        onClick={() => toggle(section.id, option)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
