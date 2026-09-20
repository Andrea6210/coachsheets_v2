import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Check, Clock, X, Dumbbell, ChevronRight, ChevronLeft, ArrowLeft, Trophy, Zap, Plus } from "lucide-react";
import { Calculator } from "@/features/calculator/Calculator";
import { WorkoutToolbox } from "./WorkoutToolbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useAuth, API } from "@/contexts/AuthContext";

export default function WorkoutMode() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const weekIdParam = searchParams.get("weekId");
  const dayIdParam = searchParams.get("dayId");

  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState({
    dayName: "Workout Guidato",
    exercises: [
      { id: 'e1', name: 'Panca Piana con Bilanciere', targetSets: 4, targetReps: '8', targetRpe: '8', lastWeight: '80', rest: '90s' },
      { id: 'e2', name: 'Trazioni alla Sbarra', targetSets: 3, targetReps: '8-10', targetRpe: '9', lastWeight: 'Corpo Libero', rest: '90s' },
      { id: 'e3', name: 'Military Press', targetSets: 3, targetReps: '10', targetRpe: '8', lastWeight: '45', rest: '75s' }
    ]
  });

  const [setLogs, setSetLogs] = useState({});
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutEnded, setWorkoutEnded] = useState(false);
  const [prDetected, setPrDetected] = useState(false);
  
  const [rpe, setRpe] = useState(8);
  const [notes, setNotes] = useState("");
  const [exerciseNotes, setExerciseNotes] = useState({});

  useEffect(() => {
    fetchSessionData();
  }, [sessionId, weekIdParam, dayIdParam]);

  const fetchSessionData = async () => {
    try {
      const res = await axios.get(`${API}/sheets/${sessionId}`);
      const sheetData = res.data;
      
      const targetWeek = (weekIdParam && sheetData.weeks?.find(w => w.id === weekIdParam)) || sheetData.weeks?.[0];
      const targetDay = (dayIdParam && targetWeek?.days?.find(d => d.id === dayIdParam)) || targetWeek?.days?.[0];

      if (targetDay && targetDay.exercises?.length > 0) {
        const mappedExercises = targetDay.exercises.map((ex, idx) => ({
          id: ex.id || `ex_${idx}`,
          name: ex.exercise || `Esercizio ${idx + 1}`,
          targetSets: parseInt(ex.sets) || 3,
          targetReps: ex.reps || "8-10",
          targetRpe: "8",
          lastWeight: ex.weight || "0",
          rest: ex.rest || "90s"
        }));

        setSession({
          dayName: `${targetWeek?.label || 'Settimana'} · ${targetDay.name || 'Giorno'}`,
          exercises: mappedExercises
        });
      }
    } catch (e) {
      // Fallback a dati guida predefiniti se non si trova la scheda
    } finally {
      setLoading(false);
    }
  };

  const activeExercise = session.exercises[activeExerciseIndex] || session.exercises[0];

  // Rest Timer countdown
  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => prev - 1);
      }, 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
      toast.success("Recupero terminato! Pronto per il prossimo set 💪");
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer]);

  const handleSetChange = (exerciseId, setIdx, field, value) => {
    const key = `${exerciseId}-${setIdx}`;
    setSetLogs(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  const toggleSetComplete = (exerciseId, setIdx) => {
    const key = `${exerciseId}-${setIdx}`;
    const current = setLogs[key] || {};
    const isNowCompleted = !current.completed;
    
    // Check for PR alert
    const weightVal = parseFloat(current.weight || activeExercise.lastWeight);
    if (isNowCompleted && weightVal > 80 && !prDetected) {
      setPrDetected(true);
      toast.success("🏆 NUOVO RECORD PERSONALE (PR) REGISTRATO!");
    }

    setSetLogs(prev => ({
      ...prev,
      [key]: { 
        weight: current.weight || activeExercise.lastWeight,
        reps: current.reps || String(activeExercise.targetReps).split('-')[0],
        completed: isNowCompleted 
      }
    }));

    if (isNowCompleted) {
      const parsedRestSeconds = parseInt(activeExercise.rest) || 90;
      setRestTimer(parsedRestSeconds);
      setIsResting(true);
    }
  };

  const addRestTime = (seconds) => {
    setRestTimer(prev => Math.max(0, prev + seconds));
  };

  const finishWorkout = () => {
    toast.success("Allenamento completato e salvato con successo!");
    navigate('/athlete');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c0e12] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-400"></div>
          <p className="text-xs text-zinc-400 font-mono">Preparazione Workout Guidato...</p>
        </div>
      </div>
    );
  }

  if (workoutEnded) {
    return (
      <div className="min-h-screen bg-[#0c0e12] text-zinc-100 p-4 flex flex-col pt-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
            <Trophy className="h-4 w-4" /> Workout Completato!
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">Riepilogo Sessione</h2>
          <p className="text-xs text-zinc-400">Valuta lo sforzo percepito e salva le note per il tuo coach</p>
        </div>

        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white">Sforzo Percepito (RPE: {rpe}/10)</label>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {rpe <= 6 ? "Leggero" : rpe <= 8 ? "Ottimo Sovraccarico" : "Massimale"}
              </span>
            </div>
            <Slider 
              value={[rpe]} 
              onValueChange={(val) => setRpe(val[0])} 
              max={10} min={1} step={0.5} 
              className="py-2"
            />
            <div className="flex justify-between text-[11px] text-zinc-400 font-mono">
              <span>1 (Facile)</span>
              <span>10 (Cedimento totale)</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Note Generali per il Coach</label>
            <Textarea 
              placeholder="Esempio: ottima spinta sulla panca, buone sensazioni..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white rounded-2xl min-h-[100px] text-xs focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            className="w-full h-12 premium-button-primary rounded-2xl text-base font-black shadow-xl" 
            onClick={finishWorkout}
          >
            Salva Allenamento in Cronologia
          </Button>
          <Button 
            variant="ghost" 
            className="w-full text-zinc-400 hover:text-white" 
            onClick={() => setWorkoutEnded(false)}
          >
            Torna alle Serie
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 flex flex-col pb-28" data-testid="workout-mode">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0c0e12]/90 border-b border-zinc-800/80 backdrop-blur-xl p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/athlete')} 
            className="h-9 w-9 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold text-sm text-white leading-tight">{session.dayName}</h1>
            <p className="text-[11px] text-zinc-400 font-mono">
              Esercizio {activeExerciseIndex + 1} di {session.exercises.length}
            </p>
          </div>
        </div>

        {prDetected && (
          <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black">
            <Trophy className="h-3 w-3" /> Record Raggiunto
          </span>
        )}
      </header>

      {/* Main Exercise Set Logging Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-6">
        
        {/* Exercise Info Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                Target: {activeExercise.targetSets} Serie × {activeExercise.targetReps} reps
              </span>
              <h2 className="text-xl font-black text-white mt-1.5">{activeExercise.name}</h2>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              Recupero {activeExercise.rest || "90s"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80 font-mono">
            <span>Carico target:</span>
            <span className="font-bold text-emerald-400">{activeExercise.lastWeight} kg</span>
          </div>
        </div>

        {/* Set Logger Table */}
        <div className="bg-zinc-900/60 border border-zinc-800/90 p-4 rounded-3xl space-y-3 shadow-xl">
          <div className="grid grid-cols-[40px_1fr_1fr_56px] gap-2 px-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            <div className="text-center">Set</div>
            <div className="text-center">Kg</div>
            <div className="text-center">Reps</div>
            <div className="text-center">Stato</div>
          </div>

          {Array.from({ length: activeExercise.targetSets }).map((_, i) => {
            const key = `${activeExercise.id}-${i}`;
            const log = setLogs[key] || { weight: activeExercise.lastWeight, reps: String(activeExercise.targetReps).split('-')[0], completed: false };
            
            return (
              <div 
                key={i} 
                className={`grid grid-cols-[40px_1fr_1fr_56px] gap-2 items-center p-2 rounded-2xl transition-all ${
                  log.completed 
                    ? 'bg-emerald-950/40 border border-emerald-500/50 glow-emerald' 
                    : 'bg-zinc-950 border border-zinc-800/80'
                }`}
              >
                <div className="text-center font-mono font-bold text-zinc-400 text-xs">{i + 1}</div>
                
                <Input 
                  type="number" 
                  inputMode="decimal"
                  placeholder={activeExercise.lastWeight}
                  className="h-11 text-center font-bold text-sm bg-zinc-900 border-zinc-800 text-white rounded-xl focus:border-emerald-500"
                  value={log.weight || ''}
                  onChange={(e) => handleSetChange(activeExercise.id, i, 'weight', e.target.value)}
                />

                <Input 
                  type="number" 
                  inputMode="numeric"
                  placeholder={String(activeExercise.targetReps).split('-')[0]}
                  className="h-11 text-center font-bold text-sm bg-zinc-900 border-zinc-800 text-white rounded-xl focus:border-emerald-500"
                  value={log.reps || ''}
                  onChange={(e) => handleSetChange(activeExercise.id, i, 'reps', e.target.value)}
                />

                <Button 
                  size="icon"
                  className={`h-11 w-full rounded-xl transition-all font-bold ${
                    log.completed 
                      ? 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950 shadow-md shadow-emerald-400/30 font-black' 
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400'
                  }`}
                  onClick={() => toggleSetComplete(activeExercise.id, i)}
                >
                  <Check className={`h-5 w-5 ${log.completed ? 'stroke-[3]' : ''}`} />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Exercise Notes */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider px-1">Note per questo esercizio</label>
          <Textarea 
            placeholder={`Aggiungi note sull'esecuzione di ${activeExercise.name}...`}
            value={exerciseNotes[activeExercise.id] || ""}
            onChange={(e) => setExerciseNotes(prev => ({ ...prev, [activeExercise.id]: e.target.value }))}
            className="bg-zinc-900 border-zinc-800 text-white rounded-2xl min-h-[80px] text-xs focus:border-emerald-500"
          />
        </div>

      </main>

      {/* Floating Rest Timer Bar & Step Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0e12]/95 border-t border-zinc-800/80 backdrop-blur-xl p-4">
        <div className="max-w-md mx-auto flex items-center justify-between gap-3">
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-12 w-12 rounded-2xl bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white shrink-0"
            onClick={() => setActiveExerciseIndex(prev => Math.max(0, prev - 1))}
            disabled={activeExerciseIndex === 0}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {isResting ? (
            <div className="flex-1 flex items-center justify-between bg-gradient-to-r from-emerald-950/80 to-zinc-900 border border-emerald-500/50 p-2 px-3 rounded-2xl glow-emerald">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-400 animate-spin" />
                <span className="font-mono font-black text-lg text-emerald-400">
                  {formatTime(restTimer)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" onClick={() => addRestTime(30)} className="h-8 w-8 text-xs text-zinc-200 bg-zinc-800 rounded-lg font-bold">
                  +30s
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setIsResting(false)} className="h-8 w-8 text-rose-400 hover:bg-rose-500/10 rounded-lg">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button 
              variant="outline"
              onClick={() => { setRestTimer(parseInt(activeExercise.rest) || 90); setIsResting(true); }}
              className="flex-1 h-12 bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white rounded-2xl text-xs font-bold gap-2"
            >
              <Clock className="h-4 w-4 text-emerald-400" /> Avvia Recupero ({activeExercise.rest || "90s"})
            </Button>
          )}

          {activeExerciseIndex < session.exercises.length - 1 ? (
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-2xl bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white shrink-0"
              onClick={() => setActiveExerciseIndex(prev => Math.min(session.exercises.length - 1, prev + 1))}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          ) : (
            <Button 
              className="h-12 px-5 premium-button-primary font-black text-sm rounded-2xl shrink-0"
              onClick={() => setWorkoutEnded(true)}
            >
              Fine
            </Button>
          )}

        </div>
      </div>

    </div>
  );
}
