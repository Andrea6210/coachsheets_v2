import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { 
  Plus, Users, FileText, Trash2, Copy, 
  MessageSquare, History, Dumbbell, User, Settings, Archive, BookOpen, Sparkles
} from "lucide-react";
import { useAuth, API } from "@/contexts/AuthContext";
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
      const currentToken = localStorage.getItem("token"); 
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
      <div className="min-h-screen bg-[#0c0e12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          <p className="text-xs text-zinc-400 font-mono">Caricamento Coach Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 pb-20 md:pb-8" data-testid="coach-dashboard">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Hero Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800/80 p-6 rounded-3xl shadow-2xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Pannello Coach
              </span>
              <span className="text-xs text-zinc-500 font-mono">OpenGym Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white mt-1">
              Dashboard Coach
            </h1>
            <p className="text-sm text-zinc-400">
              Gestisci i tuoi atleti, assegna le schede di allenamento e monitora i loro progressi.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Add Athlete Dialog */}
            <Dialog open={newAthleteOpen} onOpenChange={setNewAthleteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white gap-2 rounded-xl text-xs font-semibold" data-testid="add-athlete-btn">
                  <Users className="h-4 w-4 text-emerald-400" /> Nuovo Atleta
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Aggiungi Atleta</DialogTitle>
                </DialogHeader>
                <Tabs value={athleteMode} onValueChange={setAthleteMode} className="py-2">
                  <TabsList className="grid grid-cols-2 w-full bg-zinc-900 border border-zinc-800">
                    <TabsTrigger value="create" data-testid="athlete-mode-create" className="text-xs">Crea Nuovo</TabsTrigger>
                    <TabsTrigger value="link" data-testid="athlete-mode-link" className="text-xs">Collega Esistente</TabsTrigger>
                  </TabsList>
                  <TabsContent value="create">
                    <div className="space-y-3 py-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Nome Atleta</Label>
                        <Input
                          value={newAthlete.name}
                          onChange={(e) => setNewAthlete({ ...newAthlete, name: e.target.value })}
                          placeholder="es. Mario Rossi"
                          className="bg-zinc-900 border-zinc-800 text-white text-xs"
                          data-testid="new-athlete-name"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Email</Label>
                        <Input
                          type="email"
                          value={newAthlete.email}
                          onChange={(e) => setNewAthlete({ ...newAthlete, email: e.target.value })}
                          placeholder="email@esempio.com"
                          className="bg-zinc-900 border-zinc-800 text-white text-xs"
                          data-testid="new-athlete-email"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Password temporanea</Label>
                        <Input
                          type="password"
                          value={newAthlete.password}
                          onChange={(e) => setNewAthlete({ ...newAthlete, password: e.target.value })}
                          placeholder="Password"
                          className="bg-zinc-900 border-zinc-800 text-white text-xs"
                          data-testid="new-athlete-password"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={createAthlete} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl" data-testid="confirm-add-athlete">
                        Crea Atleta
                      </Button>
                    </DialogFooter>
                  </TabsContent>
                  <TabsContent value="link">
                    <div className="space-y-3 py-3">
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Inserisci l'email dell'atleta già registrato sulla piattaforma per collegarlo direttamente alla tua scuderia.
                      </p>
                      <div className="space-y-1">
                        <Label className="text-xs">Email dell'atleta</Label>
                        <Input
                          type="email"
                          value={linkEmail}
                          onChange={(e) => setLinkEmail(e.target.value)}
                          placeholder="email@esempio.com"
                          className="bg-zinc-900 border-zinc-800 text-white text-xs"
                          data-testid="link-athlete-email"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={linkAthlete} disabled={!linkEmail} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl" data-testid="confirm-link-athlete">
                        Collega Atleta
                      </Button>
                    </DialogFooter>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            {/* Create Sheet Dialog */}
            <Dialog open={newSheetOpen} onOpenChange={setNewSheetOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold gap-2 rounded-xl text-xs shadow-lg shadow-emerald-500/20" data-testid="add-sheet-btn">
                  <Plus className="h-4 w-4" /> Nuova Scheda
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-bold">Crea Scheda di Allenamento</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Titolo della Scheda</Label>
                    <Input
                      value={newSheet.title}
                      onChange={(e) => setNewSheet({ ...newSheet, title: e.target.value })}
                      placeholder="Es. Ipertrofia Push/Pull/Legs - Settimana 1"
                      className="bg-zinc-900 border-zinc-800 text-white text-xs"
                      data-testid="new-sheet-title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Seleziona Atleti</Label>
                    <div className="border border-zinc-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-zinc-800 bg-zinc-900/60" data-testid="new-sheet-athletes">
                      {athletes.length === 0 ? (
                        <p className="text-xs text-zinc-500 p-3">Nessun atleta in elenco. Aggiungine uno prima.</p>
                      ) : (
                        athletes.map((a) => (
                          <label key={a.id} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-zinc-800/60">
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
                            <span className="text-xs text-zinc-200">{a.name}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={createSheet} disabled={!newSheet.title || newSheet.athlete_ids.length === 0} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl" data-testid="confirm-add-sheet">
                    Crea Scheda
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Roster Athletes Section (1 Col) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Users className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold text-white">I Tuoi Atleti ({athletes.length})</h2>
              </div>
            </div>

            {athletes.length === 0 ? (
              <Card className="bg-zinc-900/60 border-zinc-800 text-center py-8 rounded-2xl">
                <CardContent className="space-y-2">
                  <Users className="h-8 w-8 mx-auto text-zinc-600" />
                  <p className="text-xs text-zinc-400">Nessun atleta in lista. Aggiungi il primo!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {athletes.map((athlete) => (
                  <div
                    key={athlete.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors"
                    data-testid={`athlete-${athlete.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        {athlete.name ? athlete.name[0].toUpperCase() : "A"}
                      </div>
                      <div>
                        <p className="font-bold text-xs text-white">{athlete.name}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">{athlete.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/chat/${athlete.id}`)}
                        className="h-8 w-8 text-emerald-400 hover:bg-emerald-500/10 rounded-lg"
                        title="Apri Chat"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAthlete(athlete.id)}
                        className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                        title="Elimina"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sheets List Section (2 Cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <FileText className="h-4 w-4" />
                </span>
                <h2 className="text-base font-bold text-white">
                  {showArchived ? "Schede Archiviate" : "Schede Attive"} ({sheets.length})
                </h2>
              </div>

              <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setShowArchived(false)}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                    !showArchived ? "bg-emerald-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                  data-testid="show-active-sheets"
                >
                  Attive
                </button>
                <button
                  onClick={() => setShowArchived(true)}
                  className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                    showArchived ? "bg-emerald-500 text-zinc-950 font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                  data-testid="show-archived-sheets"
                >
                  Archiviate
                </button>
              </div>
            </div>

            {sheets.length === 0 ? (
              <Card className="bg-zinc-900/60 border-zinc-800 text-center py-12 rounded-2xl">
                <CardContent className="space-y-3">
                  <FileText className="h-10 w-10 mx-auto text-zinc-600" />
                  <p className="text-xs text-zinc-400">
                    {showArchived ? "Nessuna scheda archiviata." : "Nessuna scheda creata. Clicca 'Nuova Scheda' per iniziare!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {sheets.map((sheet) => {
                  const sheetAthletes = athletes.filter(a => (sheet.athlete_ids || []).includes(a.id));
                  return (
                    <div
                      key={sheet.id}
                      onClick={() => navigate(`/sheet/${sheet.id}`)}
                      className="bg-zinc-900/80 border border-zinc-800 hover:border-emerald-500/50 p-5 rounded-2xl cursor-pointer transition-all hover:bg-zinc-900 flex flex-col justify-between group shadow-lg"
                      data-testid={`sheet-${sheet.id}`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
                            {sheet.title}
                          </h3>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-zinc-400 hover:text-white">
                                <Settings className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-zinc-200">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/sheet/${sheet.id}/history`); }} className="gap-2">
                                <History className="h-4 w-4 text-emerald-400" /> Cronologia
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDuplicateDialog(sheet.id, sheet.athlete_ids); }} className="gap-2">
                                <Copy className="h-4 w-4 text-indigo-400" /> Duplica
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); archiveSheet(sheet.id, !showArchived); }} className="gap-2">
                                <Archive className="h-4 w-4 text-amber-400" /> {showArchived ? "Ripristina" : "Archivia"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-zinc-800" />
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deleteSheet(sheet.id); }} className="gap-2 text-rose-400">
                                <Trash2 className="h-4 w-4" /> Elimina
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <p className="text-xs text-zinc-400">
                          Assegnata a: <span className="text-zinc-200 font-semibold">{sheetAthletes.length > 0 ? sheetAthletes.map(a => a.name).join(", ") : "Nessuno"}</span>
                        </p>
                      </div>

                      <div className="pt-3 mt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                        <span>{sheet.weeks?.length || 1} Settimane</span>
                        <span>{sheet.updated_at ? new Date(sheet.updated_at).toLocaleDateString('it-IT') : 'Recente'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Duplicate Dialog */}
      <Dialog open={duplicateOpen} onOpenChange={setDuplicateOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Duplica scheda per altri atleti</DialogTitle>
          </DialogHeader>
          <div className="border border-zinc-800 rounded-xl max-h-64 overflow-y-auto divide-y divide-zinc-800 bg-zinc-900/60 p-1" data-testid="duplicate-athletes-list">
            {athletes.length === 0 ? (
              <p className="text-xs text-zinc-500 p-3">Nessun atleta disponibile.</p>
            ) : (
              athletes.map((a) => (
                <label key={a.id} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-zinc-800/60">
                  <Checkbox
                    checked={duplicateAthleteIds.includes(a.id)}
                    onCheckedChange={(checked) => {
                      setDuplicateAthleteIds(prev => checked ? [...prev, a.id] : prev.filter(id => id !== a.id));
                    }}
                    data-testid={`duplicate-athlete-${a.id}`}
                  />
                  <span className="text-xs text-zinc-200">{a.name}</span>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={confirmDuplicate} disabled={duplicateAthleteIds.length === 0} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl" data-testid="confirm-duplicate">
              Duplica Scheda
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachDashboard;
