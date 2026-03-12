import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Mic, Plus, Search, Calendar, AlertTriangle, Download, Factory } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Episodes() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: episodes = [], isLoading } = useQuery({
    queryKey: ["episodes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("episodes").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addEpisode = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const ep = {
        user_id: user.id,
        title: formData.get("title") as string,
        number: (formData.get("number") as string) || null,
        theme: (formData.get("theme") as string) || null,
        summary: (formData.get("summary") as string) || null,
        link_spotify: (formData.get("link_spotify") as string) || null,
        descripcion_spotify: (formData.get("descripcion_spotify") as string) || null,
        nivel_completitud: (formData.get("nivel_completitud") as string) || "D",
        titulo_original: (formData.get("titulo_original") as string) || null,
        nota_trazabilidad: (formData.get("nota_trazabilidad") as string) || null,
        fecha_es_estimada: formData.get("fecha_es_estimada") === "on",
        conflicto: formData.get("conflicto") === "on",
        conflicto_nota: (formData.get("conflicto_nota") as string) || null,
      };
      const { error } = await supabase.from("episodes").insert(ep);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      setOpen(false);
      toast.success("Episodio creado");
    },
    onError: (e) => toast.error(e.message),
  });

  const exportCSV = () => {
    if (!episodes.length) return;
    const headers = ["number", "title", "theme", "status", "nivel_completitud", "release_date", "duration", "link_spotify", "streams_total", "conflicto"];
    const rows = episodes.map((ep) => headers.map((h) => {
      const val = (ep as any)[h];
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

  const getNivelStyle = (nivel: string | null) => {
    switch (nivel) {
      case "A": return "bg-[hsl(var(--chart-2)/0.15)] text-[hsl(var(--chart-2))] border-[hsl(var(--chart-2)/0.3)]";
      case "B": return "bg-[hsl(var(--chart-4)/0.15)] text-[hsl(var(--chart-4))] border-[hsl(var(--chart-4)/0.3)]";
      case "C": return "bg-[hsl(var(--chart-3)/0.15)] text-[hsl(var(--chart-3))] border-[hsl(var(--chart-3)/0.3)]";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  const getStatusStyle = (status: string | null) => {
    switch (status) {
      case "published": return "text-[hsl(var(--chart-2))] bg-[hsl(var(--chart-2)/0.1)] border-[hsl(var(--chart-2)/0.2)]";
      case "draft": return "text-muted-foreground bg-muted border-border";
      case "recording": return "text-[hsl(var(--chart-1))] bg-[hsl(var(--chart-1)/0.1)] border-[hsl(var(--chart-1)/0.2)]";
      default: return "text-[hsl(var(--chart-3))] bg-[hsl(var(--chart-3)/0.1)] border-[hsl(var(--chart-3)/0.2)]";
    }
  };

  const statusLabel = (s: string | null) => {
    switch (s) {
      case "published": return "Publicado";
      case "recording": return "Grabando";
      case "editing": return "En edición";
      default: return "Borrador";
    }
  };

  const filtered = episodes.filter((ep) =>
    !search || ep.title?.toLowerCase().includes(search.toLowerCase()) || ep.number?.includes(search) || ep.theme?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="page-title">Episodios</h1>
          <p className="page-subtitle">Gestiona la producción y publicación de tus episodios.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV} disabled={!episodes.length}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Episodio
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nuevo episodio</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addEpisode.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Título *</Label><Input name="title" required /></div>
                  <div><Label>Número</Label><Input name="number" placeholder="01" /></div>
                </div>
                <div><Label>Título original (si cambió)</Label><Input name="titulo_original" /></div>
                <div><Label>Tema</Label><Input name="theme" /></div>
                <div><Label>Resumen</Label><Textarea name="summary" rows={2} /></div>
                
                <div className="border-t border-border pt-4 space-y-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Spotify & Distribución</p>
                  <div><Label>Link Spotify</Label><Input name="link_spotify" placeholder="https://open.spotify.com/episode/..." /></div>
                  <div><Label>Descripción Spotify</Label><Textarea name="descripcion_spotify" rows={2} /></div>
                </div>

                <div className="border-t border-border pt-4 space-y-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Validación</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Nivel de completitud</Label>
                      <Select name="nivel_completitud" defaultValue="D">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A — Completo</SelectItem>
                          <SelectItem value="B">B — Casi listo</SelectItem>
                          <SelectItem value="C">C — En progreso</SelectItem>
                          <SelectItem value="D">D — Idea</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center gap-3 pt-6">
                      <Switch name="fecha_es_estimada" id="fecha_est" />
                      <Label htmlFor="fecha_est" className="text-sm">Fecha estimada</Label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch name="conflicto" id="conflicto" />
                    <Label htmlFor="conflicto" className="text-sm">Tiene conflicto</Label>
                  </div>
                  <div><Label>Nota de conflicto</Label><Input name="conflicto_nota" placeholder="Ej: tema repetido con EP.12" /></div>
                  <div><Label>Nota de trazabilidad</Label><Textarea name="nota_trazabilidad" rows={2} placeholder="Origen de la idea, decisiones editoriales..." /></div>
                </div>

                <Button type="submit" className="w-full" disabled={addEpisode.isPending}>Crear</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título, número o tema..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
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
                  <th className="px-4 py-3 font-medium">Portada</th>
                  <th className="px-4 py-3 font-medium">Episodio</th>
                  <th className="px-4 py-3 font-medium">Tema</th>
                  <th className="px-4 py-3 font-medium">Nivel</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Lanzamiento</th>
                  <th className="px-4 py-3 font-medium">Streams</th>
                  <th className="px-4 py-3 font-medium">Duración</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ep) => (
                  <tr key={ep.id} className="surface-hover">
                    <td className="px-4 py-3">
                      {ep.cover_image_url ? (
                        <img src={ep.cover_image_url} alt="Cover" className="w-10 h-10 rounded-md object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                          <Mic className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {ep.conflicto && (
                          <span title={ep.conflicto_nota || "Conflicto"}>
                            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                          </span>
                        )}
                        <div className="flex flex-col">
                          <span
                            className="font-medium text-foreground hover:text-primary cursor-pointer transition-colors"
                            onClick={() => navigate(`/episodes/${ep.id}`)}
                          >
                            {ep.title}
                          </span>
                          {ep.number && <span className="text-xs text-muted-foreground mt-0.5">#{ep.number}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{ep.theme || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`text-[10px] font-bold ${getNivelStyle(ep.nivel_completitud)}`}>
                        {ep.nivel_completitud || "D"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(ep.status)}`}>
                        {statusLabel(ep.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ep.release_date ? (
                        <div className="flex items-center gap-2 text-foreground">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span>{ep.release_date}</span>
                          {ep.fecha_es_estimada && <span className="text-[10px] text-muted-foreground">~est.</span>}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-foreground font-mono text-xs">
                      {ep.streams_total ? ep.streams_total.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{ep.duration || "—"}</td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => {
                          const params = new URLSearchParams();
                          if (ep.number) params.set("number", ep.number);
                          if (ep.title) params.set("title", ep.title);
                          if (ep.theme) params.set("theme", ep.theme);
                          if (ep.summary) params.set("script", ep.summary);
                          if (ep.hook) params.set("hook", ep.hook);
                          if (ep.quote) params.set("quote", ep.quote);
                          if (ep.cta) params.set("cta", ep.cta);
                          params.set("episode_id", ep.id);
                          navigate(`/factory?${params.toString()}`);
                        }}
                      >
                        <Factory className="h-3.5 w-3.5 mr-1" />
                        Producir
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
