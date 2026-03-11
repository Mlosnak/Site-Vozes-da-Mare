import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { HeroBanner } from "@/components/HeroBanner";
import { CategorySection } from "@/components/CategorySection";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import estrela from "@/assets/estrela.png";

type Article = Tables<"articles">;
type Category = Tables<"categories">;
type Banner = Tables<"banners">;
type CategoryFeaturedArticle = Tables<"category_featured_articles">;

const Index = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredArticles, setFeaturedArticles] = useState<CategoryFeaturedArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: bannersData, error: bannersError } = await supabase
        .from("banners")
        .select("*")
        .eq("active", true)
        .order("order_index");

      if (!bannersError && bannersData) {
        setBanners(bannersData);
      }
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false });

      if (!articlesError && articlesData) {
        setArticles(articlesData);
      }
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (!categoriesError && categoriesData) {
        setCategories(categoriesData);
      }
      const { data: featuredData, error: featuredError } = await supabase
        .from("category_featured_articles")
        .select("*")
        .order("order_index");

      if (!featuredError && featuredData) {
        setFeaturedArticles(featuredData);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const [articlesWithAuthors, setArticlesWithAuthors] = useState<any[]>([]);

  useEffect(() => {
    if (articles.length > 0) {
      Promise.all(
        articles.map(async (article) => {
          let authorSlug = undefined;
          if (article.author_id) {
            const { data } = await supabase
              .from("authors")
              .select("slug")
              .eq("id", article.author_id)
              .single();
            authorSlug = data?.slug;
          }
          return {
            ...article,
            authorSlug,
          };
        })
      ).then((articlesWithSlugs) => {
        setArticlesWithAuthors(articlesWithSlugs);
      });
    }
  }, [articles]);

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
  const bannerSlides = banners.map((banner) => {
    const matchedCategory = categories.find(c => c.name === banner.category);
    return {
      id: banner.id,
      title: banner.title,
      excerpt: banner.excerpt || "",
      image: banner.image_url,
      category: banner.category || "",
      categoryColor: matchedCategory?.color || undefined,
      slug: banner.article_slug || "",
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroBanner slides={bannerSlides.length > 0 ? bannerSlides : undefined} />

        <div className="container-fixed px-4">
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-border"></div>
            <img src={estrela} alt="" className="h-5 w-5 object-contain" />
            <div className="flex-1 h-px bg-border"></div>
          </div>
        </div>

        {categories.map((category) => {
          const featuredForCategory = featuredArticles.filter(
            (fa) => fa.category_id === category.id
          );
          const featuredArticleIds = featuredForCategory.map((f) => f.article_id);
          const categoryArticles = articlesWithAuthors.length > 0 
            ? articlesWithAuthors.filter((article) =>
                featuredArticleIds.includes(article.id)
              )
            : articles.filter((article) =>
                featuredArticleIds.includes(article.id)
              );

          if (categoryArticles.length === 0) return null;

          return (
            <CategorySection
              key={category.id}
              title={category.name}
              slug={category.slug}
              articles={categoryArticles.map((article: any) => ({
                id: article.id,
                title: article.title,
                excerpt: article.excerpt || "",
                coverImage: article.cover_image || "/placeholder.svg",
                author: article.author,
                authorId: article.author_id || undefined,
                authorSlug: article.authorSlug,
                publishedAt: article.published_at || article.created_at,
                categories: [],
                slug: article.slug,
              }))}
              accentColor={category.color || "primary"}
            />
          );
        })}
      </main>
    </div>
  );
};

export default Index;
