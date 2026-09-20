import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Dumbbell, User, LogOut, Sun, Moon, TrendingUp, Menu, X, Settings2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Calculator } from "@/features/calculator/Calculator";
import { WorkoutToolbox } from "@/features/athlete/WorkoutToolbox";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dailyFeedback, setDailyFeedback] = useState("");

  if (!user) return null;

  return (
    <header className="glass-header sticky top-0 z-50" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button 
            onClick={() => navigate(user.role === "coach" ? "/coach" : "/athlete")}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            data-testid="logo-btn"
          >
            <Dumbbell className="h-6 w-6" />
            <span className="font-heading font-bold text-lg tracking-tight">CoachSheets</span>
          </button>

          <div className="hidden md:flex items-center gap-4">
            {user.role === "athlete" && (
              <div className="flex items-center gap-2 mr-2 border-r border-border pr-4">
                {/* Calculator */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-sky-400 hover:bg-sky-500/10" title="Calcolatrice">
                      <Dumbbell className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md glass-card border-white/10 p-0 overflow-hidden">
                    <Calculator />
                  </DialogContent>
                </Dialog>

                {/* Toolbox */}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-purple-400 hover:bg-purple-500/10" title="Strumenti (Timer/AMRAP/EMOM)">
                      <Settings2 className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
                    <WorkoutToolbox />
                  </DialogContent>
                </Dialog>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => navigate("/progressi")} className="gap-2" data-testid="nav-progress">
              <TrendingUp className="h-4 w-4" /> Progressi
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleTheme} data-testid="theme-toggle">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2" data-testid="user-menu">
                  <User className="h-4 w-4" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  {user.email}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive" data-testid="logout-btn">
                  <LogOut className="h-4 w-4 mr-2" />
                  Esci
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {user.role === "athlete" && (
              <>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-sky-400 hover:bg-sky-500/10 h-8 w-8">
                      <Dumbbell className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md glass-card border-white/10 p-0 overflow-hidden w-[95vw] max-w-[400px]">
                    <Calculator />
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-purple-400 hover:bg-purple-500/10 h-8 w-8">
                      <Settings2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none w-[95vw] max-w-[400px]">
                    <WorkoutToolbox />
                  </DialogContent>
                </Dialog>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="h-8 w-8 px-0">
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-2">
              <Button variant="ghost" className="justify-start" onClick={() => { navigate("/progressi"); setMobileMenuOpen(false); }} data-testid="nav-progress-mobile">
                <TrendingUp className="h-4 w-4 mr-2" /> Progressi
              </Button>
              <Button variant="ghost" className="justify-start" onClick={toggleTheme}>
                {theme === "dark" ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {theme === "dark" ? "Tema Chiaro" : "Tema Scuro"}
              </Button>
              <Button variant="ghost" className="justify-start text-destructive" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Esci
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
