import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  ChevronRight,
  Layers,
  CheckCircle2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  VISUAL_PIECES,
  BRAND_CONTEXT,
  buildPiecePrompt,
  type EpisodeInput,
} from "@/lib/visual-templates";

type PieceCopyMap = Record<string, string[]>;

interface ExtractionResult {
  thesis: string;
  keyPhrases: string[];
  pieceCopy: PieceCopyMap;
}

export default function ContentFactory() {
  const [searchParams] = useSearchParams();

  // --- Input state ---
  const [epNumber, setEpNumber] = useState("");
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [script, setScript] = useState("");

  // Pre-fill from URL params (coming from Episodes page)
  useEffect(() => {
    const num = searchParams.get("number");
    const t = searchParams.get("title");
    const th = searchParams.get("theme");
    const sc = searchParams.get("script");
    const hook = searchParams.get("hook");
    const quote = searchParams.get("quote");
    const cta = searchParams.get("cta");

    if (num) setEpNumber(num);
    if (t) setTitle(t);
    if (th) setTheme(th);

    // Build script from available episode content
    const parts = [
      sc ? `Resumen: ${sc}` : "",
      hook ? `Hook: ${hook}` : "",
      quote ? `Quote: ${quote}` : "",
      cta ? `CTA: ${cta}` : "",
    ].filter(Boolean);
    if (parts.length) setScript(parts.join("\n\n"));
  }, [searchParams]);

  // --- Extraction state ---
  const [loading, setLoading] = useState(false);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [pieceCopy, setPieceCopy] = useState<PieceCopyMap>({});

  // --- UI state ---
  const [selectedPiece, setSelectedPiece] = useState<number>(1);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [tab, setTab] = useState("input");

  const episodeInput: EpisodeInput = useMemo(
    () => ({
      number: epNumber || "XX",
      thesis: extraction?.thesis || "",
      keyPhrases: extraction?.keyPhrases || [],
    }),
    [epNumber, extraction]
  );

  // --- Extract content via AI ---
  const extractContent = async () => {
    if (!script && !title && !theme) {
      toast.error("Ingresa al menos un guión, título o tema");
      return;
    }
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Debes iniciar sesión");
        return;
      }

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/extract-content`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ script, title, theme }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const data: ExtractionResult = await resp.json();
      if (data.thesis && data.pieceCopy) {
        setExtraction(data);
        // Merge with episode number
        const merged: PieceCopyMap = {};
        for (const [k, v] of Object.entries(data.pieceCopy)) {
          merged[k] = v.map((line: string) =>
            line.replace(/XX/g, epNumber.padStart(2, "0") || "XX")
          );
        }
        setPieceCopy(merged);
        setTab("pieces");
        toast.success("Contenido extraído — revisa las 15 piezas");
      } else {
        throw new Error("Respuesta incompleta de IA");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Copy prompt ---
  const copyPrompt = (pieceId: number) => {
    const piece = VISUAL_PIECES.find((p) => p.id === pieceId)!;
    const copy = pieceCopy[String(pieceId)] || piece.copyTemplate;
    const prompt = buildPiecePrompt(piece, episodeInput, copy);
    navigator.clipboard.writeText(prompt);
    setCopiedId(pieceId);
    toast.success(`Prompt pieza ${String(pieceId).padStart(2, "0")} copiado`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // --- Copy ALL prompts ---
  const copyAllPrompts = () => {
    const all = VISUAL_PIECES.map((piece) => {
      const copy = pieceCopy[String(piece.id)] || piece.copyTemplate;
      return buildPiecePrompt(piece, episodeInput, copy);
    }).join("\n\n---\n\n");
    navigator.clipboard.writeText(all);
    toast.success("15 prompts copiados");
  };

  // --- Edit copy for a piece ---
  const updatePieceCopy = (pieceId: number, lineIndex: number, value: string) => {
    setPieceCopy((prev) => {
      const piece = VISUAL_PIECES.find((p) => p.id === pieceId)!;
      const current = [...(prev[String(pieceId)] || piece.copyTemplate)];
      current[lineIndex] = value;
      return { ...prev, [String(pieceId)]: current };
    });
  };

  const activePiece = VISUAL_PIECES.find((p) => p.id === selectedPiece)!;
  const activeCopy = pieceCopy[String(selectedPiece)] || activePiece.copyTemplate;

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Fábrica de Contenido</h1>
          <p className="page-subtitle">
            Guión → 15 piezas visuales listas para producir
          </p>
        </div>
        {extraction && (
          <Button variant="outline" size="sm" onClick={copyAllPrompts}>
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Copiar los 15
          </Button>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="input">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Entrada
          </TabsTrigger>
          <TabsTrigger value="pieces" disabled={!extraction}>
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            Piezas ({extraction ? "15" : "—"})
          </TabsTrigger>
        </TabsList>

        {/* === INPUT TAB === */}
        <TabsContent value="input">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-sm">Datos del Episodio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>N° Episodio</Label>
                  <Input
                    value={epNumber}
                    onChange={(e) => setEpNumber(e.target.value)}
                    placeholder="Ej: 29"
                    maxLength={4}
                  />
                </div>
                <div>
                  <Label>Título</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: El ansioso se apaga"
                  />
                </div>
                <div>
                  <Label>Tema / Tesis</Label>
                  <Textarea
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    placeholder="La verdad núcleo del episodio..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm">Guión del Episodio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  placeholder="Pega aquí el guión completo del episodio... La IA extraerá las frases clave, la tesis y generará el copy para las 15 piezas visuales."
                  rows={12}
                  className="font-mono text-xs"
                />
                <Button
                  onClick={extractContent}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  {loading
                    ? "Extrayendo contenido..."
                    : "Extraer y generar 15 piezas"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === PIECES TAB === */}
        <TabsContent value="pieces">
          {extraction && (
            <div className="space-y-4">
              {/* Thesis + Key Phrases */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Tesis central
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {extraction.thesis}
                      </p>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Frases clave
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {extraction.keyPhrases.map((phrase, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs"
                          >
                            {phrase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Piece List + Detail */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Piece selector */}
                <Card className="lg:col-span-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                      Orden de producción
                    </CardTitle>
                  </CardHeader>
                  <ScrollArea className="h-[500px]">
                    <CardContent className="space-y-1 pt-0">
                      {VISUAL_PIECES.map((piece) => {
                        const hasCopy = !!pieceCopy[String(piece.id)];
                        const isActive = selectedPiece === piece.id;
                        return (
                          <button
                            key={piece.id}
                            onClick={() => setSelectedPiece(piece.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-md text-left text-sm transition-colors ${
                              isActive
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-secondary/50 text-foreground/80"
                            }`}
                          >
                            <span className="font-mono text-xs text-muted-foreground w-5">
                              {String(piece.id).padStart(2, "0")}
                            </span>
                            {hasCopy && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                            )}
                            <span className="flex-1 truncate">
                              {piece.shortName}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] shrink-0"
                            >
                              {piece.format}
                            </Badge>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          </button>
                        );
                      })}
                    </CardContent>
                  </ScrollArea>
                </Card>

                {/* Piece detail */}
                <Card className="lg:col-span-8">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm flex items-center gap-2">
                          <span className="font-mono text-muted-foreground">
                            {String(activePiece.id).padStart(2, "0")}
                          </span>
                          {activePiece.name}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {activePiece.width}×{activePiece.height} px ·{" "}
                          {activePiece.format} · Safe: {activePiece.safeZones}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyPrompt(activePiece.id)}
                      >
                        {copiedId === activePiece.id ? (
                          <Check className="h-3.5 w-3.5 mr-1" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 mr-1" />
                        )}
                        {copiedId === activePiece.id
                          ? "Copiado"
                          : "Copiar prompt"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Editable copy */}
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Copy de la pieza
                      </Label>
                      <div className="mt-2 space-y-2">
                        {activeCopy.map((line, i) => (
                          <Input
                            key={`${selectedPiece}-${i}`}
                            value={line}
                            onChange={(e) =>
                              updatePieceCopy(
                                selectedPiece,
                                i,
                                e.target.value
                              )
                            }
                            className="font-mono text-xs"
                            placeholder={
                              activePiece.copyTemplate[i] || "..."
                            }
                          />
                        ))}
                      </div>
                    </div>

                    {/* Composition notes */}
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Composición
                      </Label>
                      <p className="text-xs text-foreground/70 mt-1 leading-relaxed">
                        {activePiece.compositionNotes}
                      </p>
                    </div>

                    {/* Preview of generated prompt */}
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Preview del prompt
                      </Label>
                      <div className="bg-secondary/30 rounded-lg p-3 mt-1 max-h-[200px] overflow-auto">
                        <pre className="text-[11px] text-foreground/70 whitespace-pre-wrap font-mono leading-relaxed">
                          {buildPiecePrompt(
                            activePiece,
                            episodeInput,
                            activeCopy
                          ).substring(0, 600)}
                          ...
                        </pre>
                      </div>
                    </div>

                    {/* Color swatches */}
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Paleta
                      </Label>
                      <div className="flex gap-2 mt-1.5">
                        {Object.entries(BRAND_CONTEXT.palette).map(
                          ([name, hex]) => (
                            <div
                              key={name}
                              className="flex items-center gap-1.5"
                            >
                              <div
                                className="w-5 h-5 rounded border border-border"
                                style={{ backgroundColor: hex }}
                              />
                              <span className="text-[10px] text-muted-foreground uppercase">
                                {name}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
