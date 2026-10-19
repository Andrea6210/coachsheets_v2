import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator as CalcIcon, Weight, ArrowDownRight, Percent, Disc } from "lucide-react";

export const Calculator = () => {
  const [activeTab, setActiveTab] = useState("1rm");
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [barbellWeight, setBarbellWeight] = useState("20");
  const [oneRM, setOneRM] = useState(0);
  
  // Percentuali: modalità Diretta vs Riduzione % (Back-off)
  const [percentMode, setPercentMode] = useState("direct"); // "direct" | "reduction"
  const [knownMax, setKnownMax] = useState("");
  const [targetPercent, setTargetPercent] = useState("");

  // Riduzione da peso X (Back-off set)
  const [baseWeight, setBaseWeight] = useState("");
  const [reductionPercent, setReductionPercent] = useState("10");

  // Epley formula: 1RM = weight * (1 + reps / 30)
  useEffect(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!isNaN(w) && !isNaN(r) && r > 0 && w > 0) {
      const epley = w * (1 + r / 30.0);
      setOneRM(Math.round(epley * 10) / 10);
    } else {
      setOneRM(0);
    }
  }, [weight, reps]);

  const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];
  const quickReductions = [5, 7.5, 10, 12.5, 15, 20];

  const calculatePlates = (targetWeight) => {
    const bar = parseFloat(barbellWeight) || 20;
    if (targetWeight <= bar) return "Solo bilanciere";
    
    let remainingWeightPerSide = (targetWeight - bar) / 2;
    const availablePlates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const platesToUse = [];

    for (let plate of availablePlates) {
      while (remainingWeightPerSide >= plate) {
        platesToUse.push(plate);
        remainingWeightPerSide -= plate;
        remainingWeightPerSide = Math.round(remainingWeightPerSide * 100) / 100;
      }
    }

    if (platesToUse.length === 0) return "Nessun disco (arrotondamento)";
    return platesToUse.map(p => `${p}kg`).join(" + ");
  };

  // Calcolo riduzione da peso base X
  const parsedBase = parseFloat(baseWeight) || 0;
  const parsedReduction = parseFloat(reductionPercent) || 0;
  const deltaReducedKg = Math.round((parsedBase * (parsedReduction / 100)) * 10) / 10;
  const finalReducedWeight = Math.max(0, Math.round((parsedBase - deltaReducedKg) * 10) / 10);

  const transferToPlates = (w) => {
    setWeight(w.toString());
    setActiveTab("plates");
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-950 border border-zinc-800 text-zinc-100 shadow-2xl rounded-3xl overflow-hidden">
      <CardHeader className="bg-zinc-900/60 border-b border-zinc-800/80 pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-bold text-emerald-400">
          <CalcIcon className="h-5 w-5" /> Calcolatrice 1RM, % & Dischi
        </CardTitle>
        <CardDescription className="text-zinc-400 text-xs">
          Calcola il tuo massimale, percentuali dirette, riduzione per serie back-off e piastre.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
            <TabsTrigger value="1rm" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950">Calcolo 1RM</TabsTrigger>
            <TabsTrigger value="percent" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950">Percentuali & Scalo</TabsTrigger>
            <TabsTrigger value="plates" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950">Dischi</TabsTrigger>
          </TabsList>
          
          {/* TAB 1: CALCOLO 1RM */}
          <TabsContent value="1rm" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-400">Peso Sollevato (kg)</Label>
                <Input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  placeholder="Es: 80" 
                  inputMode="decimal"
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-400">Ripetizioni Fatte</Label>
                <Input 
                  type="number" 
                  value={reps} 
                  onChange={(e) => setReps(e.target.value)} 
                  placeholder="Es: 5" 
                  inputMode="numeric"
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="bg-zinc-900/80 rounded-2xl p-5 text-center border border-zinc-800">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">Massimale Teorico Stimato (1RM)</p>
              <p className="text-4xl sm:text-5xl font-black font-mono text-emerald-400 glow-text-emerald">
                {oneRM > 0 ? `${oneRM} kg` : "--"}
              </p>
            </div>

            {oneRM > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-400">
                  <span>Tabella Intensità (%)</span>
                  <button 
                    onClick={() => {
                      setBaseWeight(oneRM.toString());
                      setPercentMode("reduction");
                      setActiveTab("percent");
                    }}
                    className="text-emerald-400 hover:underline flex items-center gap-1 font-normal text-[11px]"
                  >
                    Usa come base per scarico →
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs max-h-48 overflow-y-auto pr-1">
                  {percentages.map(p => {
                    const val = Math.round((oneRM * (p / 100)) * 10) / 10;
                    return (
                      <div key={p} className="flex justify-between items-center bg-zinc-900/70 border border-zinc-800/80 p-2 rounded-xl">
                        <span className="font-bold text-zinc-400">{p}%</span>
                        <span className="font-bold font-mono text-white">{val} kg</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          {/* TAB 2: PERCENTUALI & RIDUZIONE SCALO DA PESO X */}
          <TabsContent value="percent" className="space-y-4">
            
            {/* Toggle Tipo Calcolo */}
            <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setPercentMode("direct")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  percentMode === "direct"
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                % Diretta (1RM)
              </button>
              <button
                type="button"
                onClick={() => setPercentMode("reduction")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  percentMode === "reduction"
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Riduzione % (Back-off)
              </button>
            </div>

            {/* MODALITA' A: CALCOLO DIRETTO */}
            {percentMode === "direct" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-400">Massimale (kg)</Label>
                    <Input 
                      type="number" 
                      value={knownMax} 
                      onChange={(e) => setKnownMax(e.target.value)} 
                      placeholder="Es: 100" 
                      inputMode="decimal"
                      className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-400">Percentuale (%)</Label>
                    <Input 
                      type="number" 
                      value={targetPercent} 
                      onChange={(e) => setTargetPercent(e.target.value)} 
                      placeholder="Es: 80" 
                      inputMode="numeric"
                      className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {parseFloat(knownMax) > 0 && parseFloat(targetPercent) > 0 && (
                  <div className="bg-zinc-900/80 rounded-2xl p-5 text-center border border-zinc-800 space-y-2">
                    <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      {targetPercent}% di {knownMax} kg
                    </p>
                    <p className="text-4xl font-black font-mono text-emerald-400 glow-text-emerald">
                      {Math.round((parseFloat(knownMax) * (parseFloat(targetPercent) / 100)) * 10) / 10} kg
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => transferToPlates(Math.round((parseFloat(knownMax) * (parseFloat(targetPercent) / 100)) * 10) / 10)}
                      className="mt-2 text-xs bg-zinc-950 border-zinc-800 text-emerald-400 hover:bg-emerald-500/10 gap-1 rounded-xl"
                    >
                      <Disc className="h-3.5 w-3.5" /> Calcola Dischi sul Bilanciere
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* MODALITA' B: RIDUZIONE DA UN PESO X (BACK-OFF SETS) */}
            {percentMode === "reduction" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-400">Peso di Partenza X (kg)</Label>
                    <Input 
                      type="number" 
                      value={baseWeight} 
                      onChange={(e) => setBaseWeight(e.target.value)} 
                      placeholder="Es: 100 (Top Set)" 
                      inputMode="decimal"
                      className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-400">Riduzione da Scalare (%)</Label>
                    <Input 
                      type="number" 
                      value={reductionPercent} 
                      onChange={(e) => setReductionPercent(e.target.value)} 
                      placeholder="Es: 10" 
                      inputMode="decimal"
                      className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs font-mono"
                    />
                  </div>
                </div>

                {/* Preset Rapidi di Scarico */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Preset Rapidi Scarico Back-off</span>
                  <div className="flex flex-wrap gap-1.5">
                    {quickReductions.map(pct => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setReductionPercent(pct.toString())}
                        className={`text-xs px-2.5 py-1 rounded-xl font-bold font-mono transition-all border ${
                          parseFloat(reductionPercent) === pct
                            ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md"
                            : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800"
                        }`}
                      >
                        -{pct}%
                      </button>
                    ))}
                  </div>
                </div>

                {parsedBase > 0 && parsedReduction > 0 && (
                  <div className="bg-zinc-900/80 rounded-2xl p-5 text-center border border-zinc-800 space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 font-medium">
                      <span>Da {parsedBase} kg</span>
                      <ArrowDownRight className="h-4 w-4 text-amber-400" />
                      <span className="text-amber-400 font-bold">Scalo -{parsedReduction}% (-{deltaReducedKg} kg)</span>
                    </div>

                    <p className="text-4xl font-black font-mono text-emerald-400 glow-text-emerald">
                      {finalReducedWeight} kg
                    </p>

                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => transferToPlates(finalReducedWeight)}
                      className="mt-2 text-xs bg-zinc-950 border-zinc-800 text-emerald-400 hover:bg-emerald-500/10 gap-1 rounded-xl"
                    >
                      <Disc className="h-3.5 w-3.5" /> Calcola Dischi per {finalReducedWeight} kg
                    </Button>
                  </div>
                )}

                {/* Tabella riepilogativa scarichi per il peso base */}
                {parsedBase > 0 && (
                  <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                      Tabella Scalo da {parsedBase} kg
                    </p>
                    <div className="grid grid-cols-3 gap-1.5 text-xs">
                      {quickReductions.map(pct => {
                        const delta = Math.round((parsedBase * (pct / 100)) * 10) / 10;
                        const finalW = Math.round((parsedBase - delta) * 10) / 10;
                        return (
                          <div 
                            key={pct} 
                            onClick={() => setReductionPercent(pct.toString())}
                            className={`p-2 rounded-xl border text-center cursor-pointer transition-all ${
                              parseFloat(reductionPercent) === pct 
                                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300' 
                                : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800 text-zinc-300'
                            }`}
                          >
                            <span className="text-[10px] font-bold text-zinc-400 block">-{pct}%</span>
                            <span className="font-mono font-bold text-white text-xs">{finalW} kg</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}
          </TabsContent>
          
          {/* TAB 3: DISCHI BILANCIERE */}
          <TabsContent value="plates" className="space-y-4">
             <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-400">Peso Totale (kg)</Label>
                <Input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  placeholder="Es: 100" 
                  inputMode="decimal"
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-zinc-400">Bilanciere (kg)</Label>
                <select 
                  value={barbellWeight} 
                  onChange={(e) => setBarbellWeight(e.target.value)} 
                  className="w-full h-9 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-xs px-2 font-mono"
                >
                  <option value="20">Olimpico 20kg</option>
                  <option value="15">Donna 15kg</option>
                  <option value="10">EZ / Corto 10kg</option>
                  <option value="0">Macchinario 0kg</option>
                </select>
              </div>
            </div>

            {parseFloat(weight) > 0 && (
              <div className="bg-zinc-900/80 rounded-2xl p-5 border border-zinc-800 text-center space-y-2">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Weight className="h-4 w-4" /> Dischi per lato
                </p>
                <p className="font-mono text-base sm:text-lg font-bold text-white bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                  {calculatePlates(parseFloat(weight))}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
