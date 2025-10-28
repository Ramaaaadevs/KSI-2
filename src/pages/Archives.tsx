// ==========================================
// HALAMAN ARSIP DIGITAL - VERSI SEDERHANA
// ==========================================
// File ini untuk mengelola arsip/dokumen desa
// Fitur: Upload dokumen, Lihat daftar, Hapus, dan Cari

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { Search, FileText, Download, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// Daftar kategori dokumen yang tersedia
const categories = [
  "Surat Keterangan",
  "Surat Pengantar",
  "Surat Keputusan",
  "Surat Permohonan",
  "Data Penduduk",
  "Data Tanah",
  "Dokumen Lainnya",
];

const Archives = () => {
  // ========== STATE (Tempat Simpan Data) ==========
  const [archives, setArchives] = useState<any[]>([]); // Daftar semua arsip
  const [loading, setLoading] = useState(true); // Status loading
  const [searchQuery, setSearchQuery] = useState(""); // Kata kunci pencarian
  const [uploading, setUploading] = useState(false); // Status upload

  // ========== AMBIL DATA SAAT HALAMAN DIBUKA ==========
  useEffect(() => {
    fetchArchives();
  }, []);

  // ========== FUNGSI 1: AMBIL SEMUA ARSIP DARI DATABASE ==========
  const fetchArchives = async () => {
    setLoading(true);
    
    // Ambil data dari tabel "archives"
    const { data, error } = await supabase
      .from("archives")
      .select("*")
      .order("created_at", { ascending: false }); // Urutkan dari yang terbaru

    // Cek apakah ada error
    if (error) {
      toast.error("Gagal memuat arsip");
      console.error(error);
    } else {
      setArchives(data || []); // Simpan ke state
    }
    
    setLoading(false);
  };

  // ========== FUNGSI 2: UPLOAD DOKUMEN BARU ==========
  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    // Ambil data dari form
    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    const documentName = formData.get("document-name") as string;
    const category = formData.get("category") as string;
    const nik = formData.get("nik") as string;

    try {
      // Cek apakah user sudah login
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Anda harus login terlebih dahulu");
        return;
      }

      // Upload file ke storage (jika ada)
      let fileUrl = null;
      let fileName = null;
      
      if (file && file.size > 0) {
        const fileExt = file.name.split(".").pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Dapatkan URL file yang sudah diupload
        const { data: { publicUrl } } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);

        fileUrl = publicUrl;
        fileName = file.name;
      }

      // Simpan data arsip ke database
      const { error: insertError } = await supabase
        .from("archives")
        .insert({
          user_id: user.id,
          document_name: documentName,
          category: category as Database["public"]["Enums"]["document_category"],
          nik: nik || null,
          file_url: fileUrl,
          file_name: fileName,
        });

      if (insertError) throw insertError;

      toast.success("Arsip berhasil ditambahkan!");
      fetchArchives(); // Refresh data
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message || "Gagal mengunggah arsip");
    } finally {
      setUploading(false);
    }
  };

  // ========== FUNGSI 3: HAPUS ARSIP ==========
  const handleDelete = async (id: string, fileUrl: string | null) => {
    if (!confirm("Apakah Anda yakin ingin menghapus arsip ini?")) return;

    try {
      // Hapus file dari storage (jika ada)
      if (fileUrl) {
        const filePath = fileUrl.split("/documents/")[1];
        if (filePath) {
          await supabase.storage.from("documents").remove([filePath]);
        }
      }

      // Hapus data dari database
      const { error } = await supabase.from("archives").delete().eq("id", id);

      if (error) throw error;

      toast.success("Arsip berhasil dihapus");
      fetchArchives(); // Refresh data
    } catch (error: any) {
      toast.error(error.message || "Gagal menghapus arsip");
    }
  };

  // ========== FUNGSI 4: FILTER ARSIP BERDASARKAN PENCARIAN ==========
  const filteredArchives = archives.filter((archive) => {
    const query = searchQuery.toLowerCase();
    return (
      archive.document_name.toLowerCase().includes(query) ||
      archive.category.toLowerCase().includes(query) ||
      (archive.nik && archive.nik.toLowerCase().includes(query))
    );
  });

  // ========== TAMPILAN HALAMAN ==========
  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold">Arsip Digital</h1>
        <p className="text-muted-foreground">
          Kelola semua dokumen dan arsip digital desa
        </p>
      </div>

      {/* FORM UPLOAD - Langsung di halaman (tidak pakai popup) */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Upload Dokumen Baru</h2>
        <form onSubmit={handleUpload} className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium block mb-2">1. Pilih File (Opsional)</label>
            <input
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">2. Kategori</label>
            <select
              name="category"
              required
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">3. Nama Dokumen (Wajib)</label>
            <input
              name="document-name"
              type="text"
              placeholder="Contoh: Surat Keterangan Domisili"
              required
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-2">4. NIK (Opsional)</label>
            <input
              name="nik"
              type="text"
              placeholder="Masukkan NIK jika ada..."
              className="w-full px-3 py-2 border rounded-md bg-background"
            />
          </div>
          
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {uploading ? "Mengunggah..." : "Upload dan Arsipkan"}
            </button>
          </div>
        </form>
      </div>

      {/* SEARCH BOX */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Cari Dokumen</h2>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ketik nama, NIK, atau kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 px-3 py-2 border rounded-md bg-background"
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Ditemukan {filteredArchives.length} dari {archives.length} dokumen
        </p>
      </div>

      {/* DAFTAR ARSIP - Pakai kartu sederhana (bukan tabel) */}
      <div className="bg-card p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">Daftar Arsip</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">Memuat data...</p>
          </div>
        ) : filteredArchives.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "Tidak ada dokumen yang cocok dengan pencarian"
                : "Belum ada dokumen. Upload dokumen untuk memulai."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArchives.map((archive) => (
              <div
                key={archive.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{archive.document_name}</h3>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>📁 {archive.category}</span>
                      {archive.nik && <span>🆔 NIK: {archive.nik}</span>}
                      <span>📅 {format(new Date(archive.created_at), "dd MMMM yyyy", { locale: id })}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {archive.file_url && (
                      <button
                        onClick={() => window.open(archive.file_url, "_blank")}
                        className="p-2 hover:bg-background rounded-md"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(archive.id, archive.file_url)}
                      className="p-2 hover:bg-background rounded-md text-destructive"
                      title="Hapus"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Archives;
