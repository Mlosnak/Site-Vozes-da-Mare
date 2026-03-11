import { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { ArticleCard } from "@/components/ArticleCard";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

type Article = Tables<"articles">;
type Category = Tables<"categories">;
type Author = Tables<"authors">;

export default function Textos() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAuthor, setSelectedAuthor] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("newest");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: articlesData, error: articlesError } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .eq("article_type", "texto")
        .order("published_at", { ascending: false });

      if (articlesError) {
        setLoading(false);
        return;
      }
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (!categoriesError) {
        setCategories(categoriesData || []);
      }
      const { data: authorsData, error: authorsError } = await supabase
        .from("authors")
        .select("*")
        .order("name");

      if (!authorsError) {
        setAuthors(authorsData || []);
      }
      if (articlesData) {
        const articlesWithData = await Promise.all(
          articlesData.map(async (article) => {
            const { data: articleCategories } = await supabase
              .from("article_categories")
              .select("categories(name)")
              .eq("article_id", article.id);

            const categoryNames = articleCategories
              ?.map((ac: any) => ac.categories?.name)
              .filter(Boolean) || [];
            let authorSlug = undefined;
            let authorName = article.author; 
            if (article.author_id) {
              const { data: authorData } = await supabase
                .from("authors")
                .select("slug, name")
                .eq("id", article.author_id)
                .single();
              if (authorData) {
                authorSlug = authorData.slug;
                authorName = authorData.name || article.author;
              }
            }

            return {
              ...article,
              categoryNames,
              authorSlug,
              authorName,
            };
          })
        );
        setArticles(articlesWithData as any);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  const filteredArticles = useMemo(() => {
    let result = [...articles];
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((article: any) =>
        article.title.toLowerCase().includes(query) ||
        (article.excerpt && article.excerpt.toLowerCase().includes(query))
      );
    }
    if (selectedCategory !== "all") {
      result = result.filter((article: any) =>
        article.categoryNames?.includes(selectedCategory)
      );
    }
    if (selectedAuthor !== "all") {
      result = result.filter((article: any) =>
        article.author_id === selectedAuthor
      );
    }
    result.sort((a: any, b: any) => {
      const dateA = new Date(a.published_at || a.created_at).getTime();
      const dateB = new Date(b.published_at || b.created_at).getTime();
      if (sortOrder === "newest") {
        return dateB - dateA;
      } else if (sortOrder === "oldest") {
        return dateA - dateB;
      } else if (sortOrder === "title-asc") {
        return a.title.localeCompare(b.title);
      } else if (sortOrder === "title-desc") {
        return b.title.localeCompare(a.title);
      }
      return 0;
    });

    return result;
  }, [articles, searchQuery, selectedCategory, selectedAuthor, sortOrder]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedAuthor("all");
    setSortOrder("newest");
  };

  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedAuthor !== "all" || sortOrder !== "newest";

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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Textos</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 font-normal italic">
          Artigos, crônicas e análises sobre os principais temas da atualidade.
        </p>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por título..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-3 w-full lg:w-auto">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Autor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os autores</SelectItem>
                  {authors.map((author) => (
                    <SelectItem key={author.id} value={author.id}>
                      {author.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mais recentes</SelectItem>
                  <SelectItem value="oldest">Mais antigos</SelectItem>
                  <SelectItem value="title-asc">Título (A-Z)</SelectItem>
                  <SelectItem value="title-desc">Título (Z-A)</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            {filteredArticles.length} {filteredArticles.length === 1 ? "texto encontrado" : "textos encontrados"}
          </p>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>{articles.length === 0 ? "Nenhum texto publicado ainda." : "Nenhum texto encontrado com os filtros selecionados."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredArticles.map((article: any) => (
              <ArticleCard
                key={article.id}
                id={article.id}
                title={article.title}
                excerpt={article.excerpt || ""}
                coverImage={article.cover_image || "/placeholder.svg"}
                author={article.authorName || article.author}
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
