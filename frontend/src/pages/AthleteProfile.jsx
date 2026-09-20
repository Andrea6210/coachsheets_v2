import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { 
  User, 
  Scale, 
  Activity, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Trophy, 
  Flame, 
  Calendar,
  Ruler,
  ShieldCheck,
  Target
} from "lucide-react";
import { useAuth, API } from "@/contexts/AuthContext";

export default function AthleteProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Weight logs state saved in localStorage per user
  const [weightLogs, setWeightLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(`coachsheets_weight_logs_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Body Measurements state (Body Fat %, Waist, Chest, Arm, Leg)
  const [bodyMetrics, setBodyMetrics] = useState(() => {
    try {
      const saved = localStorage.getItem(`coachsheets_body_metrics_${user?.id || 'guest'}`);
      return saved ? JSON.parse(saved) : {
        targetWeight: "72.0",
        height: "178",
        bodyFat: "15.0",
        waist: "82",
        chest: "102",
        arm: "38",
        thigh: "58"
      };
    } catch {
      return { targetWeight: "", height: "", bodyFat: "", waist: "", chest: "", arm: "", thigh: "" };
    }
  });

  const [newWeight, setNewWeight] = useState("");
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split("T")[0]);
  const [newWeightNotes, setNewWeightNotes] = useState("");

  const [metricsForm, setMetricsForm] = useState(bodyMetrics);
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!newWeight || isNaN(newWeight)) {
      toast.error("Inserisci un peso valido (es. 74.5)");
      return;
    }

    const formattedDate = new Date(newWeightDate).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' });
    const newEntry = {
      id: Date.now(),
      date: formattedDate,
      fullDate: newWeightDate,
      weight: parseFloat(newWeight),
      notes: newWeightNotes.trim()
    };

    const updated = [newEntry, ...weightLogs.filter(w => w.fullDate !== newWeightDate)];
    setWeightLogs(updated);
    try {
      localStorage.setItem(`coachsheets_weight_logs_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch {}

    setNewWeight("");
    setNewWeightNotes("");
    toast.success("Rilevamento peso registrato con successo!");
  };

  const handleDeleteWeight = (id) => {
    const updated = weightLogs.filter(w => w.id !== id);
    setWeightLogs(updated);
    try {
      localStorage.setItem(`coachsheets_weight_logs_${user?.id || 'guest'}`, JSON.stringify(updated));
    } catch {}
    toast.success("Rilevamento rimosso");
  };

  const handleSaveMetrics = (e) => {
    e.preventDefault();
    setBodyMetrics(metricsForm);
    try {
      localStorage.setItem(`coachsheets_body_metrics_${user?.id || 'guest'}`, JSON.stringify(metricsForm));
    } catch {}
    setIsEditingMetrics(false);
    toast.success("Dati antropometrici aggiornati!");
  };

  // Prepare chart data (chronological order)
  const chartData = [...weightLogs]
    .sort((a, b) => new Date(a.fullDate || a.id) - new Date(b.fullDate || b.id))
    .map(w => ({ date: w.date, peso: w.weight }));

  const currentWeight = weightLogs.length > 0 ? weightLogs[0].weight : "--";

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 pb-20 md:pb-8">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-emerald-500/20 p-6 rounded-3xl shadow-2xl glow-emerald">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-400 text-zinc-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/20 shrink-0">
              {user?.name ? user.name[0].toUpperCase() : "A"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Profilo Biometrico Atleta
                </span>
                <span className="text-xs text-zinc-400 font-mono">CoachSheets Metrics</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-heading font-black text-white">
                {user?.name || "Atleta"}
              </h1>
              <p className="text-xs text-zinc-400">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-zinc-950 border border-zinc-800 p-3 px-4 rounded-2xl text-center">
              <p className="text-[10px] uppercase font-bold text-zinc-400">Peso Attuale</p>
              <p className="text-xl font-black text-emerald-400 font-mono">{currentWeight} kg</p>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 p-3 px-4 rounded-2xl text-center">
              <p className="text-[10px] uppercase font-bold text-zinc-400">Target Peso</p>
              <p className="text-xl font-black text-sky-400 font-mono">{bodyMetrics.targetWeight || "--"} kg</p>
            </div>
          </div>
        </div>

        {/* Grid: Weight History Chart & Log Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Weight Evolution Graph (2 Cols) */}
          <div className="lg:col-span-2 bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 glow-emerald">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Andamento Peso Corporeo</h3>
                  <p className="text-xs text-zinc-400">Grafico delle variazioni di peso registrate</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                {weightLogs.length} Rilevamenti Totali
              </span>
            </div>

            {chartData.length < 2 ? (
              <div className="h-56 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 p-6 text-center space-y-2">
                <Scale className="h-10 w-10 text-zinc-600" />
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Servono almeno <span className="text-emerald-400 font-bold">2 rilevamenti di peso</span> per mostrare il grafico di andamento.<br />
                  Registra i tuoi pesi nel riquadro a fianco.
                </p>
              </div>
            ) : (
              <div className="h-60 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#71717a' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#71717a' }} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="peso" stroke="#10b981" strokeWidth={3} dot={{ r: 5, fill: '#10b981' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* New Weight Log Form (1 Col) */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Plus className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-white">Registra Nuovo Peso</h3>
                <p className="text-xs text-zinc-400">Aggiungi il valore letto sulla bilancia</p>
              </div>
            </div>

            <form onSubmit={handleAddWeight} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Peso (kg)</label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="es. 74.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white rounded-xl text-sm font-bold focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Data Rilevamento</label>
                <Input
                  type="date"
                  value={newWeightDate}
                  onChange={(e) => setNewWeightDate(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Note (opzionale)</label>
                <Input
                  placeholder="es. A digiuno la mattina"
                  value={newWeightNotes}
                  onChange={(e) => setNewWeightNotes(e.target.value)}
                  className="bg-zinc-950 border-zinc-800 text-white rounded-xl text-xs"
                />
              </div>

              <Button type="submit" className="w-full premium-button-primary rounded-xl text-xs font-black py-2.5 shadow-lg shadow-emerald-500/20">
                <Plus className="h-4 w-4 mr-1" /> Salva Peso
              </Button>
            </form>
          </div>

        </div>

        {/* Antropometric Measurements & History Table */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Body Measurements Card */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Ruler className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Misure Antropometriche</h3>
                  <p className="text-xs text-zinc-400">Percentuale grasso e circonferenze corporei</p>
                </div>
              </div>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditingMetrics(!isEditingMetrics)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
              >
                {isEditingMetrics ? "Annulla" : "Modifica Misure"}
              </Button>
            </div>

            {isEditingMetrics ? (
              <form onSubmit={handleSaveMetrics} className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">Target Peso (kg)</label>
                    <Input
                      value={metricsForm.targetWeight}
                      onChange={(e) => setMetricsForm({ ...metricsForm, targetWeight: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-400">Stima Massa Grassa (%)</label>
                    <Input
                      value={metricsForm.bodyFat}
                      onChange={(e) => setMetricsForm({ ...metricsForm, bodyFat: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400">Vita (cm)</label>
                    <Input
                      value={metricsForm.waist}
                      onChange={(e) => setMetricsForm({ ...metricsForm, waist: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400">Petto (cm)</label>
                    <Input
                      value={metricsForm.chest}
                      onChange={(e) => setMetricsForm({ ...metricsForm, chest: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400">Braccio (cm)</label>
                    <Input
                      value={metricsForm.arm}
                      onChange={(e) => setMetricsForm({ ...metricsForm, arm: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400">Coscia (cm)</label>
                    <Input
                      value={metricsForm.thigh}
                      onChange={(e) => setMetricsForm({ ...metricsForm, thigh: e.target.value })}
                      className="bg-zinc-950 border-zinc-800 text-white text-xs rounded-xl"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl mt-2">
                  Aggiorna Scheda Biometrica
                </Button>
              </form>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl text-center space-y-0.5">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Massa Grassa %</p>
                  <p className="text-base font-black text-emerald-400 font-mono">{bodyMetrics.bodyFat || "--"}%</p>
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl text-center space-y-0.5">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Giro Vita</p>
                  <p className="text-base font-black text-sky-400 font-mono">{bodyMetrics.waist || "--"} cm</p>
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl text-center space-y-0.5">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Circonferenza Petto</p>
                  <p className="text-base font-black text-indigo-400 font-mono">{bodyMetrics.chest || "--"} cm</p>
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl text-center space-y-0.5">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Braccio Flex</p>
                  <p className="text-base font-black text-amber-400 font-mono">{bodyMetrics.arm || "--"} cm</p>
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl text-center space-y-0.5">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Giro Coscia</p>
                  <p className="text-base font-black text-purple-400 font-mono">{bodyMetrics.thigh || "--"} cm</p>
                </div>
                <div className="bg-zinc-950/80 border border-zinc-800 p-3 rounded-2xl text-center space-y-0.5">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase">Altezza</p>
                  <p className="text-base font-black text-zinc-300 font-mono">{bodyMetrics.height || "178"} cm</p>
                </div>
              </div>
            )}
          </div>

          {/* Full Weight Logs Table */}
          <div className="bg-zinc-900/90 border border-zinc-800/90 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Scale className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Storico Peso Corporeo</h3>
                  <p className="text-xs text-zinc-400">Elenco di tutte le misurazioni registrate</p>
                </div>
              </div>
            </div>

            {weightLogs.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40 space-y-1">
                <p className="text-xs text-zinc-400">Nessuna misurazione presente nello storico.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {weightLogs.map((w) => (
                  <div key={w.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs">
                    <div>
                      <span className="font-bold text-white">{w.date}</span>
                      {w.notes && <span className="text-zinc-500 ml-2">({w.notes})</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-emerald-400 text-sm">{w.weight} kg</span>
                      <button
                        onClick={() => handleDeleteWeight(w.id)}
                        className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                        title="Elimina voce"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
