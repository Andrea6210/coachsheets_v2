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
const AthleteDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const res = await axios.get(`${API}/sheets`);
      setSheets(res.data);
    } catch (e) {
      toast.error("Errore nel caricamento");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen premium-bg" data-testid="athlete-dashboard">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold tracking-tight glow-text text-foreground">Le Mie Schede</h1>
          <p className="text-muted-foreground font-medium mt-1">Ciao, {user?.name}</p>
        </div>

        {user?.coach_id && (
          <Button 
            variant="outline" 
            className="mb-6 gap-2"
            onClick={() => navigate(`/chat/${user.coach_id}`)}
            data-testid="chat-coach-btn"
          >
            <MessageSquare className="h-4 w-4" /> Chatta con il Coach
          </Button>
        )}

        {sheets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Il tuo coach non ha ancora creato schede per te.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {sheets.map((sheet) => (
              <Card 
                key={sheet.id} 
                className="cursor-pointer glass-card border-border hover:border-primary/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all duration-300"
                onClick={() => navigate(`/sheet/${sheet.id}`)}
                data-testid={`athlete-sheet-${sheet.id}`}
              >
                <CardContent className="p-6">
                  <h3 className="font-heading font-semibold text-xl mb-2 text-foreground">{sheet.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {sheet.weeks?.length || 0} settimane · {sheet.weeks?.reduce((sum, w) => sum + (w.days?.length || 0), 0) || 0} giorni totali
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 font-medium">
                    Ultimo aggiornamento: {new Date(sheet.updated_at).toLocaleDateString('it-IT')}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Sheet Editor
export default AthleteDashboard;

