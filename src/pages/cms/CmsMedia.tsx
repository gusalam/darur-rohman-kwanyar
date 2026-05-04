import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { useConfirm } from "@/hooks/useConfirm";
import { uploadFile, listFiles, deleteFile, Bucket } from "@/lib/storage";
import { Trash2, Copy, Upload } from "lucide-react";
import { toast } from "sonner";

const BUCKETS: Bucket[] = ["cms-media", "hero", "galeri"];

export default function CmsMedia() {
  const [bucket, setBucket] = useState<Bucket>("cms-media");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { confirm, dialogProps } = useConfirm();

  const refresh = async () => {
    setLoading(true);
    try { setFiles(await listFiles(bucket)); } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [bucket]);

  const onUpload = async (f: File) => {
    try { await uploadFile(bucket, f); toast.success("Upload sukses"); refresh(); } catch (e: any) { toast.error(e.message); }
  };
  const remove = (path: string, name: string) => {
    confirm({ title: "Hapus File", description: `Yakin ingin menghapus "${name}"?`, variant: "danger", confirmLabel: "Ya, hapus",
      onConfirm: async () => { await deleteFile(bucket, path); toast.success("File berhasil dihapus"); refresh(); } });
  };
  const copy = (url: string) => { navigator.clipboard.writeText(url); toast.success("URL disalin"); };

  return (
    <div className="space-y-6">
      <PageHeader title="CMS — Media Library" subtitle="Kelola file gambar pada storage" />

      <Card className="rounded-2xl border-0 shadow-soft">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <Select value={bucket} onValueChange={(v) => setBucket(v as Bucket)}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>{BUCKETS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
          </Select>
          <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
          <Button variant="outline" onClick={refresh}><Upload className="mr-2 h-4 w-4" /> Refresh</Button>
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
                <Button size="sm" variant="outline" className="flex-1" onClick={() => copy(f.publicUrl)}><Copy className="mr-1 h-3 w-3" /> URL</Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => remove(f.path, f.name)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {!loading && files.length === 0 && <p className="col-span-full py-12 text-center text-muted-foreground">Bucket kosong</p>}
      </div>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
