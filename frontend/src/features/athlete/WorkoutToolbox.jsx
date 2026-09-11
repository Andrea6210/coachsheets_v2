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
    <Card className="w-full max-w-md mx-auto glass-card border-none shadow-2xl text-slate-100">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 glow-text text-sky-400">
          <Timer className="h-5 w-5" /> Strumenti
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="stopwatch">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-slate-900/50">
            <TabsTrigger value="stopwatch" className="data-[state=active]:bg-sky-500 data-[state=active]:text-slate-900">Cronometro</TabsTrigger>
            <TabsTrigger value="amrap" className="data-[state=active]:bg-sky-500 data-[state=active]:text-slate-900">AMRAP</TabsTrigger>
            <TabsTrigger value="emom" className="data-[state=active]:bg-sky-500 data-[state=active]:text-slate-900">EMOM</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stopwatch" className="space-y-4">
            <div className="bg-slate-950/50 rounded-xl p-8 text-center mt-4 border border-white/5">
              <p className="text-6xl font-bold font-mono text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                {formatTime(swTime)}
              </p>
            </div>
            <div className="flex justify-center gap-4">
              <Button size="icon" className="h-14 w-14 rounded-full premium-button-primary" onClick={() => setSwRunning(!swRunning)}>
                {swRunning ? <Pause className="h-6 w-6"/> : <Play className="h-6 w-6"/>}
              </Button>
              <Button size="icon" variant="outline" className="h-14 w-14 rounded-full border-white/10 hover:bg-white/10" onClick={() => {setSwRunning(false); setSwTime(0);}}>
                <Square className="h-5 w-5"/>
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="amrap" className="space-y-4">
             <div className="space-y-2">
                <Label className="text-slate-300">Minuti Totali</Label>
                <Input 
                  type="number" 
                  value={amrapMinutes} 
                  onChange={(e) => setAmrapMinutes(e.target.value)} 
                  disabled={amrapRunning || amrapTimeLeft > 0}
                  className="bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
              <div className="bg-slate-950/50 rounded-xl p-6 text-center border border-white/5">
                <p className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-2">Tempo Rimanente</p>
                <p className="text-5xl font-bold font-mono text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                  {amrapTimeLeft > 0 ? formatTime(amrapTimeLeft) : `${amrapMinutes}:00`}
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Button size="icon" className="h-14 w-14 rounded-full premium-button-primary" onClick={() => {
                  if(amrapRunning) setAmrapRunning(false);
                  else startAmrap();
                }}>
                  {amrapRunning ? <Pause className="h-6 w-6"/> : <Play className="h-6 w-6"/>}
                </Button>
                <Button size="icon" variant="outline" className="h-14 w-14 rounded-full border-white/10 hover:bg-white/10" onClick={() => {setAmrapRunning(false); setAmrapTimeLeft(0);}}>
                  <RefreshCw className="h-5 w-5"/>
                </Button>
              </div>
          </TabsContent>

          <TabsContent value="emom" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Minuti per Round</Label>
                <Input 
                  type="number" 
                  value={emomEveryMin} 
                  onChange={(e) => setEmomEveryMin(e.target.value)} 
                  disabled={emomRunning || emomTimeLeftInRound > 0}
                  className="bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Totale Rounds</Label>
                <Input 
                  type="number" 
                  value={emomRounds} 
                  onChange={(e) => setEmomRounds(e.target.value)} 
                  disabled={emomRunning || emomTimeLeftInRound > 0}
                  className="bg-slate-900/50 border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="bg-slate-950/50 rounded-xl p-6 text-center border border-sky-500/20 shadow-[0_0_20px_rgba(56,189,248,0.1)]">
              <p className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-1">
                Round {emomTimeLeftInRound > 0 ? emomCurrentRound : '-'}/{emomRounds}
              </p>
              <p className="text-5xl font-bold font-mono text-sky-400 drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]">
                {emomTimeLeftInRound > 0 ? formatTime(emomTimeLeftInRound) : `${emomEveryMin}:00`}
              </p>
            </div>

            <div className="flex justify-center gap-4">
                <Button size="icon" className="h-14 w-14 rounded-full premium-button-primary" onClick={() => {
                  if(emomRunning) setEmomRunning(false);
                  else startEmom();
                }}>
                  {emomRunning ? <Pause className="h-6 w-6"/> : <Play className="h-6 w-6"/>}
                </Button>
                <Button size="icon" variant="outline" className="h-14 w-14 rounded-full border-white/10 hover:bg-white/10" onClick={() => {setEmomRunning(false); setEmomTimeLeftInRound(0);}}>
                  <RefreshCw className="h-5 w-5"/>
                </Button>
              </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
