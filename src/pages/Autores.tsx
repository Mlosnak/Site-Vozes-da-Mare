import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { User, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";

type Author = Tables<"authors">;

export default function Autores() {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadAuthors();
  }, []);

  const loadAuthors = async () => {
    try {
      const { data, error } = await supabase
        .from("authors")
        .select("*")
        .eq("show_in_list", true)
        .order("name");

      if (error) {
      } else {
        setAuthors(data || []);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const filteredAuthors = useMemo(() => {
    return authors.filter((author) => {
      return author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (author.bio && author.bio.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  }, [authors, searchQuery]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-fixed px-4 py-12">
          <div className="text-center">Carregando...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-fixed px-4 py-6 sm:py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground mb-1 sm:mb-2">Autores</h1>
            <p className="text-sm sm:text-base text-muted-foreground font-normal italic">
              Conheça os autores que escrevem para o site.
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-sm">{filteredAuthors.length} autor{filteredAuthors.length !== 1 ? 'es' : ''}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6 sm:mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar autor por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredAuthors.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum autor encontrado com os filtros selecionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredAuthors.map((author) => (
              <Link
                key={author.id}
                to={`/autor/${author.slug || author.id}`}
                className="block group"
              >
                <div className="article-card h-full p-3 sm:p-6 flex flex-col items-center text-center">
                  {author.avatar_url ? (
                    <img
                      src={author.avatar_url}
                      alt={author.name}
                      className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover mb-2 sm:mb-4 ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all"
                    />
                  ) : (
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-muted flex items-center justify-center mb-2 sm:mb-4 ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
                      <User className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
                    </div>
                  )}
                  <h3 className="text-sm sm:text-xl font-extrabold text-foreground mb-1 sm:mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {author.name}
                  </h3>
                  {author.bio && (
                    <p className="text-muted-foreground line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm hidden sm:block">
                      {author.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
