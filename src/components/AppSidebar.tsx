
import React from 'react';
import { Home, FileText, BookOpen, Box, Star } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Documents", url: "/dashboard/documents", icon: FileText },
  { title: "Courses", url: "/dashboard/courses", icon: BookOpen },
  { title: "Spaces", url: "/dashboard/spaces", icon: Box },
  { title: "Exams", url: "/dashboard/exams", icon: Star },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard";
    }
    return currentPath.startsWith(path);
  };

  return (
    <Sidebar className="border-r border-white/20 bg-gradient-to-b from-white/95 to-slate-50/95 backdrop-blur-xl shadow-xl">
      <SidebarContent>
        <div className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">CW</span>
            </div>
            {state === "expanded" && (
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-teal-700 via-slate-700 to-teal-700 bg-clip-text text-transparent font-bold text-lg font-lato">Cloudwick</span>
                <span className="text-muted-foreground font-light text-sm font-lato">Axiom</span>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2 px-4">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard"}
                      className={({ isActive }) => `
                        flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 group
                        ${isActive 
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105' 
                          : 'hover:bg-white/60 hover:shadow-md hover:scale-105'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 transition-transform duration-300 ${
                        state === "expanded" ? "" : "group-hover:scale-110"
                      }`} />
                      {state === "expanded" && (
                        <span className="text-sm font-medium">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
