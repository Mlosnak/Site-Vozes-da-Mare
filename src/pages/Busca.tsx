import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Search, FileText, User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Article = Tables<"articles">;
type Author = Tables<"authors">;

interface SearchResult {
  type: 'article' | 'author';
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  image?: string;
  date?: string;
  authorName?: string;
}

export default function Busca() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    if (query) {
      performSearch(query);
    } else {
      setLoading(false);
    }
  }, [query]);

  const performSearch = async (term: string) => {
    setLoading(true);
    const searchResults: SearchResult[] = [];

    try {
      const { data: articles, error: articlesError } = await supabase
        .from("articles")
        .select("id, title, slug, excerpt, cover_image, published_at, author")
        .eq("published", true)
        .or(`title.ilike.%${term}%,content.ilike.%${term}%,excerpt.ilike.%${term}%`)
        .order("published_at", { ascending: false })
        .limit(20);

      if (!articlesError && articles) {
        articles.forEach((article) => {
          searchResults.push({
            type: 'article',
            id: article.id,
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt || undefined,
            image: article.cover_image || undefined,
            date: article.published_at || undefined,
            authorName: article.author || undefined,
          });
        });
      }
      const { data: authors, error: authorsError } = await supabase
        .from("authors")
        .select("id, name, slug, bio, avatar_url")
        .or(`name.ilike.%${term}%,bio.ilike.%${term}%`)
        .limit(10);

      if (!authorsError && authors) {
        authors.forEach((author) => {
          searchResults.push({
            type: 'author',
            id: author.id,
            title: author.name,
            slug: author.slug,
            excerpt: author.bio || undefined,
            image: author.avatar_url || undefined,
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(searchTerm)}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container-fixed px-4 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">Busca</h1>
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar artigos, autores..."
                className="w-full pl-12 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
              />
            </form>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : query ? (
            <>
              <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-8">
                {results.length} resultado{results.length !== 1 ? 's' : ''} para "{query}"
              </p>

              {results.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-lg text-muted-foreground">
                    Nenhum resultado encontrado para sua busca.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Tente usar palavras-chave diferentes.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {results.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={result.type === 'article' ? `/artigo/${result.slug}` : `/autor/${result.slug}`}
                      className="block bg-card border border-border rounded-lg p-3 sm:p-6 hover:border-primary transition-colors"
                    >
                      <div className="flex gap-3 sm:gap-4">
                        {result.image && (
                          <div className="flex-shrink-0">
                            <img
                              src={result.image}
                              alt={result.title}
                              className={`object-cover rounded-lg ${
                                result.type === 'author' ? 'w-16 h-16 rounded-full' : 'w-24 h-16'
                              }`}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {result.type === 'article' ? (
                              <FileText className="h-4 w-4 text-primary" />
                            ) : (
                              <User className="h-4 w-4 text-primary" />
                            )}
                            <span className="text-xs text-primary uppercase font-medium">
                              {result.type === 'article' ? 'Artigo' : 'Autor'}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-lg font-semibold text-foreground mb-1 truncate">
                            {result.title}
                          </h3>
                          {result.excerpt && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {result.excerpt}
                            </p>
                          )}
                          {result.type === 'article' && (result.date || result.authorName) && (
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {result.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(result.date)}
                                </span>
                              )}
                              {result.authorName && (
                                <span>Por {result.authorName}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">
                Digite algo para buscar artigos e autores.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
