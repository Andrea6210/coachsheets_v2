import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Trash2, Zap, Flame, ArrowUpRight, Calculator, Check, Sparkles
} from "lucide-react";

const SET_TYPES = [
  { value: "top_set", label: "Top Set", badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  { value: "back_off", label: "Back-off", badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40" },
  { value: "standard", label: "Target", badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
  { value: "warm_up", label: "Warm-up", badgeClass: "bg-orange-500/20 text-orange-300 border-orange-500/40" },
  { value: "drop_set", label: "Drop set / AMRAP", badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40" }
];

export const SetDetailsBreakdown = ({ 
  exercise, 
  onUpdateSetDetails, 
  onOpenPlateCalc 
}) => {
  const [reference1RM, setReference1RM] = useState("");
  const setDetails = exercise.set_details || exercise.setDetails || [];

  const handleAddSet = () => {
    const nextNumber = setDetails.length + 1;
    const newSet = {
      set_number: nextNumber,
      type: nextNumber === 1 ? "top_set" : "back_off",
      intensity: nextNumber === 1 ? "90%" : "75%",
      reps: nextNumber === 1 ? "5-6" : "8-10",
      weight: exercise.weight || "",
      notes: ""
    };
    onUpdateSetDetails([...setDetails, newSet]);
  };

  const handleUpdateSet = (index, field, value) => {
    const updated = setDetails.map((s, idx) => {
      if (idx === index) {
        return { ...s, [field]: value };
      }
      return s;
    });
    onUpdateSetDetails(updated);
  };

  const handleRemoveSet = (index) => {
    const filtered = setDetails
      .filter((_, idx) => idx !== index)
      .map((s, idx) => ({ ...s, set_number: idx + 1 }));
    onUpdateSetDetails(filtered);
  };

  // Preset 1: Top Set al 90% e Back-off al 75%
  const applyTopSetBackoffPreset = () => {
    const newSets = [
      { set_number: 1, type: "top_set", intensity: "90%", reps: "5", weight: "", notes: "Top Set @ RPE 9" },
      { set_number: 2, type: "back_off", intensity: "75%", reps: "8", weight: "", notes: "Back-off (focus esplosivo)" },
      { set_number: 3, type: "back_off", intensity: "75%", reps: "8", weight: "", notes: "Back-off" },
      { set_number: 4, type: "back_off", intensity: "75%", reps: "AMRAP", weight: "", notes: "Cedimento tecnico" }
    ];
    onUpdateSetDetails(newSets);
  };

  // Preset 2: Piramidale ascendente
  const applyPyramidPreset = () => {
    const newSets = [
      { set_number: 1, type: "standard", intensity: "70%", reps: "10", weight: "", notes: "Riscaldamento specifico / Serie 1" },
      { set_number: 2, type: "standard", intensity: "80%", reps: "8", weight: "", notes: "Serie 2" },
      { set_number: 3, type: "top_set", intensity: "90%", reps: "6", weight: "", notes: "Peak set" }
    ];
    onUpdateSetDetails(newSets);
  };

  // Preset 3: Generatore Riscaldamento progressivo (Warm-up generator)
  const applyWarmupProgression = () => {
    const targetW = parseFloat(exercise.weight) || (reference1RM ? parseFloat(reference1RM) * 0.9 : 100);
    const newSets = [
      { set_number: 1, type: "warm_up", intensity: "Bilanciere", reps: "10-12", weight: "20kg", notes: "Riscaldamento articolare" },
      { set_number: 2, type: "warm_up", intensity: "50%", reps: "5", weight: `${Math.round(targetW * 0.5)}kg`, notes: "Attivazione neurale" },
      { set_number: 3, type: "warm_up", intensity: "70%", reps: "3", weight: `${Math.round(targetW * 0.7)}kg`, notes: "Avvicinamento" },
      { set_number: 4, type: "warm_up", intensity: "85%", reps: "1", weight: `${Math.round(targetW * 0.85)}kg`, notes: "Test feeling" },
      { set_number: 5, type: "top_set", intensity: "90%", reps: "5", weight: `${Math.round(targetW * 0.9)}kg`, notes: "PRIMA SERIE TARGET" }
    ];
    onUpdateSetDetails(newSets);
  };

  // Calcolo kg automatico se c'è un massimale o carico base
  const calculateKgFromPercent = (intensityStr) => {
    const ref = parseFloat(reference1RM) || parseFloat(exercise.weight);
    if (!ref || isNaN(ref)) return null;
    const match = intensityStr && intensityStr.match(/(\d+)%/);
    if (match) {
      const pct = parseFloat(match[1]);
      return Math.round((ref * (pct / 100)) * 2) / 2; // arrotondato a 0.5kg
    }
    return null;
  };

  return (
    <div className="bg-zinc-950/60 border-t border-zinc-800 p-3 sm:p-4 space-y-3">
      {/* Barra Azioni & Preset Rapidi */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-semibold gap-1">
            <Zap className="h-3 w-3" /> Schema Serie Differenziate
          </Badge>
          <span className="text-xs text-zinc-400 hidden sm:inline">
            Configura ogni serie con intensità (%) e ripetizioni specifiche
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyTopSetBackoffPreset}
            className="h-7 text-xs bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
            title="1ª serie al 90%, successive al 75%"
          >
            <Sparkles className="h-3 w-3 mr-1" /> Top Set (90%) + Back-off (75%)
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyPyramidPreset}
            className="h-7 text-xs bg-sky-500/10 border-sky-500/30 text-sky-300 hover:bg-sky-500/20"
          >
            <ArrowUpRight className="h-3 w-3 mr-1" /> Piramidale
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={applyWarmupProgression}
            className="h-7 text-xs bg-orange-500/10 border-orange-500/30 text-orange-300 hover:bg-orange-500/20"
          >
            <Flame className="h-3 w-3 mr-1" /> Riscaldamento
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleAddSet}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            <Plus className="h-3 w-3 mr-1" /> + Serie
          </Button>
        </div>
      </div>

      {/* Riferimento Massimale / 1RM opzionale per conversione automatica % in Kg */}
      <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-md border border-zinc-800 text-xs text-zinc-300">
        <span className="text-zinc-400">1RM / Carico di Riferimento per calcolo %:</span>
        <Input
          type="number"
          placeholder="es. 100kg"
          value={reference1RM}
          onChange={(e) => setReference1RM(e.target.value)}
          className="h-6 w-24 text-xs bg-zinc-950 border-zinc-700 font-mono text-center"
        />
        <span className="text-zinc-500 text-[11px] hidden md:inline">
          (Traduce in automatico le percentuali es. 90% in kg esatti)
        </span>
        {onOpenPlateCalc && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenPlateCalc(reference1RM || exercise.weight)}
            className="h-6 text-[11px] ml-auto text-emerald-400 hover:text-emerald-300 gap-1 px-2"
          >
            <Calculator className="h-3 w-3" /> Calcolatore Piastre
          </Button>
        )}
      </div>

      {/* Lista / Tabella delle serie */}
      {setDetails.length === 0 ? (
        <div className="text-center py-4 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
          Nessuna serie configurata singolarmente. Usa i preset rapidi qui sopra (es. Top Set + Back-off) oppure clicca "+ Serie".
        </div>
      ) : (
        <div className="space-y-1.5">
          {setDetails.map((s, index) => {
            const calculatedKg = calculateKgFromPercent(s.intensity);
            const typeConfig = SET_TYPES.find(t => t.value === s.type) || SET_TYPES[2];

            return (
              <div 
                key={index} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-colors"
              >
                {/* Badge Set # e Selettore Tipo */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-xs font-bold text-zinc-300 w-6 text-center">
                    #{s.set_number || index + 1}
                  </span>

                  <select
                    value={s.type || "standard"}
                    onChange={(e) => handleUpdateSet(index, "type", e.target.value)}
                    className="h-7 text-xs bg-zinc-950 border border-zinc-700 rounded px-2 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {SET_TYPES.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Campi Intensità / Reps / Carico / Note */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 flex-1">
                  <div>
                    <Label className="text-[10px] text-zinc-500 block mb-0.5">Intensità / %</Label>
                    <Input
                      value={s.intensity || ""}
                      onChange={(e) => handleUpdateSet(index, "intensity", e.target.value)}
                      placeholder="90%"
                      className="h-7 text-xs bg-zinc-950 border-zinc-800 font-mono text-center focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] text-zinc-500 block mb-0.5">Reps</Label>
                    <Input
                      value={s.reps || ""}
                      onChange={(e) => handleUpdateSet(index, "reps", e.target.value)}
                      placeholder="5"
                      className="h-7 text-xs bg-zinc-950 border-zinc-800 font-mono text-center focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <Label className="text-[10px] text-zinc-500 block mb-0.5">
                      Peso {calculatedKg ? `(~${calculatedKg}kg)` : ""}
                    </Label>
                    <Input
                      value={s.weight || (calculatedKg ? `${calculatedKg}kg` : "")}
                      onChange={(e) => handleUpdateSet(index, "weight", e.target.value)}
                      placeholder={calculatedKg ? `${calculatedKg}kg` : "90kg"}
                      className="h-7 text-xs bg-zinc-950 border-zinc-800 font-mono text-center focus-visible:ring-emerald-500"
                    />
                  </div>

                  <div className="col-span-3 sm:col-span-1">
                    <Label className="text-[10px] text-zinc-500 block mb-0.5">Note serie / RPE</Label>
                    <Input
                      value={s.notes || ""}
                      onChange={(e) => handleUpdateSet(index, "notes", e.target.value)}
                      placeholder="RPE 9 / Fermo 1s"
                      className="h-7 text-xs bg-zinc-950 border-zinc-800 focus-visible:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Tasto elimina riga */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveSet(index)}
                  className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400 shrink-0 self-end sm:self-center"
                  title="Elimina serie"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
