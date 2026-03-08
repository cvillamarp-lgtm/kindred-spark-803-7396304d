import { Home, Users, Calendar, Mic, Image, BookOpen, BarChart3, FileText, Settings, ListTodo, Wand2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const navItems = [
  { label: "Dashboard", url: "/", icon: Home },
  { label: "Audiencia", url: "/audience", icon: Users },
  { label: "Calendario", url: "/calendar", icon: Calendar },
  { label: "Episodios", url: "/episodes", icon: Mic },
  { label: "Brand", url: "/brand", icon: Image },
  { label: "Design", url: "/design", icon: BookOpen },
  { label: "Prompts", url: "/prompts", icon: Wand2 },
  { label: "Métricas", url: "/metrics", icon: BarChart3 },
  { label: "Recursos", url: "/resources", icon: FileText },
  { label: "Score", url: "/scorecard", icon: Settings },
  { label: "Tareas", url: "/tasks", icon: ListTodo },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

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
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        activeClassName="bg-sidebar-accent text-sidebar-primary-foreground font-medium"
                      >
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
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <div className="px-4 pb-4">
            <p className="text-xs text-sidebar-foreground/50 font-display">energy / amtme</p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
