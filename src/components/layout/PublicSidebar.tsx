import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Home, Building2, BookOpen, GraduationCap, Briefcase, Calendar, Award,
  Megaphone, Newspaper, Image as ImageIcon, ClipboardList, Phone, LogIn, Menu, X, ChevronDown, Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo-yayasan.png";

interface NavItem {
  label: string;
  icon: any;
  href: string;
  external?: boolean;
  children?: { label: string; href: string }[];
}

const NAV: NavItem[] = [
  { label: "Beranda", icon: Home, href: "#top" },
  { label: "Tentang Yayasan", icon: Building2, href: "#tentang" },
  {
    label: "Unit Pendidikan", icon: GraduationCap, href: "#unit",
    children: [
      { label: "MI", href: "#unit-mi" },
      { label: "SMP", href: "#unit-smp" },
      { label: "SMK", href: "#unit-smk" },
    ],
  },
  {
    label: "Akademik", icon: BookOpen, href: "#akademik",
    children: [
      { label: "Pengumuman", href: "#pengumuman" },
    ],
  },
  { label: "Jadwal", icon: Calendar, href: "#jadwal" },
  { label: "PPDB", icon: ClipboardList, href: "#ppdb" },
  { label: "Berita & Artikel", icon: Newspaper, href: "#berita" },
  { label: "Galeri", icon: ImageIcon, href: "#galeri" },
  { label: "Video Profil", icon: Video, href: "#video" },
  { label: "Kontak", icon: Phone, href: "#kontak" },
];

interface SideNavProps {
  active?: string;
  onNavigate?: () => void;
  yayasanName?: string;
  tagline?: string;
}

function SideNav({ onNavigate, yayasanName, tagline }: SideNavProps) {
  const handle = (href: string) => {
    onNavigate?.();
    if (href.startsWith("#")) {
      setTimeout(() => {
        const el = document.querySelector(href);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-white">
      <div className="flex items-center gap-3 border-b border-white/10 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white p-1">
          <img src={logo} alt="Logo" className="h-full w-full object-contain" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{yayasanName ?? "Darul Rohman"}</p>
          <p className="truncate text-[11px] text-white/75">{tagline ?? "Morombuh Kwanyar"}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) =>
          item.children ? (
            <Collapsible key={item.label} defaultOpen={false}>
              <CollapsibleTrigger className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown className="h-4 w-4 transition group-data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="ml-9 mt-1 space-y-0.5">
                {item.children.map((c) => (
                  <button
                    key={c.label}
                    onClick={() => handle(c.href)}
                    className="block w-full rounded-md px-3 py-1.5 text-left text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-secondary"
                  >
                    {c.label}
                  </button>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ) : (
            <button
              key={item.label}
              onClick={() => handle(item.href)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 hover:text-secondary"
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          )
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <Link to="/login" onClick={onNavigate}>
          <Button className="w-full bg-secondary font-bold text-secondary-foreground hover:opacity-95">
            <LogIn className="mr-2 h-4 w-4" /> Login Admin
          </Button>
        </Link>
      </div>
    </div>
  );
}

interface PublicSidebarProps {
  yayasanName?: string;
  tagline?: string;
}

export function PublicSidebar({ yayasanName, tagline }: PublicSidebarProps) {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 lg:block">
      <SideNav yayasanName={yayasanName} tagline={tagline} />
    </aside>
  );
}

export function PublicMobileNavTrigger({ yayasanName, tagline }: PublicSidebarProps) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Buka menu">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 border-0 bg-sidebar p-0 text-white">
        <SideNav onNavigate={() => setOpen(false)} yayasanName={yayasanName} tagline={tagline} />
      </SheetContent>
    </Sheet>
  );
}
