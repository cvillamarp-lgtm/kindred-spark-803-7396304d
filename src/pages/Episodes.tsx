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
import { Mic, Plus, Search, Download, Factory } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useEpisodes } from "@/hooks/useEpisode";
import { auditEpisode, getCompletenessLevel } from "@/lib/episode-validation";

export default function Episodes() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { data: episodes = [], isLoading } = useEpisodes();

  const addEpisode = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const ep = {
        user_id: user.id,
        title: formData.get("title") as string,
        working_title: formData.get("title") as string,
        number: (formData.get("number") as string) || null,
        theme: (formData.get("theme") as string) || null,
        summary: (formData.get("summary") as string) || null,
        nivel_completitud: "D",
      };
      const { data, error } = await supabase.from("episodes").insert(ep).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["episodes"] });
      setOpen(false);
      toast.success("Episodio creado");
      // Navigate to workspace immediately
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
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Nuevo Episodio</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nuevo episodio</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); addEpisode.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Título *</Label><Input name="title" required /></div>
                  <div><Label>Número</Label><Input name="number" placeholder="01" /></div>
                </div>
                <div><Label>Tema</Label><Input name="theme" /></div>
                <div><Label>Resumen</Label><Textarea name="summary" rows={2} /></div>
                <p className="text-xs text-muted-foreground">Completa los detalles en el Episode Workspace después de crear.</p>
                <Button type="submit" className="w-full" disabled={addEpisode.isPending}>Crear y abrir Workspace</Button>
              </form>
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
