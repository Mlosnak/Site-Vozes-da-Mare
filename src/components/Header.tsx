import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, Facebook, Instagram, Twitter, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/logo.svg";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/vozesdamare_/", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61586276862852", label: "Facebook" },
  { icon: Twitter, href: "https://x.com/Vozesdamare", label: "Twitter" },
];

export function Header() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) return saved === 'true';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const location = useLocation();
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDarkMode));
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setIsVisible(true);
      } 
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } 
      else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ backgroundColor: '#e4142c' }}
    >
      <div className="container-fixed">
        <div className="flex h-[90px] items-center justify-between">
          <div className="flex items-center flex-shrink-0 ml-2 md:ml-8">
            <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
              <img 
                src={logo} 
                alt="Vozes da Maré" 
                className="w-32 h-32 md:w-48 md:h-48 lg:w-[260px] lg:h-[260px] object-contain p-1 md:p-2"
              />
            </Link>
          </div>

          <nav className="hidden lg:flex items-center absolute left-1/2 transform -translate-x-1/2" style={{ gap: '48px' }}>
            <Link
              to="/textos"
              className={`nav-link py-2 uppercase tracking-wide text-white ${
                location.pathname === "/textos" ? "active opacity-100" : "opacity-90"
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Textos
            </Link>
            <Link
              to="/autores"
              className={`nav-link py-2 uppercase tracking-wide text-white ${
                location.pathname === "/autores" ? "active opacity-100" : "opacity-90"
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Autores
            </Link>
            <Link
              to="/sobre-nos"
              className={`nav-link py-2 uppercase tracking-wide text-white ${
                location.pathname === "/sobre-nos" ? "active opacity-100" : "opacity-90"
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Sobre nós
            </Link>
            <Link
              to="/contato"
              className={`nav-link py-2 uppercase tracking-wide text-white ${
                location.pathname === "/contato" ? "active opacity-100" : "opacity-90"
              }`}
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              Contato
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label="Buscar"
              className="text-white hover:bg-white/10 ml-2"
            >
              <Search style={{ width: '20px', height: '20px' }} />
            </Button>
          </nav>

          <div className="flex items-center gap-3 xl:gap-4 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              aria-label={isDarkMode ? "Modo claro" : "Modo escuro"}
              className="text-white hover:bg-white/10"
            >
              {isDarkMode ? (
                <Sun style={{ width: '22px', height: '22px' }} />
              ) : (
                <Moon style={{ width: '22px', height: '22px' }} />
              )}
            </Button>

            <div className="hidden md:block w-px h-6 bg-white/30" />

            <div className="hidden md:flex items-center gap-3 xl:gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-white opacity-90 hover:opacity-100 transition-opacity"
                  aria-label={social.label}
                >
                  <social.icon style={{ width: '24px', height: '24px' }} />
                </a>
              ))}
            </div>

            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 overflow-y-auto" style={{ backgroundColor: '#e4142c' }}>
                <form onSubmit={handleSearch} className="flex items-center gap-2 mt-6 mb-6">
                  <Input
                    type="search"
                    placeholder="Buscar textos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                  <Button type="submit" variant="ghost" size="icon" className="text-white">
                    <Search className="h-5 w-5" />
                  </Button>
                </form>
                <nav className="flex flex-col gap-4">
                  <Link
                    to="/textos"
                    className={`text-lg font-extrabold py-2 border-b border-white/20 text-white hover:opacity-100 transition-opacity ${
                      location.pathname === "/textos" ? "opacity-100 border-white" : "opacity-90"
                    }`}
                  >
                    Textos
                  </Link>
                  <Link
                    to="/autores"
                    className={`text-lg font-extrabold py-2 border-b border-white/20 text-white hover:opacity-100 transition-opacity ${
                      location.pathname === "/autores" ? "opacity-100 border-white" : "opacity-90"
                    }`}
                  >
                    Autores
                  </Link>
                  <Link
                    to="/sobre-nos"
                    className={`text-lg font-extrabold py-2 border-b border-white/20 text-white hover:opacity-100 transition-opacity ${
                      location.pathname === "/sobre-nos" ? "opacity-100 border-white" : "opacity-90"
                    }`}
                  >
                    Sobre nós
                  </Link>
                  <Link
                    to="/contato"
                    className={`text-lg font-extrabold py-2 border-b border-white/20 text-white hover:opacity-100 transition-opacity ${
                      location.pathname === "/contato" ? "opacity-100 border-white" : "opacity-90"
                    }`}
                  >
                    Contato
                  </Link>
                </nav>
                <div className="flex items-center gap-4 mt-8">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-white opacity-90 hover:opacity-100 transition-opacity"
                      aria-label={social.label}
                    >
                      <social.icon style={{ width: '24px', height: '24px' }} />
                    </a>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {isSearchOpen && (
          <div className="pb-4 flex justify-center">
            <div style={{ width: '100%', maxWidth: '512px' }}>
              <form onSubmit={handleSearch} className="flex items-center gap-2 animate-fade-in">
                <Input
                  type="search"
                  placeholder="Buscar textos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
