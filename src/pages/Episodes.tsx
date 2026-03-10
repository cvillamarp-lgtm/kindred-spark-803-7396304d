import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Mic, Plus, Search, Calendar } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types";

export default function Episodes() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

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
        number: formData.get("number") as string || null,
        theme: formData.get("theme") as string || null,
        summary: formData.get("summary") as string || null,
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

  const filtered = episodes.filter((ep: any) =>
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
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Episodio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo episodio</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addEpisode.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div><Label>Título *</Label><Input name="title" required /></div>
              <div><Label>Número</Label><Input name="number" /></div>
              <div><Label>Tema</Label><Input name="theme" /></div>
              <div><Label>Resumen</Label><Textarea name="summary" /></div>
              <Button type="submit" className="w-full" disabled={addEpisode.isPending}>Crear</Button>
            </form>
          </DialogContent>
        </Dialog>
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
                  <th className="px-6 py-4 font-medium">Portada</th>
                  <th className="px-6 py-4 font-medium">Episodio</th>
                  <th className="px-6 py-4 font-medium">Tema</th>
                  <th className="px-6 py-4 font-medium">Estado</th>
                  <th className="px-6 py-4 font-medium">Lanzamiento</th>
                  <th className="px-6 py-4 font-medium">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ep: any) => (
                  <tr key={ep.id} className="surface-hover">
                    <td className="px-6 py-4">
                      {(ep as any).cover_image_url ? (
                        <img src={(ep as any).cover_image_url} alt="Cover" className="w-10 h-10 rounded-md object-cover border border-border" />
                      ) : (
                        <div className="w-10 h-10 rounded-md bg-secondary flex items-center justify-center">
                          <Mic className="w-4 h-4 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">{ep.title}</span>
                        {ep.number && <span className="text-xs text-muted-foreground mt-0.5">#{ep.number}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground">{ep.theme || "—"}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(ep.status)}`}>
                        {statusLabel(ep.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {ep.release_date ? (
                        <div className="flex items-center gap-2 text-foreground">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {ep.release_date}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{ep.duration || "—"}</td>
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
