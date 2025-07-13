import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import DashboardHome from "./components/DashboardHome";
import Spaces from "./pages/Spaces";
import SpaceDetail from "./pages/SpaceDetail";
import People from "./pages/People";
import UserDetail from "./pages/UserDetail";
import Documents from "./pages/Documents";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import SectionDetail from "./pages/SectionDetail";
import AIChat from "./pages/AIChat";
import Exams from "./pages/Exams";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardHome />} />
              <Route path="spaces" element={<Spaces />} />
            <Route path="spaces/:spaceId" element={<SpaceDetail />} />
            <Route path="spaces/:spaceId/courses/:courseId" element={<CourseDetail />} />
            <Route path="spaces/:spaceId/courses/:courseId/sections/:sectionId" element={<SectionDetail />} />
            <Route path="ai-chat" element={<AIChat />} />
              <Route path="people" element={<People />} />
              <Route path="people/:userId" element={<UserDetail />} />
              <Route path="documents" element={<Documents />} />
              <Route path="courses" element={<Courses />} />
              <Route path="exams" element={<Exams />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
