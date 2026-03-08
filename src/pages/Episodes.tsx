import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Mic, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Episodes() {
  const [open, setOpen] = useState(false);
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

  const statusColor = (s: string) => {
    switch(s) {
      case "published": return "default";
      case "recording": return "secondary";
      default: return "outline" as const;
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Episodios</h1>
          <p className="page-subtitle">Gestiona tus episodios de podcast</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nuevo episodio</Button>
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

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="h-20 animate-pulse bg-muted" />)}</div>
      ) : episodes.length === 0 ? (
        <div className="empty-state">
          <Mic className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No hay episodios aún</p>
        </div>
      ) : (
        <div className="space-y-3">
          {episodes.map((ep: any) => (
            <Card key={ep.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center justify-between py-4">
                <div>
                  <div className="flex items-center gap-2">
                    {ep.number && <span className="text-xs text-muted-foreground font-mono">#{ep.number}</span>}
                    <span className="font-medium">{ep.title}</span>
                  </div>
                  {ep.theme && <p className="text-sm text-muted-foreground mt-1">{ep.theme}</p>}
                </div>
                <Badge variant={statusColor(ep.status)}>{ep.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
