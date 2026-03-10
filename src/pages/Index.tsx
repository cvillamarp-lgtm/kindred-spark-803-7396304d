import { Users, Mic, TrendingUp, BarChart3, PlayCircle, ListTodo } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import type { Tables } from "@/integrations/supabase/types";

const Dashboard = () => {
  const { data: episodes = [], isLoading: loadingEpisodes } = useQuery({
    queryKey: ["dashboard-episodes"],
    queryFn: async () => {
      const { data } = await supabase.from("episodes").select("id, title, number, status, release_date").order("created_at", { ascending: false }).limit(5);
      return (data || []) as Pick<Tables<"episodes">, "id" | "title" | "number" | "status" | "release_date">[];
    },
  });

  const { data: counts, isLoading: loadingCounts } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const [episodes, tasks, audience, mentions] = await Promise.all([
        supabase.from("episodes").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "todo"),
        supabase.from("audience_members").select("*", { count: "exact", head: true }),
        supabase.from("mentions").select("*", { count: "exact", head: true }),
      ]);
      return {
        episodes: episodes.count || 0,
        tasks: tasks.count || 0,
        audience: audience.count || 0,
        mentions: mentions.count || 0,
      };
    },
  });

  const { data: pendingTasks = [], isLoading: loadingTasks } = useQuery({
    queryKey: ["dashboard-tasks"],
    queryFn: async () => {
      const { data } = await supabase.from("tasks").select("id, title, priority, category").eq("status", "todo").order("created_at", { ascending: false }).limit(5);
      return (data || []) as Pick<Tables<"tasks">, "id" | "title" | "priority" | "category">[];
    },
  });

  const metrics = [
    { name: "Audiencia Total", value: String(counts?.audience ?? 0), unit: "personas", icon: Users },
    { name: "Episodios", value: String(counts?.episodes ?? 0), unit: "total", icon: Mic },
    { name: "Tareas", value: String(counts?.tasks ?? 0), unit: "pendientes", icon: TrendingUp },
    { name: "Menciones", value: String(counts?.mentions ?? 0), unit: "este mes", icon: BarChart3 },
  ];

  const statusLabel = (s: string | null) => {
    switch (s) {
      case "published": return { text: "Publicado", cls: "text-chart-2 bg-chart-2/10" };
      case "recording": return { text: "Grabando", cls: "text-chart-1 bg-chart-1/10" };
      case "editing": return { text: "En edición", cls: "text-chart-3 bg-chart-3/10" };
      default: return { text: "Borrador", cls: "text-muted-foreground bg-muted" };
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <PageHeader title="Dashboard" subtitle="Bienvenido a AMTME OS. Aquí está el resumen de tu contenido." />

      {/* Metric Cards */}
      {loadingCounts ? (
        <LoadingSkeleton count={4} variant="stat" />
      ) : (
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
      )}

      {/* Recent Episodes */}
      <div className="surface overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-display font-semibold text-foreground">Episodios Recientes</h2>
          <Link to="/episodes" className="text-sm text-primary hover:text-primary/80 font-medium">Ver todos</Link>
        </div>
        {loadingEpisodes ? (
          <div className="p-5"><LoadingSkeleton count={3} variant="row" /></div>
        ) : episodes.length === 0 ? (
          <EmptyState icon={Mic} message="No hay episodios aún" className="py-12" />
        ) : (
          <div className="divide-y divide-border">
            {episodes.map((ep) => {
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
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status.cls}`}>{status.text}</span>
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
          <Link to="/tasks" className="text-sm text-primary hover:text-primary/80 font-medium">Ver todas</Link>
        </div>
        {loadingTasks ? (
          <div className="p-5"><LoadingSkeleton count={3} variant="row" /></div>
        ) : pendingTasks.length === 0 ? (
          <EmptyState icon={ListTodo} message="No hay tareas pendientes" className="py-12" />
        ) : (
          <div className="divide-y divide-border">
            {pendingTasks.map((t: any) => (
              <div key={t.id} className="p-5 flex items-center justify-between surface-hover">
                <div className="flex items-center gap-4">
                  <ListTodo className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.title}</p>
                    {t.category && <p className="text-xs text-muted-foreground mt-0.5">{t.category}</p>}
                  </div>
                </div>
                {t.priority === "high" && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Alta</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
