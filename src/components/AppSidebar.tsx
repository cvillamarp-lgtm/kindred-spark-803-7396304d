import { Home, Users, Calendar, Mic, UserPlus, Image, BookOpen, BarChart3, FileText, Settings, ListTodo, Wand2, Sparkles, FileStack, AtSign, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { label: "Dashboard", url: "/", icon: Home },
  { label: "Episodios", url: "/episodes", icon: Mic },
  { label: "Calendario", url: "/calendar", icon: Calendar },
  { label: "Invitados", url: "/guests", icon: UserPlus },
  { label: "Templates", url: "/templates", icon: FileStack },
];

const toolsNav = [
  { label: "Guiones IA", url: "/scripts", icon: Sparkles },
  { label: "Prompts", url: "/prompts", icon: Wand2 },
  { label: "Design", url: "/design", icon: BookOpen },
  { label: "Brand", url: "/brand", icon: Image },
];

const analyticsNav = [
  { label: "Métricas", url: "/metrics", icon: BarChart3 },
  { label: "Audiencia", url: "/audience", icon: Users },
  { label: "Menciones", url: "/mentions", icon: AtSign },
  { label: "Score", url: "/scorecard", icon: Settings },
];

const moreNav = [
  { label: "Tareas", url: "/tasks", icon: ListTodo },
  { label: "Recursos", url: "/resources", icon: FileText },
];

function NavGroup({ label, items, collapsed }: { label: string; items: typeof mainNav; collapsed: boolean }) {
  const location = useLocation();
  return (
    <SidebarGroup>
      {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">{label}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <NavLink to={item.url} end={item.url === "/"} activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium">
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span>{item.label}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-display font-bold text-sm">A</span>
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-sidebar-primary-foreground text-lg tracking-tight">
            AMTME OS
          </span>
        )}
      </div>

      <SidebarContent>
        <NavGroup label="Producción" items={mainNav} collapsed={collapsed} />
        <NavGroup label="Herramientas" items={toolsNav} collapsed={collapsed} />
        <NavGroup label="Analítica" items={analyticsNav} collapsed={collapsed} />
        <NavGroup label="Más" items={moreNav} collapsed={collapsed} />
      </SidebarContent>

      <SidebarFooter>
        <div className="px-2 pb-4 space-y-2">
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
          {!collapsed && <p className="text-xs text-sidebar-foreground/50 font-display px-1">energy / amtme</p>}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
