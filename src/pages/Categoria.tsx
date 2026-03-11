import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ArticleCard } from "@/components/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { usePageView } from "@/hooks/usePageView";

type Article = Tables<"articles">;
type Category = Tables<"categories">;

export default function Categoria() {
  const { slug } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  usePageView("category", category?.id);

  useEffect(() => {
    if (slug) {
      loadCategoryAndArticles(slug);
    }
  }, [slug]);

  const loadCategoryAndArticles = async (categorySlug: string) => {
    try {
      const { data: categoryData, error: categoryError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", categorySlug)
        .single();

      if (categoryError || !categoryData) {
        setLoading(false);
        return;
      }

      setCategory(categoryData);
      const { data: articleCategories, error: articleCategoriesError } = await supabase
        .from("article_categories")
        .select("article_id")
        .eq("category_id", categoryData.id);

      if (articleCategoriesError || !articleCategories) {
        setLoading(false);
        return;
      }

      const articleIds = articleCategories.map((ac) => ac.article_id);

      if (articleIds.length > 0) {
        const { data: articlesData, error: articlesError } = await supabase
          .from("articles")
          .select("*")
          .in("id", articleIds)
          .eq("published", true)
          .order("published_at", { ascending: false });

        if (!articlesError && articlesData) {
          const articlesWithData = await Promise.all(
            articlesData.map(async (article) => {
              let authorSlug = undefined;
              if (article.author_id) {
                const { data } = await supabase
                  .from("authors")
                  .select("slug")
                  .eq("id", article.author_id)
                  .single();
                authorSlug = data?.slug;
              }
              const { data: articleCats } = await supabase
                .from("article_categories")
                .select("categories(name)")
                .eq("article_id", article.id);

              const categoryNames = articleCats
                ?.map((ac: any) => ac.categories?.name)
                .filter(Boolean) || [];

              return {
                ...article,
                authorSlug,
                categoryNames,
              };
            })
          );
          setArticles(articlesWithData as any);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

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

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container-fixed px-4 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold mb-4">Categoria não encontrada</h1>
            <p className="text-muted-foreground">A categoria que você está procurando não existe.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-fixed px-4 py-6 sm:py-12">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-1 h-8 sm:h-12 rounded-full"
              style={{ backgroundColor: category.color || "#e4142c" }}
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground">{category.name}</h1>
          </div>
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nenhum artigo publicado nesta categoria ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {articles.map((article: any) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                excerpt={article.excerpt || ""}
                coverImage={article.cover_image || "/placeholder.svg"}
                author={article.author}
                authorId={article.author_id || undefined}
                authorSlug={article.authorSlug}
                publishedAt={article.published_at || article.created_at}
                categories={article.categoryNames || []}
                slug={article.slug}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
