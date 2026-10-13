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
  Dumbbell, User, Settings, Home, ArrowLeft, Check, Edit2, Link as LinkIcon, Video, Archive, TrendingUp,
  Scale, Ruler, Target
} from "lucide-react";
import { useAuth, API, WS_URL } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/layout/Navbar";
const ProgressPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("andamento");

  // Record personali (massimali, tempi, corpo libero, ecc.)
  const [records, setRecords] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [newRecord, setNewRecord] = useState({
    exercise: "", category: "Forza", weight: "", reps: "", customValue: "",
    date: new Date().toISOString().split("T")[0], notes: ""
  });

  const currentAthleteId = user?.role === "athlete" ? user?.id : selectedAthleteId;
  const isStrengthCategory = newRecord.category === "Forza" || newRecord.category === "Peso Corporeo";

  // Hub Unificato: Peso e Misure Corporee
  const [weightLogs, setWeightLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(`coachsheets_weight_logs_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bodyMetrics, setBodyMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem(`coachsheets_body_metrics_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : {
        targetWeight: "72.0",
        height: "178",
        bodyFat: "15.0",
        waist: "82",
        chest: "102",
        arm: "38",
        thigh: "58"
      };
    } catch {
      return { targetWeight: "", height: "", bodyFat: "", waist: "", chest: "", arm: "", thigh: "" };
    }
  });

  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split("T")[0]);
  const [newWeightNotes, setNewWeightNotes] = useState("");
  const [metricsForm, setMetricsForm] = useState(bodyMetrics);
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(newWeight)) {
      toast.error("Inserisci un peso valido (es. 74.5)");
      return;
    }
    const formattedDate = new Date(newWeightDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    const newEntry = {
      id: Date.now(),
      date: formattedDate,
      fullDate: newWeightDate,
      weight: parseFloat(newWeight),
      notes: newWeightNotes.trim()
    };
    const updated = [newEntry, ...weightLogs.filter(w => w.fullDate !== newWeightDate)];
    setWeightLogs(updated);
    try {
      localStorage.setItem(`coachsheets_weight_logs_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch {}
    setNewWeight("");
    setNewWeightNotes("");
    toast.success("Rilevamento peso salvato con successo!");
  };

  const handleDeleteWeight = (id) => {
    const updated = weightLogs.filter(w => w.id !== id);
    setWeightLogs(updated);
    try {
      localStorage.setItem(`coachsheets_weight_logs_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch {}
    toast.success("Rilevamento rimosso");
  };

  const handleSaveMetrics = (e) => {
    e.preventDefault();
    setBodyMetrics(metricsForm);
    try {
      localStorage.setItem(`coachsheets_body_metrics_${user?.id || 'guest'}`, JSON.stringify(metricsForm));
    } catch {}
    setIsEditingMetrics(false);
    toast.success("Misure antropometriche aggiornate!");
  };

  useEffect(() => {
    const init = async () => {
      if (user?.role === "coach") {
        try {
          const res = await axios.get(`${API}/athletes`);
          setAthletes(res.data);
          if (res.data.length > 0) {
            setSelectedAthleteId(res.data[0].id);
          } else {
            setLoading(false);
          }
        } catch (e) {
          setLoading(false);
        }
      } else {
        fetchEntries(null);
      }
    };
    init();
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "coach" && selectedAthleteId) {
      fetchEntries(selectedAthleteId);
    }
  }, [selectedAthleteId]);

  useEffect(() => {
    if (currentAthleteId) {
      fetchRecords(currentAthleteId);
    }
  }, [currentAthleteId]);

  const fetchRecords = async (athleteId) => {
    setRecordsLoading(true);
    try {
      const res = await axios.get(`${API}/athletes/${athleteId}/stats`);
      setRecords(res.data.personal_records || res.data.personalRecords || []);
      setAchievements(res.data.achievements || []);
    } catch (e) {
      // silenzioso: la sezione andamento resta comunque utilizzabile
    } finally {
      setRecordsLoading(false);
    }
  };


  const addRecord = async () => {
    if (!newRecord.exercise.trim()) {
      toast.error("Dai un nome al record (es. \"Panca Piana\" o \"5km Corsa\")");
      return;
    }
    if (!currentAthleteId) {
      toast.error("Seleziona un atleta");
      return;
    }
    try {
      const payload = {
        exercise: newRecord.exercise.trim(),
        category: newRecord.category,
        date: newRecord.date,
        notes: newRecord.notes
      };
      if (isStrengthCategory && newRecord.weight) {
        payload.weight = parseFloat(newRecord.weight.replace(",", "."));
        if (newRecord.reps) payload.reps = parseInt(newRecord.reps, 10);
      } else {
        payload.customValue = newRecord.customValue;
      }
      await axios.post(`${API}/athletes/${currentAthleteId}/stats/records`, payload);
      setNewRecord({ exercise: "", category: "Forza", weight: "", reps: "", customValue: "", date: new Date().toISOString().split("T")[0], notes: "" });
      fetchRecords(currentAthleteId);
      toast.success("Record registrato!");
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore nella registrazione");
    }
  };

  const deleteRecord = async (prId) => {
    if (!window.confirm("Eliminare questo record?")) return;
    try {
      await axios.delete(`${API}/athletes/${currentAthleteId}/stats/records/${prId}`);
      setRecords(prev => prev.filter(r => r.id !== prId));
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore nell'eliminazione");
    }
  };

  const fetchEntries = async (athleteId) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/progress`, { params: athleteId ? { athlete_id: athleteId } : {} });
      setEntries(res.data);
    } catch (e) {
      toast.error("Errore nel caricamento dei progressi");
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (entry) => {
    if (!window.confirm("Eliminare questa registrazione?")) return;
    const sheetId = entry.sheet_id || entry.sheetId;
    try {
      await axios.delete(`${API}/sheets/${sheetId}/progress/${entry.id}`);
      setEntries(prev => prev.filter(e => e.id !== entry.id));
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore nell'eliminazione");
    }
  };

  const parseWeightValue = (weight) => {
    if (!weight) return null;
    const match = String(weight).match(/[\d.,]+/);
    if (!match) return null;
    return parseFloat(match[0].replace(",", "."));
  };

  // Raggruppa le voci per nome esercizio
  const grouped = entries.reduce((acc, e) => {
    const exName = e.exercise_name || e.exerciseName || "Esercizio";
    if (!acc[exName]) acc[exName] = [];
    acc[exName].push(e);
    return acc;
  }, {});


  const exerciseNames = Object.keys(grouped)
    .filter(name => name.toLowerCase().includes(search.toLowerCase()))
    .sort();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} data-testid="progress-back-btn">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="font-heading font-bold text-2xl flex items-center gap-2">
              <TrendingUp className="h-6 w-6" /> Progressi
            </h1>
            <p className="text-sm text-muted-foreground">Andamento pesi e reps nel tempo, aggregato su tutte le schede</p>
          </div>
        </div>

        {user?.role === "coach" && (
          <div className="mb-4 space-y-1">
            <Label className="text-xs text-muted-foreground">Atleta</Label>
            {athletes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nessun atleta disponibile.</p>
            ) : (
              <select
                className="w-full sm:w-64 px-3 py-2 border border-input rounded-md bg-background text-sm"
                value={selectedAthleteId || ""}
                onChange={(e) => setSelectedAthleteId(e.target.value)}
                data-testid="progress-page-athlete-select"
              >
                {athletes.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {!loading && exerciseNames.length > 0 && (
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca esercizio..."
            className="mb-4"
            data-testid="progress-search-input"
          />
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="andamento" data-testid="tab-andamento">Carichi Esercizi</TabsTrigger>
            <TabsTrigger value="record" data-testid="tab-record">
              Record PR{records.length > 0 && ` (${records.length})`}
            </TabsTrigger>
            <TabsTrigger value="misure" data-testid="tab-misure">
              Fisico & Misure
            </TabsTrigger>
          </TabsList>

          <TabsContent value="andamento">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : exerciseNames.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              Nessun progresso registrato ancora.<br />
              Vai su una scheda, apri un esercizio e clicca l'icona 📈 per iniziare a tracciare.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {exerciseNames.map((name) => {
              const list = grouped[name].sort((a, b) => new Date(a.date) - new Date(b.date));
              const chartData = list
                .map(e => ({ date: e.date, peso: parseWeightValue(e.weight) }))
                .filter(e => e.peso !== null);
              const latest = list[list.length - 1];
              const isOpen = expandedExercise === name;
              // Massimale automatico: il valore piu' alto tra tutte le registrazioni di questo esercizio
              const best = chartData.reduce((max, e) => (max === null || e.peso > max.peso ? e : max), null);

              return (
                <Card key={name} className="overflow-hidden" data-testid={`progress-exercise-${name}`}>
                  <button
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left"
                    onClick={() => setExpandedExercise(isOpen ? null : name)}
                  >
                    <div>
                      <p className="font-semibold">{name}</p>
                      <p className="text-xs text-muted-foreground">
                        {list.length} {list.length === 1 ? "registrazione" : "registrazioni"} · ultimo: {latest.weight || "—"} {latest.reps && `× ${latest.reps}`} ({latest.date})
                      </p>
                      {best && (
                        <p className="text-xs text-amber-500 font-medium mt-0.5">
                          🏆 Record: {best.peso}kg ({best.date})
                        </p>
                      )}
                    </div>
                    {isOpen ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="border-t border-border p-4 space-y-4">
                      {chartData.length >= 2 && (
                        <div className="h-48 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                              <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                              <Tooltip />
                              <Line type="monotone" dataKey="peso" stroke="currentColor" className="text-primary" strokeWidth={2} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                      <div className="border border-input rounded-md divide-y">
                        {[...list].reverse().map((entry) => (
                          <div key={entry.id} className="flex items-center justify-between gap-2 p-2 px-3 text-sm">
                            <div>
                              <span className="font-mono">{entry.date}</span>
                              {" · "}
                              <span className="font-medium">{entry.weight || "—"}</span>
                              {entry.reps && <span className="text-muted-foreground"> × {entry.reps}</span>}
                              {entry.week_label && <span className="text-xs text-muted-foreground ml-1">({entry.week_label})</span>}
                              <div className="text-xs text-muted-foreground">
                                {entry.logged_by_name} {entry.logged_by_role === "coach" ? "(coach)" : "(atleta)"}
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEntry(entry)}
                              className="h-7 w-7 p-0 text-destructive shrink-0"
                              data-testid={`delete-progress-page-${entry.id}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
          </TabsContent>

          <TabsContent value="record">
            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4" data-testid="achievements-strip">
                {achievements.map((a) => (
                  <div key={a.id} className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-full px-3 py-1 text-xs font-medium" title={a.description}>
                    ðŸ… {a.title}
                  </div>
                ))}
              </div>
            )}

            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Nuovo record</CardTitle>
                <CardDescription>Massimali, tempi, ripetizioni a corpo libero â€” qualsiasi tipo di record personale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Nome record</Label>
                    <Input
                      value={newRecord.exercise}
                      onChange={(e) => setNewRecord({ ...newRecord, exercise: e.target.value })}
                      placeholder="Es: Panca Piana, 5km Corsa, Plank..."
                      data-testid="new-record-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Categoria</Label>
                    <select
                      className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm h-9"
                      value={newRecord.category}
                      onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
                      data-testid="new-record-category"
                    >
                      <option value="Forza">Forza (massimale)</option>
                      <option value="Peso Corporeo">Peso Corporeo</option>
                      <option value="Resistenza">Resistenza</option>
                      <option value="Corpo Libero">Corpo Libero</option>
                      <option value="Altro">Altro</option>
                    </select>
                  </div>
                </div>

                {isStrengthCategory ? (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Peso (kg)</Label>
                      <Input
                        value={newRecord.weight}
                        onChange={(e) => setNewRecord({ ...newRecord, weight: e.target.value })}
                        placeholder="120"
                        data-testid="new-record-weight"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Ripetizioni</Label>
                      <Input
                        value={newRecord.reps}
                        onChange={(e) => setNewRecord({ ...newRecord, reps: e.target.value })}
                        placeholder="1 (per il vero massimale)"
                        data-testid="new-record-reps"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Valore</Label>
                    <Input
                      value={newRecord.customValue}
                      onChange={(e) => setNewRecord({ ...newRecord, customValue: e.target.value })}
                      placeholder="Es: 22:30, 45 reps, 3 min..."
                      data-testid="new-record-value"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Data</Label>
                    <Input
                      type="date"
                      value={newRecord.date}
                      onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
                      data-testid="new-record-date"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Note (opzionale)</Label>
                    <Input
                      value={newRecord.notes}
                      onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                      placeholder="Come ti sei sentito, condizioni..."
                      data-testid="new-record-notes"
                    />
                  </div>
                </div>

                <Button onClick={addRecord} className="w-full gap-2" data-testid="confirm-add-record">
                  <Plus className="h-4 w-4" /> Registra Record
                </Button>
              </CardContent>
            </Card>

            {recordsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">Nessun record registrato ancora.</p>
            ) : (
              <div className="space-y-2">
                {[...records].sort((a, b) => new Date(b.date) - new Date(a.date)).map((r) => (
                  <Card key={r.id} data-testid={`record-${r.id}`}>
                    <CardContent className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium">{r.exercise}</p>
                          {r.category && (
                            <Badge variant="outline" className="text-xs">{r.category}</Badge>
                          )}
                        </div>
                        <p className="text-sm">
                          {r.weight ? (
                            <>
                              <span className="font-mono">{r.weight}kg</span>
                              {r.reps && <span className="text-muted-foreground"> × {r.reps}</span>}
                              {(r.estimated_one_rep_max || r.estimatedOneRepMax) && r.reps > 1 && (
                                <span className="text-xs text-muted-foreground ml-1">
                                  (1RM stimato: {(r.estimated_one_rep_max || r.estimatedOneRepMax).toFixed(1)}kg)
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="font-mono">{r.custom_value || r.customValue}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.date} · {r.logged_by_name || r.loggedByName || "Utente"} {(r.logged_by_role || r.loggedByRole) === "coach" ? "(coach)" : "(atleta)"}
                          {r.notes && ` · ${r.notes}`}
                        </p>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteRecord(r.id)}
                        className="h-8 w-8 p-0 text-destructive shrink-0"
                        data-testid={`delete-record-${r.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 3: FISICO E MISURE CORPOREE */}
          <TabsContent value="misure" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Grafico Andamento Peso (2 Colonne) */}
              <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <Scale className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">Andamento Peso Corporeo</h3>
                      <p className="text-xs text-zinc-400">Storico delle pesate e progressione</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-400">Attuale:</span>
                    <span className="text-sm font-mono font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
                      {weightLogs.length > 0 ? `${weightLogs[0].weight} kg` : "--"}
                    </span>
                    {bodyMetrics.targetWeight && (
                      <span className="text-xs font-mono text-zinc-500">
                        (Target: {bodyMetrics.targetWeight} kg)
                      </span>
                    )}
                  </div>
                </div>

                {weightLogs.length === 0 ? (
                  <div className="h-56 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl text-center p-6 space-y-2">
                    <Scale className="h-8 w-8 text-zinc-600" />
                    <p className="text-xs text-zinc-400">Nessuna pesata registrata ancora.</p>
                    <p className="text-[11px] text-zinc-500">Usa il modulo a fianco per inserire la tua prima pesata.</p>
                  </div>
                ) : (
                  <div className="h-60 w-full pt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart 
                        data={[...weightLogs]
                          .sort((a, b) => new Date(a.fullDate || a.id) - new Date(b.fullDate || b.id))
                          .map(w => ({ date: w.date, peso: w.weight }))
                        }
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                        <YAxis stroke="#71717a" fontSize={11} domain={['dataMin - 1', 'dataMax + 1']} tickLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "1rem", color: "#fff" }}
                          formatter={(value) => [`${value} kg`, "Peso"]}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="peso" 
                          stroke="#10b981" 
                          strokeWidth={2.5} 
                          dot={{ r: 4, fill: "#10b981", stroke: "#0c0e12", strokeWidth: 2 }} 
                          activeDot={{ r: 6 }} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Form Registra Nuovo Peso (1 Colonna) */}
              <div className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Plus className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-white">Nuova Pesata</h3>
                    <p className="text-xs text-zinc-400">Inserisci valore odierno</p>
                  </div>
                </div>

                <form onSubmit={handleAddWeight} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Peso (kg)</label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="es. 74.5"
                      value={newWeight}
                      onChange={(e) => setNewWeight(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white rounded-xl text-sm font-bold focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Data</label>
                    <Input
                      type="date"
                      value={newWeightDate}
                      onChange={(e) => setNewWeightDate(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Note (opzionale)</label>
                    <Input
                      placeholder="es. Mattina a digiuno"
                      value={newWeightNotes}
                      onChange={(e) => setNewWeightNotes(e.target.value)}
                      className="bg-zinc-950 border-zinc-800 text-white rounded-xl text-xs"
                    />
                  </div>

                  <Button type="submit" className="w-full premium-button-primary rounded-xl text-xs font-black py-2.5 shadow-lg shadow-emerald-500/20">
                    <Plus className="h-4 w-4 mr-1" /> Salva Peso
                  </Button>
                </form>
              </div>

            </div>

            {/* Misure Corporee & Dati Antropometrici */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Scheda Misure Antropometriche */}
              <div className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Ruler className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">Misure Antropometriche</h3>
                      <p className="text-xs text-zinc-400">Circonferenze e composizione</p>
                    </div>
                  </div>

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setIsEditingMetrics(!isEditingMetrics)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
                  >
                    {isEditingMetrics ? "Annulla" : "Modifica Misure"}
                  </Button>
                </div>

                {isEditingMetrics ? (
                  <form onSubmit={handleSaveMetrics} className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400">Target Peso (kg)</label>
                        <Input
                          value={metricsForm.targetWeight}
                          onChange={(e) => setMetricsForm({ ...metricsForm, targetWeight: e.target.value })}
                          className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400">Massa Grassa (%)</label>
                        <Input
                          value={metricsForm.bodyFat}
                          onChange={(e) => setMetricsForm({ ...metricsForm, bodyFat: e.target.value })}
                          className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400">Vita (cm)</label>
                        <Input
                          value={metricsForm.waist}
                          onChange={(e) => setMetricsForm({ ...metricsForm, waist: e.target.value })}
                          className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400">Petto (cm)</label>
                        <Input
                          value={metricsForm.chest}
                          onChange={(e) => setMetricsForm({ ...metricsForm, chest: e.target.value })}
                          className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400">Braccio (cm)</label>
                        <Input
                          value={metricsForm.arm}
                          onChange={(e) => setMetricsForm({ ...metricsForm, arm: e.target.value })}
                          className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400">Coscia (cm)</label>
                        <Input
                          value={metricsForm.thigh}
                          onChange={(e) => setMetricsForm({ ...metricsForm, thigh: e.target.value })}
                          className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                        />
                      </div>
                    </div>

                    <Button type="submit" className="w-full premium-button-primary rounded-xl text-xs font-black py-2 mt-2">
                      Salva Misure Corporee
                    </Button>
                  </form>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-2xl text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Vita</span>
                      <p className="text-base font-black font-mono text-white mt-0.5">{bodyMetrics.waist ? `${bodyMetrics.waist} cm` : "--"}</p>
                    </div>
                    <div className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-2xl text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Petto</span>
                      <p className="text-base font-black font-mono text-white mt-0.5">{bodyMetrics.chest ? `${bodyMetrics.chest} cm` : "--"}</p>
                    </div>
                    <div className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-2xl text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Braccio</span>
                      <p className="text-base font-black font-mono text-white mt-0.5">{bodyMetrics.arm ? `${bodyMetrics.arm} cm` : "--"}</p>
                    </div>
                    <div className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-2xl text-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Coscia</span>
                      <p className="text-base font-black font-mono text-white mt-0.5">{bodyMetrics.thigh ? `${bodyMetrics.thigh} cm` : "--"}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Storico Recenti Pesate */}
              <div className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <History className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-white">Storico Rilevamenti</h3>
                      <p className="text-xs text-zinc-400">Ultime pesate salvate</p>
                    </div>
                  </div>
                </div>

                {weightLogs.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">Nessun rilevamento recente.</p>
                ) : (
                  <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                    {weightLogs.slice(0, 8).map((w) => (
                      <div key={w.id} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/60 text-xs">
                        <div>
                          <span className="font-bold text-white font-mono">{w.weight} kg</span>
                          <span className="text-zinc-500 ml-2 font-mono text-[11px]">{w.date}</span>
                          {w.notes && <p className="text-[10px] text-zinc-400 italic mt-0.5">{w.notes}</p>}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteWeight(w.id)}
                          className="h-6 w-6 text-zinc-600 hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// Main App
export default ProgressPage;

