import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Calendar, User, ArrowLeft, Share2, BookOpen, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { usePageView } from "@/hooks/usePageView";
import { sanitizeHtml } from "@/lib/security";

type Article = Tables<"articles">;
type Category = Tables<"categories">;
type Author = Tables<"authors">;

export default function Artigo() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [author, setAuthor] = useState<Author | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  usePageView("article", article?.id);

  useEffect(() => {
    if (slug) {
      loadArticle(slug);
    }
  }, [slug]);

  const getCategoryColor = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes("política") || name.includes("politica")) return "#e4142c";
    if (name.includes("internacional")) return "#1e3a5f";
    if (name.includes("nacional") || name.includes("questão nacional")) return "#f5c518";
    if (name.includes("economia")) return "#fbbf24";
    if (name.includes("cultura")) return "#9333ea";
    if (name.includes("educação") || name.includes("educacao")) return "#0891b2";
    if (name.includes("saúde") || name.includes("saude")) return "#16a34a";
    if (name.includes("esporte")) return "#ea580c";
    if (name.includes("tecnologia")) return "#6366f1";
    if (name.includes("meio ambiente") || name.includes("ambiente")) return "#22c55e";
    return "#e4142c";
  };

  const loadArticle = async (articleSlug: string) => {
    try {
      const { data: articleData, error: articleError } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", articleSlug)
        .eq("published", true)
        .single();

      if (articleError || !articleData) {
        setLoading(false);
        return;
      }

      setArticle(articleData);

      const { data: articleCategories, error: categoriesError } = await supabase
        .from("article_categories")
        .select("category_id, categories(*)")
        .eq("article_id", articleData.id);

      if (!categoriesError && articleCategories) {
        const cats = articleCategories.map((ac: any) => ac.categories).filter(Boolean);
        setCategories(cats);
      }

      if (articleData.author_id) {
        const { data: authorData, error: authorError } = await supabase
          .from("authors")
          .select("*")
          .eq("id", articleData.author_id)
          .single();

        if (!authorError && authorData) {
          setAuthor(authorData);
        }
      }
      const { data: related } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .eq("article_type", articleData.article_type)
        .neq("id", articleData.id)
        .order("published_at", { ascending: false })
        .limit(4);

      if (related) {
        setRelatedArticles(related);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const estimateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt || '',
          url: window.location.href,
        });
      } catch (err) {
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-fixed px-4 py-12">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="text-muted-foreground">Carregando artigo...</span>
          </div>
        </main>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-fixed px-4 py-12">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Artigo não encontrado</h1>
            <p className="text-muted-foreground mb-8">O artigo que você está procurando não existe ou foi removido.</p>
            <Button asChild>
              <Link to="/textos">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Textos
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
      {article.cover_image && (
        <div className="relative h-[30vh] sm:h-[40vh] md:h-[50vh] overflow-hidden">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <main className="container-fixed px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 -mt-12 sm:-mt-20 relative z-10">
          <div className="lg:col-span-2">
            <article className="bg-card rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 md:p-10">
              <Button variant="ghost" asChild className="mb-6 -ml-2">
                <Link to="/textos" className="text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar para Textos
                </Link>
              </Button>

              <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6 leading-tight">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-8 pb-4 sm:pb-6 border-b border-border">
                {author ? (
                  <Link
                    to={`/autor/${author.slug || author.id}`}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    {author.avatar_url ? (
                      <img src={author.avatar_url} alt={author.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="font-semibold">{author.name}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    <span className="font-semibold">{article.author}</span>
                  </div>
                )}
                <span className="text-border">•</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(article.published_at || article.created_at)}</span>
                </div>
                <span className="text-border">•</span>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{estimateReadTime(article.content)} min de leitura</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto hidden sm:flex">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>

              {article.excerpt && (
                <div className="mb-4 sm:mb-8 p-3 sm:p-6 bg-primary/5 border-l-4 border-primary rounded-r-lg">
                  <p className="text-sm sm:text-lg text-foreground italic leading-relaxed">{article.excerpt}</p>
                </div>
              )}

              <div
                className="prose prose-sm sm:prose-lg max-w-none dark:prose-invert
                  prose-headings:text-foreground prose-headings:font-bold
                  prose-p:text-foreground prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground prose-strong:font-bold
                  prose-em:text-foreground
                  prose-blockquote:border-l-primary prose-blockquote:bg-muted/50 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                  prose-img:rounded-lg prose-img:shadow-lg
                  prose-ul:text-foreground prose-ol:text-foreground
                  prose-li:text-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content || '') }}
              />

              {categories.length > 0 && (
                <div className="mt-12 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">Categorias:</p>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => {
                      const categoryColor = category.color || getCategoryColor(category.name);
                      return (
                        <Link
                          key={category.id}
                          to={`/categoria/${category.slug}`}
                          className="px-4 py-1.5 text-sm rounded-full border-2 transition-all duration-200 hover:text-white"
                          style={{ 
                            borderColor: categoryColor,
                            color: categoryColor,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = categoryColor;
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = categoryColor;
                          }}
                        >
                          {category.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </article>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {author && (
                <div className="bg-card rounded-2xl shadow-lg p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Sobre o Autor</h3>
                  <Link to={`/autor/${author.slug || author.id}`} className="flex items-center gap-4 group">
                    {author.avatar_url ? (
                      <img src={author.avatar_url} alt={author.name} className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{author.name}</p>
                      {author.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{author.bio}</p>
                      )}
                    </div>
                  </Link>
                </div>
              )}

              {relatedArticles.length > 0 && (
                <div className="bg-card rounded-2xl shadow-lg p-6">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Leia Também</h3>
                  <div className="space-y-4">
                    {relatedArticles.map((related) => (
                      <Link
                        key={related.id}
                        to={`/artigo/${related.slug}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          {related.cover_image && (
                            <img
                              src={related.cover_image}
                              alt={related.title}
                              className="w-20 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors">
                              {related.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(related.published_at || related.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Link
                    to="/textos"
                    className="flex items-center justify-center gap-2 mt-6 py-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Ver todos os textos
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      <div className="h-16"></div>
    </div>
  );
}
