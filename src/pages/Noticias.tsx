import { Header } from "@/components/Header";
import { ArticleCard } from "@/components/ArticleCard";
import { mockArticles } from "@/lib/mockData";

export default function Noticias() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-2">Notícias</h1>
        <p className="text-muted-foreground mb-8">
          As últimas notícias e acontecimentos do cenário político brasileiro.
        </p>

        {mockArticles.length > 0 && (
          <div className="mb-8">
            <ArticleCard {...mockArticles[0]} variant="featured" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockArticles.slice(1).map((article) => (
            <ArticleCard key={article.id} {...article} />
          ))}
        </div>
      </main>
    </div>
  );
}
