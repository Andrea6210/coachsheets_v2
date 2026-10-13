import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { classifyExerciseMuscle, getMuscleStyle } from "@/lib/muscleAnalytics";

export const VolumeAnalysisModal = ({ open, onOpenChange, week }) => {
  const [sourceMode, setSourceMode] = useState("program"); // "program" | "actual"

  // 1. Volume teorico programmato nella scheda
  const plannedData = useMemo(() => {
    if (!open || !week) return { sortedMuscles: [], totalSets: 0 };

    try {
      const counts = {};
      const safeDays = Array.isArray(week.days) ? week.days : [];

      safeDays.forEach(day => {
        if (!day) return;
        const safeExercises = Array.isArray(day.exercises) ? day.exercises : [];
        safeExercises.forEach(ex => {
          if (!ex) return;
          const rawDetails = ex.set_details || ex.setDetails;
          const details = Array.isArray(rawDetails) ? rawDetails : [];
          const setsCount = details.length > 0 ? details.length : (parseInt(ex.sets, 10) || 0);
          if (setsCount <= 0) return;

          const classification = classifyExerciseMuscle(ex.exercise);
          const muscle = classification.primary;
          counts[muscle] = (counts[muscle] || 0) + setsCount;
        });
      });

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      const total = sorted.reduce((sum, [, sets]) => sum + sets, 0);
      return { sortedMuscles: sorted, totalSets: total };
    } catch (err) {
      console.error("Volume analysis error:", err);
      return { sortedMuscles: [], totalSets: 0 };
    }
  }, [open, week]);

  // 2. Volume effettivo completato nei workout
  const actualData = useMemo(() => {
    if (!open) return { sortedMuscles: [], totalSets: 0, totalTonnage: 0 };

    try {
      // Recupera sessioni completate da localStorage
      let allWorkouts = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("coachsheets_completed_workouts_")) {
          try {
            const list = JSON.parse(localStorage.getItem(key) || "[]");
            if (Array.isArray(list)) allWorkouts.push(...list);
          } catch (e) {}
        }
      }

      const counts = {};
      let totalTonnage = 0;
      let totalSets = 0;

      allWorkouts.forEach(w => {
        if (Array.isArray(w.muscleBreakdown)) {
          w.muscleBreakdown.forEach(m => {
            const muscleName = m.muscle || "Altro";
            counts[muscleName] = (counts[muscleName] || 0) + (m.completedSets || 0);
            totalSets += m.completedSets || 0;
            totalTonnage += m.tonnageKg || 0;
          });
        }
      });

      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
      return { sortedMuscles: sorted, totalSets, totalTonnage: Math.round(totalTonnage) };
    } catch (e) {
      return { sortedMuscles: [], totalSets: 0, totalTonnage: 0 };
    }
  }, [open]);

  if (!open || !week) return null;

  const currentData = sourceMode === "program" ? plannedData : actualData;

  const getVolumeStatus = (sets) => {
    if (sets < 6) return { label: "Volume Minimo", color: "text-zinc-400 bg-zinc-800" };
    if (sets <= 12) return { label: "Volume Ottimale", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
    if (sets <= 20) return { label: "Alto Volume", color: "text-sky-400 bg-sky-500/10 border-sky-500/30" };
    return { label: "Volume Molto Alto", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100 rounded-3xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-emerald-400" />
              Analisi Volume Muscolare
            </DialogTitle>
            <Badge variant="outline" className="text-zinc-400 border-zinc-800 text-xs">
              {week.label || "Settimana"}
            </Badge>
          </div>
          <DialogDescription className="text-zinc-400 text-xs">
            Calcolo veritiero delle serie allenanti per distretto muscolare.
          </DialogDescription>
        </DialogHeader>

        {/* Toggle Sorgente: Programmato vs Reale Eseguito */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setSourceMode("program")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              sourceMode === "program"
                ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Programmato (Scheda)
          </button>
          <button
            type="button"
            onClick={() => setSourceMode("actual")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
              sourceMode === "actual"
                ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Effettivo (Workout Svolti)
          </button>
        </div>

        <div className="space-y-3 py-1">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs">
            <span className="text-zinc-400">
              {sourceMode === "program" ? "Totale serie programmate:" : "Totale serie realmente completate:"}
            </span>
            <span className="font-mono font-bold text-base text-emerald-400">
              {currentData.totalSets} serie
              {sourceMode === "actual" && currentData.totalTonnage > 0 && (
                <span className="text-xs text-amber-400 ml-2">({currentData.totalTonnage.toLocaleString()} kg)</span>
              )}
            </span>
          </div>

          {currentData.sortedMuscles.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-2xl">
              {sourceMode === "program" 
                ? "Nessun esercizio presente in questa settimana." 
                : "Nessuna sessione di workout ancora registrata. Avvia un workout per visualizzare i dati reali!"}
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {currentData.sortedMuscles.map(([muscle, sets]) => {
                const status = getVolumeStatus(sets);
                const maxBenchmark = 22;
                const percentage = Math.min(100, Math.round((sets / maxBenchmark) * 100));
                const style = getMuscleStyle(muscle);

                return (
                  <div key={muscle} className="p-2.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-semibold ${style.text}`}>{muscle}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-400">{sets} serie</span>
                        <Badge variant="outline" className={`text-[10px] px-1.5 h-4.5 ${status.color}`}>
                          {status.label}
                        </Badge>
                      </div>
                    </div>
                    {/* Barra di progressione */}
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${style.bar} rounded-full transition-all duration-300`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl">
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
