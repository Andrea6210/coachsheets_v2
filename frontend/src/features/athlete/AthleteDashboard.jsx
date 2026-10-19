import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  Dumbbell, 
  Play, 
  Activity, 
  MessageSquare, 
  Plus, 
  Scale, 
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Info
} from "lucide-react";
import { useAuth, API } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { classifyExerciseMuscle, getMuscleStyle } from "@/lib/muscleAnalytics";

export default function AthleteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickWeight, setQuickWeight] = useState("");
  
  const displayName = user?.name && user.name !== "Utente"
    ? user.name 
    : (user?.username || (user?.email ? user.email.split('@')[0] : "Atleta"));

  // Real user weight logs from localStorage
  const [weightLogs, setWeightLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(`coachsheets_weight_logs_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Real completed workout logs from localStorage and backend
  const [completedWorkouts, setCompletedWorkouts] = useState(() => {
    try {
      const saved = localStorage.getItem(`coachsheets_completed_workouts_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [muscleAnalytics, setMuscleAnalytics] = useState(null);
  const [analyticsView, setAnalyticsView] = useState("recovery"); // "recovery" | "volume"

  // State for Workout Launch Modal (Week / Day Selection)
  const [selectedSheetForWorkout, setSelectedSheetForWorkout] = useState(null);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      // Carica i workout salvati localmente (sia con ID utente che guest)
      let localWorkouts = [];
      try {
        const localKeys = [`coachsheets_completed_workouts_${user?.id}`, 'coachsheets_completed_workouts_guest'].filter(Boolean);
        const seenLocalIds = new Set();
        for (const k of localKeys) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              parsed.forEach(p => {
                if (p && p.id && !seenLocalIds.has(p.id)) {
                  seenLocalIds.add(p.id);
                  localWorkouts.push(p);
                }
              });
            }
          }
        }
      } catch {}

      const [sheetsRes, sessionsRes, analyticsRes] = await Promise.allSettled([
        axios.get(`${API}/sheets`, { headers }),
        axios.get(`${API}/workout-sessions`, { headers }),
        axios.get(`${API}/workout-sessions/analytics`, { headers })
      ]);

      if (sheetsRes.status === "fulfilled" && Array.isArray(sheetsRes.value.data)) {
        setSheets(sheetsRes.value.data);
      }
      
      let mergedWorkouts = [...localWorkouts];
      if (sessionsRes.status === "fulfilled" && Array.isArray(sessionsRes.value.data)) {
        const backendSessions = sessionsRes.value.data.map(s => {
          let totalSets = 0;
          let totalTonnage = 0;
          const trainedMuscleSet = new Set();
          const breakdown = {};

          // Supporta sia snake_case che camelCase dal backend Spring Boot
          const logs = s.exercise_logs || s.exerciseLogs || [];
          if (Array.isArray(logs)) {
            logs.forEach(el => {
              const exName = el.exercise_name || el.exerciseName || el.name;
              const muscle = classifyExerciseMuscle(exName)?.primary;
              if (muscle) trainedMuscleSet.add(muscle);

              const sets = el.sets || [];
              if (Array.isArray(sets)) {
                sets.forEach(st => {
                  const isDone = st.is_completed ?? st.isCompleted ?? false;
                  const reps = st.actual_reps ?? st.actualReps ?? st.reps ?? 0;
                  const weight = st.actual_weight ?? st.actualWeight ?? st.weight ?? 0;

                  if (isDone || reps > 0) {
                    totalSets += 1;
                    const t = weight * reps;
                    totalTonnage += t;
                    if (muscle) {
                      breakdown[muscle] = (breakdown[muscle] || 0) + 1;
                    }
                  }
                });
              }
            });
          }

          // Se il log del backend non ha dettagli completi, recupera dall'equivalente locale se presente
          const matchedLocal = localWorkouts.find(l => l.id === s.id);
          const finalSets = totalSets > 0 ? totalSets : (matchedLocal?.totalSets || 0);
          const finalTonnage = totalTonnage > 0 ? totalTonnage : (matchedLocal?.totalTonnage || 0);
          const finalTrainedMuscles = trainedMuscleSet.size > 0 
            ? Array.from(trainedMuscleSet) 
            : (matchedLocal?.trainedMuscles || matchedLocal?.trained_muscles || []);
          const finalBreakdown = Object.keys(breakdown).length > 0
            ? Object.entries(breakdown).map(([muscle, completedSets]) => ({
                muscle,
                completedSets,
                tonnageKg: 0,
                exercises: []
              }))
            : (matchedLocal?.muscleBreakdown || matchedLocal?.muscle_breakdown || []);

          const sessionDate = s.session_date || s.sessionDate || (s.created_at || s.createdAt || '').split('T')[0] || matchedLocal?.date || '';
          const timestamp = s.created_at || s.createdAt || s.completed_at || s.completedAt || matchedLocal?.timestamp || sessionDate;

          return {
            id: s.id,
            sheetId: s.sheet_id || s.sheetId || matchedLocal?.sheetId,
            dayName: s.day_name || s.dayName || matchedLocal?.dayName,
            date: sessionDate,
            timestamp: timestamp,
            rpe: s.day_feedback_rpe || s.dayFeedbackRpe || matchedLocal?.rpe,
            notes: s.day_feedback_sensations || s.dayFeedbackSensations || matchedLocal?.notes,
            totalSets: finalSets,
            totalTonnage: Math.round(finalTonnage),
            trainedMuscles: finalTrainedMuscles,
            muscleBreakdown: finalBreakdown
          };
        });

        const backendIds = new Set(backendSessions.map(b => b.id));
        mergedWorkouts = [...backendSessions, ...localWorkouts.filter(c => c && c.id && !backendIds.has(c.id))];
      }
      setCompletedWorkouts(mergedWorkouts);

      if (analyticsRes.status === "fulfilled" && analyticsRes.value.data) {
        const raw = analyticsRes.value.data;
        const normalizedAnalytics = {
          totalSessions: raw.total_sessions ?? raw.totalSessions ?? 0,
          grandTotalSets: raw.grand_total_sets ?? raw.grandTotalSets ?? 0,
          grandTotalTonnageKg: raw.grand_total_tonnage_kg ?? raw.grandTotalTonnageKg ?? 0,
          muscles: (raw.muscles || []).map(m => ({
            muscleGroup: m.muscle_group || m.muscleGroup || "Muscolo",
            totalSets: m.total_sets ?? m.totalSets ?? 0,
            totalReps: m.total_reps ?? m.totalReps ?? 0,
            totalTonnage: m.total_tonnage ?? m.totalTonnage ?? 0,
            recentSets7d: m.recent_sets_7d ?? m.recentSets7d ?? 0,
            recentSets30d: m.recent_sets_30d ?? m.recentSets30d ?? 0,
            workoutsCount: m.workouts_count ?? m.workoutsCount ?? 0,
            lastTrainedDate: m.last_trained_date || m.lastTrainedDate || null,
            recoveryStatus: m.recovery_status || m.recoveryStatus || "Recuperato",
            recoveryPercent: m.recovery_percent ?? m.recoveryPercent ?? 100,
            badgeColor: m.badge_color || m.badgeColor || "emerald"
          }))
        };
        setMuscleAnalytics(normalizedAnalytics);
      }
    } catch (e) {
      console.warn("Errore caricamento dati atleta:", e);
    } finally {
      setLoading(false);
    }
  };

  // Costruzione della programmazione settimanale basandosi sui dati reali
  const getCurrentWeekSchedule = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 is Sun, 1 is Mon
    const distanceToMon = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + distanceToMon);
    monday.setHours(0, 0, 0, 0);

    const dayLabels = ["LUN", "MAR", "MER", "GIO", "VEN", "SAB", "DOM"];

    const activeSheet = sheets?.[0];
    const activeWeekDays = activeSheet?.weeks?.[0]?.days || [];

    return dayLabels.map((label, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const dateStr = d.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const isoStr = `${year}-${month}-${day}`;

      // Verifica se l'atleta ha completato un allenamento in questa data specifica
      const isDone = completedWorkouts.some(cw => {
        if (!cw) return false;
        const cwDate = cw.date || cw.session_date || cw.sessionDate || (cw.timestamp ? cw.timestamp.split('T')[0] : '') || (cw.created_at ? cw.created_at.split('T')[0] : '');
        return cwDate === isoStr || cw.dateStr === dateStr;
      });

      // Controlla se la scheda ha un giorno assegnato a questo giorno della settimana
      const isScheduledInSheet = Boolean(activeWeekDays.some((dayObj, dIdx) => {
        const nameUpper = (dayObj?.name || "").toUpperCase();
        if (nameUpper.includes(label)) return true;
        if (activeWeekDays.length > 0 && dIdx === index && activeWeekDays.length <= 4) {
          return true;
        }
        return false;
      }));

      let status = "Riposo";
      if (isDone) {
        status = "Completato";
      } else if (isScheduledInSheet) {
        status = "In Programma";
      }

      return {
        day: label,
        date: dateStr,
        status: status
      };
    });
  };

  const currentWeekSchedule = getCurrentWeekSchedule();
  const completedWorkoutsThisWeek = currentWeekSchedule.filter(s => s.status === "Completato").length;

  // Calcolo recupero muscolare dinamico reale basato esclusivamente sugli allenamenti svolti (ultime 48 ore)
  const computeMuscleRecovery = () => {
    const muscles = [
      { name: "Petto", group: "Petto" },
      { name: "Dorso", group: "Dorso" },
      { name: "Gambe", group: "Gambe" },
      { name: "Spalle", group: "Spalle" },
      { name: "Bicipiti", group: "Bicipiti" },
      { name: "Tricipiti", group: "Tricipiti" },
      { name: "Core", group: "Core" }
    ];

    const now = Date.now();
    const recentWorkouts = completedWorkouts.filter(w => {
      const dateVal = w.timestamp || w.created_at || w.completed_at || w.date || w.session_date;
      if (!dateVal) return false;
      const wTime = new Date(dateVal).getTime();
      // Nelle ultime 48 ore (con tolleranza di 12 ore per fuso orario UTC vs locale)
      return !isNaN(wTime) && (now - wTime) < (48 * 3600 * 1000) && (now - wTime) >= -(12 * 3600 * 1000);
    });

    const trainedGroups = new Set();
    recentWorkouts.forEach(w => {
      if (Array.isArray(w.trainedMuscles)) {
        w.trainedMuscles.forEach(m => trainedGroups.add(m));
      }
      if (Array.isArray(w.trained_muscles)) {
        w.trained_muscles.forEach(m => trainedGroups.add(m));
      }
      if (Array.isArray(w.muscleBreakdown)) {
        w.muscleBreakdown.forEach(mb => {
          if (mb.muscle) trainedGroups.add(mb.muscle);
        });
      }
      if (Array.isArray(w.muscle_breakdown)) {
        w.muscle_breakdown.forEach(mb => {
          if (mb.muscle) trainedGroups.add(mb.muscle);
        });
      }
      const logs = w.exerciseLogs || w.exercise_logs;
      if (Array.isArray(logs)) {
        logs.forEach(el => {
          const exName = el.name || el.exerciseName || el.exercise_name;
          const classification = classifyExerciseMuscle(exName);
          if (classification?.primary) trainedGroups.add(classification.primary);
          if (Array.isArray(classification?.secondary)) {
            classification.secondary.forEach(s => trainedGroups.add(s));
          }
        });
      }
    });

    const hasAnyWorkoutsEver = completedWorkouts.length > 0;

    const isGroupRecovering = (groupName) => {
      if (groupName === "Gambe") {
        return trainedGroups.has("Gambe") || trainedGroups.has("Quadricipiti") || 
               trainedGroups.has("Catena Posteriore") || trainedGroups.has("Polpacci");
      }
      if (groupName === "Core") {
        return trainedGroups.has("Core") || trainedGroups.has("Addome / Core");
      }
      return trainedGroups.has(groupName);
    };

    return muscles.map(m => {
      const isRecovering = isGroupRecovering(m.group);
      if (isRecovering) {
        return {
          name: m.name,
          level: "In Recupero",
          percent: 65,
          color: "text-amber-400 bg-amber-500/10 border-amber-500/30"
        };
      }
      if (!hasAnyWorkoutsEver) {
        return {
          name: m.name,
          level: "Pronto",
          percent: 100,
          color: "text-zinc-400 bg-zinc-900 border-zinc-800"
        };
      }
      return {
        name: m.name,
        level: "Recuperato",
        percent: 100,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
      };
    });
  };

  const muscleFatigue = computeMuscleRecovery();

  const openWorkoutLaunchModal = (sheet) => {
    setSelectedSheetForWorkout(sheet);
    const firstWeek = sheet.weeks?.[0];
    const firstDay = firstWeek?.days?.[0];
    setSelectedWeekId(firstWeek?.id || null);
    setSelectedDayId(firstDay?.id || null);
    setWorkoutModalOpen(true);
  };

  const handleStartGuidedWorkout = () => {
    if (!selectedSheetForWorkout) return;
    const url = `/workout/${selectedSheetForWorkout.id}?weekId=${selectedWeekId || ''}&dayId=${selectedDayId || ''}`;
    setWorkoutModalOpen(false);
    navigate(url);
  };

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!quickWeight || isNaN(quickWeight)) {
      toast.error("Inserisci un peso valido (es. 74.5)");
      return;
    }
    const todayStr = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    const newEntry = { id: Date.now(), date: todayStr, weight: parseFloat(quickWeight) };
    const updated = [newEntry, ...weightLogs.filter(w => w.date !== todayStr)];
    setWeightLogs(updated);
    try {
      localStorage.setItem(`coachsheets_weight_logs_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch {}
    setQuickWeight("");
    toast.success("Peso registrato correttamente!");
  };

  const handleDeleteWeight = (id) => {
    const updated = weightLogs.filter(w => w.id !== id);
    setWeightLogs(updated);
    try {
      localStorage.setItem(`coachsheets_weight_logs_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch {}
    toast.success("Rilevamento rimosso");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0e12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          <p className="text-xs text-zinc-400 font-mono">Caricamento CoachSheets...</p>
        </div>
      </div>
    );
  }

  const coachRecipientId = user?.coach_id || user?.coachId || "coach";
  const activeWeekInModal = selectedSheetForWorkout?.weeks?.find(w => w.id === selectedWeekId) || selectedSheetForWorkout?.weeks?.[0];
  const activeDayInModal = activeWeekInModal?.days?.find(d => d.id === selectedDayId) || activeWeekInModal?.days?.[0];

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 pb-20 md:pb-8">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-emerald-500/20 p-6 rounded-3xl shadow-2xl glow-emerald">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Atleta Attivo
              </span>
              <span className="text-xs text-zinc-400 font-mono">CoachSheets Platform</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              Bentornato, {displayName} <span className="glow-text">⚡</span>
            </h1>
            <p className="text-sm text-zinc-300">
              Controlla la tua programmazione settimanale, registra il tuo peso ed avvia il workout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {sheets.length > 0 && (
              <Button
                onClick={() => openWorkoutLaunchModal(sheets[0])}
                className="w-full sm:w-auto premium-button-primary gap-2 rounded-2xl text-xs sm:text-sm font-black py-2.5 px-5 shadow-xl shadow-emerald-500/25 flex items-center justify-center"
                data-testid="hero-start-workout-btn"
              >
                <Play className="h-4 w-4 fill-current text-zinc-950" />
                Avvia Allenamento
              </Button>
            )}
            <Button
              onClick={() => navigate(`/chat/${coachRecipientId}`)}
              variant="outline"
              className="bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white gap-2 rounded-2xl text-xs font-bold"
            >
              <MessageSquare className="h-4 w-4 text-emerald-400" />
              Chat Coach
            </Button>
            <Button
              onClick={() => navigate("/atleta-profilo")}
              variant="outline"
              className="bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white gap-2 rounded-2xl text-xs font-bold"
            >
              <Activity className="h-4 w-4 text-emerald-400" />
              Profilo Atleta
            </Button>
            <Button
              onClick={() => navigate("/esercizi")}
              variant="outline"
              className="bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white gap-2 rounded-2xl text-xs font-bold"
            >
              <BookOpen className="h-4 w-4 text-emerald-400" />
              Libreria Esercizi
            </Button>
          </div>
        </div>

        {/* Workout Sheets Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 glow-emerald">
                <Dumbbell className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Le Mie Schede di Allenamento</h2>
                <p className="text-xs text-zinc-400">Piani creati dal tuo coach ed assegnati a te</p>
              </div>
            </div>
          </div>

          {sheets.length === 0 ? (
            <Card className="bg-zinc-900/60 border-zinc-800 text-center py-12 rounded-3xl">
              <CardContent className="space-y-3">
                <Dumbbell className="h-10 w-10 mx-auto text-zinc-600" />
                <h3 className="text-base font-bold text-zinc-300">Nessuna scheda ancora assegnata</h3>
                <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                  Il tuo coach preparerà presto la tua prima scheda personalizzata. Puoi contattarlo in chat per informazioni.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sheets.map((sheet) => (
                <div
                  key={sheet.id}
                  onClick={() => navigate(`/sheet/${sheet.id}`)}
                  className="bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-5 transition-all hover:bg-zinc-900 flex flex-col justify-between group shadow-xl hover:shadow-emerald-500/10 cursor-pointer"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Scheda Attiva
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono font-bold">
                        {sheet.weeks?.length || 1} Settimane
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors">
                      {sheet.title}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      {sheet.weeks?.reduce((sum, w) => sum + (w.days?.length || 0), 0) || 0} sessioni totali in programma
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-zinc-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/sheet/${sheet.id}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="text-xs bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:text-white font-medium rounded-xl h-10 order-2 sm:order-1"
                      data-testid={`card-details-${sheet.id}`}
                    >
                      Dettagli Scheda
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        openWorkoutLaunchModal(sheet);
                      }}
                      size="sm"
                      className="premium-button-primary gap-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-lg shadow-emerald-500/25 h-10 flex items-center justify-center order-1 sm:order-2"
                      data-testid={`card-start-workout-${sheet.id}`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" /> Inizia Workout
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Calendar Weekly Activity Overview & Real Weight Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Clear Weekly Calendar Schedule Overview */}
          <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CalendarIcon className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Programmazione Settimanale</h3>
                  <p className="text-xs text-zinc-400">Stato reale degli allenamenti di questa settimana</p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                {completedWorkoutsThisWeek} Sessioni Completate
              </span>
            </div>

            {/* Clear 7-Day Weekly Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 pt-2">
              {currentWeekSchedule.map((item) => (
                <div
                  key={item.day}
                  className={`p-3 rounded-2xl border flex flex-col justify-between space-y-2 text-center transition-all ${
                    item.status === "Completato"
                      ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-md shadow-emerald-500/10"
                      : item.status === "In Programma"
                      ? "bg-zinc-950 border-emerald-500/30 text-emerald-400"
                      : "bg-zinc-950/60 border-zinc-800/80 text-zinc-500"
                  }`}
                >
                  <div>
                    <span className="text-xs font-black uppercase block">{item.day}</span>
                    <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">{item.date}</span>
                  </div>

                  <div className="py-1">
                    {item.status === "Completato" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> Fatto
                      </span>
                    ) : item.status === "In Programma" ? (
                      <span className="inline-block text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                        Workout
                      </span>
                    ) : (
                      <span className="inline-block text-[10px] font-medium text-zinc-500">
                        Riposo
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real Personal Weight Tracker (No Dummy Data) */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Scale className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Registro Peso Corporeo</h3>
                <p className="text-xs text-zinc-400">Inserisci e traccia i tuoi rilevamenti reali</p>
              </div>
            </div>

            <form onSubmit={handleAddWeight} className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="es. 75.0"
                value={quickWeight}
                onChange={(e) => setQuickWeight(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white rounded-xl text-xs focus:border-emerald-500"
              />
              <Button type="submit" size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black rounded-xl text-xs shrink-0">
                <Plus className="h-4 w-4" /> Log
              </Button>
            </form>

            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">I Tuoi Rilevamenti</p>
              
              {weightLogs.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Nessun peso ancora registrato.<br />
                    <span className="text-emerald-400 font-semibold">Inserisci il tuo peso qui sopra</span> per iniziare la tua cronologia personale.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {weightLogs.map((w) => (
                    <div key={w.id || w.date} className="flex items-center justify-between text-xs bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
                      <span className="text-zinc-400">{w.date}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400 font-mono">{w.weight} kg</span>
                        <button
                          onClick={() => handleDeleteWeight(w.id)}
                          className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                          title="Rimuovi"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Muscle Fatigue & Real Truthful Analytics Visualizer Map */}
        <div className="bg-zinc-900/90 border border-zinc-800/90 p-5 sm:p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Analisi Muscolare & Recupero Reale</h3>
                <p className="text-xs text-zinc-400">Dati veritieri registrati dalle sessioni svolte in Workout Guidato</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-zinc-950 rounded-2xl border border-zinc-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setAnalyticsView("recovery")}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  analyticsView === "recovery"
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Mappa Recupero (48h)
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsView("volume")}
                className={`px-3 py-1 text-xs font-bold rounded-xl transition-all ${
                  analyticsView === "volume"
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Volume & Carichi Reali
              </button>
            </div>
          </div>

          {analyticsView === "recovery" ? (
            <div className="space-y-3 pt-1">
              {completedWorkouts.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 space-y-2">
                  <Activity className="h-8 w-8 mx-auto text-zinc-600" />
                  <p className="text-xs font-bold text-zinc-300">Nessun affaticamento muscolare registrato</p>
                  <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                    La mappa dei gruppi muscolari e il tempo di recupero (48h) si aggiorneranno in tempo reale al completamento del tuo primo workout.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                    {muscleFatigue.map((m) => (
                      <div key={m.name} className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-2xl space-y-2 text-center">
                        <p className="text-xs font-bold text-white">{m.name}</p>
                        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${m.percent >= 80 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            style={{ width: `${m.percent}%` }}
                          />
                        </div>
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${m.color}`}>
                          {m.level}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-zinc-500 text-center italic pt-1">
                    Lo stato si aggiorna automaticamente in base ai distretti muscolari realmente allenati.
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              {/* Summary KPIs */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Sessioni Registrate</span>
                  <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                    {muscleAnalytics?.totalSessions ?? completedWorkouts.length}
                  </span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Serie Svolte Reali</span>
                  <span className="text-base sm:text-lg font-black text-sky-400 font-mono">
                    {muscleAnalytics?.grandTotalSets ?? completedWorkouts.reduce((acc, w) => acc + (w.totalSets || 0), 0)}
                  </span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-center">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase block">Tonnellaggio Reale</span>
                  <span className="text-base sm:text-lg font-black text-amber-400 font-mono">
                    {muscleAnalytics?.grandTotalTonnageKg?.toLocaleString() ?? 
                      completedWorkouts.reduce((acc, w) => acc + (w.totalTonnage || 0), 0).toLocaleString()} kg
                  </span>
                </div>
              </div>

              {/* Muscle Details List */}
              {(() => {
                const totalSessions = muscleAnalytics?.totalSessions ?? completedWorkouts.length;
                const totalSets = muscleAnalytics?.grandTotalSets ?? completedWorkouts.reduce((acc, w) => acc + (w.totalSets || 0), 0);
                const filteredMuscles = (muscleAnalytics?.muscles || []).filter(m => (m.totalSets || 0) > 0);

                if (totalSessions === 0 && totalSets === 0) {
                  return (
                    <div className="p-8 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 space-y-2">
                      <Activity className="h-8 w-8 mx-auto text-zinc-600" />
                      <p className="text-xs font-bold text-zinc-300">Nessun allenamento ancora registrato</p>
                      <p className="text-[11px] text-zinc-500 max-w-sm mx-auto">
                        I grafici di volume, le serie e il tonnellaggio muscolare si popoleranno in automatico in base ai tuoi allenamenti svolti.
                      </p>
                    </div>
                  );
                }

                if (filteredMuscles.length === 0 && completedWorkouts.length > 0) {
                  const localMuscleAgg = {};
                  completedWorkouts.forEach(w => {
                    const breakdown = w.muscleBreakdown || w.muscle_breakdown;
                    if (Array.isArray(breakdown)) {
                      breakdown.forEach(mb => {
                        if (mb && mb.muscle) {
                          if (!localMuscleAgg[mb.muscle]) {
                            localMuscleAgg[mb.muscle] = { sets: 0, tonnage: 0 };
                          }
                          localMuscleAgg[mb.muscle].sets += (mb.completedSets || 0);
                          localMuscleAgg[mb.muscle].tonnage += (mb.tonnageKg || 0);
                        }
                      });
                    }
                  });

                  const localList = Object.entries(localMuscleAgg).filter(([, data]) => data.sets > 0);
                  if (localList.length === 0) {
                    return (
                      <div className="p-6 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
                        <p className="text-xs text-zinc-400">Nessuna serie completata registrata nei workout svolti.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {localList.map(([muscleName, data]) => {
                        const style = getMuscleStyle(muscleName);
                        return (
                          <div key={muscleName} className="bg-zinc-950/80 border border-zinc-800/80 p-3.5 rounded-2xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${style.text}`}>{muscleName}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded border text-amber-400 bg-amber-500/10 border-amber-500/30">
                                In Recupero
                              </span>
                            </div>
                            <div className="flex items-baseline justify-between text-xs font-mono">
                              <span className="text-zinc-400">Serie totali: <strong className="text-white">{data.sets}</strong></span>
                              {data.tonnage > 0 && (
                                <span className="text-zinc-400">Kg: <strong className="text-amber-400">{Math.round(data.tonnage).toLocaleString()}</strong></span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                }

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredMuscles.map((m) => {
                      const style = getMuscleStyle(m.muscleGroup);
                      return (
                        <div key={m.muscleGroup} className="bg-zinc-950/80 border border-zinc-800/80 p-3.5 rounded-2xl space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${style.text}`}>{m.muscleGroup}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              m.badgeColor === 'amber' 
                                ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' 
                                : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                            }`}>
                              {m.recoveryStatus}
                            </span>
                          </div>
                          <div className="flex items-baseline justify-between text-xs font-mono">
                            <span className="text-zinc-400">Serie totali: <strong className="text-white">{m.totalSets}</strong></span>
                            <span className="text-zinc-400">Kg: <strong className="text-amber-400">{m.totalTonnage?.toLocaleString()}</strong></span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-900">
                            <span>Ultimi 7 gg: <strong className="text-emerald-400 font-mono">{m.recentSets7d} serie</strong></span>
                            <span>{m.lastTrainedDate ? `Ultimo: ${m.lastTrainedDate}` : 'Recente'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

      </main>

      {/* Workout Launch Modal (Choose Week & Day before starting) */}
      <Dialog open={workoutModalOpen} onOpenChange={setWorkoutModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-3xl w-[94vw] sm:max-w-lg max-h-[85dvh] flex flex-col p-0 overflow-hidden shadow-2xl z-[100]">
          <div className="p-5 sm:p-6 pb-3 border-b border-zinc-800/80 shrink-0">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Dumbbell className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <DialogTitle className="text-base sm:text-lg font-black text-white">
                    Seleziona Sessione di Allenamento
                  </DialogTitle>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Scegli la settimana ed il giorno per avviare il workout guidato
                  </p>
                </div>
              </div>
            </DialogHeader>
          </div>

          {selectedSheetForWorkout && (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* Select Week */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">1. Seleziona Settimana</label>
                <div className="flex flex-wrap gap-2">
                  {(selectedSheetForWorkout.weeks || [{ id: 'w1', label: 'Settimana 1' }]).map((week) => (
                    <button
                      key={week.id}
                      onClick={() => {
                        setSelectedWeekId(week.id);
                        setSelectedDayId(week.days?.[0]?.id || null);
                      }}
                      className={`text-xs px-3.5 py-2 rounded-xl transition-all font-bold ${
                        selectedWeekId === week.id
                          ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                          : "bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800"
                      }`}
                    >
                      {week.label || "Settimana"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Select Day */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">2. Seleziona Giorno di Allenamento</label>
                <div className="space-y-2">
                  {(activeWeekInModal?.days || [{ id: 'd1', name: 'Giorno 1 - Upper Body', exercises: [] }]).map((day) => (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDayId(day.id)}
                      className={`w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl transition-all text-left border ${
                        selectedDayId === day.id
                          ? "bg-zinc-900 border-emerald-500/60 text-white shadow-md shadow-emerald-500/10 ring-1 ring-emerald-500/30"
                          : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">{day.name || "Giorno"}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                          {day.exercises?.length || 0} Esercizi in programma
                        </p>
                      </div>
                      <ChevronRight className={`h-4 w-4 shrink-0 ${selectedDayId === day.id ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview of exercises for selected day */}
              {activeDayInModal && activeDayInModal.exercises && activeDayInModal.exercises.length > 0 && (
                <div className="bg-zinc-900/80 border border-zinc-800 p-3 sm:p-3.5 rounded-2xl space-y-2">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Esercizi in questa sessione:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {activeDayInModal.exercises.map((ex, idx) => (
                      <span key={idx} className="text-[11px] bg-zinc-950 text-emerald-400 px-2.5 py-1 rounded-lg border border-zinc-800 font-medium">
                        {ex.exercise || "Esercizio"} ({ex.sets || 3}x{ex.reps || 8})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="p-4 sm:p-5 border-t border-zinc-800 bg-zinc-950/95 sticky bottom-0 shrink-0">
            <Button
              onClick={handleStartGuidedWorkout}
              className="w-full premium-button-primary rounded-2xl text-sm font-black py-3.5 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2"
              data-testid="modal-start-workout-btn"
            >
              <Play className="h-4 w-4 mr-2 fill-current" /> Avvia Sessione Guidata
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
