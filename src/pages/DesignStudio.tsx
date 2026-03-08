import { Card, CardContent } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function DesignStudio() {
  return (
    <div className="page-container animate-fade-in">
      <div>
        <h1 className="page-title">Design Studio</h1>
        <p className="page-subtitle">Crea portadas y assets visuales</p>
      </div>
      <Card>
        <CardContent>
          <div className="empty-state">
            <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">Próximamente: generación de portadas y templates visuales</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
