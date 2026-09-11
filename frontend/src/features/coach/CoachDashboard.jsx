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
const CoachDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [athletes, setAthletes] = useState([]);
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAthleteOpen, setNewAthleteOpen] = useState(false);
  const [newSheetOpen, setNewSheetOpen] = useState(false);
  const [newAthlete, setNewAthlete] = useState({ name: "", email: "", password: "" });
  const [linkEmail, setLinkEmail] = useState("");
  const [athleteMode, setAthleteMode] = useState("create");
  const [newSheet, setNewSheet] = useState({ title: "", athlete_ids: [] });
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [duplicateSheetId, setDuplicateSheetId] = useState(null);
  const [duplicateAthleteIds, setDuplicateAthleteIds] = useState([]);
  const [showArchived, setShowArchived] = useState(false);

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
      // Peschiamo il token fresco un secondo prima di spedire la richiesta
      const currentToken = localStorage.getItem("token"); 
      
      // Il backend Java si aspetta "athlete_ids" (array) - supporta piu' atleti sulla stessa scheda
      const payload = {
        title: newSheet.title,
        athlete_ids: newSheet.athlete_ids
      };
      
      const res = await axios.post(`${API}/sheets`, payload, {
        headers: {
          'Authorization': `Bearer ${currentToken}`
        }
      });
      
      toast.success("Scheda creata!");
      setNewSheetOpen(false);
      setNewSheet({ title: "", athlete_ids: [] });
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
                  <div className="space-y-2">
                    <Label>Titolo</Label>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Athletes Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5" /> Atleti ({athletes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {athletes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nessun atleta. Aggiungi il primo!
                  </p>
                ) : (
                  <div className="space-y-2">
                    {athletes.map((athlete) => (
                      <div
                        key={athlete.id}
                        className="flex items-center justify-between p-3 rounded-md border border-border hover:bg-muted/50 transition-colors"
                        data-testid={`athlete-${athlete.id}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{athlete.name}</p>
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
                {sheets.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {showArchived ? "Nessuna scheda archiviata." : "Nessuna scheda. Crea la prima!"}
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {sheets.map((sheet) => {
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
    </div>
  );
};

// Athlete Dashboard
export default CoachDashboard;

