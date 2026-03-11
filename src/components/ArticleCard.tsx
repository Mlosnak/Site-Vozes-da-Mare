import { Link } from "react-router-dom";
import { Calendar, User } from "lucide-react";

interface ArticleCardProps {
  id: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: string;
  authorId?: string | null;
  authorSlug?: string | null;
  publishedAt: string;
  categories: string[];
  slug: string;
  variant?: "default" | "featured" | "compact" | "home";
}

export function ArticleCard({
  title,
  excerpt,
  coverImage,
  author,
  authorId,
  authorSlug,
  publishedAt,
  categories,
  slug,
  variant = "default",
}: ArticleCardProps) {
  const authorLink = authorSlug 
    ? `/autor/${authorSlug}` 
    : authorId 
    ? `/autor/${authorId}` 
    : null;
  const getCategoryClass = (category: string) => {
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes("política") || categoryLower.includes("politica")) return "category-badge-politica";
    if (categoryLower.includes("internacional")) return "category-badge-internacional";
    if (categoryLower.includes("nacional") || categoryLower.includes("questão nacional")) return "category-badge-nacional";
    if (categoryLower.includes("economia")) return "category-badge-economia";
    if (categoryLower.includes("cultura")) return "category-badge-cultura";
    if (categoryLower.includes("educação") || categoryLower.includes("educacao")) return "category-badge-educacao";
    if (categoryLower.includes("saúde") || categoryLower.includes("saude")) return "category-badge-saude";
    if (categoryLower.includes("esporte")) return "category-badge-esporte";
    if (categoryLower.includes("tecnologia")) return "category-badge-tecnologia";
    if (categoryLower.includes("meio ambiente") || categoryLower.includes("ambiente")) return "category-badge-meio-ambiente";
    return "category-badge-default";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (variant === "featured") {
    return (
      <Link to={`/artigo/${slug}`} className="block group">
        <article className="article-card h-full">
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 hero-gradient" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {categories.map((category) => (
                  <span
                    key={category}
                    className={`category-badge ${getCategoryClass(category)}`}
                  >
                    {category}
                  </span>
                ))}
              </div>
              <h3 className="text-2xl md:text-3xl font-semibold text-white mb-2 line-clamp-2">
                {title}
              </h3>
              <p className="text-white/80 line-clamp-2 mb-3">{excerpt}</p>
              <div className="flex items-center gap-4 text-white/70 text-sm">
                {authorLink ? (
                  <Link to={authorLink} className="flex items-center gap-1 hover:text-white transition-colors" onClick={(e) => e.stopPropagation()}>
                    <User className="h-4 w-4" />
                    {author}
                  </Link>
                ) : (
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {author}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(publishedAt)}
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "home") {
    return (
      <Link to={`/artigo/${slug}`} className="block group">
        <article className="article-card h-full flex flex-col">
          <div className="relative aspect-square sm:aspect-[16/10] overflow-hidden rounded-t-lg">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-2 sm:p-4 flex flex-col flex-1">
            <h3 className="text-xs sm:text-base font-bold text-foreground mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-2 sm:mb-3 flex-1 italic font-normal hidden sm:block">
              {excerpt}
            </p>
            <div className="flex items-center gap-1 sm:gap-3 text-muted-foreground text-[8px] sm:text-[10px] mt-auto flex-wrap">
              {authorLink ? (
                <Link to={authorLink} className="flex items-center gap-1 hover:text-primary transition-colors truncate" onClick={(e) => e.stopPropagation()}>
                  <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                  <span className="truncate">{author}</span>
                </Link>
              ) : (
                <span className="flex items-center gap-1 truncate">
                  <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                  <span className="truncate">{author}</span>
                </span>
              )}
              <span className="flex items-center gap-1 hidden sm:flex">
                <Calendar className="h-3 w-3" />
                {formatDate(publishedAt)}
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link to={`/artigo/${slug}`} className="block group">
        <article className="article-card flex gap-4 p-4">
          <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1 mb-2">
              {categories.slice(0, 1).map((category) => (
                <span
                  key={category}
                  className={`category-badge text-xs ${getCategoryClass(category)}`}
                >
                  {category}
                </span>
              ))}
            </div>
            <h4 className="font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h4>
            <span className="text-xs text-muted-foreground mt-1 block">
              {formatDate(publishedAt)}
            </span>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/artigo/${slug}`} className="block group">
      <article className="article-card h-full flex flex-col">
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4">
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-1 sm:mb-2">
              {categories.slice(0, 1).map((category) => (
                <span
                  key={category}
                  className={`category-badge text-[8px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 ${getCategoryClass(category)}`}
                >
                  {category}
                </span>
              ))}
            </div>
            <h3 className="text-xs sm:text-sm font-semibold text-white mb-1 line-clamp-2 group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
        </div>
        <div className="p-2 sm:p-3 flex flex-col flex-1">
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-1 sm:mb-2 flex-1 italic font-normal hidden sm:block">
            {excerpt}
          </p>
          <div className="flex items-center gap-1 sm:gap-3 text-muted-foreground text-[8px] sm:text-[10px] mt-auto flex-wrap">
            {authorLink ? (
              <Link to={authorLink} className="flex items-center gap-1 hover:text-primary transition-colors truncate" onClick={(e) => e.stopPropagation()}>
                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                <span className="truncate">{author}</span>
              </Link>
            ) : (
              <span className="flex items-center gap-1 truncate">
                <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                <span className="truncate">{author}</span>
              </span>
            )}
            <span className="flex items-center gap-1 hidden sm:flex">
              <Calendar className="h-3 w-3" />
              {formatDate(publishedAt)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
