import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, Square, Timer, RefreshCw } from "lucide-react";

export const WorkoutToolbox = () => {
  // -- Stopwatch State --
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);

  // -- AMRAP State --
  const [amrapMinutes, setAmrapMinutes] = useState("15");
  const [amrapTimeLeft, setAmrapTimeLeft] = useState(0);
  const [amrapRunning, setAmrapRunning] = useState(false);

  // -- EMOM State --
  const [emomEveryMin, setEmomEveryMin] = useState("1");
  const [emomRounds, setEmomRounds] = useState("10");
  const [emomCurrentRound, setEmomCurrentRound] = useState(1);
  const [emomTimeLeftInRound, setEmomTimeLeftInRound] = useState(0);
  const [emomRunning, setEmomRunning] = useState(false);

  // -- Stopwatch Logic --
  useEffect(() => {
    let interval;
    if (swRunning) {
      interval = setInterval(() => setSwTime(prev => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  // -- AMRAP Logic --
  useEffect(() => {
    let interval;
    if (amrapRunning && amrapTimeLeft > 0) {
      interval = setInterval(() => setAmrapTimeLeft(prev => prev - 1), 1000);
    } else if (amrapRunning && amrapTimeLeft === 0) {
      setAmrapRunning(false);
    }
    return () => clearInterval(interval);
  }, [amrapRunning, amrapTimeLeft]);

  const startAmrap = () => {
    if (amrapTimeLeft === 0) {
      setAmrapTimeLeft(parseInt(amrapMinutes) * 60);
    }
    setAmrapRunning(true);
  };

  // -- EMOM Logic --
  useEffect(() => {
    let interval;
    if (emomRunning) {
      if (emomTimeLeftInRound > 0) {
        interval = setInterval(() => setEmomTimeLeftInRound(prev => prev - 1), 1000);
      } else {
        if (emomCurrentRound < parseInt(emomRounds)) {
          setEmomCurrentRound(prev => prev + 1);
          setEmomTimeLeftInRound(parseInt(emomEveryMin) * 60);
        } else {
          setEmomRunning(false);
        }
      }
    }
    return () => clearInterval(interval);
  }, [emomRunning, emomTimeLeftInRound, emomCurrentRound, emomRounds, emomEveryMin]);

  const startEmom = () => {
    if (!emomRunning && emomTimeLeftInRound === 0) {
      setEmomCurrentRound(1);
      setEmomTimeLeftInRound(parseInt(emomEveryMin) * 60);
    }
    setEmomRunning(true);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-zinc-950 border border-zinc-800 shadow-2xl text-zinc-100 rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-zinc-800/80 bg-zinc-900/60 pb-3">
        <CardTitle className="flex items-center gap-2 glow-text text-emerald-400 text-base font-bold">
          <Timer className="h-5 w-5" /> Strumenti & Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="stopwatch">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
            <TabsTrigger value="stopwatch" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950">Cronometro</TabsTrigger>
            <TabsTrigger value="amrap" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950">AMRAP</TabsTrigger>
            <TabsTrigger value="emom" className="rounded-xl text-xs font-bold data-[state=active]:bg-emerald-500 data-[state=active]:text-zinc-950">EMOM</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stopwatch" className="space-y-4">
            <div className="bg-zinc-900/80 rounded-2xl p-8 text-center mt-2 border border-zinc-800 shadow-inner">
              <p className="text-6xl font-black font-mono text-emerald-400 glow-text-emerald">
                {formatTime(swTime)}
              </p>
            </div>
            <div className="flex justify-center gap-4 pt-2">
              <Button size="icon" className="h-14 w-14 rounded-2xl premium-button-primary" onClick={() => setSwRunning(!swRunning)}>
                {swRunning ? <Pause className="h-6 w-6 stroke-[3]"/> : <Play className="h-6 w-6 stroke-[3] translate-x-0.5"/>}
              </Button>
              <Button size="icon" variant="outline" className="h-14 w-14 rounded-2xl bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800" onClick={() => {setSwRunning(false); setSwTime(0);}}>
                <Square className="h-5 w-5"/>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="amrap" className="space-y-4">
             <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-400">Minuti Totali</Label>
                <Input 
                  type="number" 
                  value={amrapMinutes} 
                  onChange={(e) => setAmrapMinutes(e.target.value)} 
                  disabled={amrapRunning || amrapTimeLeft > 0}
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs"
                />
              </div>
              <div className="bg-zinc-900/80 rounded-2xl p-6 text-center border border-zinc-800">
                <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Tempo Rimanente</p>
                <p className="text-5xl font-black font-mono text-emerald-400 glow-text-emerald">
                  {amrapTimeLeft > 0 ? formatTime(amrapTimeLeft) : `${amrapMinutes}:00`}
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Button size="icon" className="h-14 w-14 rounded-2xl premium-button-primary" onClick={() => {
                  if(amrapRunning) setAmrapRunning(false);
                  else startAmrap();
                }}>
                  {amrapRunning ? <Pause className="h-6 w-6 stroke-[3]"/> : <Play className="h-6 w-6 stroke-[3] translate-x-0.5"/>}
                </Button>
                <Button size="icon" variant="outline" className="h-14 w-14 rounded-2xl bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white" onClick={() => {setAmrapRunning(false); setAmrapTimeLeft(0);}}>
                  <RefreshCw className="h-5 w-5"/>
                </Button>
              </div>
          </TabsContent>

          <TabsContent value="emom" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-400">Minuti per Round</Label>
                <Input 
                  type="number" 
                  value={emomEveryMin} 
                  onChange={(e) => setEmomEveryMin(e.target.value)} 
                  disabled={emomRunning || emomTimeLeftInRound > 0}
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-400">Totale Rounds</Label>
                <Input 
                  type="number" 
                  value={emomRounds} 
                  onChange={(e) => setEmomRounds(e.target.value)} 
                  disabled={emomRunning || emomTimeLeftInRound > 0}
                  className="bg-zinc-900 border-zinc-800 text-white rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="bg-zinc-900/80 rounded-2xl p-6 text-center border border-emerald-500/30 glow-emerald">
              <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
                Round {emomTimeLeftInRound > 0 ? emomCurrentRound : '-'}/{emomRounds}
              </p>
              <p className="text-5xl font-black font-mono text-emerald-400 glow-text-emerald">
                {emomTimeLeftInRound > 0 ? formatTime(emomTimeLeftInRound) : `${emomEveryMin}:00`}
              </p>
            </div>

            <div className="flex justify-center gap-4">
                <Button size="icon" className="h-14 w-14 rounded-2xl premium-button-primary" onClick={() => {
                  if(emomRunning) setEmomRunning(false);
                  else startEmom();
                }}>
                  {emomRunning ? <Pause className="h-6 w-6 stroke-[3]"/> : <Play className="h-6 w-6 stroke-[3] translate-x-0.5"/>}
                </Button>
                <Button size="icon" variant="outline" className="h-14 w-14 rounded-2xl bg-zinc-900 border-zinc-800 text-zinc-300 hover:text-white" onClick={() => {setEmomRunning(false); setEmomTimeLeftInRound(0);}}>
                  <RefreshCw className="h-5 w-5"/>
                </Button>
              </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
