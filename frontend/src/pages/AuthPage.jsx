import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sun, Moon, Dumbbell, ArrowLeft, KeyRound, CheckCircle2, ShieldCheck, Mail
} from "lucide-react";
import { useAuth, API } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";

const AuthPage = ({ mode }) => {
  const { login, register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "coach"
  });

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: email, 2: code + new password
  const [forgotData, setForgotData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [demoCodeHint, setDemoCodeHint] = useState("");

  const [longLoading, setLongLoading] = useState(false);

  useEffect(() => {
    let timer;
    if (loading) {
      timer = setTimeout(() => {
        setLongLoading(true);
      }, 3000);
    } else {
      setLongLoading(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLongLoading(false);
    try {
      if (mode === "login") {
        const user = await login(formData.email, formData.password);
        toast.success("Accesso effettuato!");
        navigate(user.role === "coach" ? "/coach" : "/athlete");
      } else {
        const user = await register(formData.email, formData.password, formData.name, formData.role);
        toast.success("Registrazione completata!");
        navigate(user.role === "coach" ? "/coach" : "/athlete");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.detail || "Errore durante l'operazione");
    } finally {
      setLoading(false);
      setLongLoading(false);
    }
  };

  const handleRequestResetCode = async (e) => {
    e.preventDefault();
    if (!forgotData.email) {
      toast.error("Inserisci la tua email");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/forgot-password`, { email: forgotData.email });
      toast.success(res.data.message || "Codice generato con successo!");
      if (res.data.reset_code) {
        setDemoCodeHint(res.data.reset_code);
        setForgotData(prev => ({ ...prev, code: res.data.reset_code }));
      }
      setForgotStep(2);
    } catch (e) {
      toast.error(e.response?.data?.message || "Nessun account trovato con questa email");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!forgotData.code) {
      toast.error("Inserisci il codice di verifica a 6 cifre");
      return;
    }
    if (forgotData.newPassword.length < 4) {
      toast.error("La password deve contenere almeno 4 caratteri");
      return;
    }
    if (forgotData.newPassword !== forgotData.confirmPassword) {
      toast.error("Le password non coincidono");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/reset-password`, {
        email: forgotData.email,
        token: forgotData.code,
        new_password: forgotData.newPassword
      });
      toast.success(res.data.message || "Password reimpostata con successo!");
      setIsForgotPassword(false);
      setForgotStep(1);
      setFormData(prev => ({ ...prev, email: forgotData.email, password: "" }));
      setDemoCodeHint("");
    } catch (e) {
      toast.error(e.response?.data?.message || "Codice non valido o scaduto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid={`${mode}-page`}>
      <header className="fixed top-0 left-0 right-0 z-50 glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
              <Dumbbell className="h-6 w-6 text-emerald-500" />
              <span className="font-heading font-bold text-lg tracking-tight">CoachSheets</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme} data-testid="landing-theme-toggle">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 mt-16">
        <Card className="w-full max-w-md glass-card shadow-lg border-white/10">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {isForgotPassword ? (
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                  <KeyRound className="h-6 w-6 text-emerald-500" />
                </div>
              ) : (
                <Dumbbell className="h-10 w-10 text-emerald-500" />
              )}
            </div>
            <CardTitle className="font-heading text-2xl glow-text">
              {isForgotPassword 
                ? "Recupero Account"
                : mode === "login" ? "Bentornato" : "Crea Account"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isForgotPassword
                ? (forgotStep === 1 ? "Inserisci la tua email per ricevere il codice di ripristino" : "Imposta una nuova password sicura")
                : mode === "login" 
                  ? "Accedi al tuo account CoachSheets" 
                  : "Inizia a gestire i tuoi allenamenti"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isForgotPassword ? (
              // FLUSSO RESET PASSWORD
              <div className="space-y-4">
                {forgotStep === 1 ? (
                  <form onSubmit={handleRequestResetCode} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="forgot-email">Email Registrata</Label>
                      <div className="relative">
                        <Input
                          id="forgot-email"
                          type="email"
                          placeholder="email@esempio.com"
                          value={forgotData.email}
                          onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                          required
                          className="bg-background/50 pl-9"
                          data-testid="forgot-email-input"
                        />
                        <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
                      </div>
                    </div>
                    <Button type="submit" className="w-full premium-button-primary" disabled={loading} data-testid="request-reset-btn">
                      {loading ? "Invio in corso..." : "Invia codice di ripristino"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {demoCodeHint && (
                      <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400 flex items-start gap-2">
                        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold">Codice di verifica generato:</p>
                          <p className="text-base font-mono font-bold tracking-widest text-emerald-300">{demoCodeHint}</p>
                          <p className="text-[11px] text-zinc-400">Inseriscilo qui sotto insieme alla tua nuova password.</p>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="reset-code">Codice di Verifica a 6 cifre</Label>
                      <Input
                        id="reset-code"
                        placeholder="123456"
                        maxLength={6}
                        value={forgotData.code}
                        onChange={(e) => setForgotData({ ...forgotData, code: e.target.value })}
                        required
                        className="bg-background/50 text-center font-mono text-lg tracking-widest"
                        data-testid="reset-code-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nuova Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Minimo 4 caratteri"
                        value={forgotData.newPassword}
                        onChange={(e) => setForgotData({ ...forgotData, newPassword: e.target.value })}
                        required
                        className="bg-background/50"
                        data-testid="new-password-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Conferma Nuova Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Ripeti la password"
                        value={forgotData.confirmPassword}
                        onChange={(e) => setForgotData({ ...forgotData, confirmPassword: e.target.value })}
                        required
                        className="bg-background/50"
                        data-testid="confirm-password-input"
                      />
                    </div>
                    <Button type="submit" className="w-full premium-button-primary" disabled={loading} data-testid="confirm-reset-btn">
                      {loading ? "Reimpostazione..." : "Reimposta e Salva Password"}
                    </Button>
                  </form>
                )}

                <div className="pt-2 text-center">
                  <button 
                    type="button" 
                    onClick={() => { setIsForgotPassword(false); setForgotStep(1); }} 
                    className="text-xs text-muted-foreground hover:text-white flex items-center justify-center gap-1 mx-auto"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Torna al login
                  </button>
                </div>
              </div>
            ) : (
              // FLUSSO LOGIN / REGISTRAZIONE NORMALE
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === "register" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome</Label>
                        <Input
                          id="name"
                          placeholder="Il tuo nome"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="bg-background/50"
                          data-testid="name-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ruolo</Label>
                        <Tabs value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                          <TabsList className="grid grid-cols-2 w-full bg-background/50">
                            <TabsTrigger value="coach" data-testid="role-coach">Coach</TabsTrigger>
                            <TabsTrigger value="athlete" data-testid="role-athlete">Atleta</TabsTrigger>
                          </TabsList>
                        </Tabs>
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@esempio.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-background/50"
                      data-testid="email-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setForgotStep(1);
                            setForgotData(prev => ({ ...prev, email: formData.email }));
                          }}
                          className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline"
                          data-testid="forgot-password-link"
                        >
                          Password dimenticata?
                        </button>
                      )}
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="bg-background/50"
                      data-testid="password-input"
                    />
                  </div>
                  
                  {longLoading && (
                    <div className="text-sm text-center text-amber-500 bg-amber-500/10 p-2 rounded-md animate-pulse">
                      Stiamo avviando il server (potrebbe richiedere fino a 50s)...
                    </div>
                  )}
                  
                  <Button type="submit" className="w-full premium-button-primary" disabled={loading} data-testid="submit-btn">
                    {loading ? "Caricamento..." : mode === "login" ? "Accedi" : "Registrati"}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  {mode === "login" ? (
                    <p>
                      Non hai un account?{" "}
                      <button type="button" onClick={() => navigate("/register")} className="text-emerald-400 hover:underline" data-testid="switch-to-register">
                        Registrati
                      </button>
                    </p>
                  ) : (
                    <p>
                      Hai già un account?{" "}
                      <button type="button" onClick={() => navigate("/login")} className="text-emerald-400 hover:underline" data-testid="switch-to-login">
                        Accedi
                      </button>
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
