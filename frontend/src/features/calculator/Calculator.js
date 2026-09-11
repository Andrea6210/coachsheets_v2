import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator as CalcIcon, Weight } from "lucide-react";

export const Calculator = () => {
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");
  const [barbellWeight, setBarbellWeight] = useState("20");
  const [oneRM, setOneRM] = useState(0);
  
  // Per il calcolo percentuale inverso
  const [knownMax, setKnownMax] = useState("");
  const [targetPercent, setTargetPercent] = useState("");

  // Epley formula: 1RM = weight * (1 + reps / 30)
  // Brzycki formula: 1RM = weight * (36 / (37 - reps))
  useEffect(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps);
    if (!isNaN(w) && !isNaN(r) && r > 0 && w > 0) {
      // Epley is generally preferred for > 5 reps, let's use a standard average or Epley
      const epley = w * (1 + r / 30.0);
      setOneRM(Math.round(epley * 10) / 10);
    } else {
      setOneRM(0);
    }
  }, [weight, reps]);

  const percentages = [100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50];

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
      }
    }

    if (platesToUse.length === 0) return "Nessun disco (arrotondamento)";
    return platesToUse.map(p => `${p}kg`).join(" + ");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalcIcon className="h-5 w-5" /> Calcolatrice 1RM & Dischi
        </CardTitle>
        <CardDescription>Calcola il tuo massimale teorico e le percentuali.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="1rm">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="1rm" className="text-xs sm:text-sm">Calcolo 1RM</TabsTrigger>
            <TabsTrigger value="percent" className="text-xs sm:text-sm">Percentuali</TabsTrigger>
            <TabsTrigger value="plates" className="text-xs sm:text-sm">Dischi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="1rm" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <Input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  placeholder="Es: 80" 
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-2">
                <Label>Ripetizioni</Label>
                <Input 
                  type="number" 
                  value={reps} 
                  onChange={(e) => setReps(e.target.value)} 
                  placeholder="Es: 5" 
                  inputMode="numeric"
                />
              </div>
            </div>

            <div className="bg-primary/10 rounded-lg p-4 text-center mt-4">
              <p className="text-sm text-muted-foreground mb-1">Massimale Teorico (1RM)</p>
              <p className="text-4xl font-bold font-heading text-primary">
                {oneRM > 0 ? `${oneRM} kg` : "--"}
              </p>
            </div>

            {oneRM > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-3">Tabella Percentuali</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {percentages.map(p => {
                    const val = Math.round((oneRM * (p / 100)) * 10) / 10;
                    return (
                      <div key={p} className="flex justify-between items-center bg-muted/50 p-2 rounded">
                        <span className="font-medium text-muted-foreground">{p}%</span>
                        <span className="font-bold">{val} kg</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="percent" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Massimale (kg)</Label>
                <Input 
                  type="number" 
                  value={knownMax} 
                  onChange={(e) => setKnownMax(e.target.value)} 
                  placeholder="Es: 100" 
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-2">
                <Label>Percentuale (%)</Label>
                <Input 
                  type="number" 
                  value={targetPercent} 
                  onChange={(e) => setTargetPercent(e.target.value)} 
                  placeholder="Es: 80" 
                  inputMode="numeric"
                />
              </div>
            </div>

            {parseFloat(knownMax) > 0 && parseFloat(targetPercent) > 0 && (
              <div className="bg-primary/10 rounded-lg p-4 text-center mt-4">
                <p className="text-sm text-muted-foreground mb-1">Peso da Caricare</p>
                <p className="text-4xl font-bold font-heading text-primary">
                  {Math.round((parseFloat(knownMax) * (parseFloat(targetPercent) / 100)) * 10) / 10} kg
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="plates" className="space-y-4">
             <div className="space-y-2">
                <Label>Peso da sollevare (kg)</Label>
                <Input 
                  type="number" 
                  value={weight} 
                  onChange={(e) => setWeight(e.target.value)} 
                  placeholder="Es: 100" 
                  inputMode="decimal"
                />
              </div>
              <div className="space-y-2">
                <Label>Peso Bilanciere (kg)</Label>
                <Input 
                  type="number" 
                  value={barbellWeight} 
                  onChange={(e) => setBarbellWeight(e.target.value)} 
                  placeholder="Es: 20" 
                  inputMode="decimal"
                />
              </div>

              {parseFloat(weight) > 0 && (
                <div className="bg-muted rounded-lg p-4 mt-4">
                  <p className="text-sm font-medium mb-3 flex items-center gap-2">
                    <Weight className="h-4 w-4" /> Dischi per lato
                  </p>
                  <p className="font-mono text-lg text-primary">
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
