import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, Instagram, Facebook, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sanitizeInput, isValidEmail } from "@/lib/security";

export default function Contato() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidEmail(formData.email)) {
      toast({
        variant: "destructive",
        title: "Email inválido",
        description: "Por favor, insira um email válido.",
      });
      return;
    }

    try {
      const { error } = await supabase.from("contact_messages").insert({
        name: sanitizeInput(formData.name, 100),
        email: sanitizeInput(formData.email, 254),
        subject: sanitizeInput(formData.subject, 200),
        message: sanitizeInput(formData.message, 5000),
        read: false,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao enviar mensagem. Tente novamente.",
        });
      } else {
        toast({
          title: "Mensagem enviada!",
          description: "Entraremos em contato em breve.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container-fixed px-4 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Contato</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 font-normal italic">
            Entre em contato conosco. Teremos prazer em responder suas dúvidas.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="space-y-6 md:col-span-1">
              <div className="bg-transparent">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold mb-1 text-sm">Email</h3>
                      <p className="text-xs text-muted-foreground break-words">contato.vozesdamare@gmail.com.br</p>
                    </div>
                  </div>
              </div>

              <div className="bg-transparent mt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg flex-shrink-0">
                      <Instagram className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold mb-1 text-sm">Redes Sociais</h3>
                      <div className="space-y-1">
                        <a href="https://www.instagram.com/vozesdamare_/" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                          Instagram
                        </a>
                        <a href="https://www.facebook.com/profile.php?id=61586276862852" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                          Facebook
                        </a>
                        <a href="https://x.com/Vozesdamare" target="_blank" rel="noopener noreferrer" className="block text-xs text-muted-foreground hover:text-primary transition-colors">
                          Twitter
                        </a>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            <div className="md:col-span-2 bg-transparent">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-foreground">Envie uma mensagem</h2>
                <p className="text-sm text-muted-foreground">
                  Preencha o formulário abaixo e responderemos o mais breve possível.
                </p>
              </div>
              <div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Assunto</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Enviar Mensagem
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
