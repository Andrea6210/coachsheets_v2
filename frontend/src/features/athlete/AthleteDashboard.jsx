import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dumbbell, 
  Play, 
  Activity, 
  Flame, 
  MessageSquare, 
  Plus, 
  Scale, 
  BookOpen,
  Zap,
  TrendingUp
} from "lucide-react";
import { useAuth, API } from "@/contexts/AuthContext";
import { Navbar } from "@/components/layout/Navbar";

export default function AthleteDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sheets, setSheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quickWeight, setQuickWeight] = useState("");
  const [weightLogs, setWeightLogs] = useState([
    { date: "15 Set", weight: 74.5 },
    { date: "17 Set", weight: 74.2 },
    { date: "19 Set", weight: 73.9 },
    { date: "Oggi", weight: 73.8 },
  ]);

  // Muscle Fatigue Map data with percentage meters and neon colors
  const muscleFatigue = [
    { name: "Petto", level: "Recuperato", percent: 100, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { name: "Dorso", level: "In Recupero", percent: 65, color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
    { name: "Gambe", level: "Affaticato", percent: 30, color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
    { name: "Spalle", level: "Recuperato", percent: 95, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { name: "Bicipiti", level: "In Recupero", percent: 70, color: "text-sky-400 bg-sky-500/10 border-sky-500/30" },
    { name: "Tricipiti", level: "Recuperato", percent: 90, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
    { name: "Core", level: "Recuperato", percent: 100, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  ];

  // GitHub-style workout consistency heatmap simulation (last 60 days)
  const heatmapDays = Array.from({ length: 60 }, (_, i) => {
    const intensity = Math.random() > 0.4 ? Math.floor(Math.random() * 4) + 1 : 0;
    return { id: i, intensity };
  });

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

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!quickWeight || isNaN(quickWeight)) return;
    const newEntry = { date: "Oggi", weight: parseFloat(quickWeight) };
    setWeightLogs((prev) => [...prev.filter((w) => w.date !== "Oggi"), newEntry]);
    setQuickWeight("");
    toast.success("Peso registrato con successo!");
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

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 pb-20 md:pb-8">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Top Hero Welcome Section with Neon Fluo Gradient */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-emerald-500/20 p-6 rounded-3xl shadow-2xl glow-emerald">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Atleta Attivo
              </span>
              <span className="text-xs text-zinc-400 font-mono">CoachSheets Ecosystem</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight text-white">
              Bentornato, {user?.name || "Atleta"} <span className="glow-text">⚡</span>
            </h1>
            <p className="text-sm text-zinc-300">
              Pronto per la tua prossima sessione? Monitora il recupero muscolare ed avvia l'allenamento.
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
                      onClick={() => navigate(`/workout/${sheet.id}`)}
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

        {/* Heatmap Grid & Weight Log Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Consistency Heatmap */}
          <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Flame className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Consistenza Allenamenti</h3>
                  <p className="text-xs text-zinc-400">Attività svolta negli ultimi 60 giorni</p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                18 Workout Questo Mese
              </span>
            </div>

            {/* Heatmap Grid with Neon Emerald Blocks */}
            <div className="pt-2">
              <div className="grid grid-cols-12 gap-1.5">
                {heatmapDays.map((day) => {
                  let bgClass = "bg-zinc-950 border-zinc-800/60";
                  if (day.intensity === 1) bgClass = "bg-emerald-950/90 border-emerald-800/60";
                  if (day.intensity === 2) bgClass = "bg-emerald-600/80 border-emerald-500/60";
                  if (day.intensity >= 3) bgClass = "bg-emerald-400 border-emerald-300 shadow-md shadow-emerald-400/40";
                  
                  return (
                    <div
                      key={day.id}
                      title={`Giorno ${day.id + 1}: ${day.intensity > 0 ? `${day.intensity} sessioni` : 'Nessun allenamento'}`}
                      className={`h-6 w-full rounded-md border transition-transform hover:scale-110 cursor-pointer ${bgClass}`}
                    />
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-3 font-mono">
                <span>60 Giorni Fa</span>
                <div className="flex items-center gap-1">
                  <span>Meno</span>
                  <span className="h-2.5 w-2.5 rounded bg-zinc-950 border border-zinc-800"></span>
                  <span className="h-2.5 w-2.5 rounded bg-emerald-950 border border-emerald-800"></span>
                  <span className="h-2.5 w-2.5 rounded bg-emerald-600"></span>
                  <span className="h-2.5 w-2.5 rounded bg-emerald-400"></span>
                  <span>Più</span>
                </div>
                <span>Oggi</span>
              </div>
            </div>
          </div>

          {/* Quick Body Weight Tracker Widget */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Scale className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Peso Corporeo</h3>
                <p className="text-xs text-zinc-400">Registrazione rapida bilancia</p>
              </div>
            </div>

            <form onSubmit={handleAddWeight} className="flex gap-2">
              <Input
                type="number"
                step="0.1"
                placeholder="es. 74.2"
                value={quickWeight}
                onChange={(e) => setQuickWeight(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-white rounded-xl text-xs focus:border-emerald-500"
              />
              <Button type="submit" size="sm" className="bg-sky-500 hover:bg-sky-400 text-zinc-950 font-black rounded-xl text-xs shrink-0">
                <Plus className="h-4 w-4" /> Log
              </Button>
            </form>

            <div className="space-y-2 pt-2 border-t border-zinc-800/80">
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Ultimi rilevamenti</p>
              <div className="space-y-1.5">
                {weightLogs.slice(-3).map((w, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-zinc-950/80 p-2.5 rounded-xl border border-zinc-800">
                    <span className="text-zinc-400">{w.date}</span>
                    <span className="font-bold text-emerald-400 font-mono">{w.weight} kg</span>
                  </div>
                ))}
              </div>
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
                <p className="text-xs text-zinc-400">Stima dell'affaticamento muscolare basata sulle ultime sessioni eseguite</p>
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
    </div>
  );
}
