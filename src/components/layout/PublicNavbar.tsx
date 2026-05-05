import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo-yayasan.png";

const NAV = [
  { label: "Beranda", href: "#top" },
  { label: "Tentang", href: "#tentang" },
  { label: "Unit", href: "#unit" },
  { label: "Akademik", href: "#akademik" },
  { label: "Jadwal", href: "#jadwal" },
  { label: "PPDB", href: "#ppdb" },
  { label: "Berita", href: "#berita" },
  { label: "Galeri", href: "#galeri" },
  { label: "Kontak", href: "#kontak" },
];

interface Props {
  yayasanName?: string;
  tagline?: string;
}

function goTo(href: string) {
  if (href.startsWith("#")) {
    if (window.location.hash !== href) {
      window.history.replaceState(null, "", href);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    setTimeout(() => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}

export function PublicNavbar({ yayasanName, tagline }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1 shadow-soft">
            <img src={logo} alt="Logo" className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-bold leading-tight">{yayasanName ?? "Darul Rohman"}</p>
            {tagline && <p className="truncate text-[11px] text-muted-foreground">{tagline}</p>}
          </div>
        </Link>

        <nav className="ml-auto hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <button
              key={n.label}
              onClick={() => goTo(n.href)}
              className="rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition hover:bg-muted hover:text-foreground"
            >
              {n.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto lg:ml-2 flex items-center gap-2">
          <Link to="/login" className="hidden sm:block">
            <Button className="bg-secondary text-secondary-foreground font-bold hover:opacity-95">
              <LogIn className="mr-2 h-4 w-4" /> Login Admin
            </Button>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost" className="lg:hidden" aria-label="Buka menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-3 border-b border-border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white p-1">
                    <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{yayasanName ?? "Darul Rohman"}</p>
                    {tagline && <p className="truncate text-[11px] text-muted-foreground">{tagline}</p>}
                  </div>
                </div>
                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                  {NAV.map((n) => (
                    <button
                      key={n.label}
                      onClick={() => { setOpen(false); goTo(n.href); }}
                      className="block w-full rounded-md px-3 py-2.5 text-left text-sm font-semibold text-foreground transition hover:bg-muted"
                    >
                      {n.label}
                    </button>
                  ))}
                </nav>
                <div className="border-t border-border p-3">
                  <Link to="/login" onClick={() => setOpen(false)}>
                    <Button className="w-full bg-secondary text-secondary-foreground font-bold">
                      <LogIn className="mr-2 h-4 w-4" /> Login Admin
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
