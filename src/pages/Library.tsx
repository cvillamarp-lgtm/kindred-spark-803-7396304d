import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Image, Download, CheckCircle2, Trash2, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ContentAsset {
  id: string;
  piece_id: number;
  piece_name: string;
  image_url: string | null;
  caption: string | null;
  hashtags: string | null;
  status: string | null;
  created_at: string;
  episode_id: string | null;
}

export default function Library() {
  const [assets, setAssets] = useState<ContentAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchAssets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("content_assets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error cargando biblioteca");
      console.error(error);
    } else {
      setAssets((data as any) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("content_assets")
      .update({ status } as any)
      .eq("id", id);
    if (error) {
      toast.error("Error actualizando estado");
    } else {
      setAssets((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      toast.success("Estado actualizado");
    }
  };

  const deleteAsset = async (id: string) => {
    const { error } = await supabase.from("content_assets").delete().eq("id", id);
    if (error) {
      toast.error("Error eliminando asset");
    } else {
      setAssets((prev) => prev.filter((a) => a.id !== id));
      toast.success("Asset eliminado");
    }
  };

  const filtered = assets.filter((a) => {
    if (filter !== "all" && a.status !== filter) return false;
    if (search && !a.piece_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const statusLabel: Record<string, string> = {
    pending: "Pendiente",
    generated: "Generada",
    approved: "Aprobada",
    published: "Publicada",
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-title">Biblioteca de Assets</h1>
          <p className="page-subtitle">
            Todos tus assets generados en un solo lugar
          </p>
        </div>
        <Badge variant="secondary">{assets.length} assets</Badge>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pieza..."
            className="pl-9"
          />
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[160px]">
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="pending">Pendientes</SelectItem>
            <SelectItem value="generated">Generados</SelectItem>
            <SelectItem value="approved">Aprobados</SelectItem>
            <SelectItem value="published">Publicados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Image className="h-10 w-10 mb-3 opacity-30" />
          <p className="text-sm">No hay assets{filter !== "all" ? ` con estado "${statusLabel[filter]}"` : ""}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((asset) => (
            <Card key={asset.id} className="overflow-hidden">
              <div className="rounded-t-lg overflow-hidden border-b border-border">
                <AspectRatio ratio={1}>
                  {asset.image_url ? (
                    <img
                      src={asset.image_url}
                      alt={asset.piece_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                      <Image className="h-8 w-8 text-muted-foreground/30" />
                    </div>
                  )}
                </AspectRatio>
              </div>
              <CardContent className="p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium truncate">{asset.piece_name}</span>
                  <Badge variant="secondary" className="text-[10px]">
                    {statusLabel[asset.status || "pending"] || asset.status}
                  </Badge>
                </div>
                {asset.caption && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{asset.caption}</p>
                )}
                <div className="flex gap-1">
                  {asset.status === "generated" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] flex-1"
                      onClick={() => updateStatus(asset.id, "approved")}
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Aprobar
                    </Button>
                  )}
                  {asset.status === "approved" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] flex-1"
                      onClick={() => updateStatus(asset.id, "published")}
                    >
                      Publicar
                    </Button>
                  )}
                  {asset.image_url && (
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                      <a href={asset.image_url} download target="_blank" rel="noopener noreferrer">
                        <Download className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive"
                    onClick={() => deleteAsset(asset.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
