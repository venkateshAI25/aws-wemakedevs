import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Spaces from "@/pages/Spaces";
import ConnectApps from "@/pages/ConnectApps";
import Inbox from "@/pages/Inbox";
import AITools from "@/pages/AITools";
import AISummaryPage from "@/pages/AISummaryPage";
import AskSyncChat from "@/pages/AskSyncChat";
import Reports from "@/pages/Reports";
import Settings from "@/pages/Settings";
import SearchPage from "@/pages/SearchPage";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading || user === null)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07090E] text-gray-400">
        <div className="flex gap-1.5">
          <span className="sc-dot w-2.5 h-2.5 rounded-full bg-indigo-400" />
          <span className="sc-dot w-2.5 h-2.5 rounded-full bg-violet-400" />
          <span className="sc-dot w-2.5 h-2.5 rounded-full bg-blue-400" />
        </div>
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Home />} />
        <Route path="spaces" element={<Spaces />} />
        <Route path="connect" element={<ConnectApps />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="ai" element={<AITools />} />
        <Route path="ai/summary" element={<AISummaryPage />} />
        <Route path="ai/ask" element={<AskSyncChat />} />
        <Route path="reports" element={<Reports />} />
        <Route path="settings" element={<Settings />} />
        <Route path="search" element={<SearchPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster theme="dark" position="top-right" richColors closeButton />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}
