import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  episode: Record<string, any>;
  onSave: (updates: Record<string, any>) => Promise<void>;
  isSaving: boolean;
}

export function WorkspaceDataForm({ episode, onSave, isSaving }: Props) {
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (episode) {
      setForm({
        number: episode.number || "",
        working_title: episode.working_title || episode.title || "",
        final_title: episode.final_title || "",
        titulo_original: episode.titulo_original || "",
        theme: episode.theme || "",
        core_thesis: episode.core_thesis || "",
        summary: episode.summary || "",
        descripcion_spotify: episode.descripcion_spotify || "",
        link_spotify: episode.link_spotify || "",
        hook: episode.hook || "",
        cta: episode.cta || "",
        quote: episode.quote || "",
        release_date: episode.release_date || "",
        duration: episode.duration || "",
        nota_trazabilidad: episode.nota_trazabilidad || "",
        conflicto_detectado: episode.conflicto_detectado || false,
        conflicto_nota: episode.conflicto_nota || "",
        fecha_es_estimada: episode.fecha_es_estimada || false,
        nivel_completitud: episode.nivel_completitud || "D",
      });
    }
  }, [episode]);

  const update = (key: string, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      await onSave({
        ...form,
        title: form.final_title || form.working_title,
        conflicto: form.conflicto_detectado,
      });
      toast.success("Episodio actualizado");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Guardar cambios
        </Button>
      </div>

      {/* Identificación */}
      <div className="surface p-5 space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Identificación</p>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Número *</Label><Input value={form.number} onChange={(e) => update("number", e.target.value)} placeholder="01" className="font-mono" /></div>
          <div>
            <Label>Nivel de completitud</Label>
            <Select value={form.nivel_completitud} onValueChange={(v) => update("nivel_completitud", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A — Completo</SelectItem>
                <SelectItem value="B">B — Casi listo</SelectItem>
                <SelectItem value="C">C — En progreso</SelectItem>
                <SelectItem value="D">D — Idea</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Título de trabajo *</Label><Input value={form.working_title} onChange={(e) => update("working_title", e.target.value)} /></div>
        <div><Label>Título final</Label><Input value={form.final_title} onChange={(e) => update("final_title", e.target.value)} /></div>
        <div><Label>Título original (si cambió)</Label><Input value={form.titulo_original} onChange={(e) => update("titulo_original", e.target.value)} /></div>
      </div>

      {/* Contenido */}
      <div className="surface p-5 space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Contenido</p>
        <div><Label>Tema *</Label><Input value={form.theme} onChange={(e) => update("theme", e.target.value)} /></div>
        <div><Label>Tesis central</Label><Textarea value={form.core_thesis} onChange={(e) => update("core_thesis", e.target.value)} rows={2} placeholder="La idea central que sostiene el episodio" /></div>
        <div><Label>Resumen *</Label><Textarea value={form.summary} onChange={(e) => update("summary", e.target.value)} rows={3} /></div>
        <div><Label>Hook</Label><Textarea value={form.hook} onChange={(e) => update("hook", e.target.value)} rows={2} placeholder="Frase de apertura" /></div>
        <div><Label>CTA *</Label><Textarea value={form.cta} onChange={(e) => update("cta", e.target.value)} rows={2} placeholder="Llamada a la acción" /></div>
        <div><Label>Quote</Label><Input value={form.quote} onChange={(e) => update("quote", e.target.value)} placeholder="Frase destacable del episodio" /></div>
      </div>

      {/* Distribución */}
      <div className="surface p-5 space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Distribución</p>
        <div><Label>Descripción Spotify *</Label><Textarea value={form.descripcion_spotify} onChange={(e) => update("descripcion_spotify", e.target.value)} rows={3} /></div>
        <div><Label>Link Spotify</Label><Input value={form.link_spotify} onChange={(e) => update("link_spotify", e.target.value)} placeholder="https://open.spotify.com/episode/..." /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Fecha de lanzamiento</Label><Input type="date" value={form.release_date} onChange={(e) => update("release_date", e.target.value)} /></div>
          <div><Label>Duración</Label><Input value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="45:00" /></div>
        </div>
        <div className="flex items-center gap-3">
          <Switch checked={form.fecha_es_estimada} onCheckedChange={(v) => update("fecha_es_estimada", v)} />
          <Label className="text-sm">Fecha estimada</Label>
        </div>
      </div>

      {/* Validación */}
      <div className="surface p-5 space-y-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Validación y Trazabilidad</p>
        <div><Label>Nota de trazabilidad *</Label><Textarea value={form.nota_trazabilidad} onChange={(e) => update("nota_trazabilidad", e.target.value)} rows={2} placeholder="Origen de la idea, decisiones editoriales..." /></div>
        <div className="flex items-center gap-3">
          <Switch checked={form.conflicto_detectado} onCheckedChange={(v) => update("conflicto_detectado", v)} />
          <Label className="text-sm">Conflicto detectado</Label>
        </div>
        {form.conflicto_detectado && (
          <div><Label>Nota de conflicto</Label><Input value={form.conflicto_nota} onChange={(e) => update("conflicto_nota", e.target.value)} placeholder="Ej: tema repetido con EP.12" /></div>
        )}
      </div>
    </div>
  );
}
