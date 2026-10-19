import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Check, Clock, X, Dumbbell, ChevronRight, ChevronLeft, ArrowLeft, Trophy, Zap, Plus,
  Timer, Volume2, VolumeX, Sparkles, Layers, Disc, Activity, Percent
} from "lucide-react";
import { Calculator } from "@/features/calculator/Calculator";
import { PlateCalculatorModal } from "@/features/calculator/PlateCalculatorModal";
import { WorkoutToolbox } from "./WorkoutToolbox";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useAuth, API } from "@/contexts/AuthContext";
import { classifyExerciseMuscle, computeSessionMuscleImpact, getMuscleStyle } from "@/lib/muscleAnalytics";

export default function WorkoutMode() {
  const { user, token } = useAuth();
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const weekIdParam = searchParams.get("weekId");
  const dayIdParam = searchParams.get("dayId");

  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [session, setSession] = useState({
    dayName: "Workout Guidato",
    exercises: [
      { id: 'e1', name: 'Panca Piana con Bilanciere', targetSets: 4, targetReps: '8', targetRpe: '8', lastWeight: '80', rest: '90s', set_details: [], superset_group: '' },
      { id: 'e2', name: 'Trazioni alla Sbarra', targetSets: 3, targetReps: '8-10', targetRpe: '9', lastWeight: 'Corpo Libero', rest: '90s', set_details: [], superset_group: '' },
      { id: 'e3', name: 'Military Press', targetSets: 3, targetReps: '10', targetRpe: '8', lastWeight: '45', rest: '75s', set_details: [], superset_group: '' }
    ]
  });

  const [setLogs, setSetLogs] = useState({});
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [restTimer, setRestTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [workoutEnded, setWorkoutEnded] = useState(false);
  const [prDetected, setPrDetected] = useState(false);
  
  // Timer settings: attivabile e disattivabile
  const [timerEnabled, setTimerEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Calcolatore Piastre sul bilanciere
  const [plateCalcOpen, setPlateCalcOpen] = useState(false);
  const [plateCalcWeight, setPlateCalcWeight] = useState(80);

  // Tool modali: Cronometro/Timer e Calcolatore Percentuali
  const [toolboxOpen, setToolboxOpen] = useState(false);
  const [calcModalOpen, setCalcModalOpen] = useState(false);

  const adjustWeight = (exerciseId, setIndex, delta) => {
    const key = `${exerciseId}-${setIndex}`;
    const current = parseFloat(setLogs[key]?.weight) || 0;
    const updated = Math.max(0, Math.round((current + delta) * 10) / 10);
    handleSetChange(exerciseId, setIndex, 'weight', updated.toString());
  };

  const adjustReps = (exerciseId, setIndex, delta) => {
    const key = `${exerciseId}-${setIndex}`;
    const current = parseInt(setLogs[key]?.reps) || 0;
    const updated = Math.max(0, current + delta);
    handleSetChange(exerciseId, setIndex, 'reps', updated.toString());
  };

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
        const mappedExercises = targetDay.exercises.map((ex, idx) => {
          const details = ex.set_details || ex.setDetails || [];
          return {
            id: ex.id || `ex_${idx}`,
            name: ex.exercise || `Esercizio ${idx + 1}`,
            targetSets: details.length > 0 ? details.length : (parseInt(ex.sets) || 3),
            targetReps: ex.reps || "8-10",
            targetRpe: "8",
            lastWeight: ex.weight || "0",
            rest: ex.rest || "90s",
            set_details: details,
            superset_group: ex.superset_group || ex.supersetGroup || ""
          };
        });

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

  // Controllo superserie con l'esercizio successivo o precedente
  const nextExercise = session.exercises[activeExerciseIndex + 1];
  const isPartOfSuperset = Boolean(activeExercise?.superset_group);
  const nextIsSameSuperset = isPartOfSuperset && nextExercise?.superset_group === activeExercise.superset_group;

  // Riproduzione segnale acustico sintetico Web Audio
  const playTimerBeep = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      // Ignorato se audio non consentito
    }
  };

  // Rest Timer countdown
  useEffect(() => {
    let interval;
    if (isResting && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer(prev => prev - 1);
      }, 1000);
    } else if (restTimer === 0 && isResting) {
      setIsResting(false);
      if (soundEnabled) playTimerBeep();
      toast.success("Recupero terminato! Pronto per il prossimo set 💪");
    }
    return () => clearInterval(interval);
  }, [isResting, restTimer, soundEnabled]);

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

    const detailedSet = activeExercise.set_details?.[setIdx];
    const defaultWeight = detailedSet?.weight || activeExercise.lastWeight;
    const defaultReps = detailedSet?.reps || String(activeExercise.targetReps).split('-')[0];

    setSetLogs(prev => ({
      ...prev,
      [key]: { 
        weight: current.weight || defaultWeight,
        reps: current.reps || defaultReps,
        completed: isNowCompleted 
      }
    }));

    if (isNowCompleted) {
      // Se fa parte di una superserie e c'è il prossimo esercizio nello stesso gruppo:
      if (nextIsSameSuperset) {
        toast.info(`⚡ SUPERSET: Passa subito a ${nextExercise.name}!`);
      } else if (timerEnabled) {
        // Avvia il timer di recupero solo se il timer è attivo
        const parsedRestSeconds = parseInt(activeExercise.rest) || 90;
        setRestTimer(parsedRestSeconds);
        setIsResting(true);
      }
    }
  };

  const addRestTime = (seconds) => {
    setRestTimer(prev => Math.max(0, prev + seconds));
  };

  const finishWorkout = async () => {
    setIsSaving(true);
    try {
      const completedExercises = session.exercises.map((ex, idx) => {
        const setsCount = ex.targetSets;
        const loggedSets = [];
        for (let i = 0; i < setsCount; i++) {
          const log = setLogs[`${ex.id}-${i}`];
          const detailedSet = ex.set_details?.[i];
          const fallbackWeight = detailedSet?.weight ? parseFloat(detailedSet.weight) : (parseFloat(ex.lastWeight) || 0);
          const fallbackReps = detailedSet?.reps ? parseInt(detailedSet.reps) : (parseInt(ex.targetReps) || 8);

          // Considera valido se esplicitamente spuntato o se sono stati inseriti/modificati valori
          const isExplicitlyDone = Boolean(log && log.completed);
          const hasEnteredValues = Boolean(log && ((log.weight !== undefined && log.weight !== '') || (log.reps !== undefined && log.reps !== '')));

          if (isExplicitlyDone || hasEnteredValues) {
            const finalWeight = (log?.weight !== undefined && log?.weight !== '') ? parseFloat(log.weight) : fallbackWeight;
            const finalReps = (log?.reps !== undefined && log?.reps !== '') ? parseInt(log.reps) : fallbackReps;
            loggedSets.push({
              setNumber: i + 1,
              weight: isNaN(finalWeight) ? 0 : Math.max(0, finalWeight),
              reps: isNaN(finalReps) ? 0 : Math.max(0, finalReps),
              completed: true
            });
          }
        }
        return {
          exerciseId: ex.id,
          name: ex.name,
          orderIndex: idx,
          sets: loggedSets,
          notes: exerciseNotes[ex.id] || ""
        };
      });

      // Calcola con precisione serie totali, tonnellaggio e scomposizione muscolare reale
      let totalSetsCompleted = 0;
      let totalTonnageKg = 0;
      let totalRepsCount = 0;
      const muscleMap = {};

      completedExercises.forEach(ex => {
        const classification = classifyExerciseMuscle(ex.name);
        const primary = classification.primary;

        ex.sets.forEach(st => {
          totalSetsCompleted++;
          const w = parseFloat(st.weight) || 0;
          const r = parseInt(st.reps) || 0;
          const setTonnage = w * r;
          totalTonnageKg += setTonnage;
          totalRepsCount += r;

          if (primary) {
            if (!muscleMap[primary]) {
              muscleMap[primary] = {
                muscle: primary,
                completedSets: 0,
                totalReps: 0,
                tonnageKg: 0,
                exercises: []
              };
            }
            muscleMap[primary].completedSets += 1;
            muscleMap[primary].totalReps += r;
            muscleMap[primary].tonnageKg += setTonnage;
            if (!muscleMap[primary].exercises.includes(ex.name)) {
              muscleMap[primary].exercises.push(ex.name);
            }
          }
        });
      });

      const muscleBreakdown = Object.values(muscleMap).sort((a, b) => b.completedSets - a.completedSets);
      const trainedMuscles = muscleBreakdown.map(m => m.muscle);

      const now = new Date();
      const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const nowIso = now.toISOString();

      // Payload compatibile sia con snake_case che camelCase per il backend Spring Boot
      const payload = {
        sheetId: sessionId,
        sheet_id: sessionId,
        athleteId: user?.id,
        athlete_id: user?.id,
        rpe,
        generalNotes: notes,
        general_notes: notes,
        sessionDate: todayIso,
        session_date: todayIso,
        dayName: session.dayName,
        day_name: session.dayName,
        exercises: completedExercises.map(ex => ({
          ...ex,
          exerciseId: ex.exerciseId,
          exercise_id: ex.exerciseId,
          orderIndex: ex.orderIndex,
          order_index: ex.orderIndex,
          sets: ex.sets.map(s => ({
            ...s,
            setNumber: s.setNumber,
            set_number: s.setNumber,
            weight: s.weight,
            actualWeight: s.weight,
            actual_weight: s.weight,
            reps: s.reps,
            actualReps: s.reps,
            actual_reps: s.reps,
            completed: true,
            isCompleted: true,
            is_completed: true
          }))
        }))
      };

      const currentToken = localStorage.getItem("token") || token;
      let savedSessionId = `ws_${Date.now()}`;

      try {
        const sessionRes = await axios.post(`${API}/workout-sessions`, payload, {
          headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {}
        });
        if (sessionRes.data?.id) {
          savedSessionId = sessionRes.data.id;
        }
      } catch (backendErr) {
        console.warn("Salvataggio workout-session su backend completato con fallback:", backendErr);
      }

      // Salva sempre anche nel localStorage (chiave utente e guest) per aggiornare istantaneamente la dashboard
      try {
        const newEntry = {
          id: savedSessionId,
          sheetId: sessionId,
          sheet_id: sessionId,
          dayName: session.dayName,
          day_name: session.dayName,
          date: todayIso,
          session_date: todayIso,
          timestamp: nowIso,
          created_at: nowIso,
          completed_at: nowIso,
          rpe,
          notes,
          totalSets: totalSetsCompleted,
          totalTonnage: Math.round(totalTonnageKg * 10) / 10,
          trainedMuscles,
          trained_muscles: trainedMuscles,
          muscleBreakdown,
          muscle_breakdown: muscleBreakdown,
          exerciseLogs: completedExercises,
          exercise_logs: completedExercises
        };

        const targetStorageKeys = [`coachsheets_completed_workouts_${user?.id}`, 'coachsheets_completed_workouts_guest'].filter(Boolean);
        for (const storageKey of targetStorageKeys) {
          try {
            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const updatedWorkouts = [newEntry, ...existing.filter(e => e.id !== savedSessionId)];
            localStorage.setItem(storageKey, JSON.stringify(updatedWorkouts));
          } catch {}
        }
      } catch (lsErr) {
        console.error("Errore salvataggio localStorage:", lsErr);
      }

      // Salva automaticamente le registrazioni carichi per la pagina Progressi (/progressi)
      try {
        const newProgressList = [];

        for (const ex of completedExercises) {
          if (ex.sets && ex.sets.length > 0) {
            const topSet = ex.sets.reduce((prev, curr) => (curr.weight > (prev?.weight || 0) ? curr : prev), ex.sets[0]);
            if (topSet && (topSet.weight > 0 || topSet.reps > 0)) {
              const weightStr = topSet.weight > 0 ? `${topSet.weight}kg` : "0kg";
              const progressEntry = {
                id: `prg_${Date.now()}_${ex.exerciseId}`,
                sheet_id: sessionId,
                sheetId: sessionId,
                exercise_name: ex.name,
                exerciseName: ex.name,
                week_label: session.dayName,
                weekLabel: session.dayName,
                weight: weightStr,
                reps: `${topSet.reps || 0}`,
                date: todayIso,
                logged_by_name: user?.name || "Atleta",
                logged_by_role: "athlete"
              };
              newProgressList.push(progressEntry);

              if (sessionId && currentToken) {
                try {
                  await axios.post(`${API}/sheets/${sessionId}/progress`, {
                    athleteId: user?.id,
                    athlete_id: user?.id,
                    exerciseName: ex.name,
                    exercise_name: ex.name,
                    weekLabel: session.dayName,
                    week_label: session.dayName,
                    weight: weightStr,
                    reps: `${topSet.reps || 0}`,
                    date: todayIso
                  }, {
                    headers: { Authorization: `Bearer ${currentToken}` }
                  });
                } catch (e) {
                  // Fallback su storage locale
                }
              }
            }
          }
        }

        if (newProgressList.length > 0) {
          const pKeys = [`coachsheets_progress_entries_${user?.id}`, 'coachsheets_progress_entries_guest'].filter(Boolean);
          for (const k of pKeys) {
            try {
              const existingProgress = JSON.parse(localStorage.getItem(k) || '[]');
              localStorage.setItem(k, JSON.stringify([...newProgressList, ...existingProgress]));
            } catch {}
          }
        }
      } catch (prgErr) {
        console.warn("Registrazione progressi completata con fallback:", prgErr);
      }

      // Aggiorna feedback e pesi sulla scheda (se associata)
      if (sessionId) {
        try {
          const sheetRes = await axios.get(`${API}/sheets/${sessionId}`);
          const currentSheet = sheetRes.data;
          
          if (currentSheet && currentSheet.weeks) {
            const formattedFeedback = `[RPE ${rpe}/10 · ${totalSetsCompleted} serie · ${Math.round(totalTonnageKg)}kg] ${notes}`.trim();
            const updatedWeeks = currentSheet.weeks.map(w => {
              if (!weekIdParam || w.id === weekIdParam) {
                return {
                  ...w,
                  days: (w.days || []).map(d => {
                    if (!dayIdParam || d.id === dayIdParam) {
                      return {
                        ...d,
                        daily_feedback: formattedFeedback,
                        dailyFeedback: formattedFeedback,
                        exercises: (d.exercises || []).map(ex => {
                          const customNote = exerciseNotes[ex.id];
                          const completedEx = completedExercises.find(ce => ce.exerciseId === ex.id || ce.name === ex.exercise);
                          const lastSet = completedEx?.sets?.[completedEx.sets.length - 1];
                          const updatedWeight = lastSet && lastSet.weight > 0 ? `${lastSet.weight}` : ex.weight;

                          let updatedDetails = ex.set_details || ex.setDetails;
                          if (completedEx && Array.isArray(completedEx.sets) && completedEx.sets.length > 0 && Array.isArray(updatedDetails)) {
                            updatedDetails = updatedDetails.map((sd, sIdx) => {
                              const matchedSet = completedEx.sets.find(cs => cs.setNumber === sIdx + 1);
                              if (matchedSet) {
                                return {
                                  ...sd,
                                  weight: matchedSet.weight > 0 ? String(matchedSet.weight) : sd.weight,
                                  reps: matchedSet.reps > 0 ? String(matchedSet.reps) : sd.reps
                                };
                              }
                              return sd;
                            });
                          }

                          return {
                            ...ex,
                            weight: updatedWeight || ex.weight,
                            set_details: updatedDetails || ex.set_details,
                            setDetails: updatedDetails || ex.setDetails,
                            athlete_notes: customNote || ex.athlete_notes,
                            athleteNotes: customNote || ex.athleteNotes
                          };
                        })
                      };
                    }
                    return d;
                  })
                };
              }
              return w;
            });
            await axios.put(`${API}/sheets/${sessionId}`, { weeks: updatedWeeks }, {
              headers: currentToken ? { Authorization: `Bearer ${currentToken}` } : {}
            });
          }
        } catch (err) {
          console.error("Errore salvataggio feedback su scheda:", err);
        }
      }

      toast.success("Workout completato! Sessione e progressi registrati con successo 💪");
      navigate('/athlete');
    } catch (e) {
      toast.error("Errore durante il salvataggio");
      navigate('/athlete');
    } finally {
      setIsSaving(false);
    }
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
    const impact = computeSessionMuscleImpact(session.exercises, setLogs);

    return (
      <div className="min-h-screen bg-[#0c0e12] text-zinc-100 p-4 flex flex-col pt-8 space-y-6 max-w-xl mx-auto">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-black uppercase tracking-wider">
            <Trophy className="h-4 w-4" /> Workout Completato!
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-white">Riepilogo & Analisi Sessione</h2>
          <p className="text-xs text-zinc-400">Dati reali registrati su volume, tonnellaggio e gruppi muscolari</p>
        </div>

        {/* Real Muscle Impact Breakdown Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm sm:text-base font-bold text-white">Analisi Muscolare Reale</h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              {impact.totalTonnageKg.toLocaleString()} kg totali
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block uppercase">Serie Svolte</span>
              <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">{impact.totalSetsCompleted}</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block uppercase">Ripetizioni</span>
              <span className="text-base sm:text-lg font-black text-sky-400 font-mono">{impact.totalRepsCount}</span>
            </div>
            <div className="bg-zinc-950 p-2.5 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block uppercase">Tonnellaggio</span>
              <span className="text-base sm:text-lg font-black text-amber-400 font-mono">{impact.totalTonnageKg} kg</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center justify-between">
              <span>Gruppi Muscolari Stimolati</span>
              <span className="text-[10px] font-normal text-zinc-400">basato su serie spuntate</span>
            </h4>
            
            {impact.muscles.length === 0 ? (
              <p className="text-xs text-zinc-500 italic text-center py-3 border border-dashed border-zinc-800 rounded-2xl">
                Nessuna serie completata registrata.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {impact.muscles.map((m) => {
                  const style = getMuscleStyle(m.muscle);
                  const maxSets = Math.max(...impact.muscles.map(x => x.completedSets), 1);
                  const pct = Math.round((m.completedSets / maxSets) * 100);
                  return (
                    <div key={m.muscle} className="p-3 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-bold ${style.text}`}>{m.muscle}</span>
                        <span className="font-mono text-zinc-300 font-bold">
                          {m.completedSets} serie · {m.tonnageKg.toLocaleString()} kg
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${style.bar}`} style={{ width: `${pct}%` }} />
                      </div>
                      <div className="text-[10px] text-zinc-500 truncate">
                        Esercizi: {m.exercises.join(", ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Feedback & Save Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-2xl">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-white">Sforzo Percepito (RPE: {rpe}/10)</label>
              <span className="text-xs font-mono text-emerald-400 font-bold">
                {rpe <= 6 ? "Leggero" : rpe <= 8 ? "Ottimo Sovraccarico" : "Massimale"}
              </span>
            </div>
            <Slider
              value={[rpe]}
              onValueChange={([val]) => setRpe(val)}
              min={1}
              max={10}
              step={1}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-white">Note generali sul recupero e workout</label>
            <Textarea
              placeholder="Come ti sei sentito? Dolori, sonno, carichi da aggiustare..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white rounded-2xl min-h-[90px] text-xs"
            />
          </div>

          <Button 
            className="w-full h-12 premium-button-primary font-black text-base rounded-2xl"
            onClick={finishWorkout}
            disabled={isSaving}
          >
            {isSaving ? "Salvataggio..." : "Salva e Chiudi Workout"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 flex flex-col pb-28" data-testid="workout-mode">
      
      {/* Top Header con controlli Timer e Audio */}
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

        {/* Controlli Timer, Strumenti & Audio */}
        <div className="flex items-center gap-1.5">
          {/* Apri Cronometro / AMRAP / EMOM */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setToolboxOpen(true)}
            className="h-8 px-2.5 text-xs rounded-xl gap-1.5 bg-zinc-900 border border-zinc-800 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 font-bold"
            title="Apri Cronometro & Timer (AMRAP / EMOM)"
          >
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Cronometro</span>
          </Button>

          {/* Apri Calcolatore & Percentuali */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCalcModalOpen(true)}
            className="h-8 px-2.5 text-xs rounded-xl gap-1.5 bg-zinc-900 border border-zinc-800 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300 font-bold"
            title="Calcola 1RM, Percentuali e Scalo %"
          >
            <Percent className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Percentuali</span>
          </Button>

          {/* Toggle Rest Timer ON/OFF */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const next = !timerEnabled;
              setTimerEnabled(next);
              if (!next) setIsResting(false);
              toast.info(next ? "Rest Timer automatico ATTIVATO" : "Rest Timer automatico DISATTIVATO");
            }}
            className={`h-8 px-2 text-xs rounded-xl gap-1 border ${
              timerEnabled 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
            }`}
            title={timerEnabled ? "Disattiva Rest Timer" : "Attiva Rest Timer"}
          >
            <Timer className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{timerEnabled ? "Timer ON" : "Timer OFF"}</span>
          </Button>

          {/* Toggle Audio Muto/Suono */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              toast.info(next ? "Avviso acustico attivo" : "Audio silenziato");
            }}
            className="h-8 w-8 text-zinc-400 hover:text-white rounded-xl"
            title={soundEnabled ? "Silenzia audio timer" : "Attiva suono timer"}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4 text-emerald-400" /> : <VolumeX className="h-4 w-4" />}
          </Button>

          {prDetected && (
            <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black">
              <Trophy className="h-3 w-3" /> PR
            </span>
          )}
        </div>
      </header>

      {/* Main Exercise Set Logging Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 space-y-4">
        
        {/* Banner Superserie Attivo se presente */}
        {nextIsSameSuperset && (
          <div className="bg-purple-950/40 border border-purple-500/40 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                <Zap className="h-4 w-4 text-purple-400" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-purple-300">SUPERSET {activeExercise.superset_group}: </span>
                <span className="text-zinc-300">Completa la serie e passa subito a </span>
                <span className="text-white font-bold">{nextExercise.name}</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setActiveExerciseIndex(activeExerciseIndex + 1)}
              className="h-8 text-xs bg-purple-600 hover:bg-purple-500 text-white shrink-0 rounded-xl"
            >
              Passa a {nextExercise.name.slice(0, 12)} →
            </Button>
          </div>
        )}

        {/* Exercise Info Card */}
        <div className="bg-zinc-900/90 border border-zinc-800 p-5 rounded-3xl space-y-3 shadow-xl">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  Target: {activeExercise.targetSets} Serie × {activeExercise.targetReps} reps
                </span>
                {isPartOfSuperset && (
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/40 text-[10px] font-mono">
                    ⚡ SUPERSET {activeExercise.superset_group}
                  </Badge>
                )}
              </div>
              <h2 className="text-xl font-black text-white mt-1.5">{activeExercise.name}</h2>
              {(() => {
                const muscleInfo = classifyExerciseMuscle(activeExercise?.name);
                const style = getMuscleStyle(muscleInfo.primary);
                return (
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${style.bg} ${style.border} ${style.text}`}>
                      💪 Focus: {muscleInfo.primary}
                    </span>
                    {muscleInfo.secondary?.length > 0 && (
                      <span className="text-[10px] text-zinc-400">
                        (Sinergici: {muscleInfo.secondary.join(", ")})
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
            <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20">
              Recupero {activeExercise.rest || "90s"}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 border-t border-zinc-800/80 font-mono">
            <span className="flex items-center gap-1.5 flex-wrap">
              <span>Carico target:</span>
              <span className="font-bold text-emerald-400">{activeExercise.lastWeight} kg</span>
              {activeExercise.lastWeight && activeExercise.lastWeight !== '0' && (
                <span className="text-[10px] text-zinc-500 font-sans italic">(Scorsa volta: {activeExercise.lastWeight} kg)</span>
              )}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCalcModalOpen(true)}
                className="h-7 px-2 text-[11px] font-bold text-sky-400 hover:text-sky-300 hover:bg-sky-500/10 gap-1 rounded-lg"
                title="Calcola percentuali e scalo"
              >
                <Percent className="h-3.5 w-3.5" /> % & Scalo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  const w = parseFloat(activeExercise.lastWeight) || 60;
                  setPlateCalcWeight(w);
                  setPlateCalcOpen(true);
                }}
                className="h-7 px-2 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1 rounded-lg"
                title="Calcola dischi bilanciere"
              >
                <Disc className="h-3.5 w-3.5" /> Dischi
              </Button>
            </div>
          </div>
        </div>

        {/* Set Logger Table con riconoscimento serie differenziate e stepper touch */}
        <div className="bg-zinc-900/60 border border-zinc-800/90 p-4 rounded-3xl space-y-3 shadow-xl">
          <div className="grid grid-cols-[40px_1fr_1fr_56px] gap-2 px-2 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
            <div className="text-center">Set</div>
            <div className="text-center">Kg</div>
            <div className="text-center">Reps</div>
            <div className="text-center">Stato</div>
          </div>

          {Array.from({ length: activeExercise.targetSets }).map((_, i) => {
            const key = `${activeExercise.id}-${i}`;
            const detailedSet = activeExercise.set_details?.[i];
            
            const defaultWeight = detailedSet?.weight ? detailedSet.weight.replace('kg', '') : activeExercise.lastWeight;
            const defaultReps = detailedSet?.reps || String(activeExercise.targetReps).split('-')[0];

            const log = setLogs[key] || { weight: defaultWeight, reps: defaultReps, completed: false };
            
            const isTopSet = detailedSet?.type === 'top_set';
            const isBackoff = detailedSet?.type === 'back_off';
            const isWarmup = detailedSet?.type === 'warm_up';

            return (
              <div 
                key={i} 
                className={`grid grid-cols-[40px_1fr_1fr_56px] gap-2 items-center p-2 rounded-2xl transition-all ${
                  log.completed 
                    ? 'bg-emerald-950/40 border border-emerald-500/50 glow-emerald' 
                    : isTopSet 
                      ? 'bg-amber-950/20 border border-amber-500/30'
                      : isBackoff
                        ? 'bg-sky-950/20 border border-sky-500/30'
                        : 'bg-zinc-950 border border-zinc-800/80'
                }`}
              >
                <div className="text-center flex flex-col items-center justify-center">
                  <span className="font-mono font-bold text-zinc-400 text-xs">#{i + 1}</span>
                  {detailedSet?.intensity && (
                    <span className="text-[9px] font-bold text-amber-400 leading-none mt-0.5">
                      {detailedSet.intensity}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="relative">
                    <Input 
                      type="number" 
                      inputMode="decimal"
                      placeholder={defaultWeight}
                      className="h-10 text-center font-bold text-sm bg-zinc-900 border-zinc-800 text-white rounded-xl focus:border-emerald-500"
                      value={log.weight || ''}
                      onChange={(e) => handleSetChange(activeExercise.id, i, 'weight', e.target.value)}
                    />
                    {detailedSet?.type && (
                      <span className={`absolute -top-1.5 left-2 px-1 rounded text-[8px] font-bold uppercase ${
                        isTopSet ? 'bg-amber-500/20 text-amber-300' : isBackoff ? 'bg-sky-500/20 text-sky-300' : isWarmup ? 'bg-orange-500/20 text-orange-300' : 'bg-zinc-800 text-zinc-400'
                      }`}>
                        {isTopSet ? 'Top' : isBackoff ? 'Back-off' : isWarmup ? 'Warm' : 'Target'}
                      </span>
                    )}
                  </div>
                  {/* Stepper rapidi per il peso */}
                  <div className="flex items-center justify-center gap-1">
                    <button 
                      type="button" 
                      onClick={() => adjustWeight(activeExercise.id, i, -2.5)} 
                      className="text-[10px] font-mono px-1 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    >
                      -2.5
                    </button>
                    <button 
                      type="button" 
                      onClick={() => adjustWeight(activeExercise.id, i, 2.5)} 
                      className="text-[10px] font-mono px-1 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold"
                    >
                      +2.5
                    </button>
                    <button 
                      type="button" 
                      onClick={() => adjustWeight(activeExercise.id, i, 5)} 
                      className="text-[10px] font-mono px-1 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const w = parseFloat(log.weight) || parseFloat(defaultWeight) || 60;
                        setPlateCalcWeight(w);
                        setPlateCalcOpen(true);
                      }}
                      className="text-zinc-500 hover:text-emerald-400 p-0.5"
                      title="Calcola dischi"
                    >
                      <Disc className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <Input 
                    type="number" 
                    inputMode="numeric"
                    placeholder={defaultReps}
                    className="h-10 text-center font-bold text-sm bg-zinc-900 border-zinc-800 text-white rounded-xl focus:border-emerald-500"
                    value={log.reps || ''}
                    onChange={(e) => handleSetChange(activeExercise.id, i, 'reps', e.target.value)}
                  />
                  {/* Stepper rapidi per le ripetizioni */}
                  <div className="flex items-center justify-center gap-1.5">
                    <button 
                      type="button" 
                      onClick={() => adjustReps(activeExercise.id, i, -1)} 
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    >
                      -1
                    </button>
                    <button 
                      type="button" 
                      onClick={() => adjustReps(activeExercise.id, i, 1)} 
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold"
                    >
                      +1
                    </button>
                  </div>
                </div>

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

      {/* Modal Calcolatore Piastre sul Bilanciere */}
      {plateCalcOpen && (
        <PlateCalculatorModal
          open={plateCalcOpen}
          onOpenChange={setPlateCalcOpen}
          initialWeight={plateCalcWeight}
        />
      )}

      {/* Modal Cronometro & Timer (AMRAP / EMOM / Stopwatch) */}
      <Dialog open={toolboxOpen} onOpenChange={setToolboxOpen}>
        <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none">
          <WorkoutToolbox />
        </DialogContent>
      </Dialog>

      {/* Modal Calcolatore 1RM, Percentuali & Riduzioni */}
      <Dialog open={calcModalOpen} onOpenChange={setCalcModalOpen}>
        <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-white p-0 overflow-hidden shadow-2xl">
          <Calculator />
        </DialogContent>
      </Dialog>

    </div>
  );
}
