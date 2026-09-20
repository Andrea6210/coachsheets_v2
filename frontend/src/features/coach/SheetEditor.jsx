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
const SheetEditor = () => {
  const { user, token } = useAuth();
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeWeekId, setActiveWeekId] = useState(null);
  const [activeDayId, setActiveDayId] = useState(null);
  const [athletes, setAthletes] = useState([]);
  const [manageAthletesOpen, setManageAthletesOpen] = useState(false);
  const [selectedAthleteIds, setSelectedAthleteIds] = useState([]);
  const [expandedExercises, setExpandedExercises] = useState({});
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressExercise, setProgressExercise] = useState("");
  const [progressAthleteId, setProgressAthleteId] = useState(null);
  const [progressEntries, setProgressEntries] = useState([]);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressForm, setProgressForm] = useState({ weight: "", reps: "", date: new Date().toISOString().split("T")[0] });
  const [dailyFeedback, setDailyFeedback] = useState({});
  const [athleteFeedback, setAthleteFeedback] = useState({});

  useEffect(() => {
    fetchSheet();
    connectWebSocket();
    if (user?.role === "coach") {
      fetchAthletes();
    }
    return () => {
      if (ws) ws.close();
    };
  }, [sheetId]);

  const fetchAthletes = async () => {
    try {
      const res = await axios.get(`${API}/athletes`);
      setAthletes(res.data);
    } catch (e) {
      // silenzioso: non blocca la visualizzazione della scheda
    }
  };

  const fetchSheet = async () => {
    try {
      const res = await axios.get(`${API}/sheets/${sheetId}`);
      setSheet(res.data);
      if (res.data.weeks?.length > 0) {
        setActiveWeekId(res.data.weeks[0].id);
        setActiveDayId(res.data.weeks[0].days?.[0]?.id || null);
      }
    } catch (e) {
      toast.error("Scheda non trovata");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const websocket = new WebSocket(`${WS_URL}/ws/sheet/${sheetId}?token=${token}`);
    
    websocket.onopen = () => {
      console.log("WebSocket connected");
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === "sheet_update") {
        setSheet(prev => prev ? { ...prev, weeks: data.weeks } : prev);
        toast.info(`${data.updated_by_name} ha modificato la scheda`);
      } else if (data.type === "user_joined") {
        setConnectedUsers(prev => [...prev.filter(u => u.user_id !== data.user_id), data]);
        toast.info(`${data.user_name} si Ã¨ connesso`);
      } else if (data.type === "user_left") {
        setConnectedUsers(prev => prev.filter(u => u.user_id !== data.user_id));
      }
    };

    websocket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    setWs(websocket);
  };

  const activeWeek = sheet?.weeks?.find(w => w.id === activeWeekId) || sheet?.weeks?.[0];
  const activeDay = activeWeek?.days?.find(d => d.id === activeDayId) || activeWeek?.days?.[0];

  const updateWeeks = async (newWeeks) => {
    setSheet(prev => prev ? { ...prev, weeks: newWeeks } : prev);
    setSaving(true);

    // Invia via WebSocket per la sincronizzazione in tempo reale
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "update", weeks: newWeeks }));
    }

    // Salva anche via API
    try {
      await axios.put(`${API}/sheets/${sheetId}`, { weeks: newWeeks });
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Settimane ----------
  const addWeek = () => {
    const weeks = sheet?.weeks || [];
    const lastWeek = weeks[weeks.length - 1];
    const nextNumber = (lastWeek?.weekNumber || weeks.length) + 1;
    // Copia i giorni/esercizi dell'ultima settimana, cosi' si parte gia' impostati
    // e si modifica solo cio' che cambia rispetto alla settimana precedente
    const clonedDays = (lastWeek?.days || []).map(d => ({
      ...d,
      id: crypto.randomUUID(),
      exercises: (d.exercises || []).map(ex => ({ ...ex, id: crypto.randomUUID() }))
    }));
    const newWeek = {
      id: crypto.randomUUID(),
      weekNumber: nextNumber,
      label: `Settimana ${nextNumber}`,
      days: clonedDays.length > 0 ? clonedDays : [{ id: crypto.randomUUID(), name: "Giorno 1", exercises: [], notes: "" }]
    };
    const newWeeks = [...weeks, newWeek];
    setActiveWeekId(newWeek.id);
    setActiveDayId(newWeek.days[0]?.id || null);
    updateWeeks(newWeeks);
  };

  const renameWeek = (weekId, label) => {
    const newWeeks = sheet.weeks.map(w => w.id === weekId ? { ...w, label } : w);
    updateWeeks(newWeeks);
  };

  const deleteWeek = (weekId) => {
    if ((sheet?.weeks?.length || 0) <= 1) {
      toast.error("Deve rimanere almeno una settimana");
      return;
    }
    if (!window.confirm("Eliminare questa settimana e tutti i suoi giorni/esercizi?")) return;
    const newWeeks = sheet.weeks.filter(w => w.id !== weekId);
    if (activeWeekId === weekId) {
      setActiveWeekId(newWeeks[0]?.id || null);
      setActiveDayId(newWeeks[0]?.days?.[0]?.id || null);
    }
    updateWeeks(newWeeks);
  };

  // ---------- Giorni (dentro la settimana attiva) ----------
  const updateActiveWeekDays = (newDays) => {
    const newWeeks = sheet.weeks.map(w => w.id === activeWeek.id ? { ...w, days: newDays } : w);
    updateWeeks(newWeeks);
  };

  const addDay = () => {
    const newDay = {
      id: crypto.randomUUID(),
      name: `Giorno ${(activeWeek?.days?.length || 0) + 1}`,
      exercises: [],
      notes: ""
    };
    const newDays = [...(activeWeek?.days || []), newDay];
    setActiveDayId(newDay.id);
    updateActiveWeekDays(newDays);
  };

  const duplicateDay = (dayId) => {
    const day = activeWeek.days.find(d => d.id === dayId);
    if (!day) return;
    const copy = {
      ...day,
      id: crypto.randomUUID(),
      name: `${day.name} (Copia)`,
      exercises: (day.exercises || []).map(ex => ({ ...ex, id: crypto.randomUUID() }))
    };
    const index = activeWeek.days.findIndex(d => d.id === dayId);
    const newDays = [...activeWeek.days];
    newDays.splice(index + 1, 0, copy);
    setActiveDayId(copy.id);
    updateActiveWeekDays(newDays);
  };

  const updateDay = (dayId, updates) => {
    const newDays = activeWeek.days.map(d => d.id === dayId ? { ...d, ...updates } : d);
    updateActiveWeekDays(newDays);
  };

  const deleteDay = (dayId) => {
    const newDays = activeWeek.days.filter(d => d.id !== dayId);
    if (activeDayId === dayId) {
      setActiveDayId(newDays[0]?.id || null);
    }
    updateActiveWeekDays(newDays);
  };

  // ---------- Esercizi (dentro il giorno attivo) ----------
  const addExercise = (dayId) => {
    const newExercise = {
      id: crypto.randomUUID(),
      exercise: "",
      sets: "",
      reps: "",
      weight: "",
      rest: "",
      notes: "",
      video_url: ""
    };
    const newDays = activeWeek.days.map(d => {
      if (d.id === dayId) {
        return { ...d, exercises: [...(d.exercises || []), newExercise] };
      }
      return d;
    });
    updateActiveWeekDays(newDays);
  };

  const duplicateExercise = (dayId, exerciseId) => {
    const day = activeWeek.days.find(d => d.id === dayId);
    const exercise = day?.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;
    const copy = { ...exercise, id: crypto.randomUUID() };
    const newDays = activeWeek.days.map(d => {
      if (d.id === dayId) {
        const index = d.exercises.findIndex(e => e.id === exerciseId);
        const newExercises = [...d.exercises];
        newExercises.splice(index + 1, 0, copy);
        return { ...d, exercises: newExercises };
      }
      return d;
    });
    updateActiveWeekDays(newDays);
  };

  const updateExercise = (dayId, exerciseId, field, value) => {
    const newDays = activeWeek.days.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          exercises: d.exercises.map(e => 
            e.id === exerciseId ? { ...e, [field]: value } : e
          )
        };
      }
      return d;
    });
    updateActiveWeekDays(newDays);
  };

  const deleteExercise = (dayId, exerciseId) => {
    const newDays = activeWeek.days.map(d => {
      if (d.id === dayId) {
        return { ...d, exercises: d.exercises.filter(e => e.id !== exerciseId) };
      }
      return d;
    });
    updateActiveWeekDays(newDays);
  };

  const toggleExerciseExpand = (exerciseId) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  // ---------- Atleti collegati alla scheda ----------
  const openManageAthletes = () => {
    setSelectedAthleteIds(sheet?.athlete_ids || []);
    setManageAthletesOpen(true);
  };

  const saveAthletes = async () => {
    if (selectedAthleteIds.length === 0) {
      toast.error("Seleziona almeno un atleta");
      return;
    }
    try {
      const res = await axios.put(`${API}/sheets/${sheetId}`, { athlete_ids: selectedAthleteIds });
      setSheet(res.data);
      toast.success("Atleti aggiornati");
      setManageAthletesOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore nell'aggiornamento");
    }
  };

  // ---------- Tracciamento progressi ----------
  const openProgress = (exerciseName) => {
    if (!exerciseName) {
      toast.error("Dai prima un nome all'esercizio");
      return;
    }
    const defaultAthleteId = user?.role === "athlete" ? user.id : (sheet?.athlete_ids?.length === 1 ? sheet.athlete_ids[0] : null);
    setProgressExercise(exerciseName);
    setProgressAthleteId(defaultAthleteId);
    setProgressForm({ weight: "", reps: "", date: new Date().toISOString().split("T")[0] });
    setProgressOpen(true);
    if (defaultAthleteId) {
      fetchProgress(exerciseName, defaultAthleteId);
    } else {
      setProgressEntries([]);
    }
  };

  const fetchProgress = async (exerciseName, athleteId) => {
    if (!athleteId) return;
    setProgressLoading(true);
    try {
      const res = await axios.get(`${API}/sheets/${sheetId}/progress`, { params: { athlete_id: athleteId } });
      setProgressEntries(res.data.filter(e => e.exercise_name === exerciseName));
    } catch (e) {
      toast.error("Errore nel caricamento dei progressi");
    } finally {
      setProgressLoading(false);
    }
  };

  const changeProgressAthlete = (athleteId) => {
    setProgressAthleteId(athleteId);
    fetchProgress(progressExercise, athleteId);
  };

  const addProgressEntry = async () => {
    if (!progressAthleteId) {
      toast.error("Seleziona un atleta");
      return;
    }
    try {
      await axios.post(`${API}/sheets/${sheetId}/progress`, {
        athlete_id: progressAthleteId,
        exercise_name: progressExercise,
        week_label: activeWeek?.label || "",
        weight: progressForm.weight,
        reps: progressForm.reps,
        date: progressForm.date
      });
      setProgressForm({ weight: "", reps: "", date: new Date().toISOString().split("T")[0] });
      fetchProgress(progressExercise, progressAthleteId);
      toast.success("Progresso registrato");
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore nella registrazione");
    }
  };

  const deleteProgressEntry = async (entryId) => {
    try {
      await axios.delete(`${API}/sheets/${sheetId}/progress/${entryId}`);
      setProgressEntries(prev => prev.filter(e => e.id !== entryId));
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore nell'eliminazione");
    }
  };

  // Estrae il primo numero da una stringa tipo "82.5kg" per poterlo mettere nel grafico
  const parseWeightValue = (weight) => {
    if (!weight) return null;
    const match = String(weight).match(/[\d.,]+/);
    if (!match) return null;
    return parseFloat(match[0].replace(",", "."));
  };

  const progressChartData = progressEntries
    .map(e => ({ date: e.date, peso: parseWeightValue(e.weight) }))
    .filter(e => e.peso !== null);

  // ---------- Archivio Video ("stile Drive") ----------
  const [videoArchiveOpen, setVideoArchiveOpen] = useState(false);

  // Raccoglie tutti gli esercizi con un link video, in tutte le settimane/giorni della scheda
  const videoArchiveItems = (sheet?.weeks || []).flatMap(week =>
    (week.days || []).flatMap(day =>
      (day.exercises || [])
        .filter(ex => ex.video_url)
        .map(ex => ({
          weekId: week.id,
          weekLabel: week.label,
          dayId: day.id,
          dayName: day.name,
          exerciseId: ex.id,
          exerciseName: ex.exercise || "(senza nome)",
          videoUrl: ex.video_url
        }))
    )
  );

  const removeVideoFromArchive = (weekId, dayId, exerciseId) => {
    const newWeeks = sheet.weeks.map(w => {
      if (w.id !== weekId) return w;
      return {
        ...w,
        days: w.days.map(d => {
          if (d.id !== dayId) return d;
          return {
            ...d,
            exercises: d.exercises.map(ex => ex.id === exerciseId ? { ...ex, video_url: "" } : ex)
          };
        })
      };
    });
    updateWeeks(newWeeks);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!sheet) return null;

  return (
    <div className="min-h-screen bg-background" data-testid="sheet-editor">
      <Navbar />
      
      {/* Sticky Header */}
      <div className="glass-header sticky top-16 z-40 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate(-1)} data-testid="back-btn">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="font-heading font-bold text-lg">{sheet.title}</h1>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {saving && <span className="text-yellow-500">Salvando...</span>}
                  {!saving && <span className="text-green-500 flex items-center gap-1"><Check className="h-3 w-3" /> Salvato</span>}
                  {connectedUsers.length > 0 && (
                    <span className="flex items-center gap-1">
                      â€¢ {connectedUsers.length + 1} online
                      <div className="flex -space-x-1">
                        {connectedUsers.slice(0, 3).map((u, i) => (
                          <div key={i} className="w-4 h-4 rounded-full bg-blue-500 border border-background" title={u.user_name}></div>
                        ))}
                      </div>
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {user?.role === "coach" && (
                <Button variant="outline" onClick={openManageAthletes} size="sm" className="gap-2" data-testid="manage-athletes-btn">
                  <Users className="h-4 w-4" /> Atleti
                </Button>
              )}
              <Button variant="outline" onClick={() => setVideoArchiveOpen(true)} size="sm" className="gap-2" data-testid="video-archive-btn">
                <Video className="h-4 w-4" /> Video
                {videoArchiveItems.length > 0 && (
                  <span className="ml-0.5 text-xs bg-primary text-primary-foreground rounded-full h-4 w-4 flex items-center justify-center">
                    {videoArchiveItems.length}
                  </span>
                )}
              </Button>
              {user?.role === "coach" && (
                <Button onClick={addDay} size="sm" className="gap-2" data-testid="add-day-btn">
                  <Plus className="h-4 w-4" /> Aggiungi Giorno
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Settimane */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          {sheet.weeks?.map((week) => (
            <div
              key={week.id}
              className={`group flex items-center gap-1 shrink-0 rounded-full border px-1 pl-3 py-1 cursor-pointer transition-colors ${
                activeWeekId === week.id ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 hover:bg-muted"
              }`}
              onClick={() => {
                setActiveWeekId(week.id);
                setActiveDayId(week.days?.[0]?.id || null);
              }}
              data-testid={`week-tab-${week.id}`}
            >
              {activeWeekId === week.id ? (
                <Input
                  value={week.label}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => renameWeek(week.id, e.target.value)}
                  className="h-6 w-28 border-0 bg-transparent p-0 text-sm font-medium text-primary-foreground focus-visible:ring-0"
                  data-testid={`week-label-${week.id}`}
                />
              ) : (
                <span className="text-sm font-medium">{week.label}</span>
              )}
              {sheet.weeks.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-5 w-5 p-0 shrink-0 ${activeWeekId === week.id ? "hover:bg-primary-foreground/20 text-primary-foreground" : "text-muted-foreground"}`}
                  onClick={(e) => { e.stopPropagation(); deleteWeek(week.id); }}
                  data-testid={`delete-week-${week.id}`}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addWeek} className="shrink-0 gap-1 rounded-full" data-testid="add-week-btn">
            <Plus className="h-3.5 w-3.5" /> Settimana
          </Button>
        </div>

        {(activeWeek?.days?.length || 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Questa settimana Ã¨ vuota. Aggiungi il primo giorno!</p>
              <Button onClick={addDay} data-testid="add-first-day-btn">
                <Plus className="h-4 w-4 mr-2" /> Aggiungi Giorno
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Selettore giorni - permette di concentrarsi su un giorno alla volta (comodo su telefono) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {activeWeek.days.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setActiveDayId(day.id)}
                  className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
                    activeDay?.id === day.id ? "bg-foreground text-background border-foreground" : "bg-muted/40 hover:bg-muted border-transparent"
                  }`}
                  data-testid={`day-tab-${day.id}`}
                >
                  {day.name || "Giorno"}
                </button>
              ))}
            </div>

            {activeDay && (
              <Card className="overflow-hidden" data-testid={`day-${activeDay.id}`}>
                <CardHeader className="bg-muted/30 py-3">
                  <div className="flex justify-between items-center gap-2">
                    <Input
                      value={activeDay.name}
                      onChange={(e) => updateDay(activeDay.id, { name: e.target.value })}
                      className="font-heading font-semibold text-lg bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                      data-testid={`day-name-${activeDay.id}`}
                    />
                    <div className="flex gap-1 shrink-0">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => addExercise(activeDay.id)}
                        title="Aggiungi esercizio"
                        data-testid={`add-exercise-${activeDay.id}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => duplicateDay(activeDay.id)}
                        title="Duplica giorno"
                        data-testid={`duplicate-day-${activeDay.id}`}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" title="Feedback Giornaliero">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Feedback: {activeDay.name}</DialogTitle>
                          </DialogHeader>
                          <Textarea 
                            placeholder="Scrivi qui le tue sensazioni libere su questo giorno di allenamento..."
                            value={dailyFeedback[activeDay.id] || ""}
                            onChange={(e) => setDailyFeedback(prev => ({...prev, [activeDay.id]: e.target.value}))}
                            className="min-h-[150px] mt-4"
                          />
                        </DialogContent>
                      </Dialog>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteDay(activeDay.id)}
                        className="text-destructive hover:text-destructive"
                        title="Elimina giorno"
                        data-testid={`delete-day-${activeDay.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Intestazioni colonna - solo da tablet in su, su mobile ogni campo ha la sua etichetta */}
                  <div className="hidden sm:flex bg-muted/50 text-sm">
                    <div className="p-3 text-left font-medium w-[26%]">Esercizio</div>
                    <div className="p-3 text-center font-medium w-[9%]">Serie</div>
                    <div className="p-3 text-center font-medium w-[9%]">Reps</div>
                    <div className="p-3 text-center font-medium w-[11%]">Peso</div>
                    <div className="p-3 text-center font-medium w-[9%]">Rec.</div>
                    <div className="p-3 text-left font-medium w-[20%]">Note</div>
                    <div className="p-3 w-[16%]"></div>
                  </div>

                  {activeDay.exercises?.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Nessun esercizio. Clicca + per aggiungere.
                    </div>
                  ) : (
                    activeDay.exercises.map((ex) => (
                      <div key={ex.id} className="border-t border-border" data-testid={`exercise-${ex.id}`}>
                        <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-0 sm:p-0 hover:bg-muted/30 transition-colors">
                          {/* Nome esercizio */}
                          <div className="sm:w-[26%] sm:p-2">
                            <Input
                              value={ex.exercise}
                              onChange={(e) => updateExercise(activeDay.id, ex.id, "exercise", e.target.value)}
                              placeholder="Es: Panca Piana"
                              className="border border-input sm:border-0 bg-transparent focus-visible:ring-0 px-2 sm:p-1 font-medium sm:font-normal"
                              data-testid={`exercise-name-${ex.id}`}
                            />
                          </div>

                          {/* Serie / Reps / Peso / Rec - griglia compatta su mobile, riga su desktop */}
                          <div className="grid grid-cols-4 gap-2 sm:contents">
                            <div className="sm:w-[9%] sm:p-2">
                              <Label className="text-[10px] text-muted-foreground sm:hidden">Serie</Label>
                              <Input
                                value={ex.sets}
                                onChange={(e) => updateExercise(activeDay.id, ex.id, "sets", e.target.value)}
                                placeholder="4"
                                className="border border-input sm:border-0 bg-transparent focus-visible:ring-0 px-2 sm:p-1 text-center font-mono"
                                data-testid={`exercise-sets-${ex.id}`}
                              />
                            </div>
                            <div className="sm:w-[9%] sm:p-2">
                              <Label className="text-[10px] text-muted-foreground sm:hidden">Reps</Label>
                              <Input
                                value={ex.reps}
                                onChange={(e) => updateExercise(activeDay.id, ex.id, "reps", e.target.value)}
                                placeholder="8-10"
                                className="border border-input sm:border-0 bg-transparent focus-visible:ring-0 px-2 sm:p-1 text-center font-mono"
                                data-testid={`exercise-reps-${ex.id}`}
                              />
                            </div>
                            <div className="sm:w-[11%] sm:p-2">
                              <Label className="text-[10px] text-muted-foreground sm:hidden">Peso</Label>
                              <Input
                                value={ex.weight}
                                onChange={(e) => updateExercise(activeDay.id, ex.id, "weight", e.target.value)}
                                placeholder="80kg"
                                className="border border-input sm:border-0 bg-transparent focus-visible:ring-0 px-2 sm:p-1 text-center font-mono"
                                data-testid={`exercise-weight-${ex.id}`}
                              />
                            </div>
                            <div className="sm:w-[9%] sm:p-2">
                              <Label className="text-[10px] text-muted-foreground sm:hidden">Rec.</Label>
                              <Input
                                value={ex.rest}
                                onChange={(e) => updateExercise(activeDay.id, ex.id, "rest", e.target.value)}
                                placeholder="90s"
                                className="border border-input sm:border-0 bg-transparent focus-visible:ring-0 px-2 sm:p-1 text-center font-mono"
                                data-testid={`exercise-rest-${ex.id}`}
                              />
                            </div>
                          </div>

                          {/* Note */}
                          <div className="sm:w-[20%] sm:p-2">
                            <Label className="text-[10px] text-muted-foreground sm:hidden">Note</Label>
                            <Input
                              value={ex.notes}
                              onChange={(e) => updateExercise(activeDay.id, ex.id, "notes", e.target.value)}
                              placeholder="Note..."
                              className="border border-input sm:border-0 bg-transparent focus-visible:ring-0 px-2 sm:p-1"
                              data-testid={`exercise-notes-${ex.id}`}
                            />
                          </div>

                          {/* Azioni */}
                          <div className="flex items-center justify-end gap-1 sm:w-[16%] sm:p-2 border-t border-border pt-2 sm:border-t-0 sm:pt-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openProgress(ex.exercise)}
                              className="h-9 w-9 sm:h-8 sm:w-8 p-0 text-muted-foreground"
                              title="Progressi"
                              data-testid={`progress-${ex.id}`}
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExerciseExpand(ex.id)}
                              className={`h-9 w-9 sm:h-8 sm:w-8 p-0 ${ex.video_url ? "text-primary" : "text-muted-foreground"}`}
                              title="Link video esercizio"
                              data-testid={`toggle-video-${ex.id}`}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateExercise(activeDay.id, ex.id)}
                              className="h-9 w-9 sm:h-8 sm:w-8 p-0 text-muted-foreground"
                              title="Duplica esercizio"
                              data-testid={`duplicate-exercise-${ex.id}`}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteExercise(activeDay.id, ex.id)}
                              className="text-destructive hover:text-destructive h-9 w-9 sm:h-8 sm:w-8 p-0"
                              data-testid={`delete-exercise-${ex.id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Athlete Feedback Field */}
                        <div className="bg-muted/10 border-t border-border p-2 sm:px-4 sm:py-2">
                          <Label className="text-[10px] uppercase font-bold text-sky-500 tracking-wider mb-1 block">Feedback Atleta</Label>
                          <Input
                            value={athleteFeedback[ex.id] || ""}
                            onChange={(e) => setAthleteFeedback(prev => ({...prev, [ex.id]: e.target.value}))}
                            placeholder="Es: Ottime sensazioni, peso leggero..."
                            className="border-dashed border-sky-500/30 bg-transparent focus-visible:ring-sky-500/50 text-sm h-8"
                          />
                        </div>

                        {expandedExercises[ex.id] && (
                          <div className="border-t border-border bg-muted/20 p-2 px-3">
                            <div className="flex items-center gap-2">
                              <LinkIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <Input
                                value={ex.video_url || ""}
                                onChange={(e) => updateExercise(activeDay.id, ex.id, "video_url", e.target.value)}
                                placeholder="Incolla qui il link del video (YouTube, Google Drive, Vimeo...)"
                                className="h-8 text-xs"
                                data-testid={`exercise-video-${ex.id}`}
                              />
                              {ex.video_url && (
                                <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline shrink-0">
                                  Apri
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  {/* Day Notes */}
                  <div className="border-t border-border p-4">
                    <Label className="text-xs text-muted-foreground mb-2 block">Note del giorno</Label>
                    <Textarea
                      value={activeDay.notes || ""}
                      onChange={(e) => updateDay(activeDay.id, { notes: e.target.value })}
                      placeholder="Aggiungi note, feedback, promemoria..."
                      className="min-h-[60px] resize-none"
                      data-testid={`day-notes-${activeDay.id}`}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>

      {/* Dialog gestione atleti collegati */}
      <Dialog open={manageAthletesOpen} onOpenChange={setManageAthletesOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atleti collegati a questa scheda</DialogTitle>
          </DialogHeader>
          <div className="border border-input rounded-md max-h-64 overflow-y-auto divide-y" data-testid="manage-athletes-list">
            {athletes.length === 0 ? (
              <p className="text-sm text-muted-foreground p-3">Nessun atleta disponibile.</p>
            ) : (
              athletes.map((a) => (
                <label key={a.id} className="flex items-center gap-2 p-3 cursor-pointer hover:bg-muted/50">
                  <Checkbox
                    checked={selectedAthleteIds.includes(a.id)}
                    onCheckedChange={(checked) => {
                      setSelectedAthleteIds(prev => checked ? [...prev, a.id] : prev.filter(id => id !== a.id));
                    }}
                    data-testid={`manage-athlete-${a.id}`}
                  />
                  <span className="text-sm">{a.name}</span>
                </label>
              ))
            )}
          </div>
          <DialogFooter>
            <Button onClick={saveAthletes} disabled={selectedAthleteIds.length === 0} data-testid="confirm-manage-athletes">
              Salva
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog tracciamento progressi: grafico + tabella + form inserimento */}
      <Dialog open={progressOpen} onOpenChange={setProgressOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" /> Progressi: {progressExercise}
            </DialogTitle>
          </DialogHeader>

          {user?.role === "coach" && (sheet?.athlete_ids?.length || 0) > 1 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Atleta</Label>
              <select
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
                value={progressAthleteId || ""}
                onChange={(e) => changeProgressAthlete(e.target.value)}
                data-testid="progress-athlete-select"
              >
                <option value="">Seleziona atleta</option>
                {athletes.filter(a => sheet.athlete_ids.includes(a.id)).map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
          )}

          {!progressAthleteId ? (
            <p className="text-sm text-muted-foreground text-center py-6">Seleziona un atleta per vedere i progressi.</p>
          ) : progressLoading ? (
            <div className="flex justify-center py-6">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {progressChartData.length >= 2 && (
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line type="monotone" dataKey="peso" stroke="currentColor" className="text-primary" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="border border-input rounded-md max-h-48 overflow-y-auto divide-y" data-testid="progress-entries-list">
                {progressEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-3 text-center">Nessun progresso registrato ancora.</p>
                ) : (
                  [...progressEntries].reverse().map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between gap-2 p-2 px-3 text-sm">
                      <div>
                        <span className="font-mono">{entry.date}</span>
                        {" Â· "}
                        <span className="font-medium">{entry.weight || "â€”"}</span>
                        {entry.reps && <span className="text-muted-foreground"> Ã— {entry.reps}</span>}
                        {entry.week_label && <span className="text-xs text-muted-foreground ml-1">({entry.week_label})</span>}
                        <div className="text-xs text-muted-foreground">
                          {entry.logged_by_name} {entry.logged_by_role === "coach" ? "(coach)" : "(atleta)"}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteProgressEntry(entry.id)}
                        className="h-7 w-7 p-0 text-destructive shrink-0"
                        data-testid={`delete-progress-${entry.id}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 items-end pt-1">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Peso</Label>
                  <Input
                    value={progressForm.weight}
                    onChange={(e) => setProgressForm({ ...progressForm, weight: e.target.value })}
                    placeholder="82.5kg"
                    className="h-9"
                    data-testid="progress-weight-input"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Reps</Label>
                  <Input
                    value={progressForm.reps}
                    onChange={(e) => setProgressForm({ ...progressForm, reps: e.target.value })}
                    placeholder="8"
                    className="h-9"
                    data-testid="progress-reps-input"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Data</Label>
                  <Input
                    type="date"
                    value={progressForm.date}
                    onChange={(e) => setProgressForm({ ...progressForm, date: e.target.value })}
                    className="h-9"
                    data-testid="progress-date-input"
                  />
                </div>
              </div>
              <Button onClick={addProgressEntry} className="w-full gap-2" data-testid="confirm-add-progress">
                <Plus className="h-4 w-4" /> Registra Progresso
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Archivio Video: raccoglie in un unico posto tutti i link video della scheda, come una piccola "drive" */}
      <Dialog open={videoArchiveOpen} onOpenChange={setVideoArchiveOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-5 w-5" /> Archivio Video
            </DialogTitle>
          </DialogHeader>
          {videoArchiveItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Nessun video collegato ancora. Aggiungine uno dall'icona ðŸŽ¥ su un esercizio.
            </p>
          ) : (
            <div className="border border-input rounded-md max-h-96 overflow-y-auto divide-y" data-testid="video-archive-list">
              {videoArchiveItems.map((item) => (
                <div key={item.exerciseId} className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.exerciseName}</p>
                    <p className="text-xs text-muted-foreground">{item.weekLabel} Â· {item.dayName}</p>
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline truncate block max-w-[280px]"
                    >
                      {item.videoUrl}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVideoFromArchive(item.weekId, item.dayId, item.exerciseId)}
                    className="h-8 w-8 p-0 text-destructive shrink-0"
                    title="Rimuovi collegamento video"
                    data-testid={`remove-video-${item.exerciseId}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Sheet History
export default SheetEditor;

