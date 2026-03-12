import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Mic, ExternalLink, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { auditEpisode, getCompletenessLevel } from "@/lib/episode-validation";

interface Props {
  episode: Record<string, any>;
  assetCount: number;
  taskCount: number;
}

export function WorkspaceSummary({ episode, assetCount, taskCount }: Props) {
  const audit = auditEpisode(episode);
  const level = getCompletenessLevel(audit.healthScore);

  return (
    <div className="space-y-6">
      {/* Health Score */}
      <div className="surface p-5 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-foreground">Salud del episodio</h3>
          <Badge variant="outline" className={level.color}>{level.nivel} — {level.label}</Badge>
        </div>
        <Progress value={audit.healthScore} className="h-2" />
        <p className="text-xs text-muted-foreground">{audit.healthScore}% completado · {audit.validations.filter(v => v.status === "ok").length}/{audit.validations.length} campos</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="surface p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{assetCount}</p>
          <p className="text-xs text-muted-foreground">Assets</p>
        </div>
        <div className="surface p-4 text-center">
          <p className="text-2xl font-display font-bold text-foreground">{taskCount}</p>
          <p className="text-xs text-muted-foreground">Tareas</p>
        </div>
        <div className="surface p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            {audit.canProduce ? (
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--chart-2))]" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Producción</p>
        </div>
        <div className="surface p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            {audit.canPublish ? (
              <CheckCircle2 className="h-5 w-5 text-[hsl(var(--chart-2))]" />
            ) : (
              <XCircle className="h-5 w-5 text-destructive" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Publicación</p>
        </div>
      </div>

      {/* Blockers */}
      {audit.blockers.length > 0 && (
        <div className="surface p-4 space-y-2 border-l-2 border-destructive">
          <h4 className="text-xs font-medium text-destructive flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" /> Bloqueos
          </h4>
          {audit.blockers.map((b, i) => (
            <p key={i} className="text-xs text-muted-foreground">{b}</p>
          ))}
        </div>
      )}

      {audit.warnings.length > 0 && (
        <div className="surface p-4 space-y-2 border-l-2 border-[hsl(var(--chart-3))]">
          <h4 className="text-xs font-medium text-[hsl(var(--chart-3))] flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" /> Advertencias
          </h4>
          {audit.warnings.map((w, i) => (
            <p key={i} className="text-xs text-muted-foreground">{w}</p>
          ))}
        </div>
      )}

      {/* Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {episode.release_date && (
          <div className="surface p-4 flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Lanzamiento</p>
              <p className="text-sm font-medium text-foreground">{episode.release_date}</p>
            </div>
          </div>
        )}
        {episode.duration && (
          <div className="surface p-4 flex items-center gap-3">
            <Mic className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Duración</p>
              <p className="text-sm font-medium text-foreground">{episode.duration}</p>
            </div>
          </div>
        )}
        {episode.link_spotify && (
          <div className="surface p-4 flex items-center gap-3">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Spotify</p>
              <a href={episode.link_spotify} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate block">
                Escuchar
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Summary text */}
      {episode.summary && (
        <div className="surface p-5">
          <h3 className="text-sm font-medium text-foreground mb-2">Resumen</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{episode.summary}</p>
        </div>
      )}

      {episode.core_thesis && (
        <div className="surface p-5">
          <h3 className="text-sm font-medium text-foreground mb-2">Tesis central</h3>
          <p className="text-sm text-muted-foreground">{episode.core_thesis}</p>
        </div>
      )}
    </div>
  );
}
