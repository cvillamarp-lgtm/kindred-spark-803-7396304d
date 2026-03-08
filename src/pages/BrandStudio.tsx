import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Image, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function BrandStudio() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: assets = [], isLoading } = useQuery({
    queryKey: ["brand_assets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("brand_assets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addAsset = useMutation({
    mutationFn: async (formData: FormData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");
      const asset = {
        user_id: user.id,
        type: formData.get("type") as string,
        label: formData.get("label") as string,
        value: formData.get("value") as string,
      };
      const { error } = await supabase.from("brand_assets").insert(asset);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brand_assets"] });
      setOpen(false);
      toast.success("Activo añadido");
    },
    onError: (e) => toast.error(e.message),
  });

  const typeLabel = (t: string) => {
    const map: Record<string, string> = { logo: "Logo", font: "Fuente", color: "Color", image: "Imagen", reference_image: "Referencia" };
    return map[t] || t;
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Brand Studio</h1>
          <p className="page-subtitle">Activos de tu marca</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Añadir activo</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuevo activo de marca</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); addAsset.mutate(new FormData(e.currentTarget)); }} className="space-y-4">
              <div><Label>Tipo</Label>
                <Select name="type" required><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="logo">Logo</SelectItem>
                    <SelectItem value="font">Fuente</SelectItem>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="image">Imagen</SelectItem>
                    <SelectItem value="reference_image">Referencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Nombre *</Label><Input name="label" required /></div>
              <div><Label>Valor *</Label><Input name="value" required placeholder="Hex, URL, nombre..." /></div>
              <Button type="submit" className="w-full" disabled={addAsset.isPending}>Guardar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <Card key={i} className="h-24 animate-pulse bg-muted" />)}</div>
      ) : assets.length === 0 ? (
        <div className="empty-state">
          <Image className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No hay activos de marca aún</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((a: any) => (
            <Card key={a.id}>
              <CardContent className="pt-4 flex items-center gap-3">
                {a.type === "color" && <div className="h-10 w-10 rounded-lg border" style={{ backgroundColor: a.value }} />}
                <div>
                  <p className="font-medium text-sm">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{typeLabel(a.type)} · {a.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
