import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Archive, FileText, TrendingUp } from "lucide-react";

const DashboardHome = () => {
  const [stats, setStats] = useState({
    totalArchives: 0,
    totalTemplates: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [archivesResult, templatesResult] = await Promise.all([
        supabase.from("archives").select("*", { count: "exact", head: true }),
        supabase.from("letter_templates").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalArchives: archivesResult.count || 0,
        totalTemplates: templatesResult.count || 0,
      });
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di Sistem Arsip Digital Desa
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-[var(--shadow-elegant)] transition-[var(--transition-smooth)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Arsip
            </CardTitle>
            <Archive className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalArchives}</div>
            <p className="text-xs text-muted-foreground">
              Dokumen yang diarsipkan
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-[var(--shadow-elegant)] transition-[var(--transition-smooth)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Template Surat
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">
              Template tersedia
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-[var(--shadow-elegant)] transition-[var(--transition-smooth)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status Sistem
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Aktif</div>
            <p className="text-xs text-muted-foreground">
              Sistem berjalan normal
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Akses Cepat</CardTitle>
            <CardDescription>
              Fitur yang sering digunakan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/dashboard/archives"
              className="block p-4 rounded-lg border hover:bg-accent transition-[var(--transition-smooth)]"
            >
              <div className="flex items-center gap-3">
                <Archive className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Kelola Arsip</p>
                  <p className="text-sm text-muted-foreground">
                    Upload dan cari dokumen arsip
                  </p>
                </div>
              </div>
            </a>
            <a
              href="/dashboard/letters"
              className="block p-4 rounded-lg border hover:bg-accent transition-[var(--transition-smooth)]"
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium">Template Surat</p>
                  <p className="text-sm text-muted-foreground">
                    Buat surat dengan template
                  </p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi</CardTitle>
            <CardDescription>
              Panduan penggunaan sistem
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm">
                <strong>Upload Dokumen:</strong> Klik menu "Arsip Digital" untuk mengunggah dan mengelola dokumen arsip desa.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm">
                <strong>Template Surat:</strong> Gunakan menu "Template Surat" untuk membuat surat dengan template yang sudah tersedia.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
