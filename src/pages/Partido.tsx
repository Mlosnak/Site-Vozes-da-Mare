import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Eye, Heart, Users } from "lucide-react";

export default function Partido() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section className="bg-gradient-to-r from-secondary to-tertiary py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">O Partido</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Conheça nossa história, valores e compromisso com o Brasil.
          </p>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        <section className="max-w-4xl mx-auto mb-16">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-t-4 border-t-primary">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-bold text-xl mb-3">Missão</h3>
                <p className="text-muted-foreground">
                  Promover a transformação política e social do Brasil através da participação
                  cidadã e da defesa dos valores democráticos.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-t-4 border-t-secondary">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="font-bold text-xl mb-3">Visão</h3>
                <p className="text-muted-foreground">
                  Ser referência na construção de políticas públicas que promovam o
                  desenvolvimento sustentável e a justiça social.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-t-4 border-t-tertiary">
              <CardContent className="pt-8">
                <div className="w-16 h-16 bg-tertiary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-tertiary" />
                </div>
                <h3 className="font-bold text-xl mb-3">Valores</h3>
                <p className="text-muted-foreground">
                  Transparência, ética, compromisso social, respeito à diversidade
                  e defesa intransigente da democracia.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Nossa História</h2>
          <div className="prose prose-lg max-w-none text-muted-foreground">
            <p className="mb-4">
              Fundado com o propósito de renovar a política brasileira, nosso partido nasceu da
              união de cidadãos comprometidos com a transformação do país. Desde nossa fundação,
              trabalhamos incansavelmente para construir uma sociedade mais justa e igualitária.
            </p>
            <p className="mb-4">
              Ao longo dos anos, conquistamos importantes vitórias em diversas esferas do poder
              público, sempre mantendo nosso compromisso com a ética e a transparência. Nossa
              trajetória é marcada pela defesa intransigente dos direitos fundamentais e pela
              busca constante por políticas públicas que beneficiem toda a população.
            </p>
            <p>
              Hoje, somos uma força política consolidada, presente em todo o território nacional,
              com milhares de filiados e simpatizantes que compartilham nossa visão de um Brasil
              melhor para todos.
            </p>
          </div>
        </section>

        <section className="bg-muted rounded-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-center mb-8">Em Números</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50K+</div>
              <p className="text-muted-foreground">Filiados</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-secondary mb-2">27</div>
              <p className="text-muted-foreground">Estados</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-tertiary mb-2">500+</div>
              <p className="text-muted-foreground">Cidades</p>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-accent mb-2">100+</div>
              <p className="text-muted-foreground">Eleitos</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
