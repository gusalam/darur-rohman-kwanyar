import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseTable } from "@/hooks/useSupabaseTable";
import { GraduationCap, BookOpen, Briefcase, MapPin, Phone, Mail, Sparkles, ArrowRight, LogIn, Newspaper, Megaphone } from "lucide-react";
import logo from "@/assets/logo-yayasan.png";

export default function PublicHome() {
  const [settings, setSettings] = useState<any>(null);
  const { data: banners } = useSupabaseTable<any>("cms_banners", { filters: { is_active: true }, orderBy: { column: "sort_order", ascending: true } });
  const { data: posts } = useSupabaseTable<any>("cms_posts", { filters: { status: "published" } });
  const { data: pages } = useSupabaseTable<any>("cms_pages", { filters: { is_published: true } });

  useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => setSettings(data));
    const ch = supabase.channel("rt-settings").on("postgres_changes", { event: "*", schema: "public", table: "site_settings" }, () => {
      supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data }) => setSettings(data));
    }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const pengumuman = posts.filter((p) => p.category === "pengumuman").slice(0, 3);
  const berita = posts.filter((p) => p.category !== "pengumuman").slice(0, 6);
  const galleryPage = pages.find((p) => (p.gallery_urls ?? []).length > 0);
  const gallery: string[] = galleryPage?.gallery_urls ?? [];

  const youtubeId = (() => {
    const u = settings?.youtube_url;
    if (!u) return null;
    const m = u.match(/(?:youtu\.be\/|v=)([\w-]{11})/);
    return m ? m[1] : null;
  })();

  const heroBg = settings?.hero_image_url || banners[0]?.image_url;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 shadow-soft">
              <img src={logo} alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-bold leading-tight">{settings?.nama_yayasan ?? "Yayasan Darul Rohman"}</p>
              <p className="text-[11px] text-muted-foreground">{settings?.tagline ?? "Morombuh Kwanyar"}</p>
            </div>
          </Link>
          <Link to="/login">
            <Button className="gradient-primary text-primary-foreground"><LogIn className="mr-2 h-4 w-4" /> Login Admin</Button>
          </Link>
        </div>
      </header>

      <section className="relative overflow-hidden gradient-hero text-white">
        {heroBg && <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${heroBg})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24 md:px-6">
          <Badge className="mb-4 border-0 bg-secondary text-secondary-foreground"><Sparkles className="mr-1 h-3 w-3" /> Sistem Terpadu Pendidikan</Badge>
          <h1 className="font-display text-3xl font-bold md:text-5xl">{settings?.hero_title ?? "Membentuk Generasi Qur'ani, Cerdas & Berakhlak Mulia"}</h1>
          <p className="mt-5 max-w-xl text-base text-white/90 md:text-lg">{settings?.hero_subtitle ?? settings?.deskripsi ?? "Yayasan Darul Rohman menyelenggarakan pendidikan Islam terpadu MI, SMP, SMK."}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#unit"><Button size="lg" className="bg-secondary text-secondary-foreground">Jelajahi Unit <ArrowRight className="ml-2 h-4 w-4" /></Button></a>
            <a href="#kontak"><Button size="lg" variant="outline" className="border-white/40 bg-white/10 text-white hover:bg-white/20">Hubungi Kami</Button></a>
          </div>
        </div>
      </section>

      <ErrorBoundary silent label="Banners">
        {banners.length > 1 && (
          <section className="bg-muted/40 py-10">
            <div className="mx-auto grid max-w-7xl gap-4 px-4 md:grid-cols-2 md:px-6">
              {banners.slice(1).map((b) => (
                <a key={b.id} href={b.cta_url ?? "#"} className="group relative block h-44 overflow-hidden rounded-2xl shadow-soft">
                  {b.image_url && <img src={b.image_url} alt={b.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-white flex flex-col justify-end">
                    <p className="font-bold">{b.title}</p>
                    <p className="text-xs text-white/85">{b.subtitle}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
      </ErrorBoundary>

      <section id="unit" className="bg-muted/40 py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="text-center">
            <Badge variant="outline" className="border-primary text-primary">Unit Pendidikan</Badge>
            <h2 className="mt-3 font-display text-2xl font-bold md:text-3xl">MI · SMP · SMK</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              { key: "mi", title: "MI Darul Rohman", icon: BookOpen, color: "gradient-primary", desc: settings?.deskripsi_mi },
              { key: "smp", title: "SMP Darul Rohman", icon: GraduationCap, color: "gradient-sky", desc: settings?.deskripsi_smp },
              { key: "smk", title: "SMK Darul Rohman", icon: Briefcase, color: "gradient-gold", desc: settings?.deskripsi_smk },
            ].map((u) => (
              <Card key={u.key} className="rounded-2xl border-border shadow-soft">
                <CardContent className="p-6">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${u.color} text-primary-foreground`}><u.icon className="h-7 w-7" /></div>
                  <h3 className="mt-4 font-display text-xl font-bold">{u.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{u.desc ?? "Deskripsi belum diisi pada CMS."}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <ErrorBoundary silent label="Pengumuman">
        {pengumuman.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
            <Badge variant="outline"><Megaphone className="mr-1 h-3 w-3" /> Pengumuman</Badge>
            <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Pengumuman Terbaru</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {pengumuman.map((p) => (
                <article key={p.id} className="rounded-2xl border-l-4 border-secondary bg-secondary/10 p-5 shadow-soft">
                  <h3 className="font-bold">{p.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm text-foreground/85">{p.excerpt ?? p.content}</p>
                </article>
              ))}
            </div>
          </section>
        )}
      </ErrorBoundary>

      <ErrorBoundary silent label="Berita">
        {berita.length > 0 && (
          <section className="bg-muted/40 py-14">
            <div className="mx-auto max-w-7xl px-4 md:px-6">
              <Badge variant="outline"><Newspaper className="mr-1 h-3 w-3" /> Berita</Badge>
              <h2 className="mt-2 font-display text-2xl font-bold md:text-3xl">Berita & Artikel</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {berita.map((p) => (
                  <Card key={p.id} className="overflow-hidden rounded-2xl border-border shadow-soft">
                    {p.cover_url && <div className="h-40 bg-muted"><img src={p.cover_url} alt={p.title} className="h-full w-full object-cover" /></div>}
                    <CardContent className="space-y-2 p-5">
                      <Badge className="bg-accent text-accent-foreground capitalize">{p.category}</Badge>
                      <h3 className="font-display text-lg font-bold">{p.title}</h3>
                      <p className="line-clamp-3 text-sm text-muted-foreground">{p.excerpt ?? p.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}
      </ErrorBoundary>

      <ErrorBoundary silent label="Galeri">
        {gallery.length > 0 && (
          <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
            <h2 className="font-display text-2xl font-bold md:text-3xl">Galeri</h2>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {gallery.map((u) => <img key={u} src={u} alt="" className="aspect-square rounded-xl object-cover" />)}
            </div>
          </section>
        )}
      </ErrorBoundary>

      <ErrorBoundary silent label="Video">
        {youtubeId && (
          <section className="bg-muted/40 py-14">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
              <h2 className="font-display text-2xl font-bold md:text-3xl">Video Profil</h2>
              <div className="mt-6 aspect-video overflow-hidden rounded-2xl shadow-soft">
                <iframe src={`https://www.youtube.com/embed/${youtubeId}`} title="YouTube" allowFullScreen className="h-full w-full" />
              </div>
            </div>
          </section>
        )}
      </ErrorBoundary>

      <section id="kontak" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">Kontak Yayasan</h2>
            <div className="mt-6 space-y-3">
              <Row icon={MapPin} label="Alamat" value={settings?.alamat ?? "-"} />
              <Row icon={Phone} label="Telepon" value={settings?.telepon ?? "-"} />
              <Row icon={Mail} label="Email" value={settings?.email ?? "-"} />
            </div>
          </div>
          {settings?.map_embed && (
            <div className="aspect-video overflow-hidden rounded-2xl shadow-soft">
              <iframe src={settings.map_embed} title="Map" className="h-full w-full" loading="lazy" />
            </div>
          )}
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} {settings?.nama_yayasan ?? "Yayasan Darul Rohman"}.</p>
          <p>Sistem Terpadu Pendidikan v1.0</p>
        </div>
      </footer>
    </div>
  );
}

function Row({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary text-primary-foreground"><Icon className="h-4 w-4" /></div>
      <div>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
