import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Key, Shield, User, Lock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateAdminToken, storeToken, hasValidToken } from "@/lib/jwt";
async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const LOCKOUT_KEY = "admin_lockout";

function getLockoutState(): { attempts: number; lockedUntil: number | null } {
  try {
    const data = localStorage.getItem(LOCKOUT_KEY);
    if (!data) return { attempts: 0, lockedUntil: null };
    return JSON.parse(data);
  } catch {
    return { attempts: 0, lockedUntil: null };
  }
}

function setLockoutState(attempts: number, lockedUntil: number | null) {
  localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ attempts, lockedUntil }));
}

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    hasValidToken().then((valid) => {
      if (valid) navigate("/gatewayhorsemint");
    });
  }, [navigate]);
  useEffect(() => {
    const checkLockout = () => {
      const state = getLockoutState();
      if (state.lockedUntil && Date.now() < state.lockedUntil) {
        setIsLocked(true);
        setLockTimeLeft(Math.ceil((state.lockedUntil - Date.now()) / 1000 / 60));
      } else if (state.lockedUntil) {
        setLockoutState(0, null);
        setIsLocked(false);
      }
    };

    checkLockout();
    const interval = setInterval(checkLockout, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      toast({
        variant: "destructive",
        title: "Conta bloqueada",
        description: `Muitas tentativas. Aguarde ${lockTimeLeft} minuto(s).`,
      });
      return;
    }

    if (!username.trim() || !password.trim() || !token.trim()) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
      });
      return;
    }

    setIsLoading(true);

    try {
      const tokenHash = await hashString(token);
      const passwordHash = await hashString(password);
      const { data, error } = await supabase
        .from("admin_users")
        .select("id, username, password_hash")
        .eq("username", username.trim())
        .eq("token_hash", tokenHash)
        .single();

      if (error || !data) {
        const state = getLockoutState();
        const newAttempts = state.attempts + 1;
        if (newAttempts >= MAX_ATTEMPTS) {
          const lockedUntil = Date.now() + (LOCKOUT_MINUTES * 60 * 1000);
          setLockoutState(newAttempts, lockedUntil);
          setIsLocked(true);
          setLockTimeLeft(LOCKOUT_MINUTES);
          toast({
            variant: "destructive",
            title: "Conta bloqueada",
            description: `Muitas tentativas falhadas. Bloqueado por ${LOCKOUT_MINUTES} minutos.`,
          });
        } else {
          setLockoutState(newAttempts, null);
          toast({
            variant: "destructive",
            title: "Acesso negado",
            description: `Credenciais inválidas. ${MAX_ATTEMPTS - newAttempts} tentativa(s) restante(s).`,
          });
        }
      } else {
        if (data.password_hash && data.password_hash !== passwordHash) {
          const state = getLockoutState();
          const newAttempts = state.attempts + 1;
          if (newAttempts >= MAX_ATTEMPTS) {
            const lockedUntil = Date.now() + (LOCKOUT_MINUTES * 60 * 1000);
            setLockoutState(newAttempts, lockedUntil);
            setIsLocked(true);
            setLockTimeLeft(LOCKOUT_MINUTES);
            toast({
              variant: "destructive",
              title: "Conta bloqueada",
              description: `Muitas tentativas falhadas. Bloqueado por ${LOCKOUT_MINUTES} minutos.`,
            });
          } else {
            setLockoutState(newAttempts, null);
            toast({
              variant: "destructive",
              title: "Acesso negado",
              description: `Credenciais inválidas. ${MAX_ATTEMPTS - newAttempts} tentativa(s) restante(s).`,
            });
          }
        } else {
          setLockoutState(0, null);
          const jwtToken = await generateAdminToken(data.id, data.username);
          storeToken(jwtToken);
          toast({
            title: "Acesso autorizado!",
            description: `Bem-vindo, ${data.username}!`,
          });
          navigate("/gatewayhorsemint");
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro interno. Tente novamente.",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Acesso Restrito
          </h1>
          <p className="text-muted-foreground text-sm">
            Autenticação de múltiplos fatores necessária
          </p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-lg border border-border">
          {isLocked ? (
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Acesso Bloqueado</h3>
              <p className="text-sm text-muted-foreground">
                Muitas tentativas falhadas. Aguarde {lockTimeLeft} minuto(s) para tentar novamente.
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Usuário
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Seu nome de usuário"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-11 h-11"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Senha
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Sua senha de acesso"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-11"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm font-medium">
                  Token de Autenticação
                </Label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="token"
                    type="password"
                    placeholder="Token JWT de acesso"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="pl-11 h-11"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 text-sm font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Autenticando...
                  </span>
                ) : (
                  "Autenticar"
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Sistema protegido por autenticação multifator
        </p>
      </div>
    </div>
  );
}
