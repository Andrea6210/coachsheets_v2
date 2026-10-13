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
  Play, Zap, Disc, Watch, Sparkles, Layers, ChevronUp, Share2, BarChart2, SlidersHorizontal
} from "lucide-react";
import { useAuth, API, WS_URL } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Navbar } from "@/components/layout/Navbar";
import { EXERCISE_CATALOG } from "@/lib/exerciseCatalog";
import { SetDetailsBreakdown } from "./SetDetailsBreakdown";
import { PlateCalculatorModal } from "@/features/calculator/PlateCalculatorModal";
import { WearableIntegrationModal } from "@/features/athlete/WearableIntegrationModal";
import { VolumeAnalysisModal } from "./VolumeAnalysisModal";
import { ShareSheetModal } from "./ShareSheetModal";
import { generateUUID } from "@/lib/uuid";

const SheetEditor = () => {
  const { user, token } = useAuth();
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  // Rinomina titolo scheda
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Dettaglio serie differenziate
  const [expandedSetDetails, setExpandedSetDetails] = useState({});

  // Modali Pro
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState(80);
  const [wearableOpen, setWearableOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [volumeModalOpen, setVolumeModalOpen] = useState(false);

  const getAuthHeaders = () => {
    const currentToken = localStorage.getItem("token") || token;
    return currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
  };

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
      const res = await axios.get(`${API}/athletes`, { headers: getAuthHeaders() });
      setAthletes(res.data);
    } catch (e) {
      // silenzioso: non blocca la visualizzazione della scheda
    }
  };

  const extractFeedbacksFromWeeks = (weeks) => {
    const dailyMap = {};
    const athleteMap = {};
    if (!Array.isArray(weeks)) return { dailyMap, athleteMap };
    weeks.forEach(w => {
      if (!w || !Array.isArray(w.days)) return;
      w.days.forEach(d => {
        if (!d) return;
        const df = d.daily_feedback || d.dailyFeedback || d.feedback;
        if (df) dailyMap[d.id] = df;
        if (!Array.isArray(d.exercises)) return;
        d.exercises.forEach(ex => {
          if (!ex) return;
          const af = ex.athlete_notes || ex.athleteNotes || ex.athlete_feedback || ex.athleteFeedback;
          if (af) athleteMap[ex.id] = af;
        });
      });
    });
    return { dailyMap, athleteMap };
  };

  const fetchSheet = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API}/sheets/${sheetId}`, { headers: getAuthHeaders() });
      const sheetData = res.data;
      setSheet(sheetData);
      if (sheetData.weeks?.length > 0) {
        setActiveWeekId(sheetData.weeks[0].id);
        setActiveDayId(sheetData.weeks[0].days?.[0]?.id || null);
      }
      const { dailyMap, athleteMap } = extractFeedbacksFromWeeks(sheetData.weeks);
      setDailyFeedback(dailyMap);
      setAthleteFeedback(athleteMap);
    } catch (e) {
      console.error("fetchSheet error:", e);
      setError(e.response?.data?.message || "Impossibile caricare la scheda.");
      toast.error("Errore nel caricamento della scheda");
    } finally {
      setLoading(false);
    }
  };

  const connectWebSocket = () => {
    const currentToken = localStorage.getItem("token") || token;
    const websocket = new WebSocket(`${WS_URL}/ws/sheet/${sheetId}?token=${currentToken || ''}`);
    
    websocket.onopen = () => {
      console.log("WebSocket connected");
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "sheet_update") {
          setSheet(prev => prev ? { ...prev, weeks: data.weeks } : prev);
          const { dailyMap, athleteMap } = extractFeedbacksFromWeeks(data.weeks);
          setDailyFeedback(prev => ({ ...prev, ...dailyMap }));
          setAthleteFeedback(prev => ({ ...prev, ...athleteMap }));
          toast.info(`${data.updated_by_name || 'Coach'} ha modificato la scheda`);
        } else if (data.type === "user_joined") {
          setConnectedUsers(prev => [...prev.filter(u => u.user_id !== data.user_id), data]);
        } else if (data.type === "user_left") {
          setConnectedUsers(prev => prev.filter(u => u.user_id !== data.user_id));
        }
      } catch (err) {
        console.error("WebSocket message parse error:", err);
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
      try {
        ws.send(JSON.stringify({ type: "update", weeks: newWeeks }));
      } catch (e) {}
    }

    // Salva anche via API
    try {
      await axios.put(`${API}/sheets/${sheetId}`, { weeks: newWeeks }, { headers: getAuthHeaders() });
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setSaving(false);
    }
  };

  // ---------- Settimane ----------
  const addWeekWithProgression = (percent = 0) => {
    const weeks = sheet?.weeks || [];
    const lastWeek = weeks[weeks.length - 1];
    const nextNumber = (lastWeek?.weekNumber || weeks.length) + 1;
    const clonedDays = (lastWeek?.days || []).map(d => ({
      ...d,
      id: generateUUID(),
      exercises: (d.exercises || []).map(ex => {
        let newWeight = ex.weight;
        if (percent > 0 && ex.weight) {
          const match = ex.weight.toString().match(/([0-9.]+)/);
          if (match) {
            const val = parseFloat(match[1]);
            const incremented = Math.round((val * (1 + percent / 100)) * 2) / 2;
            newWeight = ex.weight.replace(match[1], incremented.toString());
          }
        }
        return {
          ...ex,
          id: generateUUID(),
          weight: newWeight
        };
      })
    }));
    const newWeek = {
      id: generateUUID(),
      weekNumber: nextNumber,
      label: `Settimana ${nextNumber}${percent > 0 ? ` (+${percent}%)` : ''}`,
      days: clonedDays.length > 0 ? clonedDays : [{ id: generateUUID(), name: "Giorno 1", exercises: [], notes: "" }]
    };
    const newWeeks = [...weeks, newWeek];
    setActiveWeekId(newWeek.id);
    setActiveDayId(newWeek.days[0]?.id || null);
    updateWeeks(newWeeks);
    toast.success(percent > 0 ? `Settimana ${nextNumber} creata con incremento +${percent}%!` : `Settimana ${nextNumber} creata!`);
  };

  const addWeek = () => addWeekWithProgression(0);

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
      id: generateUUID(),
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
      id: generateUUID(),
      name: `${day.name} (Copia)`,
      exercises: (day.exercises || []).map(ex => ({ ...ex, id: generateUUID() }))
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

  const handleDailyFeedbackChange = (dayId, value) => {
    setDailyFeedback(prev => ({ ...prev, [dayId]: value }));
    updateDay(dayId, { daily_feedback: value, dailyFeedback: value });
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
      id: generateUUID(),
      exercise: "",
      sets: "",
      reps: "",
      weight: "",
      rest: "",
      notes: "",
      athlete_notes: "",
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
    const copy = { ...exercise, id: generateUUID() };
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
          exercises: d.exercises.map(e => {
            if (e.id === exerciseId) {
              const updated = { ...e, [field]: value };
              if (field === "athlete_notes") {
                updated.athleteNotes = value;
              }
              return updated;
            }
            return e;
          })
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

  const moveExercise = (dayId, currentIndex, direction) => {
    const day = activeWeek?.days?.find(d => d.id === dayId);
    if (!day || !day.exercises) return;
    const newIndex = currentIndex + direction;
    if (newIndex < 0 || newIndex >= day.exercises.length) return;

    const newExercises = [...day.exercises];
    const [moved] = newExercises.splice(currentIndex, 1);
    newExercises.splice(newIndex, 0, moved);

    const newDays = activeWeek.days.map(d => {
      if (d.id === dayId) {
        return { ...d, exercises: newExercises };
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

  const handleSaveTitle = async () => {
    if (!editedTitle.trim()) {
      toast.error("Il titolo non può essere vuoto");
      return;
    }
    const newTitle = editedTitle.trim();
    setSheet(prev => ({ ...prev, title: newTitle }));
    setIsEditingTitle(false);
    try {
      await axios.put(`${API}/sheets/${sheetId}`, { title: newTitle }, { headers: getAuthHeaders() });
      toast.success("Nome scheda salvato!");
    } catch (e) {
      toast.error("Errore durante il salvataggio del nome");
    }
  };

  const toggleSetDetails = (exerciseId) => {
    setExpandedSetDetails(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  };

  const updateExerciseSetDetails = (dayId, exerciseId, newDetails) => {
    const newDays = activeWeek.days.map(d => {
      if (d.id === dayId) {
        return {
          ...d,
          exercises: d.exercises.map(e => {
            if (e.id === exerciseId) {
              return { 
                ...e, 
                set_details: newDetails, 
                setDetails: newDetails,
                sets: newDetails.length > 0 ? String(newDetails.length) : e.sets 
              };
            }
            return e;
          })
        };
      }
      return d;
    });
    updateActiveWeekDays(newDays);
  };

  const cycleSupersetGroup = (dayId, exerciseId, currentGroup) => {
    const cycle = { "": "A", "A": "B", "B": "C", "C": "" };
    const nextGroup = cycle[currentGroup || ""] || "";
    updateExercise(dayId, exerciseId, "superset_group", nextGroup);
    toast.info(nextGroup ? `Esercizio collegato a SUPERSET ${nextGroup}` : "Superserie rimossa");
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
      const res = await axios.put(`${API}/sheets/${sheetId}`, { athlete_ids: selectedAthleteIds }, { headers: getAuthHeaders() });
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
      const res = await axios.get(`${API}/sheets/${sheetId}/progress`, { 
        params: { athlete_id: athleteId },
        headers: getAuthHeaders()
      });
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
      }, { headers: getAuthHeaders() });
      setProgressForm({ weight: "", reps: "", date: new Date().toISOString().split("T")[0] });
      fetchProgress(progressExercise, progressAthleteId);
      toast.success("Progresso registrato");
    } catch (e) {
      toast.error(e.response?.data?.detail || e.response?.data?.message || "Errore nella registrazione");
    }
  };

  const deleteProgressEntry = async (entryId) => {
    try {
      await axios.delete(`${API}/sheets/${sheetId}/progress/${entryId}`, { headers: getAuthHeaders() });
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
    (week?.days || []).flatMap(day =>
      (day?.exercises || [])
        .filter(ex => ex && ex.video_url)
        .map(ex => ({
          weekId: week.id,
          weekLabel: week.label || "Settimana",
          dayId: day.id,
          dayName: day.name || "Giorno",
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
      <div className="min-h-screen bg-[#0c0e12] flex flex-col items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
        <p className="text-xs text-zinc-400 font-mono">Caricamento scheda in corso...</p>
      </div>
    );
  }

  if (error || !sheet) {
    return (
      <div className="min-h-screen bg-[#0c0e12] text-zinc-100">
        <Navbar />
        <div className="max-w-md mx-auto mt-24 p-8 bg-zinc-900 border border-zinc-800 rounded-3xl text-center space-y-4 shadow-xl">
          <Dumbbell className="h-10 w-10 mx-auto text-zinc-600" />
          <h3 className="text-base font-bold text-zinc-200">{error || "Scheda non trovata"}</h3>
          <p className="text-xs text-zinc-400">Non è stato possibile caricare i dettagli di questa scheda di allenamento.</p>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => navigate(user?.role === "coach" ? "/coach" : "/athlete")}>
              Torna alla Dashboard
            </Button>
            <Button className="premium-button-primary rounded-xl" onClick={fetchSheet}>
              Riprova
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 sm:pb-12" data-testid="sheet-editor">
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
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={(e) => { 
                        if (e.key === 'Enter') handleSaveTitle(); 
                        if (e.key === 'Escape') setIsEditingTitle(false); 
                      }}
                      className="h-8 text-base font-bold w-64 bg-background"
                      autoFocus
                    />
                    <Button size="sm" className="h-8 px-2 bg-emerald-600 hover:bg-emerald-500 text-white" onClick={handleSaveTitle}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setIsEditingTitle(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div 
                    className="flex items-center gap-2 group cursor-pointer" 
                    onClick={() => { 
                      if (user?.role === "coach") { 
                        setEditedTitle(sheet.title || ""); 
                        setIsEditingTitle(true); 
                      } 
                    }}
                    title={user?.role === "coach" ? "Clicca per modificare il nome della scheda" : ""}
                  >
                    <h1 className="font-heading font-bold text-lg">{sheet.title || "Scheda di Allenamento"}</h1>
                    {user?.role === "coach" && (
                      <Edit2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {saving && <span className="text-yellow-500">Salvando...</span>}
                  {!saving && <span className="text-green-500 flex items-center gap-1"><Check className="h-3 w-3" /> Salvato</span>}
                  {connectedUsers.length > 0 && (
                    <span className="flex items-center gap-1">
                      • {connectedUsers.length + 1} online
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
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => navigate(`/workout/${sheetId}?weekId=${activeWeekId || ''}&dayId=${activeDayId || ''}`)} 
                size="sm" 
                className="premium-button-primary gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black shadow-lg shadow-emerald-500/25 flex items-center"
                data-testid="start-workout-header-btn"
              >
                <Play className="h-3.5 w-3.5 fill-current text-zinc-950" />
                <span className="hidden xs:inline">Avvia</span> Workout
              </Button>

              {/* Menu Unificato Strumenti Scheda */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 rounded-xl" title="Strumenti e Analisi della Scheda">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Strumenti</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-zinc-950 border-zinc-800 text-zinc-200 rounded-2xl shadow-2xl">
                  <DropdownMenuItem onClick={() => setVolumeModalOpen(true)} className="gap-2 cursor-pointer focus:bg-zinc-900 text-zinc-300 font-medium">
                    <BarChart2 className="h-4 w-4 text-emerald-400" />
                    Analisi Volume Muscolare
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShareModalOpen(true)} className="gap-2 cursor-pointer focus:bg-zinc-900 text-zinc-300 font-medium">
                    <Share2 className="h-4 w-4 text-emerald-400" />
                    Condividi (WhatsApp / PDF)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPlateCalcOpen(true)} className="gap-2 cursor-pointer focus:bg-zinc-900 text-zinc-300 font-medium">
                    <Disc className="h-4 w-4 text-emerald-400" />
                    Calcolatore Piastre
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setVideoArchiveOpen(true)} className="gap-2 cursor-pointer focus:bg-zinc-900 text-zinc-300 font-medium">
                    <Video className="h-4 w-4 text-blue-400" />
                    Archivio Video {videoArchiveItems.length > 0 && `(${videoArchiveItems.length})`}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setWearableOpen(true)} className="gap-2 cursor-pointer focus:bg-zinc-900 text-zinc-300 font-medium">
                    <Watch className="h-4 w-4 text-sky-400" />
                    Dispositivi & Smartwatch
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {user?.role === "coach" && (
                <Button variant="outline" onClick={openManageAthletes} size="sm" className="gap-2 text-xs rounded-xl" data-testid="manage-athletes-btn">
                  <Users className="h-4 w-4 text-emerald-400" /> Atleti
                </Button>
              )}
              {user?.role === "coach" && (
                <Button onClick={addDay} size="sm" className="gap-2 text-xs rounded-xl" data-testid="add-day-btn">
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
          {(sheet.weeks || []).map((week) => (
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
              {activeWeekId === week.id && user?.role === "coach" ? (
                <Input
                  value={week.label || ""}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => renameWeek(week.id, e.target.value)}
                  className="h-6 w-28 border-0 bg-transparent p-0 text-sm font-medium text-primary-foreground focus-visible:ring-0"
                  data-testid={`week-label-${week.id}`}
                />
              ) : (
                <span className="text-sm font-medium px-2">{week.label || "Settimana"}</span>
              )}
              {user?.role === "coach" && (sheet.weeks || []).length > 1 && (
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
          {user?.role === "coach" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 gap-1 rounded-full text-xs font-bold bg-zinc-900 border-zinc-800 hover:bg-zinc-800" data-testid="add-week-btn">
                  <Plus className="h-3.5 w-3.5" /> Settimana
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-zinc-950 border-zinc-800 text-zinc-200 rounded-xl">
                <DropdownMenuItem onClick={() => addWeekWithProgression(0)} className="cursor-pointer focus:bg-zinc-900">
                  Copia 1:1 dall'ultima settimana
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWeekWithProgression(2.5)} className="cursor-pointer focus:bg-zinc-900 text-emerald-400 font-bold">
                  ⚡ Progressione +2.5% sui carichi
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => addWeekWithProgression(5)} className="cursor-pointer focus:bg-zinc-900 text-emerald-400 font-bold">
                  ⚡ Progressione +5% sui carichi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {(activeWeek?.days?.length || 0) === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Questa settimana è vuota.</p>
              {user?.role === "coach" && (
                <Button onClick={addDay} data-testid="add-first-day-btn">
                  <Plus className="h-4 w-4 mr-2" /> Aggiungi Giorno
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Selettore giorni - permette di concentrarsi su un giorno alla volta (comodo su telefono) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {(activeWeek?.days || []).map((day) => (
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
                    {user?.role === "coach" ? (
                      <Input
                        value={activeDay.name || ""}
                        onChange={(e) => updateDay(activeDay.id, { name: e.target.value })}
                        className="font-heading font-semibold text-lg bg-transparent border-0 p-0 h-auto focus-visible:ring-0"
                        data-testid={`day-name-${activeDay.id}`}
                      />
                    ) : (
                      <h3 className="font-heading font-semibold text-lg text-white">
                        {activeDay.name || "Giorno"}
                      </h3>
                    )}
                    <div className="flex gap-1 shrink-0">
                      {user?.role === "coach" && (
                        <>
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
                        </>
                      )}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`relative ${
                              (activeDay.daily_feedback || activeDay.dailyFeedback || dailyFeedback[activeDay.id])
                                ? "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 font-bold"
                                : "text-blue-500 hover:text-blue-600 hover:bg-blue-500/10"
                            }`} 
                            title="Feedback Giornaliero"
                            data-testid={`daily-feedback-btn-${activeDay.id}`}
                          >
                            <MessageSquare className="h-4 w-4" />
                            {Boolean(activeDay.daily_feedback || activeDay.dailyFeedback || dailyFeedback[activeDay.id]) && (
                              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-background animate-pulse" />
                            )}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <MessageSquare className="h-5 w-5 text-emerald-400" />
                              Feedback: {activeDay.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground">
                              Scrivi le tue sensazioni, commenti o note di recupero su questa giornata di allenamento.
                            </DialogDescription>
                          </DialogHeader>
                          <Textarea 
                            placeholder="Scrivi qui le tue sensazioni libere su questo giorno di allenamento..."
                            value={dailyFeedback[activeDay.id] !== undefined ? dailyFeedback[activeDay.id] : (activeDay.daily_feedback || activeDay.dailyFeedback || "")}
                            onChange={(e) => handleDailyFeedbackChange(activeDay.id, e.target.value)}
                            className="min-h-[150px] mt-2"
                            data-testid={`daily-feedback-input-${activeDay.id}`}
                          />
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-[11px] text-muted-foreground font-mono">
                              {saving ? "Salvataggio..." : "✓ Salvataggio automatico attivo"}
                            </span>
                          </div>
                        </DialogContent>
                      </Dialog>
                      {user?.role === "coach" && (
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
                      )}
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

                  {(activeDay.exercises || []).length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground text-sm">
                      Nessun esercizio presente per questa sessione. {user?.role === "coach" && "Clicca + per aggiungere."}
                    </div>
                  ) : (
                    (activeDay.exercises || []).map((ex, exIndex) => (
                      <div key={ex.id} className="border-t border-border" data-testid={`exercise-${ex.id}`}>
                        <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:gap-0 sm:p-0 hover:bg-muted/30 transition-colors">
                          {/* Nome esercizio con ricerca da catalogo o creazione nuovo */}
                          <div className="sm:w-[26%] sm:p-2">
                            <Input
                              list="exercise-catalog-suggestions"
                              value={ex.exercise}
                              onChange={(e) => {
                                const val = e.target.value;
                                updateExercise(activeDay.id, ex.id, "exercise", val);
                                const found = EXERCISE_CATALOG.find(c => c.name.toLowerCase() === val.toLowerCase());
                                if (found && !ex.rest) {
                                  updateExercise(activeDay.id, ex.id, "rest", found.defaultRest || "90s");
                                }
                              }}
                              placeholder="Cerca o inserisci esercizio..."
                              className="border border-zinc-800 sm:border-0 bg-transparent text-white focus-visible:ring-emerald-500/50 px-2 sm:p-1 font-medium placeholder:text-zinc-500"
                              data-testid={`exercise-name-${ex.id}`}
                            />
                            <datalist id="exercise-catalog-suggestions">
                              {EXERCISE_CATALOG.map((cat) => (
                                <option key={cat.id} value={cat.name}>{cat.muscleGroup} • {cat.equipment}</option>
                              ))}
                            </datalist>
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
                          <div className="flex items-center justify-end gap-1 sm:w-[16%] sm:p-2 border-t border-border pt-2 sm:border-t-0 sm:pt-0 flex-wrap">
                            {/* Toggle Dettaglio Serie Differenziate */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleSetDetails(ex.id)}
                              className={`h-8 px-2 text-xs gap-1 ${
                                ((ex.set_details || ex.setDetails || []).length > 0)
                                  ? "text-amber-400 bg-amber-500/10 border border-amber-500/20" 
                                  : "text-muted-foreground hover:text-white"
                              }`}
                              title="Configura serie differenziate (es. 1ª al 90%, 2ª al 75%)"
                            >
                              <Zap className="h-3.5 w-3.5" />
                              <span className="hidden lg:inline">Serie</span>
                              {(ex.set_details || ex.setDetails || []).length > 0 && (
                                <span className="text-[10px] font-bold">({(ex.set_details || ex.setDetails).length})</span>
                              )}
                            </Button>

                            {/* Tasto Cicla Superserie */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cycleSupersetGroup(activeDay.id, ex.id, ex.superset_group || ex.supersetGroup)}
                              className={`h-8 px-2 text-xs gap-1 ${
                                (ex.superset_group || ex.supersetGroup)
                                  ? "text-purple-400 bg-purple-500/10 border border-purple-500/20 font-bold"
                                  : "text-muted-foreground hover:text-white"
                              }`}
                              title="Collega in superserie con l'esercizio successivo"
                            >
                              <Layers className="h-3.5 w-3.5" />
                              <span className="hidden xl:inline">Super</span>
                              {(ex.superset_group || ex.supersetGroup) && (
                                <span className="text-[10px]">{ex.superset_group || ex.supersetGroup}</span>
                              )}
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openProgress(ex.exercise)}
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                              title="Progressi"
                              data-testid={`progress-${ex.id}`}
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExerciseExpand(ex.id)}
                              className={`h-8 w-8 p-0 ${ex.video_url ? "text-primary" : "text-muted-foreground hover:text-white"}`}
                              title="Link video esercizio"
                              data-testid={`toggle-video-${ex.id}`}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                            {user?.role === "coach" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveExercise(activeDay.id, exIndex, -1)}
                                  disabled={exIndex === 0}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-white disabled:opacity-20"
                                  title="Sposta su"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveExercise(activeDay.id, exIndex, 1)}
                                  disabled={exIndex === (activeDay.exercises || []).length - 1}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-white disabled:opacity-20"
                                  title="Sposta giù"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateExercise(activeDay.id, ex.id)}
                                  className="h-8 w-8 p-0 text-muted-foreground hover:text-white"
                                  title="Duplica esercizio"
                                  data-testid={`duplicate-exercise-${ex.id}`}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteExercise(activeDay.id, ex.id)}
                                  className="text-destructive hover:text-destructive h-8 w-8 p-0"
                                  data-testid={`delete-exercise-${ex.id}`}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Banner Superserie se assegnato */}
                        {(ex.superset_group || ex.supersetGroup) && (
                          <div className="bg-purple-950/20 border-t border-purple-500/30 px-3 py-1 flex items-center gap-2 text-[11px] text-purple-300">
                            <Layers className="h-3.5 w-3.5 text-purple-400" />
                            <span>
                              Collegato in <strong className="text-white">SUPERSET {ex.superset_group || ex.supersetGroup}</strong> (esegui questo esercizio e passa al successivo senza recupero)
                            </span>
                          </div>
                        )}

                        {/* Pannello Serie Differenziate (% e Reps per serie) */}
                        {expandedSetDetails[ex.id] && (
                          <SetDetailsBreakdown
                            exercise={ex}
                            onUpdateSetDetails={(details) => updateExerciseSetDetails(activeDay.id, ex.id, details)}
                            onOpenPlateCalc={(w) => {
                              setPlateCalcWeight(parseFloat(w) || 80);
                              setPlateCalcOpen(true);
                            }}
                          />
                        )}

                        {/* Athlete Feedback Field */}
                        <div className="bg-muted/10 border-t border-border p-2 sm:px-4 sm:py-2">
                          <Label className="text-[10px] uppercase font-bold text-sky-500 tracking-wider mb-1 block">Feedback Atleta</Label>
                          <Input
                            value={athleteFeedback[ex.id] !== undefined ? athleteFeedback[ex.id] : (ex.athlete_notes || ex.athleteNotes || "")}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAthleteFeedback(prev => ({ ...prev, [ex.id]: val }));
                              updateExercise(activeDay.id, ex.id, "athlete_notes", val);
                            }}
                            placeholder="Es: Ottime sensazioni, peso leggero..."
                            className="border-dashed border-sky-500/30 bg-transparent focus-visible:ring-sky-500/50 text-sm h-8"
                            data-testid={`athlete-feedback-input-${ex.id}`}
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
                {(Array.isArray(athletes) ? athletes : []).filter(a => (sheet?.athlete_ids || []).includes(a.id)).map(a => (
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
              Nessun video collegato ancora. Aggiungine uno dall'icona 🎥 su un esercizio.
            </p>
          ) : (
            <div className="border border-input rounded-md max-h-96 overflow-y-auto divide-y" data-testid="video-archive-list">
              {videoArchiveItems.map((item) => (
                <div key={item.exerciseId} className="flex items-center justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{item.exerciseName}</p>
                    <p className="text-xs text-muted-foreground">{item.weekLabel} · {item.dayName}</p>
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

      {/* Floating Mobile Start Workout Bar for Athletes */}
      {user?.role === "athlete" && activeDay && (
        <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 px-4 py-2 bg-gradient-to-t from-[#0c0e12] via-[#0c0e12]/95 to-transparent pointer-events-none">
          <Button
            onClick={() => navigate(`/workout/${sheetId}?weekId=${activeWeekId || ''}&dayId=${activeDayId || ''}`)}
            className="w-full pointer-events-auto premium-button-primary rounded-2xl py-3.5 text-xs font-black shadow-2xl shadow-emerald-500/40 flex items-center justify-center gap-2"
            data-testid="floating-start-workout-btn"
          >
            <Play className="h-4 w-4 fill-current text-zinc-950" />
            Avvia Workout ({activeDay.name || "Sessione"})
          </Button>
        </div>
      )}

      {/* Modal Calcolatore Piastre */}
      {plateCalcOpen && (
        <PlateCalculatorModal
          open={plateCalcOpen}
          onOpenChange={setPlateCalcOpen}
          initialWeight={plateCalcWeight}
        />
      )}

      {/* Modal Integrazione Wearable / Smartwatch */}
      {wearableOpen && (
        <WearableIntegrationModal
          open={wearableOpen}
          onOpenChange={setWearableOpen}
          sheetTitle={sheet?.title || "Scheda di Allenamento"}
          exercises={activeDay?.exercises || []}
        />
      )}

      {/* Modal Analisi Volume Settimanale */}
      {volumeModalOpen && (
        <VolumeAnalysisModal
          open={volumeModalOpen}
          onOpenChange={setVolumeModalOpen}
          week={activeWeek}
        />
      )}

      {/* Modal Condivisione WhatsApp e PDF */}
      {shareModalOpen && (
        <ShareSheetModal
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          sheet={sheet}
          athletes={athletes}
        />
      )}
    </div>
  );
};

// Sheet History
export default SheetEditor;

