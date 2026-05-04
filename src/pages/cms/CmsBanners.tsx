import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader } from "@/components/shared/StatCard";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ButtonLoading } from "@/components/shared/ButtonLoading";
import { SkeletonCards } from "@/components/shared/SkeletonTable";
import { useConfirm } from "@/hooks/useConfirm";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { dbInsert, dbUpdate, dbDelete } from "@/lib/db";
import { uploadFile } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const empty = () => ({ title: "", subtitle: "", image_url: "", cta_label: "", cta_url: "", is_active: true, sort_order: 0 });

export default function CmsBanners() {
  const { data, loading: fetching, refetch } = useSupabaseTable<any>("cms_banners", { orderBy: { column: "sort_order", ascending: true } });
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<any>(empty());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { confirm, dialogProps } = useConfirm();

  const submit = async () => {
    if (!draft.title?.trim()) return toast.error("Judul wajib");
    setSaving(true);
    try {
      if (draft.id) await dbUpdate("cms_banners", draft.id, draft);
      else await dbInsert("cms_banners", draft);
      toast.success("Banner berhasil disimpan"); setOpen(false); refetch();
    } catch {} finally { setSaving(false); }
  };
  const onUpload = async (f: File) => {
    setUploading(true);
    try { const { publicUrl } = await uploadFile("hero", f); setDraft({ ...draft, image_url: publicUrl }); toast.success("Gambar berhasil diupload"); } catch (e: any) { toast.error(e.message); } finally { setUploading(false); }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="CMS — Banner Hero" subtitle="Banner di homepage publik" action={
        <Button onClick={() => { setDraft(empty()); setOpen(true); }} className="gradient-primary text-primary-foreground"><Plus className="mr-2 h-4 w-4" /> Banner Baru</Button>
      } />

      {fetching && data.length === 0 ? <SkeletonCards count={2} /> : (
      <div className="grid gap-4 md:grid-cols-2">
        {data.map((b) => (
          <Card key={b.id} className={`overflow-hidden rounded-2xl border-0 shadow-soft ${b.is_active ? "" : "opacity-60"}`}>
            <div className="relative h-40 bg-muted">
              {b.image_url ? <img src={b.image_url} alt={b.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground text-sm">Tanpa gambar</div>}
            </div>
            <CardContent className="space-y-2 p-4">
              <p className="font-bold">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.subtitle}</p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2"><Switch checked={b.is_active} onCheckedChange={async (v) => { await dbUpdate("cms_banners", b.id, { is_active: v }); refetch(); }} /><span className="text-xs">{b.is_active ? "Aktif" : "Off"}</span></div>
                <div>
                  <Button size="icon" variant="ghost" onClick={() => { setDraft(b); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirm({ title: "Hapus Banner", description: `Yakin ingin menghapus banner "${b.title}"?`, variant: "danger", confirmLabel: "Ya, hapus", onConfirm: async () => { await dbDelete("cms_banners", b.id); toast.success("Banner berhasil dihapus"); refetch(); } })}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {data.length === 0 && <p className="col-span-full py-12 text-center text-muted-foreground">Belum ada banner</p>}
      </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{draft.id ? "Edit" : "Buat"} Banner</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Judul</Label><Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Subjudul</Label><Input value={draft.subtitle ?? ""} onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })} /></div>
            <div className="space-y-1.5"><Label>Gambar</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])} />
                {draft.image_url && <img src={draft.image_url} alt="" className="h-10 w-16 rounded object-cover" />}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>CTA Label</Label><Input value={draft.cta_label ?? ""} onChange={(e) => setDraft({ ...draft, cta_label: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>CTA URL</Label><Input value={draft.cta_url ?? ""} onChange={(e) => setDraft({ ...draft, cta_url: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Urutan</Label><Input type="number" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })} /></div>
              <div className="flex items-end gap-2"><Switch checked={draft.is_active} onCheckedChange={(v) => setDraft({ ...draft, is_active: v })} /><Label>Aktif</Label></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Batal</Button><ButtonLoading onClick={submit} loading={saving || uploading} loadingText={uploading ? "Mengupload..." : "Menyimpan..."} className="gradient-primary text-primary-foreground">Simpan</ButtonLoading></DialogFooter>
        </DialogContent>
      </Dialog>
      {dialogProps && <ConfirmDialog {...dialogProps} />}
    </div>
  );
}
