import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { ArticleCard } from "@/components/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { User, Instagram, Facebook, Twitter, Youtube, ArrowLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageView } from "@/hooks/usePageView";

type Author = Tables<"authors">;
type Article = Tables<"articles">;

export default function Autor() {
  const { slug } = useParams<{ slug: string }>();
  const [author, setAuthor] = useState<Author | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [relatedAuthors, setRelatedAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  usePageView("author", author?.id);

  useEffect(() => {
    if (slug) {
      loadAuthorAndArticles(slug);
    }
  }, [slug]);

  const loadAuthorAndArticles = async (authorSlug: string) => {
    try {
      const { data: authorData, error: authorError } = await supabase
        .from("authors")
        .select("*")
        .eq("slug", authorSlug)
        .single();

      if (authorError || !authorData) {
        const { data: authorById, error: byIdError } = await supabase
          .from("authors")
          .select("*")
          .eq("id", authorSlug)
          .single();

        if (byIdError || !authorById) {
          setLoading(false);
          return;
        }

        setAuthor(authorById);
        await loadArticles(authorById.id);
        await loadRelatedAuthors(authorById.id);
      } else {
        setAuthor(authorData);
        await loadArticles(authorData.id);
        await loadRelatedAuthors(authorData.id);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const loadArticles = async (authorId: string) => {
    const { data: articlesData, error } = await supabase
      .from("articles")
      .select("*")
      .eq("author_id", authorId)
      .eq("published", true)
      .order("published_at", { ascending: false });

    if (error) {
    } else {
      setArticles(articlesData || []);
    }
  };

  const loadRelatedAuthors = async (currentAuthorId: string) => {
    const { data: authorsData, error } = await supabase
      .from("authors")
      .select("*")
      .eq("show_in_list", true)
      .neq("id", currentAuthorId)
      .limit(4);

    if (!error && authorsData) {
      setRelatedAuthors(authorsData);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-fixed px-4 py-12">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-muted-foreground">Carregando autor...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-fixed px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Autor não encontrado</h1>
            <p className="text-muted-foreground mb-8">O autor que você está procurando não existe.</p>
            <Button asChild>
              <Link to="/autores">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ver todos os autores
              </Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container-fixed px-4 py-6 sm:py-12">
          <Button variant="ghost" asChild className="mb-4 sm:mb-6 -ml-2">
            <Link to="/autores" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Todos os autores
            </Link>
          </Button>

          <div className="flex flex-col md:flex-row gap-4 sm:gap-8 items-center md:items-start">
            <div className="relative">
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.name}
                  className="w-24 h-24 sm:w-40 sm:h-40 rounded-full object-cover ring-4 ring-primary/30 shadow-2xl"
                />
              ) : (
                <div className="w-24 h-24 sm:w-40 sm:h-40 rounded-full bg-muted flex items-center justify-center ring-4 ring-primary/30">
                  <User className="h-12 w-12 sm:h-20 sm:w-20 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-4">{author.name}</h1>
              {author.bio && (
                <p className="text-sm sm:text-lg text-muted-foreground mb-4 sm:mb-6 max-w-2xl leading-relaxed">{author.bio}</p>
              )}

              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                {author.instagram_url && (
                  <a
                    href={author.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border hover:border-primary hover:text-primary transition-all"
                  >
                    <Instagram className="h-4 w-4" />
                    <span className="text-sm">Instagram</span>
                  </a>
                )}
                {author.facebook_url && (
                  <a
                    href={author.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border hover:border-primary hover:text-primary transition-all"
                  >
                    <Facebook className="h-4 w-4" />
                    <span className="text-sm">Facebook</span>
                  </a>
                )}
                {author.twitter_url && (
                  <a
                    href={author.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border hover:border-primary hover:text-primary transition-all"
                  >
                    <Twitter className="h-4 w-4" />
                    <span className="text-sm">Twitter</span>
                  </a>
                )}
                {author.youtube_url && (
                  <a
                    href={author.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border hover:border-primary hover:text-primary transition-all"
                  >
                    <Youtube className="h-4 w-4" />
                    <span className="text-sm">YouTube</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container-fixed px-4 py-6 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground">Textos de {author.name}</h2>
              <span className="text-xs sm:text-sm text-muted-foreground">{articles.length} texto{articles.length !== 1 ? 's' : ''}</span>
            </div>
            {articles.length === 0 ? (
              <div className="bg-card rounded-2xl p-12 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Este autor ainda não publicou nenhum texto.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-6">
                {articles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    id={article.id}
                    title={article.title}
                    excerpt={article.excerpt || ""}
                    coverImage={article.cover_image || "/placeholder.svg"}
                    author={article.author}
                    authorId={article.author_id || undefined}
                    authorSlug={author.slug}
                    publishedAt={article.published_at || article.created_at}
                    categories={[]}
                    slug={article.slug}
                    variant="home"
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              {relatedAuthors.length > 0 && (
                <div className="bg-card rounded-2xl shadow-lg p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Outros Autores</h3>
                  <div className="space-y-4">
                    {relatedAuthors.map((relatedAuthor) => (
                      <Link
                        key={relatedAuthor.id}
                        to={`/autor/${relatedAuthor.slug || relatedAuthor.id}`}
                        className="flex items-center gap-4 group"
                      >
                        {relatedAuthor.avatar_url ? (
                          <img
                            src={relatedAuthor.avatar_url}
                            alt={relatedAuthor.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/50 transition-all"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {relatedAuthor.name}
                          </p>
                          {relatedAuthor.bio && (
                            <p className="text-xs text-muted-foreground line-clamp-1">{relatedAuthor.bio}</p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/autores"
                    className="flex items-center justify-center gap-2 mt-6 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Ver todos os autores
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
