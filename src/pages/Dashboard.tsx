// ==========================================
// LAYOUT DASHBOARD - VERSI SEDERHANA
// ==========================================
// File ini mengatur tampilan dashboard dengan navbar dan menu

import { useEffect, useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { LayoutDashboard, Archive, FileText, LogOut } from "lucide-react";

const Dashboard = ({ children }: { children?: React.ReactNode }) => {
  // ========== STATE ==========
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // ========== CEK LOGIN SAAT HALAMAN DIBUKA ==========
  useEffect(() => {
    // Cek apakah user sudah login
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth"); // Redirect ke login jika belum login
      }
      setLoading(false);
    });

    // Dengarkan perubahan status login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // ========== FUNGSI LOGOUT ==========
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Gagal logout");
    } else {
      toast.success("Berhasil logout");
      navigate("/auth");
    }
  };

  // ========== TAMPILKAN LOADING ==========
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // ========== JIKA BELUM LOGIN, JANGAN TAMPILKAN APA-APA ==========
  if (!session) {
    return null;
  }

  // ========== TAMPILAN DASHBOARD ==========
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* NAVBAR DI ATAS */}
      <nav className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo / Nama Aplikasi */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Arsip Desa</h1>
            </div>
            
            {/* Menu Navigasi */}
            <div className="flex items-center gap-1">
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink
                to="/dashboard/archives"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`
                }
              >
                <Archive className="h-4 w-4" />
                <span>Arsip Digital</span>
              </NavLink>
              
              <NavLink
                to="/dashboard/letters"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`
                }
              >
                <FileText className="h-4 w-4" />
                <span>Template Surat</span>
              </NavLink>
            </div>
            
            {/* Info User & Logout */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-accent transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* KONTEN HALAMAN */}
      <main className="flex-1 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
