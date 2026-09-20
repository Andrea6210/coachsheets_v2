import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  Dumbbell, 
  LogOut, 
  TrendingUp, 
  MessageSquare, 
  Home, 
  BookOpen, 
  Settings2,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Calculator } from "@/features/calculator/Calculator";
import { WorkoutToolbox } from "@/features/athlete/WorkoutToolbox";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isAthlete = user.role === "athlete";
  const homePath = isAthlete ? "/athlete" : "/coach";

  const navItems = isAthlete ? [
    { label: "Home", icon: Home, path: "/athlete" },
    { label: "Esercizi", icon: BookOpen, path: "/esercizi" },
    { label: "Progressi", icon: TrendingUp, path: "/progressi" },
    { label: "Chat", icon: MessageSquare, path: `/chat/${user.coachId || user.coach_id || 'coach'}` },
  ] : [
    { label: "Dashboard", icon: Home, path: "/coach" },
    { label: "Esercizi", icon: BookOpen, path: "/esercizi" },
    { label: "Progressi", icon: TrendingUp, path: "/progressi" },
    { label: "Chat", icon: MessageSquare, path: "/chat/athlete" },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#0c0e12]/90 backdrop-blur-xl" data-testid="navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo and Brand with Vibrant Neon Accent */}
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate(homePath)}
                className="flex items-center gap-2.5 group text-left"
                data-testid="logo-btn"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform">
                  <Dumbbell className="h-5 w-5 text-zinc-950 stroke-[2.5]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-black text-lg tracking-tight text-white flex items-center gap-1">
                    Coach<span className="text-emerald-400 glow-text">Sheets</span>
                  </span>
                </div>
              </button>

              {/* Desktop Main Navigation Links */}
              <nav className="hidden md:flex items-center gap-1.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Button
                      key={item.path}
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(item.path)}
                      className={`gap-2 font-medium transition-all ${
                        isActive 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 glow-emerald font-bold" 
                          : "text-zinc-400 hover:text-white hover:bg-zinc-800/40"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : ""}`} />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Icons & User Profile */}
            <div className="flex items-center gap-3">
              {isAthlete && (
                <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800/90 p-1.5 rounded-2xl shadow-md">
                  {/* Calculator Tool */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-sky-400 hover:bg-sky-500/10 rounded-xl" title="Calcolatore 1RM">
                        <Dumbbell className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden">
                      <Calculator />
                    </DialogContent>
                  </Dialog>

                  {/* Rest & AMRAP Toolbox */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 rounded-xl" title="Timer & Strumenti">
                        <Settings2 className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
                      <WorkoutToolbox />
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 rounded-2xl px-3 py-1.5" data-testid="user-menu">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-emerald-500 to-sky-400 text-zinc-950 flex items-center justify-center font-black text-xs">
                      {user.name ? user.name[0].toUpperCase() : "U"}
                    </div>
                    <span className="max-w-[100px] truncate font-bold text-xs hidden sm:inline">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200 rounded-2xl shadow-2xl">
                  <div className="px-3 py-2 border-b border-zinc-800/80">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    <p className="text-xs text-zinc-400 truncate">{user.email}</p>
                    <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {user.role === "coach" ? "Coach" : "Atleta"}
                    </div>
                  </div>

                  <DropdownMenuItem onClick={() => navigate(homePath)} className="gap-2 cursor-pointer focus:bg-zinc-900 text-zinc-300 font-medium">
                    <Home className="h-4 w-4 text-emerald-400" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/esercizi")} className="gap-2 cursor-pointer focus:bg-zinc-900 text-zinc-300 font-medium">
                    <BookOpen className="h-4 w-4 text-sky-400" />
                    Libreria Esercizi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/progressi")} className="gap-2 cursor-pointer focus:bg-zinc-900 text-zinc-300 font-medium">
                    <TrendingUp className="h-4 w-4 text-amber-400" />
                    Analisi & Progressi
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-zinc-800/80" />

                  <DropdownMenuItem onClick={logout} className="gap-2 cursor-pointer focus:bg-rose-500/10 text-rose-400 font-medium" data-testid="logout-btn">
                    <LogOut className="h-4 w-4" />
                    Disconnetti
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
        </div>
      </header>

      {/* Bottom Navigation Bar for Mobile with Vibrant Neon Highlights */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0e12]/95 border-t border-zinc-800/80 backdrop-blur-xl px-2 py-2">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all ${
                  isActive 
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 font-extrabold shadow-md shadow-emerald-500/10" 
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Icon className={`h-5 w-5 mb-0.5 ${isActive ? "text-emerald-400" : ""}`} />
                <span className="text-[11px] tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
