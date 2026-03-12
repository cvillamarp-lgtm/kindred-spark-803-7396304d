import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Loader2, Save, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  episode: Record<string, any>;
  onSave: (updates: Record<string, any>) => Promise<void>;
  isSaving: boolean;
}

export function WorkspaceScript({ episode, onSave, isSaving }: Props) {
  const [scriptBase, setScriptBase] = useState(episode.script_base || "");
  const [scriptGenerated, setScriptGenerated] = useState(episode.script_generated || "");
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateScript = async () => {
    if (!episode.theme && !episode.working_title) {
      toast.error("El episodio necesita tema o título para generar guión");
      return;
    }
    setGenerating(true);
    setScriptGenerated("");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Sesión expirada");

      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-script`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            theme: episode.theme,
            title: episode.final_title || episode.working_title,
            format: "solo",
          }),
        }
      );

      if (!resp.ok || !resp.body) throw new Error("Error al generar");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullText += content;
              setScriptGenerated(fullText);
            }
          } catch { /* skip */ }
        }
      }

      toast.success("Guión generado");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const saveScripts = async () => {
    await onSave({
      script_base: scriptBase || null,
      script_generated: scriptGenerated || null,
    });
    toast.success("Guiones guardados");
  };

  const copyScript = () => {
    const text = scriptGenerated || scriptBase;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Escribe o genera el guión directamente desde los datos del episodio.
        </p>
        <div className="flex gap-2">
          {(scriptBase || scriptGenerated) && (
            <Button variant="outline" size="sm" onClick={copyScript}>
              {copied ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
              {copied ? "Copiado" : "Copiar"}
            </Button>
          )}
          <Button size="sm" onClick={saveScripts} disabled={isSaving}>
            <Save className="h-3.5 w-3.5 mr-1" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Script base */}
      <div className="surface p-5 space-y-3">
        <Label>Guión base (manual)</Label>
        <Textarea
          value={scriptBase}
          onChange={(e) => setScriptBase(e.target.value)}
          rows={8}
          placeholder="Pega o escribe tu guión aquí..."
          className="font-mono text-sm"
        />
      </div>

      {/* Script generated */}
      <div className="surface p-5 space-y-3">
        <div className="flex justify-between items-center">
          <Label>Guión generado (IA)</Label>
          <Button size="sm" variant="outline" onClick={generateScript} disabled={generating}>
            {generating ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            {generating ? "Generando..." : "Generar desde datos"}
          </Button>
        </div>
        <div className="bg-secondary/30 rounded-lg p-4 min-h-[200px]">
          <pre className="text-sm text-foreground/90 whitespace-pre-wrap font-body leading-relaxed">
            {scriptGenerated || <span className="text-muted-foreground">El guión generado aparecerá aquí</span>}
            {generating && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5" />}
          </pre>
        </div>
      </div>
    </div>
  );
}
