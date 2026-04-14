import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/language";
import { ThemeProvider } from "@/lib/dark-mode";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppShell } from "@/components/AppShell";
import WelcomePage from "./pages/WelcomePage";
import PortalPage from "./pages/PortalPage";
import RequestAccessPage from "./pages/RequestAccessPage";
import AccessRequestsPage from "./pages/AccessRequestsPage";
import DashboardPage from "./pages/DashboardPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminAccessPage from "./pages/AdminAccessPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppShell>{children}</AppShell>
    </ProtectedRoute>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<WelcomePage />} />
              <Route path="/portal" element={<ProtectedShell><PortalPage /></ProtectedShell>} />
              <Route path="/portal/request-access" element={<ProtectedShell><RequestAccessPage /></ProtectedShell>} />
              <Route path="/portal/access-requests" element={<ProtectedShell><AccessRequestsPage /></ProtectedShell>} />
              <Route path="/dashboard/:slug" element={<ProtectedShell><DashboardPage /></ProtectedShell>} />
              <Route path="/admin/users" element={<ProtectedShell><AdminUsersPage /></ProtectedShell>} />
              <Route path="/admin/access" element={<ProtectedShell><AdminAccessPage /></ProtectedShell>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
