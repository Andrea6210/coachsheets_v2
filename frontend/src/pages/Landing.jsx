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
const Landing = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" data-testid="landing-page">
      <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6" />
              <span className="font-heading font-bold text-lg tracking-tight">CoachSheets</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme} data-testid="landing-theme-toggle">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/login")} data-testid="login-nav-btn" className="border-white/20 text-white hover:bg-white/10">
                Accedi
              </Button>
              <Button size="sm" onClick={() => navigate("/register")} data-testid="register-nav-btn" className="premium-button-primary border-none">
                Inizia Gratis
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center min-h-[calc(100vh-200px)]">
            <div className="lg:col-span-7 space-y-8">
              <div className="space-y-4 animate-fade-in-up">
                <Badge variant="outline" className="px-3 py-1 border-sky-500/30 text-sky-400 bg-sky-500/10">
                  Collaborazione in tempo reale
                </Badge>
                <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight glow-text">
                  Schede di allenamento<br />
                  <span className="text-primary">condivise e collaborative</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  CoachSheets permette a coach e atleti di modificare le schede di allenamento insieme, 
                  in tempo reale. Come Google Docs, ma per il fitness.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-1">
                <Button size="lg" onClick={() => navigate("/register")} className="gap-2 premium-button-primary border-none text-lg px-8 h-14" data-testid="hero-cta-btn">
                  Inizia Gratis <ChevronRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")} data-testid="hero-login-btn" className="border-white/20 text-white hover:bg-white/10 text-lg px-8 h-14">
                  Ho già un account
                </Button>
              </div>

              <div className="grid sm:grid-cols-3 gap-6 pt-8 animate-fade-in-up stagger-2">
                {[
                  { title: "Real-time", desc: "Modifiche visibili istantaneamente" },
                  { title: "Semplice", desc: "Interfaccia pulita e intuitiva" },
                  { title: "Chat", desc: "Comunica direttamente con gli atleti" }
                ].map((f, i) => (
                  <div key={i} className="space-y-1">
                    <h3 className="font-heading font-semibold">{f.title}</h3>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 animate-fade-in-up stagger-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 to-purple-500/20 rounded-lg blur-3xl"></div>
                <Card className="relative glass-card border-none shadow-[0_0_30px_rgba(56,189,248,0.15)] text-foreground">
                  <CardHeader className="pb-2 border-b border-border">
                    <div className="flex items-center justify-between">
                      <Badge>Giorno 1 - Push</Badge>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {[
                        { ex: "Panca Piana", sets: "4", reps: "8", kg: "80" },
                        { ex: "Military Press", sets: "3", reps: "10", kg: "40" },
                        { ex: "Dips", sets: "3", reps: "12", kg: "BW" }
                      ].map((row, i) => (
                        <div key={i} className="grid grid-cols-4 gap-2 py-2 border-b border-border last:border-0 items-center">
                          <span className="font-medium">{row.ex}</span>
                          <span className="text-center font-mono text-primary">{row.sets}x{row.reps}</span>
                          <span className="text-center font-mono text-muted-foreground">{row.kg}kg</span>
                          <span className="text-right"><Check className="h-4 w-4 text-green-500 inline-block"/></span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Auth Pages
export default Landing;

