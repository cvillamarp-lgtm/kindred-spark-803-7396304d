import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ListTodo, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Tasks() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addTask = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const t = {
        user_id: user.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string || null,
        priority: formData.get("priority") as string || "medium",
        category: formData.get("category") as string || null,
      };
      const { error } = await supabase.from("tasks").insert(t);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setOpen(false);
      toast.success("Tarea creada");
    },
    onError: (e) => toast.error(e.message),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const { error } = await supabase.from("tasks").update({ status: done ? "done" : "todo" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const priorityColor = (p: string) => {
    switch(p) {
      case "high": return "destructive" as const;
      case "medium": return "secondary" as const;
      default: return "outline" as const;
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Tareas</h1>
          <p className="page-subtitle">Gestión de tareas del podcast</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nueva tarea</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nueva tarea</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addTask.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div><Label>Título *</Label><Input name="title" required /></div>
              <div><Label>Descripción</Label><Textarea name="description" /></div>
              <div><Label>Prioridad</Label>
                <Select name="priority" defaultValue="medium"><SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Categoría</Label><Input name="category" /></div>
              <Button type="submit" className="w-full" disabled={addTask.isPending}>Crear</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[1,2,3].map(i => <Card key={i} className="h-16 animate-pulse bg-muted" />)}</div>
      ) : tasks.length === 0 ? (
        <div className="empty-state">
          <ListTodo className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No hay tareas aún</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((t: any) => (
            <Card key={t.id} className={t.status === "done" ? "opacity-60" : ""}>
              <CardContent className="flex items-center gap-3 py-3">
                <Checkbox
                  checked={t.status === "done"}
                  onCheckedChange={(checked) => toggleTask.mutate({ id: t.id, done: !!checked })}
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.status === "done" ? "line-through" : ""}`}>{t.title}</p>
                  {t.category && <p className="text-xs text-muted-foreground">{t.category}</p>}
                </div>
                <Badge variant={priorityColor(t.priority)}>{t.priority}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
