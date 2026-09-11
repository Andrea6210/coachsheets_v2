import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sun, Moon, LogOut, Plus, Users, FileText, Trash2, Copy, 
  MessageSquare, History, ChevronRight, ChevronDown, Menu, X, Send, 
  Dumbbell, User, Settings, Home, ArrowLeft, Check, Edit2, Link as LinkIcon, Video, Archive, TrendingUp
} from "lucide-react";
import { useAuth, API, WS_URL } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/layout/Navbar";
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
      toast.error(e.response?.data?.detail || "Errore durante l'operazione");
    } finally {
      setLoading(false);
      setLongLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" data-testid={`${mode}-page`}>
      <header className="fixed top-0 left-0 right-0 z-50 glass-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate("/")}>
              <Dumbbell className="h-6 w-6" />
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
              <Dumbbell className="h-10 w-10 text-primary" />
            </div>
            <CardTitle className="font-heading text-2xl glow-text">
              {mode === "login" ? "Bentornato" : "Crea Account"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {mode === "login" 
                ? "Accedi al tuo account CoachSheets" 
                : "Inizia a gestire i tuoi allenamenti"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                <Label htmlFor="password">Password</Label>
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
                  <button type="button" onClick={() => navigate("/register")} className="text-primary hover:underline" data-testid="switch-to-register">
                    Registrati
                  </button>
                </p>
              ) : (
                <p>
                  Hai già un account?{" "}
                  <button type="button" onClick={() => navigate("/login")} className="text-primary hover:underline" data-testid="switch-to-login">
                    Accedi
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Coach Dashboard
export default AuthPage;

