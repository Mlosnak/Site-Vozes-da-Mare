import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBanner1 from "@/assets/hero-banner-1.jpg";
import heroBanner2 from "@/assets/hero-banner-2.jpg";
import heroBanner3 from "@/assets/hero-banner-3.jpg";

interface BannerSlide {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  categoryColor?: string;
  slug: string;
}

const defaultSlides: BannerSlide[] = [
  {
    id: "1",
    title: "Análise Política: O Futuro da Democracia Brasileira",
    excerpt: "Uma reflexão profunda sobre os rumos políticos do país e os desafios que enfrentamos.",
    image: heroBanner1,
    category: "Política",
    slug: "analise-politica-futuro-democracia",
  },
  {
    id: "2",
    title: "Brasil no Cenário Internacional",
    excerpt: "Como as relações internacionais impactam o desenvolvimento nacional.",
    image: heroBanner2,
    category: "Questão Internacional",
    slug: "brasil-cenario-internacional",
  },
  {
    id: "3",
    title: "Economia e Desenvolvimento Social",
    excerpt: "Os caminhos para um crescimento econômico sustentável e inclusivo.",
    image: heroBanner3,
    category: "Economia",
    slug: "economia-desenvolvimento-social",
  },
];

interface HeroBannerProps {
  slides?: BannerSlide[];
}

export function HeroBanner({ slides }: HeroBannerProps) {
  const displaySlides = slides && slides.length > 0 ? slides : defaultSlides;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev + 1) % displaySlides.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, displaySlides.length]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating, displaySlides.length]);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  return (
    <div className="bg-background px-3 py-3 md:px-5 md:py-4 lg:p-5 lg:pb-6">
      <section className="relative w-full h-[280px] sm:h-[350px] md:h-[400px] lg:h-[460px] overflow-hidden rounded-lg">
      {displaySlides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-all duration-700 ease-in-out ${
            index === currentSlide
              ? "opacity-100 scale-100 z-10"
              : "opacity-0 scale-105 z-0 pointer-events-none"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 hero-gradient" />

          <div className="absolute inset-0 flex items-end">
            <div className="container-fixed px-4 pb-8 sm:pb-10 md:pb-12 lg:pb-14 w-full">
              <div
                className={`max-w-2xl transition-all duration-500 delay-200 ${
                  index === currentSlide
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ marginLeft: 'clamp(8px, 5%, 10%)' }}
              >
                <span
                  className="category-badge mb-2 sm:mb-4 text-xs sm:text-sm text-white"
                  style={{ backgroundColor: slide.categoryColor || 'hsl(var(--primary))' }}
                >
                  {slide.category}
                </span>
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3 leading-tight line-clamp-3">
                  {slide.title}
                </h2>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/90 mb-3 sm:mb-4 italic font-normal line-clamp-2 hidden sm:block">
                  {slide.excerpt}
                </p>
                {slide.slug && (
                  <Link to={`/artigo/${slide.slug}`} className="inline-block">
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground relative z-20 text-sm sm:text-base">
                      Leia Mais
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full backdrop-blur-sm z-30"
        onClick={prevSlide}
        disabled={isAnimating}
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-full backdrop-blur-sm z-30"
        onClick={nextSlide}
        disabled={isAnimating}
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
      </Button>

      <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-30">
        {displaySlides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentSlide(index);
                setTimeout(() => setIsAnimating(false), 600);
              }
            }}
            className={`h-2 sm:h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? "bg-white w-5 sm:w-8"
                : "bg-white/50 hover:bg-white/75 w-2 sm:w-3"
            }`}
            aria-label={`Ir para slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
    </div>
  );
}
