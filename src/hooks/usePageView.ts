import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

type ViewType = "article" | "category" | "author" | "site";

export function usePageView(type: ViewType, id?: string, page?: string) {
  useEffect(() => {
    const recordView = async () => {
      try {
        let result;
        if (type === "article" && id) {
          result = await supabase.from("article_views").insert({ article_id: id });
        } else if (type === "category" && id) {
          result = await supabase.from("category_views").insert({ category_id: id });
        } else if (type === "author" && id) {
          result = await supabase.from("author_views").insert({ author_id: id });
        } else if (type === "site" && page) {
          result = await supabase.from("site_views").insert({ page });
        }

        if (result?.error) {
          console.error(`Erro ao registrar visualização (${type}):`, result.error.message, result.error.details, result.error.hint);
        }
      } catch (error) {
        console.error("Erro ao registrar visualização:", error);
      }
    };

    if ((type === "site" && page) || (type !== "site" && id)) {
      recordView();
    }
  }, [type, id, page]);
}

export async function getArticleViews(articleId: string): Promise<number> {
  const { count } = await supabase
    .from("article_views")
    .select("*", { count: "exact", head: true })
    .eq("article_id", articleId);
  return count || 0;
}

export async function getCategoryViews(categoryId: string): Promise<number> {
  const { count } = await supabase
    .from("category_views")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);
  return count || 0;
}

export async function getAuthorViews(authorId: string): Promise<number> {
  const { count } = await supabase
    .from("author_views")
    .select("*", { count: "exact", head: true })
    .eq("author_id", authorId);
  return count || 0;
}

export async function getSiteViews(page?: string): Promise<number> {
  let query = supabase.from("site_views").select("*", { count: "exact", head: true });
  if (page) {
    query = query.eq("page", page);
  }
  const { count } = await query;
  return count || 0;
}

export async function getAllViewsStats() {
  const [articleViews, categoryViews, authorViews, siteViews] = await Promise.all([
    supabase.from("article_views").select("*", { count: "exact", head: true }),
    supabase.from("category_views").select("*", { count: "exact", head: true }),
    supabase.from("author_views").select("*", { count: "exact", head: true }),
    supabase.from("site_views").select("*", { count: "exact", head: true }),
  ]);

  return {
    articles: articleViews.count || 0,
    categories: categoryViews.count || 0,
    authors: authorViews.count || 0,
    site: siteViews.count || 0,
    total: (articleViews.count || 0) + (categoryViews.count || 0) + (authorViews.count || 0) + (siteViews.count || 0),
  };
}

export async function getArticleViewsDetailed() {
  const { data } = await supabase
    .from("article_views")
    .select("article_id")
    .order("viewed_at", { ascending: false });
  if (!data) return [];
  const viewCounts: Record<string, number> = {};
  data.forEach((view) => {
    viewCounts[view.article_id] = (viewCounts[view.article_id] || 0) + 1;
  });
  return Object.entries(viewCounts).map(([article_id, count]) => ({
    article_id,
    count,
  })).sort((a, b) => b.count - a.count);
}

export async function getCategoryViewsDetailed() {
  const { data } = await supabase
    .from("category_views")
    .select("category_id")
    .order("viewed_at", { ascending: false });
  if (!data) return [];
  const viewCounts: Record<string, number> = {};
  data.forEach((view) => {
    viewCounts[view.category_id] = (viewCounts[view.category_id] || 0) + 1;
  });
  return Object.entries(viewCounts).map(([category_id, count]) => ({
    category_id,
    count,
  })).sort((a, b) => b.count - a.count);
}

export async function getAuthorViewsDetailed() {
  const { data } = await supabase
    .from("author_views")
    .select("author_id")
    .order("viewed_at", { ascending: false });
  if (!data) return [];
  const viewCounts: Record<string, number> = {};
  data.forEach((view) => {
    viewCounts[view.author_id] = (viewCounts[view.author_id] || 0) + 1;
  });
  return Object.entries(viewCounts).map(([author_id, count]) => ({
    author_id,
    count,
  })).sort((a, b) => b.count - a.count);
}
