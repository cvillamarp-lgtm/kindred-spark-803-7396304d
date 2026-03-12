import { Mic, ListTodo, Image, Zap, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/PageHeader";
import { EmptyState } from "@/components/EmptyState";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { auditEpisode, getCompletenessLevel } from "@/lib/episode-validation";

const Dashboard = () => {
  const navigate = useNavigate();

  const { data: episodes = [], isLoading: loadingEpisodes } = useQuery({
    queryKey: ["dashboard-episodes"],
    queryFn: async () => {
      const { data } = await supabase
        .from("episodes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: counts, isLoading: loadingCounts } = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const [eps, tasks, assetsTotal, assetsPending] = await Promise.all([
        supabase.from("episodes").select("*", { count: "exact", head: true }),
        supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "todo"),
        supabase.from("content_assets").select("*", { count: "exact", head: true }),
        supabase.from("content_assets").select("*", { count: "exact", head: true }).in("status", ["generated", "pending"]),
      ]);
      return {
        episodes: eps.count || 0,
        tasks: tasks.count || 0,
        assets: assetsTotal.count || 0,
        assetsPending: assetsPending.count || 0,
      };
    },
  });

  const { data: pendingTasks = [] } = useQuery({
    queryKey: ["dashboard-tasks"],
    queryFn: async () => {
      const { data } = await supabase
        .from("tasks")
        .select("id, title, priority, category, episode_id")
        .eq("status", "todo")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const { data: recentAssets = [] } = useQuery({
    queryKey: ["dashboard-recent-assets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("content_assets")
        .select("id, piece_name, image_url, status, created_at")
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
  });

  // Audit alerts from active episodes
  const auditAlerts = episodes
    .filter((ep: any) => ep.status !== "published")
    .map((ep: any) => {
      const audit = auditEpisode(ep);
      if (audit.blockers.length === 0 && audit.warnings.length === 0) return null;
      return { episode: ep, audit };
    })
    .filter(Boolean)
    .slice(0, 3);

  const metrics = [
    { name: "Episodios", value: counts?.episodes ?? 0, unit: "total", icon: Mic },
    { name: "Assets", value: counts?.assets ?? 0, unit: `${counts?.assetsPending ?? 0} pendientes`, icon: Image },
    { name: "Tareas", value: counts?.tasks ?? 0, unit: "pendientes", icon: ListTodo },
  ];

  return (
    <div className="page-container animate-fade-in">
      <PageHeader title="Dashboard" subtitle="Centro de operaciones AMTME OS." />

      {/* Metric Cards */}
      {loadingCounts ? (
        <LoadingSkeleton count={3} variant="stat" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Audit Alerts */}
      {auditAlerts.length > 0 && (
        <div className="surface overflow-hidden">
          <div className="p-5 border-b border-border">
            <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-[hsl(var(--chart-3))]" />
              Alertas de auditoría
            </h2>
          </div>
          <div className="divide-y divide-border">
            {auditAlerts.map((item: any) => (
              <div key={item.episode.id} className="p-4 flex items-center justify-between surface-hover cursor-pointer" onClick={() => navigate(`/episodes/${item.episode.id}`)}>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.episode.number && `#${item.episode.number} — `}{item.episode.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.audit.blockers.length} bloqueos · {item.audit.warnings.length} advertencias · {item.audit.healthScore}% salud
                  </p>
                </div>
                <Badge variant="outline" className={getCompletenessLevel(item.audit.healthScore).color}>
                  {item.audit.healthScore}%
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Episodes with health */}
      <div className="surface overflow-hidden">
        <div className="p-5 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-display font-semibold text-foreground">Episodios activos</h2>
          <Link to="/episodes" className="text-sm text-primary hover:text-primary/80 font-medium">Ver todos</Link>
        </div>
        {loadingEpisodes ? (
          <div className="p-5"><LoadingSkeleton count={3} variant="row" /></div>
        ) : episodes.length === 0 ? (
          <EmptyState icon={Mic} message="No hay episodios aún" className="py-12" />
        ) : (
          <div className="divide-y divide-border">
            {episodes.map((ep: any) => {
              const audit = auditEpisode(ep);
              const level = getCompletenessLevel(audit.healthScore);
              return (
                <div
                  key={ep.id}
                  className="p-4 flex items-center gap-4 surface-hover cursor-pointer"
                  onClick={() => navigate(`/episodes/${ep.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{ep.title}</p>
                      {ep.number && <span className="text-xs text-muted-foreground">#{ep.number}</span>}
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <Progress value={audit.healthScore} className="h-1.5 flex-1 max-w-[120px]" />
                      <span className={`text-[10px] font-medium ${level.color}`}>{level.nivel} · {audit.healthScore}%</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!audit.canProduce && <Badge variant="destructive" className="text-[9px]">Bloqueado</Badge>}
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={(e) => { e.stopPropagation(); navigate(`/factory?episode_id=${ep.id}`); }}>
                      <Zap className="h-3 w-3 mr-1" />Producir
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Two columns: Tasks + Recent Assets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="surface overflow-hidden">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-display font-semibold text-foreground">Tareas pendientes</h2>
            <Link to="/tasks" className="text-sm text-primary hover:text-primary/80 font-medium">Ver todas</Link>
          </div>
          {pendingTasks.length === 0 ? (
            <EmptyState icon={ListTodo} message="Sin tareas pendientes" className="py-12" />
          ) : (
            <div className="divide-y divide-border">
              {pendingTasks.map((t: any) => (
                <div key={t.id} className="p-4 flex items-center justify-between surface-hover">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.title}</p>
                    {t.category && <p className="text-xs text-muted-foreground">{t.category}</p>}
                  </div>
                  {t.priority === "high" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Alta</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="surface overflow-hidden">
          <div className="p-5 border-b border-border flex justify-between items-center">
            <h2 className="text-lg font-display font-semibold text-foreground">Assets recientes</h2>
            <Link to="/library" className="text-sm text-primary hover:text-primary/80 font-medium">Ver todos</Link>
          </div>
          {recentAssets.length === 0 ? (
            <EmptyState icon={Image} message="No hay assets generados" className="py-12" />
          ) : (
            <div className="p-4 grid grid-cols-3 gap-2">
              {recentAssets.map((a: any) => (
                <div key={a.id} className="rounded-md overflow-hidden border border-border bg-secondary/30 aspect-square relative group">
                  {a.image_url ? (
                    <img src={a.image_url} alt={a.piece_name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Image className="h-5 w-5 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/80 to-transparent p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-foreground truncate">{a.piece_name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
