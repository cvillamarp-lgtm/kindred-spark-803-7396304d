import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Users, Calendar, ListTodo } from "lucide-react";

const stats = [
  { label: "Episodes", value: "0", icon: Mic, color: "text-primary" },
  { label: "Audience", value: "0", icon: Users, color: "text-accent" },
  { label: "This Month", value: "0", icon: Calendar, color: "text-chart-3" },
  { label: "Tasks", value: "0", icon: ListTodo, color: "text-chart-4" },
];

const Dashboard = () => {
  return (
    <div className="page-container animate-fade-in">
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Resumen general de tu podcast</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="stat-card border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-display font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Próximos episodios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="empty-state py-8">
              <Mic className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No hay episodios programados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tareas pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="empty-state py-8">
              <ListTodo className="h-10 w-10 text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No hay tareas pendientes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
