import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mic, TrendingUp, BarChart3, PlayCircle, ListTodo } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { data: episodes = [] } = useQuery({
    queryKey: ["episodes"],
    queryFn: async () => {
      const { data } = await supabase.from("episodes").select("*").order("created_at", { ascending: false }).limit(5);
      return data || [];
    },
  });

  const { data: taskCount = 0 } = useQuery({
    queryKey: ["task-count"],
    queryFn: async () => {
      const { count } = await supabase.from("tasks").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: episodeCount = 0 } = useQuery({
    queryKey: ["episode-count"],
    queryFn: async () => {
      const { count } = await supabase.from("episodes").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: audienceCount = 0 } = useQuery({
    queryKey: ["audience-count"],
    queryFn: async () => {
      const { count } = await supabase.from("audience_members").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const { data: mentionCount = 0 } = useQuery({
    queryKey: ["mention-count"],
    queryFn: async () => {
      const { count } = await supabase.from("mentions").select("*", { count: "exact", head: true });
      return count || 0;
    },
  });

  const metrics = [
    { name: "Audiencia Total", value: String(audienceCount), unit: "personas", icon: Users },
    { name: "Episodios", value: String(episodeCount), unit: "total", icon: Mic },
    { name: "Tareas", value: String(taskCount), unit: "pendientes", icon: TrendingUp },
    { name: "Menciones", value: String(mentionCount), unit: "este mes", icon: BarChart3 },
  ];

  const statusLabel = (s: string | null) => {
    switch (s) {
      case "published": return { text: "Publicado", cls: "text-[hsl(var(--chart-2))] bg-[hsl(var(--chart-2)/0.1)]" };
      case "recording": return { text: "Grabando", cls: "text-[hsl(var(--chart-1))] bg-[hsl(var(--chart-1)/0.1)]" };
      case "editing": return { text: "En edición", cls: "text-[hsl(var(--chart-3))] bg-[hsl(var(--chart-3)/0.1)]" };
      default: return { text: "Borrador", cls: "text-muted-foreground bg-muted" };
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Bienvenido a AMTME OS. Aquí está el resumen de tu contenido.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="stat-card">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-secondary rounded-lg">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-muted-foreground text-sm font-medium">{metric.name}</h3>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-display font-bold text-foreground">{metric.value}</span>
                <span className="text-xs text-muted-foreground">{metric.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Episodes */}
      <div className="surface overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-display font-semibold text-foreground">Episodios Recientes</h2>
          <Link to="/episodes" className="text-sm text-primary hover:text-primary/80 font-medium">
            Ver todos
          </Link>
        </div>
        {episodes.length === 0 ? (
          <div className="empty-state py-12">
            <Mic className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No hay episodios aún</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {episodes.map((ep: any) => {
              const status = statusLabel(ep.status);
              return (
                <div key={ep.id} className="p-5 flex items-center justify-between surface-hover">
                  <div className="flex items-center gap-4">
                    <PlayCircle className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{ep.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {ep.number ? `#${ep.number}` : ""} {ep.release_date ? `• ${ep.release_date}` : ""}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>
                    {status.text}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pending Tasks */}
      <div className="surface overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-display font-semibold text-foreground">Tareas Pendientes</h2>
          <Link to="/tasks" className="text-sm text-primary hover:text-primary/80 font-medium">
            Ver todas
          </Link>
        </div>
        <div className="empty-state py-12">
          <ListTodo className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No hay tareas pendientes</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
