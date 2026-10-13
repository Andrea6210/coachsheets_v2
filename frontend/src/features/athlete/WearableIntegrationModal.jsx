import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Watch, Heart, Activity, Flame, Download, CheckCircle2, RefreshCw, ExternalLink, ShieldCheck
} from "lucide-react";

export const WearableIntegrationModal = ({ open, onOpenChange, sheetTitle = "Scheda Allenamento", exercises = [] }) => {
  const [integrations, setIntegrations] = useState({
    garmin: { connected: false, syncing: false, lastSync: null },
    apple: { connected: false, syncing: false, lastSync: null },
    strava: { connected: true, syncing: false, lastSync: "Oggi, 18:30" },
    google: { connected: false, syncing: false, lastSync: null }
  });

  const toggleConnect = (key, name) => {
    setIntegrations(prev => {
      const isConn = prev[key].connected;
      const nextState = !isConn;
      if (nextState) {
        toast.success(`Account ${name} collegato con successo!`);
      } else {
        toast.info(`Account ${name} scollegato.`);
      }
      return {
        ...prev,
        [key]: {
          connected: nextState,
          syncing: false,
          lastSync: nextState ? "Adesso" : null
        }
      };
    });
  };

  const handleSync = (key, name) => {
    setIntegrations(prev => ({
      ...prev,
      [key]: { ...prev[key], syncing: true }
    }));
    setTimeout(() => {
      setIntegrations(prev => ({
        ...prev,
        [key]: { ...prev[key], syncing: false, lastSync: "Adesso" }
      }));
      toast.success(`Dati biometrici sincronizzati da ${name}!`);
    }, 1200);
  };

  // Esportazione file .FIT / Garmin Workout simulato (download JSON/TCX compatto)
  const handleExportGarmin = () => {
    const workoutExport = {
      workoutName: sheetTitle,
      exportDate: new Date().toISOString(),
      sport: "STRENGTH_TRAINING",
      steps: exercises.map((ex, idx) => ({
        stepNumber: idx + 1,
        exercise: ex.exercise || `Esercizio ${idx + 1}`,
        targetSets: ex.sets || "4",
        targetReps: ex.reps || "8-10",
        targetWeight: ex.weight || "",
        restSeconds: parseInt(ex.rest) || 90
      }))
    };

    const blob = new Blob([JSON.stringify(workoutExport, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sheetTitle.replace(/\s+/g, '_')}_garmin_workout.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("File allenamento esportato (compatibile Garmin & Smartwatch)!");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Watch className="h-5 w-5 text-emerald-400" />
            Integrazioni Smartwatch & App Salute
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Collega il tuo orologio (Garmin, Apple Watch, Strava) per sincronizzare battiti, calorie e durata degli allenamenti.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          {/* Card Garmin Connect */}
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-xs shrink-0">
                GARMIN
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold">Garmin Connect</h4>
                  {integrations.garmin.connected && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 h-4 px-1">
                      Connesso
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">
                  {integrations.garmin.connected ? `Ultima sync: ${integrations.garmin.lastSync}` : "Ricevi cardio, calorie e file .FIT"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {integrations.garmin.connected ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSync('garmin', 'Garmin')}
                    disabled={integrations.garmin.syncing}
                    className="h-8 text-xs text-zinc-300"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${integrations.garmin.syncing ? 'animate-spin' : ''}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleConnect('garmin', 'Garmin')}
                    className="h-8 text-xs border-zinc-700 text-zinc-400"
                  >
                    Scollega
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  onClick={() => toggleConnect('garmin', 'Garmin')}
                  className="h-8 text-xs bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Connetti
                </Button>
              )}
            </div>
          </div>

          {/* Card Apple Watch / Apple Health */}
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold">Apple Watch & HealthKit</h4>
                  {integrations.apple.connected && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 h-4 px-1">
                      Attivo
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">
                  {integrations.apple.connected ? `Sincronizzato: ${integrations.apple.lastSync}` : "Sincronizza battiti e anelli attività da iPhone"}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant={integrations.apple.connected ? "outline" : "default"}
              onClick={() => toggleConnect('apple', 'Apple Health')}
              className={`h-8 text-xs ${integrations.apple.connected ? 'border-zinc-700 text-zinc-400' : 'bg-red-600 hover:bg-red-500 text-white'}`}
            >
              {integrations.apple.connected ? "Scollega" : "Abilita"}
            </Button>
          </div>

          {/* Card Strava */}
          <div className="p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-xs shrink-0">
                STRAVA
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-semibold">Strava (Bridge Universale)</h4>
                  {integrations.strava.connected && (
                    <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-400 border-emerald-500/30 h-4 px-1">
                      Connesso
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400">
                  {integrations.strava.connected ? `Ultima sync: ${integrations.strava.lastSync}` : "Importa automaticamente gli allenamenti"}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSync('strava', 'Strava')}
              disabled={integrations.strava.syncing}
              className="h-8 text-xs border-zinc-700 text-zinc-300 gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${integrations.strava.syncing ? 'animate-spin' : ''}`} /> Sincronizza
            </Button>
          </div>

          {/* Sezione Esportazione File per Smartwatch */}
          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <Download className="h-4 w-4" /> Esporta Allenamento per Orologio
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportGarmin}
                className="h-7 text-xs bg-emerald-600/20 border-emerald-500/30 text-emerald-300 hover:bg-emerald-600/30"
              >
                Esporta Scheda (.JSON / Garmin)
              </Button>
            </div>
            <p className="text-[11px] text-zinc-400">
              Esporta questa scheda per guidare i tempi di recupero e le serie direttamente dal display del tuo smartwatch.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
