import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function MetricsPage() {
  return (
    <div className="page-container animate-fade-in">
      <div>
        <h1 className="page-title">Métricas</h1>
        <p className="page-subtitle">Analítica de tu podcast</p>
      </div>
      <Card>
        <CardContent>
          <div className="empty-state">
            <BarChart3 className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Las métricas aparecerán cuando agregues datos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
