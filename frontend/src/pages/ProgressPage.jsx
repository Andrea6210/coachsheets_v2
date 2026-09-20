import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, ArrowLeft, ChevronRight, ChevronDown, Trash2, Plus, Trophy, Activity, Flame, Search
} from "lucide-react";
import { useAuth, API } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

export default function ProgressPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState([]);
  const [selectedAthleteId, setSelectedAthleteId] = useState(null);
  const [entries, setEntries] = useState([]);
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("andamento");

  const [records, setRecords] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [newRecord, setNewRecord] = useState({
    exercise: "", category: "Forza", weight: "", reps: "", customValue: "",
    date: new Date().toISOString().split("T")[0], notes: ""
  });

  const currentAthleteId = user?.role === "athlete" ? user?.id : selectedAthleteId;
  const isStrengthCategory = newRecord.category === "Forza" || newRecord.category === "Peso Corporeo";

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
      setRecords(res.data.personal_records || []);
      setAchievements(res.data.achievements || []);
    } catch (e) {
      // silenzioso
    } finally {
      setRecordsLoading(false);
    }
  };

  const addRecord = async () => {
    if (!newRecord.exercise.trim()) {
      toast.error("Inserisci il nome dell'esercizio");
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
      toast.success("Record registrato con successo!");
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
    try {
      await axios.delete(`${API}/sheets/${entry.sheet_id}/progress/${entry.id}`);
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

  const grouped = entries.reduce((acc, e) => {
    if (!acc[e.exercise_name]) acc[e.exercise_name] = [];
    acc[e.exercise_name].push(e);
    return acc;
  }, {});

  const exerciseNames = Object.keys(grouped)
    .filter(name => name.toLowerCase().includes(search.toLowerCase()))
    .sort();

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 pb-20 md:pb-8">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex items-center gap-3 border-b border-zinc-800/80 pb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)} 
            className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
            data-testid="progress-back-btn"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <TrendingUp className="h-4 w-4" />
              </span>
              <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">
                Analisi & Progressi
              </h1>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Grafici di progressione carichi, volume e record personali OpenGym
            </p>
          </div>
        </div>

        {user?.role === "coach" && (
          <div className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-2">
            <Label className="text-xs font-bold text-zinc-300">Seleziona Atleta</Label>
            {athletes.length === 0 ? (
              <p className="text-xs text-zinc-500">Nessun atleta disponibile.</p>
            ) : (
              <select
                className="w-full sm:w-64 px-3 py-2 border border-zinc-800 rounded-xl bg-zinc-950 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
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

        {/* Tabs for Progress / Records */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-2xl mb-6">
            <TabsTrigger value="andamento" data-testid="tab-andamento" className="text-xs font-bold rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950">
              Andamento Carichi
            </TabsTrigger>
            <TabsTrigger value="record" data-testid="tab-record" className="text-xs font-bold rounded-xl data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950">
              Record Personali {records.length > 0 && `(${records.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="andamento" className="space-y-4">
            {!loading && exerciseNames.length > 0 && (
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filtra esercizi..."
                  className="pl-10 bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs"
                  data-testid="progress-search-input"
                />
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : exerciseNames.length === 0 ? (
              <Card className="bg-zinc-900/60 border-zinc-800 text-center py-12 rounded-2xl">
                <CardContent className="space-y-2">
                  <Activity className="h-10 w-10 mx-auto text-zinc-600" />
                  <p className="text-xs text-zinc-400">
                    Nessun progresso registrato ancora. Completa le serie nei tuoi workout per generare i grafici!
                  </p>
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
                  const best = chartData.reduce((max, e) => (max === null || e.peso > max.peso ? e : max), null);

                  return (
                    <div 
                      key={name} 
                      className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg transition-all"
                      data-testid={`progress-exercise-${name}`}
                    >
                      <button
                        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors text-left"
                        onClick={() => setExpandedExercise(isOpen ? null : name)}
                      >
                        <div className="space-y-1">
                          <p className="font-bold text-white text-base">{name}</p>
                          <p className="text-xs text-zinc-400">
                            {list.length} registrazioni · ultimo: <span className="text-emerald-400 font-bold">{latest.weight || "—"} {latest.reps && `× ${latest.reps}`}</span> ({latest.date})
                          </p>
                          {best && (
                            <p className="text-xs text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                              <Trophy className="h-3 w-3" /> Max PR: {best.peso} kg ({best.date})
                            </p>
                          )}
                        </div>
                        {isOpen ? <ChevronDown className="h-4 w-4 text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-400" />}
                      </button>

                      {isOpen && (
                        <div className="border-t border-zinc-800 p-4 space-y-4 bg-zinc-950/60">
                          {chartData.length >= 2 && (
                            <div className="h-48 w-full pt-2">
                              <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#71717a' }} />
                                  <YAxis tick={{ fontSize: 10, fill: '#71717a' }} domain={['auto', 'auto']} />
                                  <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                                  <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                                </LineChart>
                              </ResponsiveContainer>
                            </div>
                          )}

                          <div className="border border-zinc-800 rounded-xl divide-y divide-zinc-800 overflow-hidden">
                            {[...list].reverse().map((entry) => (
                              <div key={entry.id} className="flex items-center justify-between p-3 text-xs bg-zinc-900/40">
                                <div className="space-y-0.5">
                                  <span className="font-mono text-zinc-400">{entry.date}</span>
                                  {" · "}
                                  <span className="font-bold text-white">{entry.weight || "—"}</span>
                                  {entry.reps && <span className="text-emerald-400 font-bold"> × {entry.reps}</span>}
                                  {entry.week_label && <span className="text-[10px] text-zinc-500 ml-1">({entry.week_label})</span>}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => deleteEntry(entry)}
                                  className="h-7 w-7 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                                  data-testid={`delete-progress-page-${entry.id}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="record" className="space-y-4">
            <Card className="bg-zinc-900/80 border-zinc-800 rounded-2xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-white font-bold">Aggiungi Record Personale</CardTitle>
                <CardDescription className="text-xs text-zinc-400">Registra i tuoi massimali di forza o traguardi di resistenza</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-400">Nome Record</Label>
                    <Input
                      value={newRecord.exercise}
                      onChange={(e) => setNewRecord({ ...newRecord, exercise: e.target.value })}
                      placeholder="es. Panca Piana 1RM"
                      className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                      data-testid="new-record-name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-400">Categoria</Label>
                    <select
                      className="w-full px-3 py-2 border border-zinc-800 rounded-xl bg-zinc-950 text-white text-xs h-9"
                      value={newRecord.category}
                      onChange={(e) => setNewRecord({ ...newRecord, category: e.target.value })}
                      data-testid="new-record-category"
                    >
                      <option value="Forza">Forza (1RM / Massimale)</option>
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
                      <Label className="text-xs text-zinc-400">Peso (kg)</Label>
                      <Input
                        value={newRecord.weight}
                        onChange={(e) => setNewRecord({ ...newRecord, weight: e.target.value })}
                        placeholder="100"
                        className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                        data-testid="new-record-weight"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-zinc-400">Ripetizioni</Label>
                      <Input
                        value={newRecord.reps}
                        onChange={(e) => setNewRecord({ ...newRecord, reps: e.target.value })}
                        placeholder="1"
                        className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                        data-testid="new-record-reps"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Label className="text-xs text-zinc-400">Valore Custom</Label>
                    <Input
                      value={newRecord.customValue}
                      onChange={(e) => setNewRecord({ ...newRecord, customValue: e.target.value })}
                      placeholder="es. 30 trazioni consecutive"
                      className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                      data-testid="new-record-value"
                    />
                  </div>
                )}

                <Button onClick={addRecord} className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold gap-2 text-xs rounded-xl shadow-lg shadow-emerald-500/20" data-testid="confirm-add-record">
                  <Plus className="h-4 w-4" /> Registra Record
                </Button>
              </CardContent>
            </Card>

            {recordsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-500"></div>
              </div>
            ) : records.length === 0 ? (
              <p className="text-xs text-zinc-500 text-center py-6">Nessun record registrato finora.</p>
            ) : (
              <div className="space-y-2">
                {[...records].sort((a, b) => new Date(b.date) - new Date(a.date)).map((r) => (
                  <div key={r.id} className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between gap-3" data-testid={`record-${r.id}`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-sm">{r.exercise}</p>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {r.category}
                        </span>
                      </div>
                      <p className="text-xs font-mono font-bold text-emerald-400">
                        {r.weight ? `${r.weight} kg × ${r.reps || 1}` : r.custom_value}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteRecord(r.id)}
                      className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 rounded-lg"
                      data-testid={`delete-record-${r.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}
