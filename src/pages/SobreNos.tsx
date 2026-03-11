import { Header } from "@/components/Header";
import estrela from "@/assets/estrela.png";
import lulaImg from "@/assets/lula.png";

export default function SobreNos() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="w-full bg-primary mt-6 sm:mt-10 md:mt-14 mb-6 sm:mb-10 md:mb-14">
        <div className="pr-0 md:pr-12">
          <div className="grid grid-cols-1 md:grid-cols-2 items-center">
            <div className="flex items-center justify-center p-4 sm:p-6 md:p-8 h-[120px] sm:h-[150px] md:h-[200px]">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-white" style={{ fontFamily: 'Georgia, serif' }}>
                  Vozes da Maré
                </h1>
                <p className="text-white/80 mt-2 sm:mt-3 text-[10px] sm:text-xs md:text-sm italic">
                  "É preciso não ter medo, é preciso ter a coragem de dizer"
                </p>
              </div>
            </div>
            <div className="h-[160px] sm:h-[180px] md:h-[200px] overflow-hidden">
              <img 
                src={lulaImg} 
                alt="Lula"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>

      <main className="container-fixed px-4 pt-0 pb-6 sm:pb-12">

        <div className="flex items-center gap-4 mb-8 sm:mb-16">
          <div className="flex-1 h-px bg-border"></div>
          <img src={estrela} alt="Estrela" className="h-5 w-5 object-contain" />
          <div className="flex-1 h-px bg-border"></div>
        </div>

        <section className="mb-8 sm:mb-16 max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4 sm:mb-6">
            Quem Somos
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            O <strong className="text-foreground">Vozes da Maré</strong> é um site independente, feito por brasileiros e brasileiras que buscam construir, debater, articular e lutar por um Brasil Soberano. Nosso horizonte é a emancipação da classe trabalhadora, a garantia da justiça social e a construção de um projeto nacional que compreenda a complexidade de nosso povo, a diversificação de nossa fauna e flora, mas que principalmente entenda a grandeza de nossa pátria.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            Somos guiados pelas experiências históricas e pela liderança de grandes homens e mulheres do Brasil. Somos herdeiros dos comunistas, dos trabalhistas, do petismo e de toda experiência que coloque o povo e a pátria no centro do debate.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            Compreendemos a importância do presidente Getúlio como fundador da soberania brasileira, das nossas estatais, além de grande defensor das riquezas de nosso país. Defendemos o legado de figuras como Marighella, Prestes, Zuleika Alambert, Gregório Bezerra e Clara Charf, exímios comunistas e lutadores da classe trabalhadora Brasileira. Construímos, defendemos e nos doamos junto ao presidente Lula na luta por justiça social, por dignidade e honra ao povo brasileiro. Exaltamos figuras como Leonel Brizola, Darcy Ribeiro e suas teorias e assim como os trabalhistas, também cremos e lutamos pela construção de um Brasil que ainda não tenha existido.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            Somos um movimento brasileiro-popular, colocamos nosso povo e a pátria no centro de nossas atenções. Nossa razão se dá a partir da necessidade de construir a vocação ao qual nosso país está premeditado: Ser a nova Roma.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            Acreditamos que o Brasil necessita atingir sua soberania a partir da relação íntima com sua grandeza, sua complexidade territorial e sua diversidade explícita no povo. Essa nova Roma é complexa pois é caipira, crioula, sertaneja, cabocla e sulina. Essa nova Roma é grandiosa pois tem em sua terra a maior riqueza desse planeta, a amazônia; somos grandiosos pois temos a caatinga, cerrado, pantanal, mata atlântica e pampa. Um país como o nosso não pode ser simplificado, não pode ser dependente, não pode mais ser emergente. Precisamos ser a autoridade que reside no atlântico, o coração da américa do sul e a referência do sul global.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
            Nos atentamos à conjuntura nacional e global, defendemos a necessidade de uma nova ordem multipolar que ponha fim a ordem ocidental que está posta. Acreditamos ser essa nova ordem a única possível de pôr fim à opressão que países soberanos, a classe trabalhadora mundial, nações emergentes e membros do sul global sofrem. O mundo multipolar deve florescer e trazer autonomia aos blocos civilizacionais, grandeza aos países e liberdade aos povos de todo mundo. Evidenciamos a compreensão de que temos um inimigo ao norte, que tem como suserano o estado de Israel; Nosso inimigo são os Estados Unidos da América.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Entre tudo evidenciado, colocamos nosso corpo e mente nos diversos problemas de nosso planeta, mas sempre retornamos nossa alma ao nosso território. No final das contas: "Somos apenas alguns entre tantos brasileiros que resistem"
          </p>
        </section>

        <footer className="border-t-4 border-primary pt-6 sm:pt-8 mt-8 sm:mt-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div>
              <h3 className="font-bold text-foreground mb-2 uppercase tracking-wider text-sm">Expediente</h3>
              <p className="text-sm text-muted-foreground">
                Vozes da Maré é uma publicação independente dedicada ao jornalismo popular e democrático.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2 uppercase tracking-wider text-sm">Contato</h3>
              <p className="text-sm text-muted-foreground">
                contato.vozesdamare@gmail.com.br
              </p>
              <p className="text-sm text-muted-foreground">
                Santos, SP - Brasil
              </p>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-2 uppercase tracking-wider text-sm">Redes Sociais</h3>
              <div className="flex justify-center gap-4">
                <a href="https://www.instagram.com/vozesdamare_/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Instagram
                </a>
                <a href="https://www.facebook.com/profile.php?id=61586276862852" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Facebook
                </a>
                <a href="https://x.com/Vozesdamare" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Twitter
                </a>
              </div>
            </div>
          </div>
          <div className="text-center mt-8 sm:mt-12 pb-6 sm:pb-8">
            <div className="inline-block border-t-2 border-b-2 border-primary py-3 sm:py-4 px-4 sm:px-8">
              <p className="text-lg font-bold text-foreground" style={{ fontFamily: 'Georgia, serif' }}>
                "Ou ficar a pátria livre, ou morrer pelo Brasil"
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                © {new Date().getFullYear()} Vozes da Maré - Todos os direitos reservados
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
