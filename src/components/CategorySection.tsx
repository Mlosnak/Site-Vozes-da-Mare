import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ArticleCard } from "./ArticleCard";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  publishedAt: string;
  categories: string[];
  slug: string;
}

interface CategorySectionProps {
  title: string;
  slug: string;
  articles: Article[];
  accentColor?: string;
}

export function CategorySection({
  title,
  slug,
  articles,
  accentColor = "primary",
}: CategorySectionProps) {
  const isCustomColor = accentColor && (accentColor.startsWith("#") || accentColor.startsWith("rgb"));
  const colorClasses: Record<string, string> = {
    primary: "bg-primary",
    secondary: "bg-secondary",
    tertiary: "bg-tertiary",
    accent: "bg-accent",
  };
  const colorClassName = !isCustomColor ? (colorClasses[accentColor] || colorClasses.primary) : "";
  const colorStyle = isCustomColor ? { backgroundColor: accentColor } : {};

  if (articles.length === 0) return null;

  return (
    <section className="py-12">
      <div className="container-fixed px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div 
              className="w-1 h-8 rounded-full"
              style={isCustomColor ? { backgroundColor: accentColor } : undefined}
            />
            <h2 
              className="text-xl md:text-2xl font-bold"
              style={isCustomColor ? { color: accentColor } : undefined}
            >
              {title}
            </h2>
          </div>
          <Link
            to={`/categoria/${slug}`}
            className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <span>Ver todos</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {articles.slice(0, 3).map((article) => (
            <ArticleCard
              key={article.id}
              {...article}
              variant="home"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
