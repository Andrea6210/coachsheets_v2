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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sun, Moon, LogOut, Plus, Users, FileText, Trash2, Copy, 
  MessageSquare, History, ChevronRight, ChevronDown, Menu, X, Send, 
  Dumbbell, User, Settings, Home, ArrowLeft, Check, Edit2, Link as LinkIcon, Video, Archive, TrendingUp,
  KeyRound, Search, Sparkles
} from "lucide-react";
import { useAuth, API, WS_URL } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/layout/Navbar";
import { generateUUID } from "@/lib/uuid";

const STARTER_TEMPLATES = {
  custom: {
    label: "Scheda Vuota",
    description: "Inizia da zero con una scheda vuota",
    title: "",
    getWeeks: () => null
  },
  ppl: {
    label: "Push / Pull / Legs (3 Giorni)",
    description: "Petto-Spalle-Tricipiti, Dorso-Bicipiti, Gambe-Core",
    title: "Split Push / Pull / Legs",
    getWeeks: () => [
      {
        id: generateUUID(),
        weekNumber: 1,
        label: "Settimana 1",
        days: [
          {
            id: generateUUID(),
            name: "Giorno 1 - Push",
            exercises: [
              { id: generateUUID(), exercise: "Panca Piana con Bilanciere", sets: "4", reps: "6-8", weight: "75kg", rest: "120s", notes: "Top Set + Back-off" },
              { id: generateUUID(), exercise: "Spinte con Manubri Panca Inclinata", sets: "3", reps: "8-10", weight: "24kg", rest: "90s", notes: "" },
              { id: generateUUID(), exercise: "Military Press", sets: "3", reps: "8-10", weight: "40kg", rest: "90s", notes: "" },
              { id: generateUUID(), exercise: "Dip alle Parallele", sets: "3", reps: "10-12", weight: "BW", rest: "75s", notes: "" },
              { id: generateUUID(), exercise: "Pushdown ai Cavi per Tricipiti", sets: "3", reps: "12-15", weight: "25kg", rest: "60s", notes: "" }
            ]
          },
          {
            id: generateUUID(),
            name: "Giorno 2 - Pull",
            exercises: [
              { id: generateUUID(), exercise: "Stacco da Terra con Bilanciere", sets: "4", reps: "5", weight: "120kg", rest: "180s", notes: "" },
              { id: generateUUID(), exercise: "Trazioni alla Sbarra", sets: "4", reps: "6-8", weight: "BW", rest: "120s", notes: "" },
              { id: generateUUID(), exercise: "Rematore con Bilanciere", sets: "3", reps: "8-10", weight: "60kg", rest: "90s", notes: "" },
              { id: generateUUID(), exercise: "Pulley Basso", sets: "3", reps: "10-12", weight: "50kg", rest: "75s", notes: "" },
              { id: generateUUID(), exercise: "Curl con Bilanciere per Bicipiti", sets: "4", reps: "10-12", weight: "30kg", rest: "60s", notes: "" }
            ]
          },
          {
            id: generateUUID(),
            name: "Giorno 3 - Legs",
            exercises: [
              { id: generateUUID(), exercise: "Squat con Bilanciere", sets: "4", reps: "6-8", weight: "90kg", rest: "150s", notes: "" },
              { id: generateUUID(), exercise: "Pressa a 45 Gradi", sets: "3", reps: "10-12", weight: "160kg", rest: "90s", notes: "" },
              { id: generateUUID(), exercise: "Leg Curl", sets: "3", reps: "10-12", weight: "45kg", rest: "75s", notes: "" },
              { id: generateUUID(), exercise: "Calf Raise", sets: "4", reps: "15", weight: "60kg", rest: "60s", notes: "" },
              { id: generateUUID(), exercise: "Plank Addominale", sets: "3", reps: "60s", weight: "BW", rest: "60s", notes: "" }
            ]
          }
        ]
      }
    ]
  },
  upper_lower: {
    label: "Upper / Lower (4 Giorni)",
    description: "2 sessioni parte alta, 2 sessioni parte bassa",
    title: "Split Upper / Lower",
    getWeeks: () => [
      {
        id: generateUUID(),
        weekNumber: 1,
        label: "Settimana 1",
        days: [
          {
            id: generateUUID(),
            name: "Giorno 1 - Upper A",
            exercises: [
              { id: generateUUID(), exercise: "Panca Piana con Bilanciere", sets: "4", reps: "5", weight: "80kg", rest: "150s", notes: "" },
              { id: generateUUID(), exercise: "Rematore con Bilanciere", sets: "4", reps: "6", weight: "70kg", rest: "120s", notes: "" },
              { id: generateUUID(), exercise: "Military Press", sets: "3", reps: "8", weight: "45kg", rest: "90s", notes: "" },
              { id: generateUUID(), exercise: "Trazioni alla Sbarra", sets: "3", reps: "8", weight: "BW", rest: "90s", notes: "" }
            ]
          },
          {
            id: generateUUID(),
            name: "Giorno 2 - Lower A",
            exercises: [
              { id: generateUUID(), exercise: "Squat con Bilanciere", sets: "4", reps: "5", weight: "100kg", rest: "180s", notes: "" },
              { id: generateUUID(), exercise: "Stacco Rumeno", sets: "3", reps: "8", weight: "80kg", rest: "120s", notes: "" },
              { id: generateUUID(), exercise: "Leg Press", sets: "3", reps: "10", weight: "150kg", rest: "90s", notes: "" },
              { id: generateUUID(), exercise: "Calf Raise", sets: "4", reps: "12", weight: "70kg", rest: "60s", notes: "" }
            ]
          }
        ]
      }
    ]
  }
};

const CoachDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAthleteOpen, setNewAthleteOpen] = useState(false);
  const [newSheetOpen, setNewSheetOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("custom");
  const [newAthlete, setNewAthlete] = useState({ name: "", email: "", password: "" });
  const [linkEmail, setLinkEmail] = useState("");
  const [athleteMode, setAthleteMode] = useState("create");
  const [newSheet, setNewSheet] = useState({ title: "", athlete_ids: [] });
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateSheetId, setDuplicateSheetId] = useState(null);
  const [duplicateAthleteIds, setDuplicateAthleteIds] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

  // Rinomina scheda
  const [renameOpen, setRenameOpen] = useState(false);
  const [sheetToRename, setSheetToRename] = useState(null);
  const [renameTitle, setRenameTitle] = useState("");

  // Reimposta password atleta
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false);
  const [athleteToReset, setAthleteToReset] = useState(null);
  const [newPasswordForAthlete, setNewPasswordForAthlete] = useState("");

  // Barra di ricerca
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [showArchived]);

  const fetchData = async () => {
    try {
      const [athletesRes, sheetsRes] = await Promise.all([
        axios.get(`${API}/athletes`),
        axios.get(`${API}/sheets${showArchived ? "/archived" : ""}`)
      ]);
      setAthletes(athletesRes.data);
      setSheets(sheetsRes.data);
    } catch (e) {
      toast.error("Errore nel caricamento dati");
    } finally {
      setLoading(false);
    }
  };

  const archiveSheet = async (sheetId, archived) => {
    try {
      await axios.put(`${API}/sheets/${sheetId}`, { archived });
      toast.success(archived ? "Scheda archiviata" : "Scheda ripristinata");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore");
    }
  };

  const createAthlete = async () => {
    try {
      await axios.post(`${API}/athletes`, newAthlete);
      toast.success("Atleta creato!");
      setNewAthleteOpen(false);
      setNewAthlete({ name: "", email: "", password: "" });
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Errore");
    }
  };

  const linkAthlete = async () => {
    try {
      await axios.post(`${API}/athletes/link`, { email: linkEmail });
      toast.success("Atleta collegato!");
      setNewAthleteOpen(false);
      setLinkEmail("");
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore nel collegamento");
    }
  };

  const createSheet = async () => {
    try {
      const currentToken = localStorage.getItem("token"); 
      const templateWeeks = selectedTemplate !== "custom" 
        ? (typeof STARTER_TEMPLATES[selectedTemplate]?.getWeeks === "function" 
            ? STARTER_TEMPLATES[selectedTemplate].getWeeks() 
            : STARTER_TEMPLATES[selectedTemplate]?.weeks) 
        : null;
      
      const payload = {
        title: newSheet.title,
        athlete_ids: newSheet.athlete_ids,
        weeks: templateWeeks
      };
      
      const res = await axios.post(`${API}/sheets`, payload, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      toast.success(selectedTemplate !== "custom" ? "Scheda creata con template!" : "Scheda creata!");
      setNewSheetOpen(false);
      setNewSheet({ title: "", athlete_ids: [] });
      setSelectedTemplate("custom");
      navigate(`/sheet/${res.data.id}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore nella creazione della scheda");
    }
  };

  const deleteAthlete = async (id) => {
    if (!window.confirm("Eliminare questo atleta e tutte le sue schede?")) return;
    try {
      await axios.delete(`${API}/athletes/${id}`);
      toast.success("Atleta eliminato");
      fetchData();
    } catch (e) {
      toast.error("Errore");
    }
  };

  const deleteSheet = async (id) => {
    if (!window.confirm("Eliminare questa scheda?")) return;
    try {
      await axios.delete(`${API}/sheets/${id}`);
      toast.success("Scheda eliminata");
      fetchData();
    } catch (e) {
      toast.error("Errore");
    }
  };

  const openDuplicateDialog = (sheetId, currentAthleteIds) => {
    setDuplicateSheetId(sheetId);
    setDuplicateAthleteIds(currentAthleteIds || []);
    setDuplicateOpen(true);
  };

  const confirmDuplicate = async () => {
    if (duplicateAthleteIds.length === 0) {
      toast.error("Seleziona almeno un atleta");
      return;
    }
    try {
      const res = await axios.post(`${API}/sheets/${duplicateSheetId}/duplicate`, {
        athlete_ids: duplicateAthleteIds
      });
      toast.success("Scheda duplicata!");
      setDuplicateOpen(false);
      navigate(`/sheet/${res.data.id}`);
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore nella duplicazione");
    }
  };

  const openRenameDialog = (sheet) => {
    setSheetToRename(sheet);
    setRenameTitle(sheet.title || "");
    setRenameOpen(true);
  };

  const confirmRenameSheet = async () => {
    if (!sheetToRename || !renameTitle.trim()) {
      toast.error("Inserisci un titolo valido");
      return;
    }
    try {
      await axios.put(`${API}/sheets/${sheetToRename.id}`, { title: renameTitle.trim() });
      toast.success("Nome scheda aggiornato!");
      setRenameOpen(false);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Errore durante la modifica del nome");
    }
  };

  const openResetPassword = (athlete) => {
    setAthleteToReset(athlete);
    setNewPasswordForAthlete("");
    setResetPasswordOpen(true);
  };

  const confirmResetAthletePassword = async () => {
    if (!athleteToReset || newPasswordForAthlete.length < 4) {
      toast.error("La password deve contenere almeno 4 caratteri");
      return;
    }
    try {
      await axios.post(`${API}/athletes/${athleteToReset.id}/reset-password`, {
        new_password: newPasswordForAthlete
      });
      toast.success(`Password reimpostata per ${athleteToReset.name}!`);
      setResetPasswordOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || "Errore durante il reset della password");
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
    <div className="min-h-screen bg-background" data-testid="coach-dashboard">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Benvenuto, {user?.name}</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={newAthleteOpen} onOpenChange={setNewAthleteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="add-athlete-btn">
                  <Users className="h-4 w-4" /> Nuovo Atleta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Aggiungi Atleta</DialogTitle>
                </DialogHeader>
                <Tabs value={athleteMode} onValueChange={setAthleteMode} className="py-2">
                  <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="create" data-testid="athlete-mode-create">Crea Nuovo</TabsTrigger>
                    <TabsTrigger value="link" data-testid="athlete-mode-link">Collega Esistente</TabsTrigger>
                  </TabsList>
                  <TabsContent value="create">
                    <div className="space-y-4 py-2">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={newAthlete.name}
                          onChange={(e) => setNewAthlete({ ...newAthlete, name: e.target.value })}
                          placeholder="Nome atleta"
                          data-testid="new-athlete-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={newAthlete.email}
                          onChange={(e) => setNewAthlete({ ...newAthlete, email: e.target.value })}
                          placeholder="email@esempio.com"
                          data-testid="new-athlete-email"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          value={newAthlete.password}
                          onChange={(e) => setNewAthlete({ ...newAthlete, password: e.target.value })}
                          placeholder="Password"
                          data-testid="new-athlete-password"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={createAthlete} data-testid="confirm-add-athlete">Crea Atleta</Button>
                    </DialogFooter>
                  </TabsContent>
                  <TabsContent value="link">
                    <div className="space-y-4 py-2">
                      <p className="text-sm text-muted-foreground">
                        Usa questa opzione se l'atleta si Ã¨ giÃ  registrato da solo scegliendo il ruolo "Atleta" nella pagina di registrazione. Inserisci l'email che ha usato per collegarlo al tuo account.
                      </p>
                      <div className="space-y-2">
                        <Label>Email dell'atleta</Label>
                        <Input
                          type="email"
                          value={linkEmail}
                          onChange={(e) => setLinkEmail(e.target.value)}
                          placeholder="email@esempio.com"
                          data-testid="link-athlete-email"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={linkAthlete} disabled={!linkEmail} data-testid="confirm-link-athlete">Collega Atleta</Button>
                    </DialogFooter>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            <Dialog open={newSheetOpen} onOpenChange={setNewSheetOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2" data-testid="add-sheet-btn">
                  <Plus className="h-4 w-4" /> Nuova Scheda
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crea Scheda</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  {/* Scelta Template Starter */}
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Template di Partenza</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {Object.entries(STARTER_TEMPLATES).map(([key, tpl]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setSelectedTemplate(key);
                            if (tpl.title) {
                              setNewSheet(prev => ({ ...prev, title: tpl.title }));
                            }
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all ${
                            selectedTemplate === key
                              ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400 font-bold"
                              : "bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                          }`}
                        >
                          <p className="text-xs font-bold leading-tight">{tpl.label}</p>
                          <p className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5">{tpl.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Titolo Scheda</Label>
                    <Input
                      value={newSheet.title}
                      onChange={(e) => setNewSheet({ ...newSheet, title: e.target.value })}
                      placeholder="Es: Scheda Forza - Settimana 1"
                      data-testid="new-sheet-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Atleti</Label>
                    <div className="border border-input rounded-md max-h-48 overflow-y-auto divide-y" data-testid="new-sheet-athletes">
                      {athletes.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-3">Nessun atleta disponibile. Aggiungine uno prima.</p>
                      ) : (
                        athletes.map((a) => (
                          <label key={a.id} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50">
                            <Checkbox
                              checked={newSheet.athlete_ids.includes(a.id)}
                              onCheckedChange={(checked) => {
                                setNewSheet(prev => ({
                                  ...prev,
                                  athlete_ids: checked
                                    ? [...prev.athlete_ids, a.id]
                                    : prev.athlete_ids.filter(id => id !== a.id)
                                }));
                              }}
                              data-testid={`new-sheet-athlete-${a.id}`}
                            />
                            <span className="text-sm">{a.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Puoi selezionare piÃ¹ atleti per assegnare la stessa scheda a tutti.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createSheet} disabled={!newSheet.title || newSheet.athlete_ids.length === 0} data-testid="confirm-add-sheet">
                    Crea Scheda
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Barra di ricerca rapida Atleti e Schede */}
        <div className="relative mb-6">
          <Search className="h-4 w-4 absolute left-3.5 top-3 text-muted-foreground" />
          <Input
            placeholder="Cerca per nome atleta o titolo scheda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-background/60 border-zinc-800 rounded-xl text-sm"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1.5 h-7 px-2 text-xs text-muted-foreground hover:text-white"
            >
              Cancella
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Athletes Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" /> Atleti ({athletes.filter(a => !searchQuery.trim() || a.name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.email?.toLowerCase().includes(searchQuery.toLowerCase())).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {athletes.filter(a => !searchQuery.trim() || a.name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.email?.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery ? "Nessun atleta corrispondente alla ricerca." : "Nessun atleta. Aggiungi il primo!"}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {athletes.filter(a => !searchQuery.trim() || a.name?.toLowerCase().includes(searchQuery.toLowerCase()) || a.email?.toLowerCase().includes(searchQuery.toLowerCase())).map((athlete) => (
                      <div
                        key={athlete.id}
                        className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
                        data-testid={`athlete-${athlete.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                              {athlete.name ? athlete.name.slice(0, 2).toUpperCase() : "AT"}
                            </div>
                            <span 
                              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-zinc-950 ${
                                sheets.some(s => (s.athlete_ids || []).includes(athlete.id)) ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-zinc-500"
                              }`} 
                              title={sheets.some(s => (s.athlete_ids || []).includes(athlete.id)) ? "Atleta attivo" : "Nessuna scheda"}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium text-sm text-white">{athlete.name}</p>
                              {sheets.some(s => (s.athlete_ids || []).includes(athlete.id)) ? (
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Attivo
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                                  Da assegnare
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{athlete.email}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Menu className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/chat/${athlete.id}`)}>
                              <MessageSquare className="h-4 w-4 mr-2" /> Chat
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openResetPassword(athlete)}>
                              <KeyRound className="h-4 w-4 mr-2 text-emerald-400" /> Reimposta Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteAthlete(athlete.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> Elimina
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sheets Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" /> {showArchived ? "Schede Archiviate" : "Schede"} ({sheets.length})
                  </CardTitle>
                  <div className="flex gap-1 bg-muted/50 rounded-md p-0.5">
                    <Button
                      variant={!showArchived ? "default" : "ghost"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setShowArchived(false)}
                      data-testid="show-active-sheets"
                    >
                      Attive
                    </Button>
                    <Button
                      variant={showArchived ? "default" : "ghost"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setShowArchived(true)}
                      data-testid="show-archived-sheets"
                    >
                      Archiviate
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sheets.filter(s => {
                  if (!searchQuery.trim()) return true;
                  const query = searchQuery.toLowerCase();
                  const titleMatch = s.title?.toLowerCase().includes(query);
                  const athleteMatch = athletes.some(a => (s.athlete_ids || []).includes(a.id) && a.name?.toLowerCase().includes(query));
                  return titleMatch || athleteMatch;
                }).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchQuery ? "Nessuna scheda corrispondente alla ricerca." : (showArchived ? "Nessuna scheda archiviata." : "Nessuna scheda. Crea la prima!")}
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {sheets.filter(s => {
                      if (!searchQuery.trim()) return true;
                      const query = searchQuery.toLowerCase();
                      const titleMatch = s.title?.toLowerCase().includes(query);
                      const athleteMatch = athletes.some(a => (s.athlete_ids || []).includes(a.id) && a.name?.toLowerCase().includes(query));
                      return titleMatch || athleteMatch;
                    }).map((sheet) => {
                      const sheetAthletes = athletes.filter(a => (sheet.athlete_ids || []).includes(a.id));
                      return (
                        <Card 
                          key={sheet.id} 
                          className="cursor-pointer hover:border-primary/50 transition-colors"
                          onClick={() => navigate(`/sheet/${sheet.id}`)}
                          data-testid={`sheet-${sheet.id}`}
                        >
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <h3 className="font-semibold">{sheet.title}</h3>
                                <p className="text-xs text-muted-foreground">
                                  {sheetAthletes.length > 0 ? sheetAthletes.map(a => a.name).join(", ") : "Atleta"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {sheet.weeks?.length || 0} settimane
                                </p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="sm">
                                    <Menu className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openRenameDialog(sheet); }}>
                                    <Edit2 className="h-4 w-4 mr-2 text-primary" /> Rinomina
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/sheet/${sheet.id}/history`); }}>
                                    <History className="h-4 w-4 mr-2" /> Cronologia
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDuplicateDialog(sheet.id, sheet.athlete_ids); }}>
                                    <Copy className="h-4 w-4 mr-2" /> Duplica
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); archiveSheet(sheet.id, !showArchived); }}>
                                    <Archive className="h-4 w-4 mr-2" /> {showArchived ? "Ripristina" : "Archivia"}
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={(e) => { e.stopPropagation(); deleteSheet(sheet.id); }} 
                                    className="text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" /> Elimina
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Dialog duplicazione scheda: permette di scegliere per quali atleti */}
      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplica scheda per...</DialogTitle>
          </DialogHeader>
          <div className="border border-input rounded-md max-h-64 overflow-y-auto divide-y" data-testid="duplicate-athletes-list">
            {athletes.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">Nessun atleta disponibile.</p>
            ) : (
              athletes.map((a) => (
                <label key={a.id} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50">
                  <Checkbox
                    checked={duplicateAthleteIds.includes(a.id)}
                    onCheckedChange={(checked) => {
                      setDuplicateAthleteIds(prev => checked ? [...prev, a.id] : prev.filter(id => id !== a.id));
                    }}
                    data-testid={`duplicate-athlete-${a.id}`}
                  />
                  <span className="text-sm">{a.name}</span>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={confirmDuplicate} disabled={duplicateAthleteIds.length === 0} data-testid="confirm-duplicate">
              Duplica
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Rinomina Scheda */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rinomina Scheda di Allenamento</DialogTitle>
            <DialogDescription>
              Modifica il titolo della scheda. La modifica sarà visibile subito anche agli atleti assegnati.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="rename-sheet-input">Nuovo Nome Scheda</Label>
              <Input
                id="rename-sheet-input"
                value={renameTitle}
                onChange={(e) => setRenameTitle(e.target.value)}
                placeholder="Es. Ipertrofia Push-Pull-Legs Avanzato"
                onKeyDown={(e) => { if (e.key === 'Enter') confirmRenameSheet(); }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>Annulla</Button>
            <Button onClick={confirmRenameSheet} disabled={!renameTitle.trim()}>Salva Nome</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Reimposta Password Atleta (Gestione account smarrito) */}
      <Dialog open={resetPasswordOpen} onOpenChange={setResetPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-emerald-400" />
              Reimposta Password per {athleteToReset?.name}
            </DialogTitle>
            <DialogDescription>
              Imposta una nuova password per l'atleta ({athleteToReset?.email}). Potrà subito accedere con questa credenziale.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="athlete-new-password">Nuova Password</Label>
              <Input
                id="athlete-new-password"
                type="text"
                value={newPasswordForAthlete}
                onChange={(e) => setNewPasswordForAthlete(e.target.value)}
                placeholder="Es. Atleta2026!"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">Suggerimento: comunica all'atleta questa nuova password per riaccedere.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordOpen(false)}>Annulla</Button>
            <Button onClick={confirmResetAthletePassword} disabled={newPasswordForAthlete.length < 4}>
              Conferma e Aggiorna Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Athlete Dashboard
export default CoachDashboard;

