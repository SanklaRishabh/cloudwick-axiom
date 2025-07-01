
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
    <Sidebar className="border-r border-gray-200">
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">CW</span>
            </div>
            {state === "expanded" && (
              <div className="flex flex-col">
                <span className="text-blue-600 font-bold text-sm font-lato">Cloudwick</span>
                <span className="text-gray-600 font-light text-xs font-lato">Axiom</span>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/dashboard"}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                    >
                      <item.icon className="h-5 w-5" />
                      {state === "expanded" && (
                        <span className="font-lexend text-sm">{item.title}</span>
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
