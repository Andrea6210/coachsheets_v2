import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Check, Clock, X, Dumbbell, ChevronRight, ChevronLeft, ArrowLeft } from "lucide-react";
import { Calculator } from "@/features/calculator/Calculator";
import { WorkoutToolbox } from "./WorkoutToolbox";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { MessageSquare, Settings2 } from "lucide-react";

export default function WorkoutMode() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  
  // Dummy data for now. In real app, fetch from backend via sessionId
  const [session, setSession] = useState({
    dayName: "Giorno 1 - Upper Body",
    exercises: [
      { id: 'e1', name: 'Panca Piana', targetSets: 4, targetReps: '8', targetRpe: '8' },
      { id: 'e2', name: 'Trazioni', targetSets: 3, targetReps: '8-10', targetRpe: '9' }
    ]
  });

  // State to track completed sets: { "e1-set1": { weight: 80, reps: 8, completed: true } }
  const [setLogs, setSetLogs] = useState({});
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutEnded, setWorkoutEnded] = useState(false);
  
  // Feedback state
  const [rpe, setRpe] = useState(5);
  const [notes, setNotes] = useState("");
  const [dailyFeedback, setDailyFeedback] = useState("");
  const [exerciseFeedback, setExerciseFeedback] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  const activeExercise = session.exercises[activeExerciseIndex];

  // Timer logic
  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => prev - 1);
      }, 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
      // Suono o haptic feedback qui in futuro con Capacitor
      toast("Recupero terminato!");
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
    
    setSetLogs(prev => ({
      ...prev,
      [key]: { ...current, completed: isNowCompleted }
    }));

    if (isNowCompleted) {
      // Avvia timer recupero (es. 90 secondi)
      setRestTimer(90);
      setIsResting(true);
    }
  };

  const finishWorkout = () => {
    // In real app: invia setLogs e feedback al backend
    toast.success("Allenamento completato e salvato!");
    navigate('/athlete');
  };

  const endWorkoutTrigger = () => {
    setWorkoutEnded(true);
    setShowConfetti(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (workoutEnded) {
    return (
      <div className="min-h-screen premium-bg p-4 flex flex-col pt-12">
        <h2 className="text-2xl font-bold text-center mb-6 glow-text text-white">Com'è andata?</h2>
        <Card className="flex-1 glass-card text-slate-100">
          <CardContent className="pt-6 space-y-8">
            <div className="space-y-4">
              <label className="font-medium text-lg">Difficoltà (RPE: {rpe})</label>
              <Slider 
                value={[rpe]} 
                onValueChange={(val) => setRpe(val[0])} 
                max={10} min={1} step={0.5} 
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 (Facilissimo)</span>
                <span>10 (Massimale)</span>
              </div>
            </div>

            <div className="space-y-4">
              <label className="font-medium text-lg">Note Finali</label>
              <Textarea 
                placeholder="Note generali sull'allenamento (es. spalla sinistra ok oggi)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-4">
              <label className="font-medium text-lg">Feedback Giornaliero</label>
              <Textarea 
                placeholder="Sensazioni a caldo scritte durante il workout..."
                value={dailyFeedback}
                onChange={(e) => setDailyFeedback(e.target.value)}
                className="min-h-[100px] border-primary/50"
              />
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 space-y-4">
          <Button className="w-full h-14 text-lg premium-button-primary" onClick={finishWorkout}>Salva Allenamento</Button>
          <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" onClick={() => setWorkoutEnded(false)}>Torna indietro</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-24" data-testid="workout-mode">
      {/* Header Sticky */}
      <header className="sticky top-0 z-40 glass-card border-b-0 p-4 flex justify-between items-center text-slate-50">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/athlete')} className="shrink-0 hover:bg-white/10 text-slate-50">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-bold leading-tight">{session.dayName}</h1>
            <p className="text-sm text-muted-foreground">Esercizio {activeExerciseIndex + 1} di {session.exercises.length}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Calculator Icon */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 rounded-full">
                <Dumbbell className="h-4 w-4 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <Calculator />
            </DialogContent>
          </Dialog>

          {/* Toolbox Icon */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 rounded-full">
                <Settings2 className="h-4 w-4 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
              <WorkoutToolbox />
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 text-slate-50">
        <h2 className="text-3xl font-bold font-heading mb-2 drop-shadow-md">{activeExercise.name}</h2>
        <div className="flex gap-2 mb-6">
          <span className="px-2 py-1 bg-sky-500/20 border border-sky-500/30 text-sky-300 text-xs rounded-md font-medium">Obiettivo: {activeExercise.targetReps} reps</span>
          <span className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs rounded-md font-medium">RPE {activeExercise.targetRpe}</span>
        </div>

        <div className="space-y-3">
          {/* Header Righe */}
          <div className="grid grid-cols-[30px_1fr_1fr_60px] gap-2 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <div className="text-center">Set</div>
            <div>Kg</div>
            <div>Reps</div>
            <div className="text-center">Fatto</div>
          </div>

          {/* Righe dei Set */}
          {Array.from({ length: activeExercise.targetSets }).map((_, i) => {
            const key = `${activeExercise.id}-${i}`;
            const log = setLogs[key] || { weight: '', reps: '', completed: false };
            
            return (
              <div 
                key={i} 
                className={`grid grid-cols-[30px_1fr_1fr_60px] gap-2 items-center p-2 rounded-xl transition-all duration-300 ${
                  log.completed ? 'glass-card glow-blue' : 'glass-card'
                }`}
              >
                <div className="text-center font-mono font-bold text-slate-400">{i + 1}</div>
                <Input 
                  type="number" inputMode="decimal"
                  placeholder="Kg" 
                  className={`h-12 text-lg text-center font-bold bg-slate-900/50 border-slate-700/50 text-slate-100 ${log.completed && 'bg-transparent border-none shadow-none text-sky-300'}`}
                  value={log.weight}
                  onChange={(e) => handleSetChange(activeExercise.id, i, 'weight', e.target.value)}
                  disabled={log.completed}
                />
                <Input 
                  type="number" inputMode="numeric"
                  placeholder="Reps" 
                  className={`h-12 text-lg text-center font-bold bg-slate-900/50 border-slate-700/50 text-slate-100 ${log.completed && 'bg-transparent border-none shadow-none text-sky-300'}`}
                  value={log.reps}
                  onChange={(e) => handleSetChange(activeExercise.id, i, 'reps', e.target.value)}
                  disabled={log.completed}
                />
                <Button 
                  size="icon"
                  className={`h-12 w-full rounded-lg active-scale transition-colors ${log.completed ? 'bg-sky-500 hover:bg-sky-400 text-slate-900 shadow-[0_0_15px_rgba(56,189,248,0.5)]' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  onClick={() => toggleSetComplete(activeExercise.id, i)}
                >
                  <Check className={`h-6 w-6 ${log.completed ? 'text-slate-900' : ''}`} />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 space-y-3">
          <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider px-2">Note Esercizio</label>
          <Textarea 
            placeholder={`Scrivi qui note o sensazioni per ${activeExercise.name}...`}
            value={exerciseFeedback[activeExercise.id] || ""}
            onChange={(e) => setExerciseFeedback(prev => ({ ...prev, [activeExercise.id]: e.target.value }))}
            className="min-h-[100px] glass-card bg-transparent border-slate-700/50 focus-visible:ring-sky-500/50"
          />
        </div>
      </main>

      {/* Floating Timer & Navigation */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-transparent pt-12 pb-6 z-50">
        <div className="max-w-md mx-auto flex items-end justify-between gap-4">
          
          <Button 
            variant="outline" 
            size="icon" 
            className="h-14 w-14 rounded-full shrink-0 shadow-md glass-card text-white hover:bg-white/10 active-scale"
            onClick={() => setActiveExerciseIndex(prev => Math.max(0, prev - 1))}
            disabled={activeExerciseIndex === 0}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          {isResting ? (
            <Button 
              className="flex-1 h-16 rounded-2xl text-2xl font-bold font-mono premium-button-primary animate-pulse active-scale"
              onClick={() => setIsResting(false)}
            >
              <Clock className="h-6 w-6 mr-3" />
              {formatTime(restTimer)}
            </Button>
          ) : (
            <div className="flex-1 h-16"></div> /* Spaziatore vuoto */
          )}

          {activeExerciseIndex < session.exercises.length - 1 ? (
            <Button 
              size="icon" 
              className="h-14 w-14 rounded-full shrink-0 shadow-md glass-card text-white hover:bg-white/10 active-scale"
              onClick={() => setActiveExerciseIndex(prev => Math.min(session.exercises.length - 1, prev + 1))}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          ) : (
            <Button 
              className="h-14 px-6 rounded-full shrink-0 premium-button-primary active-scale font-bold text-lg"
              onClick={endWorkoutTrigger}
            >
              Fine
            </Button>
          )}

        </div>
      </div>
    </div>
  );
}
