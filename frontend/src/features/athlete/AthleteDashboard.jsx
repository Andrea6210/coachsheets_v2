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
  Flame, 
  MessageSquare, 
  Plus, 
  Scale, 
  BookOpen,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { useAuth, API } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

export default function AthleteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickWeight, setQuickWeight] = useState("");
  
  // Real user weight logs initialized from localStorage (default empty)
  const [weightLogs, setWeightLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(`coachsheets_weight_logs_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // State for Workout Launch Modal (Week / Day Selection)
  const [selectedSheetForWorkout, setSelectedSheetForWorkout] = useState(null);
  const [selectedWeekId, setSelectedWeekId] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [workoutModalOpen, setWorkoutModalOpen] = useState(false);

  // Weekly calendar schedule overview (current week)
  const [currentWeekSchedule] = useState([
    { day: "Lun", date: "16 Set", status: "Completato", workout: "Upper Body Forza" },
    { day: "Mar", date: "17 Set", status: "Riposo", workout: "-" },
    { day: "Mer", date: "18 Set", status: "Completato", workout: "Lower Body Ipertrofia" },
    { day: "Gio", date: "19 Set", status: "Riposo", workout: "-" },
    { day: "Ven", date: "20 Set", status: "In Programma", workout: "Push / Pull" },
    { day: "Sab", date: "21 Set", status: "In Programma", workout: "Richiamo Braccia" },
    { day: "Dom", date: "22 Set", status: "Riposo", workout: "-" },
  ]);

  // Muscle Fatigue Map data
  const muscleFatigue = [
    { name: "Petto", level: "Recuperato", percent: 100, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { name: "Dorso", level: "In Recupero", percent: 70, color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
    { name: "Gambe", level: "Recuperato", percent: 90, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { name: "Spalle", level: "Recuperato", percent: 100, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { name: "Bicipiti", level: "In Recupero", percent: 65, color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
    { name: "Tricipiti", level: "Recuperato", percent: 95, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { name: "Core", level: "Recuperato", percent: 100, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  ];

  useEffect(() => {
    fetchSheets();
  }, []);

  const fetchSheets = async () => {
    try {
      const res = await axios.get(`${API}/sheets`);
      setSheets(res.data);
    } catch (e) {
      toast.error("Errore nel caricamento delle schede");
    } finally {
      setLoading(false);
    }
  };

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
  const completedWorkoutsThisWeek = currentWeekSchedule.filter(s => s.status === "Completato").length;

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
              Bentornato, {user?.name || "Atleta"} <span className="glow-text">⚡</span>
            </h1>
            <p className="text-sm text-zinc-300">
              Controlla la tua programmazione settimanale, registra il tuo peso ed avvia il workout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => navigate(`/chat/${coachRecipientId}`)}
              variant="outline"
              className="bg-zinc-900 border-zinc-700 text-zinc-200 hover:bg-zinc-800 hover:text-white gap-2 rounded-2xl text-xs font-bold"
            >
              <MessageSquare className="h-4 w-4 text-sky-400" />
              Chat Coach
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
                  className="bg-zinc-900/90 border border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-5 transition-all hover:bg-zinc-900 flex flex-col justify-between group shadow-xl hover:shadow-emerald-500/10"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20">
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

                  <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                    <Button
                      onClick={() => navigate(`/sheet/${sheet.id}`)}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-zinc-400 hover:text-white font-medium"
                    >
                      Dettagli Scheda
                    </Button>
                    <Button
                      onClick={() => openWorkoutLaunchModal(sheet)}
                      size="sm"
                      className="premium-button-primary gap-1.5 rounded-xl px-4 py-2 text-xs font-black shadow-lg shadow-emerald-500/25"
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
                  <p className="text-xs text-zinc-400">Stato degli allenamenti di questa settimana</p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                {completedWorkoutsThisWeek} / 3 Sessioni Completate
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
                      ? "bg-zinc-950 border-sky-500/40 text-sky-300"
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
                      <span className="inline-block text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">
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
              <span className="p-2 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
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
              <Button type="submit" size="sm" className="bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black rounded-xl text-xs shrink-0">
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

        {/* Muscle Fatigue & Recovery Visualizer Map */}
        <div className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Activity className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Stato di Recupero Muscolare</h3>
                <p className="text-xs text-zinc-400">Stima del recupero muscolare per gruppo muscolare</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {muscleFatigue.map((m) => (
              <div key={m.name} className="bg-zinc-950/80 border border-zinc-800/80 p-3 rounded-2xl space-y-2 text-center">
                <p className="text-xs font-bold text-white">{m.name}</p>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${m.percent >= 80 ? 'bg-emerald-400' : m.percent >= 50 ? 'bg-sky-400' : 'bg-rose-500'}`}
                    style={{ width: `${m.percent}%` }}
                  />
                </div>
                <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border ${m.color}`}>
                  {m.level}
                </span>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Workout Launch Modal (Choose Week & Day before starting) */}
      <Dialog open={workoutModalOpen} onOpenChange={setWorkoutModalOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-3xl max-w-lg p-6">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Dumbbell className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle className="text-lg font-black text-white">
                  Seleziona Sessione di Allenamento
                </DialogTitle>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Scegli la settimana ed il giorno per avviare il workout guidato
                </p>
              </div>
            </div>
          </DialogHeader>

          {selectedSheetForWorkout && (
            <div className="space-y-5 py-3">
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
                <div className="space-y-1.5">
                  {(activeWeekInModal?.days || [{ id: 'd1', name: 'Giorno 1 - Upper Body', exercises: [] }]).map((day) => (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDayId(day.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left border ${
                        selectedDayId === day.id
                          ? "bg-zinc-900 border-emerald-500/60 text-white shadow-md shadow-emerald-500/10"
                          : "bg-zinc-900/60 border-zinc-800/80 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                      }`}
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{day.name || "Giorno"}</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                          {day.exercises?.length || 0} Esercizi in programma
                        </p>
                      </div>
                      <ChevronRight className={`h-4 w-4 ${selectedDayId === day.id ? 'text-emerald-400' : 'text-zinc-600'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview of exercises for selected day */}
              {activeDayInModal && activeDayInModal.exercises && activeDayInModal.exercises.length > 0 && (
                <div className="bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl space-y-2">
                  <p className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Esercizi in questa sessione:</p>
                  <div className="flex flex-wrap gap-1">
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

          <DialogFooter>
            <Button
              onClick={handleStartGuidedWorkout}
              className="w-full premium-button-primary rounded-2xl text-sm font-black py-3 shadow-xl shadow-emerald-500/25"
            >
              <Play className="h-4 w-4 mr-2 fill-current" /> Avvia Sessione Guidata
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
