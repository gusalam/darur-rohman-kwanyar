import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { SkeletonCards } from "@/components/shared/SkeletonTable";
import { useConfirm } from "@/hooks/useConfirm";
import { uploadFile, listFiles, deleteFile } from "@/lib/storage";
import { Trash2, Copy, Upload, ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function CmsGaleri() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { confirm, dialogProps } = useConfirm();
  const [uploading, setUploading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      setFiles(await listFiles("galeri"));
    } catch (e: any) {
      toast.error(e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const onUpload = async (f: File) => {
    setUploading(true);
    try {
      await uploadFile("galeri", f);
      toast.success("Upload berhasil");
      refresh();
    } catch (e: any) {
      toast.error(e.message);
    }
    setUploading(false);
  };

  const remove = (path: string, name: string) => {
    confirm({ title: "Hapus Foto", description: `Yakin ingin menghapus "${name}"?`, variant: "danger", confirmLabel: "Ya, hapus",
      onConfirm: async () => { await deleteFile("galeri", path); toast.success("Foto berhasil dihapus"); refresh(); } });
  };

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL disalin");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="CMS — Galeri"
        subtitle="Kelola foto galeri yang tampil di halaman publik"
        action={
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <Upload className="mr-2 h-4 w-4" /> Refresh
          </Button>
        }
      />

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="flex items-center gap-3 p-4">
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {files.map((f) => (
          <Card key={f.path} className="overflow-hidden rounded-xl border-0 shadow-soft">
            <div className="aspect-square bg-muted">
              <img src={f.publicUrl} alt={f.name} className="h-full w-full object-cover" />
            </div>
            <CardContent className="space-y-2 p-3">
              <p className="truncate text-xs">{f.name}</p>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => copy(f.publicUrl)}>
                  <Copy className="mr-1 h-3 w-3" /> URL
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(f.path, f.name)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && files.length === 0 && (
          <p className="col-span-full py-12 text-center text-muted-foreground">Belum ada foto di galeri</p>
        )}
      </div>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}