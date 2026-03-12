import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Mic, Plus, Search, Download, Factory, ChevronDown, Loader2, Sparkles } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEpisodes } from "@/hooks/useEpisode";
import { auditEpisode, getCompletenessLevel } from "@/lib/episode-validation";

export default function Episodes() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [ideaPrincipal, setIdeaPrincipal] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [conflictoCentral, setConflictoCentral] = useState("");
  const [intencion, setIntencion] = useState("");
  const [tono, setTono] = useState("íntimo");
  const [fechaEstimada, setFechaEstimada] = useState("");
  const [restricciones, setRestricciones] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: episodes = [], isLoading } = useEpisodes();

  const resetForm = () => {
    setIdeaPrincipal("");
    setConflictoCentral("");
    setIntencion("");
    setTono("íntimo");
    setFechaEstimada("");
    setRestricciones("");
    setAdvancedOpen(false);
  };

  const createEpisode = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      // 1. Count existing episodes to suggest number
      const { count } = await supabase
        .from("episodes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      const nextNumber = String((count || 0) + 1).padStart(2, "0");

      // 2. Create episode in draft state
      const episodeData: Record<string, any> = {
        user_id: user.id,
        title: ideaPrincipal.slice(0, 100),
        idea_principal: ideaPrincipal,
        conflicto_central: conflictoCentral || null,
        intencion_del_episodio: intencion || null,
        tono: tono || "íntimo",
        restricciones: restricciones || null,
        release_date: fechaEstimada || null,
        fecha_es_estimada: !!fechaEstimada,
        status: "draft",
        estado_produccion: "draft",
        nivel_completitud: "D",
        number: nextNumber,
      };

      const { data: episode, error: insertError } = await supabase
        .from("episodes")
        .insert(episodeData as any)
        .select("id")
        .single();
      if (insertError) throw insertError;

      // 3. Call AI to generate 8 fields
      setIsGenerating(true);
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke(
          "generate-episode-fields",
          {
            body: {
              idea_principal: ideaPrincipal,
              conflicto_central: conflictoCentral || undefined,
              intencion_del_episodio: intencion || undefined,
              tono: tono || "íntimo",
              restricciones: restricciones || undefined,
              episode_number: nextNumber,
            },
          }
        );

        if (fnError) throw fnError;

        if (fnData?.fields) {
          const fields = fnData.fields;
          const metadata = fnData.metadata;

          const updatePayload: Record<string, any> = {
            working_title: fields.working_title || null,
            theme: fields.theme || null,
            core_thesis: fields.core_thesis || null,
            summary: fields.summary || null,
            hook: fields.hook || null,
            cta: fields.cta || null,
            quote: fields.quote || null,
            descripcion_spotify: fields.descripcion_spotify || null,
            title: fields.working_title || ideaPrincipal.slice(0, 100),
            generation_metadata: metadata,
          };

          const { error: updateError } = await supabase
            .from("episodes")
            .update(updatePayload as any)
            .eq("id", episode.id);

          if (updateError) {
            console.error("Failed to save AI fields:", updateError);
            toast.error("Episodio creado pero falló al guardar campos generados");
          }
        }
      } catch (aiError: any) {
        console.error("AI generation failed:", aiError);
        toast.warning("Episodio creado. No se pudieron generar los campos automáticamente. Puedes generarlos desde el workspace.");
      } finally {
        setIsGenerating(false);
      }

      return episode;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      setOpen(false);
      resetForm();
      toast.success("Episodio creado");
      if (data?.id) navigate(`/episodes/${data.id}`);
    },
    onError: (e) => toast.error(e.message),
  });

  const exportCSV = () => {
    if (!episodes.length) return;
    const headers = ["number", "title", "theme", "status", "nivel_completitud", "release_date", "health_score"];
    const rows = episodes.map((ep: any) => headers.map((h) => {
      const val = ep[h];
      return val === null || val === undefined ? "" : String(val).replace(/"/g, '""');
    }));
    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "episodios.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  const statusLabel = (s: string | null) => {
    switch (s) {
      case "published": return "Publicado";
      case "recording": return "Grabando";
      case "editing": return "En edición";
      default: return "Borrador";
    }
  };

  const filtered = episodes.filter((ep: any) =>
    !search || ep.title?.toLowerCase().includes(search.toLowerCase()) || ep.number?.includes(search) || ep.theme?.toLowerCase().includes(search.toLowerCase())
  );

  const isPending = createEpisode.isPending || isGenerating;

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title">Episodios</h1>
          <p className="page-subtitle">Fuente de verdad. Haz click en un episodio para abrir su Workspace.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={!episodes.length}>
            <Download className="h-4 w-4 mr-2" />CSV
          </Button>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nuevo Episodio</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nuevo episodio</DialogTitle></DialogHeader>
              <div className="space-y-5">
                {/* Campo obligatorio único */}
                <div>
                  <Label className="text-sm font-medium">
                    Idea principal <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    value={ideaPrincipal}
                    onChange={(e) => setIdeaPrincipal(e.target.value)}
                    placeholder="Ej: la diferencia entre soltar y rendirse"
                    rows={3}
                    className="mt-1.5"
                    disabled={isPending}
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    El sistema generará automáticamente título, tema, resumen, hook, CTA, quote y descripción Spotify.
                  </p>
                </div>

                {/* Opciones avanzadas colapsables */}
                <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-between text-muted-foreground hover:text-foreground">
                      Opciones avanzadas
                      <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-3">
                    <div>
                      <Label className="text-sm">Conflicto central</Label>
                      <Input
                        value={conflictoCentral}
                        onChange={(e) => setConflictoCentral(e.target.value)}
                        placeholder="Ej: querer intimidad pero temer la vulnerabilidad"
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Intención del episodio</Label>
                      <Input
                        value={intencion}
                        onChange={(e) => setIntencion(e.target.value)}
                        placeholder="Ej: que el oyente se dé permiso de no tener todo resuelto"
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Tono</Label>
                      <Select value={tono} onValueChange={setTono} disabled={isPending}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="íntimo">Íntimo</SelectItem>
                          <SelectItem value="confrontador">Confrontador</SelectItem>
                          <SelectItem value="reflexivo">Reflexivo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-sm">Fecha estimada</Label>
                      <Input
                        type="date"
                        value={fechaEstimada}
                        onChange={(e) => setFechaEstimada(e.target.value)}
                        disabled={isPending}
                      />
                    </div>
                    <div>
                      <Label className="text-sm">Restricciones</Label>
                      <Textarea
                        value={restricciones}
                        onChange={(e) => setRestricciones(e.target.value)}
                        placeholder="Ej: no mencionar religión organizada, enfocarse en relaciones"
                        rows={2}
                        disabled={isPending}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Botón de creación */}
                <Button
                  onClick={() => createEpisode.mutate()}
                  className="w-full"
                  disabled={!ideaPrincipal.trim() || isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isGenerating ? "Generando campos con IA..." : "Creando episodio..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Crear episodio
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <p className="text-xs text-muted-foreground text-center animate-pulse">
                    Generando título, tema, resumen, hook, CTA, quote y descripción Spotify...
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar por título, número o tema..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse bg-muted rounded-lg" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state flex-1">
          <Mic className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">{search ? "Sin resultados" : "No hay episodios aún"}</p>
        </div>
      ) : (
        <div className="surface flex-1 overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-secondary/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium">Episodio</th>
                  <th className="px-4 py-3 font-medium">Tema</th>
                  <th className="px-4 py-3 font-medium">Salud</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Nivel</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ep: any) => {
                  const audit = auditEpisode(ep);
                  const level = getCompletenessLevel(audit.healthScore);
                  return (
                    <tr key={ep.id} className="surface-hover cursor-pointer" onClick={() => navigate(`/episodes/${ep.id}`)}>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground hover:text-primary transition-colors">
                            {ep.final_title || ep.working_title || ep.title}
                          </span>
                          {ep.number && <span className="text-xs text-muted-foreground mt-0.5">#{ep.number}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-foreground">{ep.theme || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Progress value={audit.healthScore} className="h-1.5 w-16" />
                          <span className={`text-[10px] font-medium ${level.color}`}>{audit.healthScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground">{statusLabel(ep.status)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={`text-[10px] font-bold ${level.color}`}>
                          {level.nivel}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/factory?episode_id=${ep.id}`); }}>
                          <Factory className="h-3.5 w-3.5 mr-1" />Producir
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
