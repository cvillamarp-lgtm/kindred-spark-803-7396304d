import { useState, useMemo, useEffect, useCallback } from "react";
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
  Sparkles, Loader2, Layers, Download, MessageSquare, FolderOpen, Zap,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  VISUAL_PIECES, buildPiecePrompt, type EpisodeInput,
} from "@/lib/visual-templates";
import { PieceCard } from "@/components/factory/PieceCard";
import { CaptionEditor } from "@/components/factory/CaptionEditor";
import { AssetGallery } from "@/components/factory/AssetGallery";
import { ProgressTracker } from "@/components/factory/ProgressTracker";

type PieceCopyMap = Record<string, string[]>;

interface ExtractionResult {
  thesis: string;
  keyPhrases: string[];
  pieceCopy: PieceCopyMap;
}

// Convert seccionA/seccionB format from extract-content to our internal format
function parseExtraction(data: any): ExtractionResult | null {
  // Handle seccionA/seccionB format from edge function
  if (data.seccionA && data.seccionB) {
    const thesis = data.seccionA.tesisCentral || "";
    const keyPhrases = data.seccionA.frasesClaves || [];
    const pieceCopy: PieceCopyMap = {};

    // Map seccionB pieces to VISUAL_PIECES by index
    const secBKeys = [
      "portada", "lanzamiento", "reel", "story_lanzamiento", "story_quote",
      "quote_feed", "slide1", "slide2", "slide3", "slide4",
      "slide5", "slide6", "slide7", "slide8", "highlight",
    ];

    secBKeys.forEach((key, idx) => {
      const pieceData = data.seccionB[key];
      if (pieceData && typeof pieceData === "object") {
        const lines = Object.values(pieceData).filter((v): v is string => typeof v === "string" && v.length > 0);
        if (lines.length > 0) {
          pieceCopy[String(idx + 1)] = lines;
        }
      }
    });

    return { thesis, keyPhrases, pieceCopy };
  }

  // Handle direct thesis/pieceCopy format (legacy)
  if (data.thesis && data.pieceCopy) {
    return data as ExtractionResult;
  }

  return null;
}

interface AssetState {
  imageUrl?: string;
  caption: string;
  hashtags: string;
  status: string;
  promptUsed?: string;
}

export default function ContentFactory() {
  const [searchParams] = useSearchParams();

  // Input state
  const [epNumber, setEpNumber] = useState("");
  const [title, setTitle] = useState("");
  const [theme, setTheme] = useState("");
  const [script, setScript] = useState("");

  // Pre-fill from URL params
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

    const parts = [
      sc ? `Resumen: ${sc}` : "",
      hook ? `Hook: ${hook}` : "",
      quote ? `Quote: ${quote}` : "",
      cta ? `CTA: ${cta}` : "",
    ].filter(Boolean);
    if (parts.length) setScript(parts.join("\n\n"));
  }, [searchParams]);

  // Extraction state
  const [loading, setLoading] = useState(false);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [pieceCopy, setPieceCopy] = useState<PieceCopyMap>({});

  // Assets state
  const [assets, setAssets] = useState<Record<number, AssetState>>({});

  // Production state
  const [producing, setProducing] = useState(false);
  const [prodStep, setProdStep] = useState("");
  const [prodCurrent, setProdCurrent] = useState(0);
  const [prodTotal, setProdTotal] = useState(0);

  // UI state
  const [tab, setTab] = useState("input");

  const episodeInput: EpisodeInput = useMemo(
    () => ({
      number: epNumber || "XX",
      thesis: extraction?.thesis || "",
      keyPhrases: extraction?.keyPhrases || [],
    }),
    [epNumber, extraction]
  );

  // Extract content via AI
  const extractContent = async () => {
    if (!script && !title && !theme) {
      toast.error("Ingresa al menos un guión, título o tema");
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
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

      const rawData = await resp.json();
      const parsed = parseExtraction(rawData);
      if (parsed) {
        setExtraction(parsed);
        const merged: PieceCopyMap = {};
        for (const [k, v] of Object.entries(parsed.pieceCopy)) {
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

  // Handle image generated for a piece
  const handleImageGenerated = useCallback((pieceId: number, imageUrl: string, prompt: string) => {
    setAssets((prev) => ({
      ...prev,
      [pieceId]: {
        ...prev[pieceId],
        imageUrl,
        status: "generated",
        promptUsed: prompt,
        caption: prev[pieceId]?.caption || "",
        hashtags: prev[pieceId]?.hashtags || "",
      },
    }));
  }, []);

  // Edit copy
  const updatePieceCopy = useCallback((pieceId: number, lineIndex: number, value: string) => {
    setPieceCopy((prev) => {
      const piece = VISUAL_PIECES.find((p) => p.id === pieceId)!;
      const current = [...(prev[String(pieceId)] || piece.copyTemplate)];
      current[lineIndex] = value;
      return { ...prev, [String(pieceId)]: current };
    });
  }, []);

  // Caption changes
  const handleCaptionChange = useCallback((pieceId: number, field: "caption" | "hashtags", value: string) => {
    setAssets((prev) => ({
      ...prev,
      [pieceId]: {
        ...prev[pieceId],
        [field]: value,
        status: prev[pieceId]?.status || "pending",
        caption: field === "caption" ? value : (prev[pieceId]?.caption || ""),
        hashtags: field === "hashtags" ? value : (prev[pieceId]?.hashtags || ""),
      },
    }));
  }, []);

  // Generate captions for all pieces
  const generateCaptions = async () => {
    if (!extraction) {
      toast.error("Primero extrae el contenido del guión");
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error("Debes iniciar sesión");
        return;
      }

      const pieces = VISUAL_PIECES.map((p) => ({
        id: p.id,
        name: p.shortName,
        copy: (pieceCopy[String(p.id)] || p.copyTemplate).join(" "),
      }));

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-captions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            pieces,
            episodeTitle: title,
            episodeNumber: epNumber,
            thesis: extraction.thesis,
          }),
        }
      );

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `Error ${resp.status}`);
      }

      const data = await resp.json();
      if (data.captions && Array.isArray(data.captions)) {
        setAssets((prev) => {
          const next = { ...prev };
          for (const c of data.captions) {
            next[c.pieceId] = {
              ...next[c.pieceId],
              caption: c.caption || "",
              hashtags: c.hashtags || "",
              status: next[c.pieceId]?.status || "pending",
            };
          }
          return next;
        });
        setTab("captions");
        toast.success("Captions generados para las 15 piezas");
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve / delete asset
  const approveAsset = useCallback((pieceId: number) => {
    setAssets((prev) => ({
      ...prev,
      [pieceId]: { ...prev[pieceId], status: "approved", caption: prev[pieceId]?.caption || "", hashtags: prev[pieceId]?.hashtags || "" },
    }));
    toast.success("Pieza aprobada");
  }, []);

  const deleteAsset = useCallback((pieceId: number) => {
    setAssets((prev) => {
      const next = { ...prev };
      delete next[pieceId];
      return next;
    });
    toast.success("Asset eliminado");
  }, []);

  // Save all to database
  const saveToDatabase = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Debes iniciar sesión");
        return;
      }

      const rows = Object.entries(assets)
        .filter(([_, a]) => a.imageUrl || a.caption)
        .map(([pieceId, a]) => {
          const piece = VISUAL_PIECES.find((p) => p.id === Number(pieceId))!;
          return {
            user_id: session.user.id,
            piece_id: Number(pieceId),
            piece_name: piece.shortName,
            image_url: a.imageUrl || null,
            caption: a.caption || null,
            hashtags: a.hashtags || null,
            prompt_used: a.promptUsed || null,
            status: a.status,
          };
        });

      if (rows.length === 0) {
        toast.error("No hay assets para guardar");
        return;
      }

      const { error } = await supabase.from("content_assets").insert(rows as any);
      if (error) throw error;

      toast.success(`${rows.length} assets guardados`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  // Produce all - automated flow
  const produceAll = async () => {
    if (!script && !title) {
      toast.error("Ingresa al menos un guión o título");
      return;
    }
    setProducing(true);
    setProdTotal(17); // 1 extract + 1 captions + 15 images
    setProdCurrent(0);

    try {
      // Step 1: Extract
      setProdStep("Extrayendo contenido...");
      setProdCurrent(1);
      await extractContent();

      // Step 2: Generate captions
      setProdStep("Generando captions...");
      setProdCurrent(2);
      await generateCaptions();

      // Step 3: Generate images one by one
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sesión expirada");

      for (let i = 0; i < VISUAL_PIECES.length; i++) {
        const piece = VISUAL_PIECES[i];
        setProdStep(`Generando imagen ${i + 1}/15: ${piece.shortName}`);
        setProdCurrent(3 + i);

        const copy = pieceCopy[String(piece.id)] || piece.copyTemplate;
        const prompt = buildPiecePrompt(piece, episodeInput, copy);

        try {
          const resp = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-image`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({ prompt }),
            }
          );

          if (resp.ok) {
            const data = await resp.json();
            if (data.imageUrl) {
              handleImageGenerated(piece.id, data.imageUrl, prompt);
            }
          } else {
            console.error(`Error generando pieza ${piece.id}`);
          }
        } catch {
          console.error(`Error en pieza ${piece.id}`);
        }

        // Small delay to avoid rate limits
        if (i < VISUAL_PIECES.length - 1) {
          await new Promise((r) => setTimeout(r, 2000));
        }
      }

      // Save all
      setProdStep("Guardando assets...");
      setProdCurrent(17);
      await saveToDatabase();

      setTab("library");
      toast.success("Producción completa");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setProducing(false);
    }
  };

  const generatedCount = Object.values(assets).filter((a) => a.imageUrl).length;
  const captionCount = Object.values(assets).filter((a) => a.caption).length;

  return (
    <div className="page-container animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Fábrica de Contenido</h1>
          <p className="page-subtitle">
            Guión → Piezas → Imágenes → Captions → Publicar
          </p>
        </div>
        <div className="flex gap-2">
          {extraction && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={saveToDatabase}
                disabled={producing}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Guardar assets
              </Button>
              <Button
                size="sm"
                onClick={produceAll}
                disabled={producing || loading}
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                Producir Todo
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Progress tracker */}
      <ProgressTracker
        currentStep={prodStep}
        currentPiece={prodCurrent}
        totalPieces={prodTotal}
        isRunning={producing}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="input">
            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
            Entrada
          </TabsTrigger>
          <TabsTrigger value="pieces" disabled={!extraction}>
            <Layers className="h-3.5 w-3.5 mr-1.5" />
            Piezas {generatedCount > 0 && `(${generatedCount})`}
          </TabsTrigger>
          <TabsTrigger value="captions" disabled={!extraction}>
            <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
            Captions {captionCount > 0 && `(${captionCount})`}
          </TabsTrigger>
          <TabsTrigger value="library">
            <FolderOpen className="h-3.5 w-3.5 mr-1.5" />
            Biblioteca
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
                <div className="flex gap-2">
                  <Button
                    onClick={extractContent}
                    disabled={loading || producing}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Extrayendo..." : "Extraer y generar 15 piezas"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* === PIECES TAB === */}
        <TabsContent value="pieces">
          {extraction && (
            <div className="space-y-4">
              {/* Thesis */}
              <Card>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Tesis central</p>
                      <p className="text-sm font-medium">{extraction.thesis}</p>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Frases clave</p>
                      <div className="flex flex-wrap gap-1.5">
                        {extraction.keyPhrases.map((phrase, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{phrase}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pieces grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VISUAL_PIECES.map((piece) => (
                  <PieceCard
                    key={piece.id}
                    piece={piece}
                    copyLines={pieceCopy[String(piece.id)] || piece.copyTemplate}
                    episodeInput={episodeInput}
                    imageUrl={assets[piece.id]?.imageUrl}
                    status={assets[piece.id]?.status || "pending"}
                    onImageGenerated={handleImageGenerated}
                    onCopyChange={updatePieceCopy}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* === CAPTIONS TAB === */}
        <TabsContent value="captions">
          {extraction && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {captionCount > 0
                    ? `${captionCount} captions generados`
                    : "Genera captions para todas las piezas con IA"}
                </p>
                <Button
                  size="sm"
                  onClick={generateCaptions}
                  disabled={loading || producing}
                >
                  {loading ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {captionCount > 0 ? "Regenerar captions" : "Generar captions"}
                </Button>
              </div>

              <ScrollArea className="h-[600px]">
                <div className="space-y-3 pr-4">
                  {VISUAL_PIECES.map((piece) => (
                    <CaptionEditor
                      key={piece.id}
                      piece={piece}
                      imageUrl={assets[piece.id]?.imageUrl}
                      captionData={{
                        caption: assets[piece.id]?.caption || "",
                        hashtags: assets[piece.id]?.hashtags || "",
                      }}
                      onCaptionChange={handleCaptionChange}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </TabsContent>

        {/* === LIBRARY TAB === */}
        <TabsContent value="library">
          <AssetGallery
            pieces={VISUAL_PIECES}
            assets={Object.fromEntries(
              Object.entries(assets).map(([k, v]) => [
                Number(k),
                { pieceId: Number(k), ...v },
              ])
            )}
            onApprove={approveAsset}
            onDelete={deleteAsset}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
