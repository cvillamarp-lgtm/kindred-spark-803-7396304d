import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function EditorialCalendar() {
  return (
    <div className="page-container animate-fade-in">
      <div>
        <h1 className="page-title">Calendario Editorial</h1>
        <p className="page-subtitle">Planifica tu contenido</p>
      </div>
      <Card>
        <CardContent>
          <div className="empty-state">
            <Calendar className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">El calendario se llenará con tus episodios programados</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
