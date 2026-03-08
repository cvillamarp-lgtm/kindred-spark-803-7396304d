import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function Scorecard() {
  return (
    <div className="page-container animate-fade-in">
      <div>
        <h1 className="page-title">Scorecard</h1>
        <p className="page-subtitle">Evaluación y puntuación de tu podcast</p>
      </div>
      <Card>
        <CardContent>
          <div className="empty-state">
            <Settings className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">El scorecard se generará con tus métricas y episodios</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
