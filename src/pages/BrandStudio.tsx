import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Check, Pencil, Save, X, ChevronRight } from "lucide-react";
import { brandSections, BrandSection, BrandOption, BrandCard } from "@/lib/brand-system-data";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type EditState = {
  sectionId: string;
  optionId: string;
  cardIndex: number;
  field: "title" | "body" | "eyebrow";
  value: string;
} | null;

type TableEditState = {
  sectionId: string;
  optionId: string;
  rowIndex: number;
  colIndex: number;
  value: string;
} | null;

export default function BrandStudio() {
  const [activeSection, setActiveSection] = useState(brandSections[0].id);
  const [activeOptions, setActiveOptions] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    brandSections.forEach(s => { init[s.id] = s.options[0].id; });
    return init;
  });
  const [sections, setSections] = useState<BrandSection[]>(brandSections);
  const [editing, setEditing] = useState<EditState>(null);
  const [tableEditing, setTableEditing] = useState<TableEditState>(null);
  const queryClient = useQueryClient();

  // Load saved overrides from DB
  const { data: savedOverrides } = useQuery({
    queryKey: ["brand_system_overrides"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brand_assets").select("*").eq("type", "brand_system_override");
      if (error) throw error;
      return data;
    },
  });

  const saveOverride = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      // Upsert by checking existing
      const { data: existing } = await supabase.from("brand_assets")
        .select("id").eq("type", "brand_system_override").eq("label", key).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("brand_assets").update({ value }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("brand_assets").insert({ user_id: user.id, type: "brand_system_override", label: key, value });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand_system_overrides"] });
      toast.success("Cambio guardado");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSaveEdit = useCallback(() => {
    if (!editing) return;
    const { sectionId, optionId, cardIndex, field, value } = editing;
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        options: s.options.map(o => {
          if (o.id !== optionId) return o;
          return {
            ...o,
            cards: o.cards.map((c, i) => i === cardIndex ? { ...c, [field]: value } : c),
          };
        }),
      };
    }));
    saveOverride.mutate({ key: `${sectionId}.${optionId}.${cardIndex}.${field}`, value });
    setEditing(null);
  }, [editing, saveOverride]);

  const handleSaveTableEdit = useCallback(() => {
    if (!tableEditing) return;
    const { sectionId, optionId, rowIndex, colIndex, value } = tableEditing;
    setSections(prev => prev.map(s => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        options: s.options.map(o => {
          if (o.id !== optionId || !o.table) return o;
          const newRows = o.table.rows.map((row, ri) =>
            ri === rowIndex ? row.map((cell, ci) => ci === colIndex ? value : cell) : row
          );
          return { ...o, table: { ...o.table, rows: newRows } };
        }),
      };
    }));
    saveOverride.mutate({ key: `${sectionId}.${optionId}.table.${rowIndex}.${colIndex}`, value });
    setTableEditing(null);
  }, [tableEditing, saveOverride]);

  const currentSection = sections.find(s => s.id === activeSection)!;
  const currentOptionId = activeOptions[activeSection];
  const currentOption = currentSection.options.find(o => o.id === currentOptionId)!;

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-fade-in">
      {/* Sidebar Navigation */}
      <aside className="w-60 shrink-0 border-r border-border bg-card/50 overflow-y-auto">
        <div className="p-4 border-b border-border">
          <p className="text-[10px] font-extrabold tracking-[.3em] uppercase text-muted-foreground">Brand System</p>
          <p className="text-sm font-black mt-1">A mi tampoco<br /><span className="text-primary">me explicaron</span></p>
        </div>
        <div className="py-2">
          <p className="px-4 py-2 text-[9px] font-bold tracking-[.2em] uppercase text-muted-foreground/60">Identidad</p>
          {sections.slice(0, 8).map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors text-left border-l-2",
                activeSection === s.id
                  ? "border-l-primary bg-primary/5 text-foreground"
                  : "border-l-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-[9px] font-extrabold text-primary min-w-[24px]">{s.number}</span>
              {s.eyebrow}
            </button>
          ))}
          <p className="px-4 py-2 mt-2 text-[9px] font-bold tracking-[.2em] uppercase text-muted-foreground/60">Estrategia</p>
          {sections.slice(8, 10).map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors text-left border-l-2",
                activeSection === s.id
                  ? "border-l-primary bg-primary/5 text-foreground"
                  : "border-l-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-[9px] font-extrabold text-primary min-w-[24px]">{s.number}</span>
              {s.eyebrow}
            </button>
          ))}
          <p className="px-4 py-2 mt-2 text-[9px] font-bold tracking-[.2em] uppercase text-muted-foreground/60">Marketing Digital</p>
          {sections.slice(10).map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "w-full flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors text-left border-l-2",
                activeSection === s.id
                  ? "border-l-primary bg-primary/5 text-foreground"
                  : "border-l-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="text-[9px] font-extrabold text-primary min-w-[24px]">{s.number}</span>
              {s.eyebrow}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <div className="sticky top-0 z-10 bg-primary px-6 py-3 flex items-center gap-3">
          <span className="text-primary-foreground text-xs font-bold tracking-[.2em] uppercase">
            AMTME <span className="text-primary-foreground/70">Brand System</span>
          </span>
          <span className="bg-primary-foreground/15 text-primary-foreground text-[10px] font-bold px-2.5 py-0.5 rounded-full tracking-wider">
            14 Secciones · 3 Variantes
          </span>
        </div>

        <div className="p-6 max-w-5xl">
          {/* Section Header */}
          <div className="mb-6">
            <p className="text-[10px] font-extrabold tracking-[.3em] text-primary uppercase">{currentSection.number} — {currentSection.eyebrow}</p>
            <h1 className="text-2xl font-black text-foreground mt-1">{currentSection.title}</h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-xl">{currentSection.description}</p>
          </div>

          {/* Option Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {currentSection.options.map(opt => (
              <button
                key={opt.id}
                onClick={() => setActiveOptions(prev => ({ ...prev, [activeSection]: opt.id }))}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold border-2 transition-all",
                  currentOptionId === opt.id
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-primary border-primary hover:bg-primary/5"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {currentOption.cards.map((card, cardIdx) => (
              <Card
                key={cardIdx}
                className={cn(
                  "group relative transition-all",
                  card.accent && "bg-primary border-primary",
                  card.dark && "bg-[hsl(var(--sidebar-background))] border-[hsl(var(--sidebar-background))]"
                )}
              >
                <CardContent className="pt-5 pb-4 px-5">
                  {/* Eyebrow - editable */}
                  {editing?.sectionId === currentSection.id && editing?.optionId === currentOptionId && editing?.cardIndex === cardIdx && editing?.field === "eyebrow" ? (
                    <div className="flex items-center gap-1 mb-1">
                      <Input
                        value={editing.value}
                        onChange={e => setEditing({ ...editing, value: e.target.value })}
                        className="h-6 text-[9px] px-1"
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && handleSaveEdit()}
                      />
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleSaveEdit}><Check className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditing(null)}><X className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <p
                      className={cn(
                        "text-[9px] font-extrabold tracking-[.2em] uppercase mb-1.5 cursor-pointer hover:underline",
                        card.accent ? "text-primary-foreground/60" : card.dark ? "text-primary/80" : "text-primary/60"
                      )}
                      onClick={() => setEditing({ sectionId: currentSection.id, optionId: currentOptionId, cardIndex: cardIdx, field: "eyebrow", value: card.eyebrow })}
                    >
                      {card.eyebrow}
                    </p>
                  )}

                  {/* Title - editable */}
                  {editing?.sectionId === currentSection.id && editing?.optionId === currentOptionId && editing?.cardIndex === cardIdx && editing?.field === "title" ? (
                    <div className="flex items-center gap-1 mb-2">
                      <Input
                        value={editing.value}
                        onChange={e => setEditing({ ...editing, value: e.target.value })}
                        className="h-7 text-sm font-bold px-1"
                        autoFocus
                        onKeyDown={e => e.key === "Enter" && handleSaveEdit()}
                      />
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleSaveEdit}><Check className="w-3 h-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => setEditing(null)}><X className="w-3 h-3" /></Button>
                    </div>
                  ) : (
                    <p
                      className={cn(
                        "text-sm font-extrabold mb-2 cursor-pointer hover:underline",
                        card.accent ? "text-primary-foreground" : card.dark ? "text-primary-foreground" : "text-foreground"
                      )}
                      onClick={() => setEditing({ sectionId: currentSection.id, optionId: currentOptionId, cardIndex: cardIdx, field: "title", value: card.title })}
                    >
                      {card.title}
                    </p>
                  )}

                  {/* Body - editable */}
                  {editing?.sectionId === currentSection.id && editing?.optionId === currentOptionId && editing?.cardIndex === cardIdx && editing?.field === "body" ? (
                    <div className="space-y-1">
                      <Textarea
                        value={editing.value}
                        onChange={e => setEditing({ ...editing, value: e.target.value })}
                        className="text-xs min-h-[60px]"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <Button size="sm" variant="secondary" className="h-6 text-[10px]" onClick={handleSaveEdit}><Check className="w-3 h-3 mr-1" />Guardar</Button>
                        <Button size="sm" variant="ghost" className="h-6 text-[10px]" onClick={() => setEditing(null)}><X className="w-3 h-3 mr-1" />Cancelar</Button>
                      </div>
                    </div>
                  ) : (
                    <p
                      className={cn(
                        "text-xs leading-relaxed cursor-pointer hover:bg-foreground/5 rounded p-1 -m-1 transition-colors",
                        card.accent ? "text-primary-foreground/80" : card.dark ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                      onClick={() => setEditing({ sectionId: currentSection.id, optionId: currentOptionId, cardIndex: cardIdx, field: "body", value: card.body })}
                    >
                      {card.body}
                    </p>
                  )}

                  {/* Edit hint */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Pencil className={cn("w-3 h-3", card.accent || card.dark ? "text-primary-foreground/40" : "text-muted-foreground/40")} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table */}
          {currentOption.table && (
            <div className="rounded-lg border border-border overflow-hidden mb-6">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[hsl(var(--sidebar-background))]">
                    {currentOption.table.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left text-[10px] font-bold tracking-wider text-primary-foreground uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentOption.table.rows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 1 ? "bg-muted/30" : ""}>
                      {row.map((cell, ci) => (
                        <td key={ci} className="px-3 py-2 border-b border-border">
                          {tableEditing?.sectionId === currentSection.id && tableEditing?.optionId === currentOptionId && tableEditing?.rowIndex === ri && tableEditing?.colIndex === ci ? (
                            <div className="flex items-center gap-1">
                              <Input
                                value={tableEditing.value}
                                onChange={e => setTableEditing({ ...tableEditing, value: e.target.value })}
                                className="h-6 text-xs px-1"
                                autoFocus
                                onKeyDown={e => { if (e.key === "Enter") handleSaveTableEdit(); if (e.key === "Escape") setTableEditing(null); }}
                              />
                              <Button size="icon" variant="ghost" className="h-5 w-5" onClick={handleSaveTableEdit}><Check className="w-3 h-3" /></Button>
                            </div>
                          ) : (
                            <span
                              className="cursor-pointer hover:underline"
                              onClick={() => setTableEditing({ sectionId: currentSection.id, optionId: currentOptionId, rowIndex: ri, colIndex: ci, value: cell })}
                            >
                              {cell}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
