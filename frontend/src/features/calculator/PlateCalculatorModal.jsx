import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Disc, Dumbbell } from "lucide-react";

const PLATE_COLORS = {
  25: { bg: "bg-red-600", text: "text-white", border: "border-red-400", h: "h-20", w: "w-6" },
  20: { bg: "bg-blue-600", text: "text-white", border: "border-blue-400", h: "h-18", w: "w-5" },
  15: { bg: "bg-yellow-500", text: "text-zinc-950 font-bold", border: "border-yellow-300", h: "h-16", w: "w-5" },
  10: { bg: "bg-emerald-600", text: "text-white", border: "border-emerald-400", h: "h-14", w: "w-4" },
  5: { bg: "bg-zinc-100", text: "text-zinc-950 font-bold", border: "border-zinc-300", h: "h-12", w: "w-4" },
  2.5: { bg: "bg-zinc-800", text: "text-white", border: "border-zinc-600", h: "h-10", w: "w-3" },
  1.25: { bg: "bg-zinc-400", text: "text-zinc-950 font-bold", border: "border-zinc-200", h: "h-8", w: "w-3" }
};

export const PlateCalculatorModal = ({ open, onOpenChange, initialWeight = 80 }) => {
  const [targetWeight, setTargetWeight] = useState(initialWeight || 80);
  const [barbellWeight, setBarbellWeight] = useState(20);

  const target = parseFloat(targetWeight) || 0;
  const bar = parseFloat(barbellWeight) || 20;

  const calculatePlatesPerSide = () => {
    if (target <= bar) return [];

    let remainingPerSide = (target - bar) / 2;
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const plates = [];

    for (const p of availablePlates) {
      while (remainingPerSide >= p) {
        plates.push(p);
        remainingPerSide -= p;
        // arrotondamento float
        remainingPerSide = Math.round(remainingPerSide * 100) / 100;
      }
    }
    return plates;
  };

  const platesPerSide = calculatePlatesPerSide();
  const loadedTotal = bar + platesPerSide.reduce((a, b) => a + b, 0) * 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Disc className="h-5 w-5 text-emerald-400" />
            Calcolatore Piastre sul Bilanciere
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Visualizza immediatamente quali dischi caricare su ciascun lato del bilanciere.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Selettori Peso Target e Peso Bilanciere */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-zinc-400 mb-1 block">Peso Target (kg)</Label>
              <Input
                type="number"
                step="0.5"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                className="bg-zinc-900 border-zinc-750 font-mono text-base font-bold text-center text-emerald-400"
              />
            </div>

            <div>
              <Label className="text-xs text-zinc-400 mb-1 block">Bilanciere (kg)</Label>
              <select
                value={barbellWeight}
                onChange={(e) => setBarbellWeight(parseFloat(e.target.value))}
                className="w-full h-9 bg-zinc-900 border border-zinc-700 rounded-md px-2 text-xs text-zinc-200"
              >
                <option value={20}>Olimpico Uomo (20 kg)</option>
                <option value={15}>Olimpico Donna (15 kg)</option>
                <option value={10}>Bilanciere EZ / Corto (10 kg)</option>
                <option value={0}>Nessuna tara / Macchinario (0 kg)</option>
              </select>
            </div>
          </div>

          {/* Rappresentazione Grafica del Carico per Lato */}
          <div className="bg-zinc-900/90 rounded-xl p-4 border border-zinc-800 text-center space-y-3">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
              Dischi da mettere su <span className="text-emerald-400 font-bold">ciascun lato</span>:
            </div>

            {target <= bar ? (
              <p className="text-xs text-zinc-400 italic py-4">
                Solo bilanciere scarico ({bar} kg).
              </p>
            ) : platesPerSide.length === 0 ? (
              <p className="text-xs text-amber-400 py-4">
                Carico inferiore al disco minimo (1.25 kg).
              </p>
            ) : (
              <div className="flex items-center justify-center gap-1.5 py-4 overflow-x-auto min-h-[90px]">
                {/* Bilanciere bar */}
                <div className="h-4 w-12 bg-zinc-600 rounded-l border-y border-l border-zinc-500 shrink-0" title="Manicotto bilanciere" />

                {/* Dischi in sequenza */}
                {platesPerSide.map((plate, idx) => {
                  const style = PLATE_COLORS[plate] || PLATE_COLORS[5];
                  return (
                    <div
                      key={idx}
                      className={`${style.bg} ${style.text} ${style.border} ${style.w} ${style.h} rounded-sm border flex items-center justify-center text-[10px] font-mono shadow-md shrink-0`}
                      title={`${plate} kg`}
                    >
                      <span className="rotate-90 whitespace-nowrap">{plate}</span>
                    </div>
                  );
                })}

                {/* Collare / Fermadischi */}
                <div className="h-6 w-2 bg-amber-500 rounded-r border border-amber-400 shrink-0" title="Fermadischi" />
              </div>
            )}

            {/* Riepilogo testuale */}
            {platesPerSide.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {platesPerSide.map((p, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-mono bg-zinc-950 border-zinc-700">
                    {p} kg
                  </Badge>
                ))}
              </div>
            )}

            <div className="text-xs text-zinc-400 pt-1 border-t border-zinc-800 flex justify-between px-2">
              <span>Totale effettivo caricato:</span>
              <span className="font-mono font-bold text-emerald-400">{loadedTotal} kg</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
            Chiudi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
