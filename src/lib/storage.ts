import { supabase } from "@/integrations/supabase/client";

export type Bucket = "hero" | "galeri" | "cms-media" | "ppdb-docs";

export async function uploadFile(bucket: Bucket, file: File, folder = "") {
  const ext = file.name.split(".").pop();
  const path = `${folder ? folder + "/" : ""}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, cacheControl: "3600" });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function listFiles(bucket: Bucket, folder = "") {
  const { data, error } = await supabase.storage.from(bucket).list(folder, { limit: 200, sortBy: { column: "created_at", order: "desc" } });
  if (error) throw error;
  return (data ?? []).filter((f) => !f.name.startsWith(".")).map((f) => {
    const fullPath = folder ? `${folder}/${f.name}` : f.name;
    const { data: pub } = supabase.storage.from(bucket).getPublicUrl(fullPath);
    return { name: f.name, path: fullPath, publicUrl: pub.publicUrl, created_at: f.created_at };
  });
}

export async function deleteFile(bucket: Bucket, path: string) {
  // Strip full public URL if accidentally passed
  let cleanPath = path;
  const marker = `/object/public/${bucket}/`;
  const idx = cleanPath.indexOf(marker);
  if (idx >= 0) cleanPath = cleanPath.substring(idx + marker.length);
  cleanPath = cleanPath.replace(/^\/+/, "");

  const { data, error } = await supabase.storage.from(bucket).remove([cleanPath]);
  if (error) throw error;
  // Supabase returns [] silently when RLS blocks the delete
  if (!data || data.length === 0) {
    throw new Error("File tidak terhapus (cek izin / path salah)");
  }
}
