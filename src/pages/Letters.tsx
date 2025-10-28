// ==========================================
// HALAMAN TEMPLATE SURAT - VERSI SEDERHANA
// ==========================================
// File ini untuk mengelola template surat desa
// Fitur: Buat template, Isi nama, dan Print surat

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Printer, Trash2 } from "lucide-react";

const Letters = () => {
  // ========== STATE (Tempat Simpan Data) ==========
  const [templates, setTemplates] = useState<any[]>([]); // Daftar template
  const [loading, setLoading] = useState(true); // Status loading
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null); // Template yang dipilih
  const [name, setName] = useState(""); // Nama untuk diisi di surat

  // ========== AMBIL DATA SAAT HALAMAN DIBUKA ==========
  useEffect(() => {
    fetchTemplates();
  }, []);

  // ========== FUNGSI 1: AMBIL SEMUA TEMPLATE DARI DATABASE ==========
  const fetchTemplates = async () => {
    setLoading(true);
    
    // Ambil data dari tabel "letter_templates"
    const { data, error } = await supabase
      .from("letter_templates")
      .select("*")
      .order("created_at", { ascending: false }); // Urutkan dari yang terbaru

    // Cek apakah ada error
    if (error) {
      toast.error("Gagal memuat template");
      console.error(error);
    } else {
      setTemplates(data || []); // Simpan ke state
    }
    
    setLoading(false);
  };

  // ========== FUNGSI 2: BUAT TEMPLATE BARU ==========
  const handleCreateTemplate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Ambil data dari form
    const formData = new FormData(e.currentTarget);
    const templateName = formData.get("template-name") as string;
    const templateContent = formData.get("template-content") as string;

    try {
      // Cek apakah user sudah login
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      // Simpan template ke database
      const { error } = await supabase.from("letter_templates").insert({
        user_id: user.id,
        template_name: templateName,
        template_content: templateContent,
      });

      if (error) throw error;

      toast.success("Template berhasil dibuat!");
      fetchTemplates(); // Refresh data
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat template");
    }
  };

  // ========== FUNGSI 3: HAPUS TEMPLATE ==========
  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus template ini?")) return;

    try {
      // Hapus dari database
      const { error } = await supabase.from("letter_templates").delete().eq("id", id);

      if (error) throw error;

      toast.success("Template berhasil dihapus");
      fetchTemplates(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus template");
    }
  };

  // ========== FUNGSI 4: PRINT SURAT ==========
  const handlePrint = () => {
    window.print();
  };

  // ========== FUNGSI 5: GANTI [NAMA] DENGAN NAMA YANG DIINPUT ==========
  const renderPreview = () => {
    if (!selectedTemplate) return "";
    let content = selectedTemplate.template_content;
    content = content.replace(/\[NAMA\]/g, name || "[NAMA]");
    return content;
  };

  // ========== TAMPILAN HALAMAN ==========
  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Template Surat</h1>
        <p className="text-muted-foreground">
          Kelola template surat desa Anda
        </p>
      </div>

      {/* Jika belum pilih template: tampilkan daftar template */}
      {!selectedTemplate ? (
        <>
          {/* FORM BUAT TEMPLATE BARU */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Buat Template Baru</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Gunakan <code className="bg-muted px-1 rounded">[NAMA]</code> sebagai placeholder yang akan diganti otomatis
            </p>
            <form onSubmit={handleCreateTemplate} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-2">Nama Template</label>
                <input
                  name="template-name"
                  type="text"
                  placeholder="Contoh: Surat Keterangan Domisili"
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium block mb-2">Isi Template</label>
                <textarea
                  name="template-content"
                  rows={10}
                  placeholder={`Contoh:\n\nKepada Yth.\nSaudara/i [NAMA]\n\nDengan hormat,\nKami yang bertanda tangan di bawah ini...`}
                  required
                  className="w-full px-3 py-2 border rounded-md bg-background font-mono text-sm"
                />
              </div>
              
              <button
                type="submit"
                className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Simpan Template
              </button>
            </form>
          </div>

          {/* DAFTAR TEMPLATE */}
          <div className="bg-card p-6 rounded-lg border">
            <h2 className="text-lg font-semibold mb-4">Daftar Template</h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-sm text-muted-foreground">Memuat template...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">
                  Belum ada template. Buat template baru untuk memulai.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border rounded-lg hover:shadow-lg transition-shadow"
                  >
                    <h3 className="font-medium mb-2">{template.template_name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {template.template_content.substring(0, 100)}...
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 text-sm"
                      >
                        Gunakan
                      </button>
                      <button
                        onClick={() => handleDelete(template.id)}
                        className="p-2 border rounded-md hover:bg-destructive/10 text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Jika sudah pilih template: tampilkan form isi nama dan preview */
        <div className="space-y-4">
          <div className="bg-card p-6 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold">{selectedTemplate.template_name}</h2>
                <p className="text-sm text-muted-foreground">Isi data untuk membuat surat</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedTemplate(null);
                    setName("");
                  }}
                  className="px-4 py-2 border rounded-md hover:bg-accent"
                >
                  Kembali
                </button>
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
              </div>
            </div>
            
            {/* Input Nama */}
            <div className="mb-4">
              <label className="text-sm font-medium block mb-2">Nama</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama..."
                className="w-full px-3 py-2 border rounded-md bg-background"
              />
            </div>
            
            {/* Preview Surat */}
            <div className="p-6 bg-white text-black rounded-lg border min-h-[400px] print:shadow-none print:border-0">
              <pre className="whitespace-pre-wrap font-sans">{renderPreview()}</pre>
            </div>
          </div>
        </div>
      )}

      {/* CSS untuk Print */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:shadow-none,
          .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Letters;
