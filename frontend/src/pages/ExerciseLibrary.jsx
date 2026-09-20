import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  Dumbbell, 
  Flame, 
  Info, 
  Plus, 
  CheckCircle2, 
  SlidersHorizontal,
  Activity,
  Layers
} from "lucide-react";

const INITIAL_EXERCISES = [
  {
    id: "ex_1",
    name: "Panca Piana con Bilanciere",
    category: "Forza",
    muscleGroup: "Petto",
    secondaryMuscles: ["Tricipiti", "Spalle (Anteriore)"],
    equipment: "Bilanciere",
    difficulty: "Intermedio",
    description: "Esercizio fondamentale per lo sviluppo della forza e della massa del petto. Mantenere l'arco fisiologico della schiena e i piedi saldi a terra.",
    instructions: [
      "Sdraiati sulla panca con gli occhi sotto il bilanciere.",
      "Afferra la barra con una presa leggermente più ampia delle spalle.",
      "Stacca il bilanciere ed abbassalo in modo controllato fino a toccare il petto medio.",
      "Spingi con forza verso l'alto fino a distendere le braccia senza iper-estendere i gomiti."
    ]
  },
  {
    id: "ex_2",
    name: "Squat con Bilanciere Back",
    category: "Forza",
    muscleGroup: "Gambe",
    secondaryMuscles: ["Glutei", "Core", "Lombari"],
    equipment: "Bilanciere",
    difficulty: "Avanzato",
    description: "Re degli esercizi per le gambe. Coinvolge quadricipiti, glutei e l'intero stabilizzatore del tronco.",
    instructions: [
      "Posiziona il bilanciere sui trapezi.",
      "Piedi a larghezza spalle, punte leggermente ruotate all'esterno.",
      "Scendi flettendo anche ed ginocchia mantenendo il petto alto fino a superare il parallelo.",
      "Spingi attraverso i talloni per tornare in posizione eretta."
    ]
  },
  {
    id: "ex_3",
    name: "Stacco da Terra (Deadlift)",
    category: "Forza",
    muscleGroup: "Dorso",
    secondaryMuscles: ["Glutei", "Femorali", "Trapezi", "Grip"],
    equipment: "Bilanciere",
    difficulty: "Avanzato",
    description: "Costruisce una catena posteriore d'acciaio e una forza globale ineguagliabile.",
    instructions: [
      "Posizionati davanti al bilanciere con la barra vicina alle tibie.",
      "Afferra la barra mantenendo la schiena dritta e le spalle contratte.",
      "Spingi con le gambe ed estendi il bacino contemporaneamente.",
      "Rimani eretto senza iper-estendere la zona lombare."
    ]
  },
  {
    id: "ex_4",
    name: "Trazioni alla Sbarra (Pull-ups)",
    category: "Corpo Libero",
    muscleGroup: "Dorso",
    secondaryMuscles: ["Bicipiti", "Spalle (Posteriore)", "Core"],
    equipment: "Corpo Libero",
    difficulty: "Intermedio",
    description: "Esercizio principe a corpo libero per la larghezza del dorso e la forza di trazione.",
    instructions: [
      "Afferra la sbarra con presa prona più ampia delle spalle.",
      "Tirati su portando il petto verso la sbarra ed abbassando le scapole.",
      "Raggiungi il mento sopra la sbarra e scendi in modo controllato."
    ]
  },
  {
    id: "ex_5",
    name: "Military Press (Spinte in Alto)",
    category: "Forza",
    muscleGroup: "Spalle",
    secondaryMuscles: ["Tricipiti", "Core"],
    equipment: "Bilanciere",
    difficulty: "Intermedio",
    description: "Esercizio fondamentale per la massa ed la potenza delle spalle.",
    instructions: [
      "Tieni il bilanciere all'altezza delle clavicole.",
      "Contrai glutei ed addominali, poi spingi il bilanciere verticalmente sopra la testa.",
      "Riporta il bilanciere con controllo al petto."
    ]
  },
  {
    id: "ex_6",
    name: "Dip alle Parallele",
    category: "Corpo Libero",
    muscleGroup: "Tricipiti",
    secondaryMuscles: ["Petto", "Spalle"],
    equipment: "Corpo Libero",
    difficulty: "Intermedio",
    description: "Eccellente spinta a corpo libero per tricipiti e parte inferiore del petto.",
    instructions: [
      "Sospenditi sulle parallele a braccia tese.",
      "Piegati in avanti per attivare il petto o rimani dritto per i tricipiti.",
      "Scendi finché i gomiti formano un angolo di 90 gradi e risali."
    ]
  },
  {
    id: "ex_7",
    name: "Curl con Manubri (Alternato)",
    category: "Isolamento",
    muscleGroup: "Bicipiti",
    secondaryMuscles: ["Avambracci"],
    equipment: "Manubri",
    difficulty: "Principiante",
    description: "Isolamento dei bicipiti brachiali con supinazione del polso per la massima contrazione.",
    instructions: [
      "Impugna i manubri ai lati del corpo.",
      "Fletti il gomito ruotando il palmo della mano verso l'alto a metà movimento.",
      "Contrai il bicipite in cima ed abbassa lentamente."
    ]
  },
  {
    id: "ex_8",
    name: "Affondi Camminati con Manubri",
    category: "Ipertrofia",
    muscleGroup: "Gambe",
    secondaryMuscles: ["Glutei", "Femorali"],
    equipment: "Manubri",
    difficulty: "Intermedio",
    description: "Ottimo lavoro unilaterale per stabilità, coordinazione e ipertrofia delle gambe.",
    instructions: [
      "Fai un passo in avanti sufficientemente lungo.",
      "Abbassa il bacino finché il ginocchio posteriore quasi tocca terra.",
      "Spingi col tallone anteriore e avanza con l'altra gamba."
    ]
  }
];

const MUSCLE_GROUPS = ["Tutti", "Petto", "Dorso", "Gambe", "Spalle", "Bicipiti", "Tricipiti", "Core", "Cardio"];
const EQUIPMENT_TYPES = ["Tutti", "Bilanciere", "Manubri", "Corpo Libero", "Cavi", "Macchina"];

export default function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Tutti");
  const [selectedEquipment, setSelectedEquipment] = useState("Tutti");
  const [selectedExercise, setSelectedExercise] = useState(null);

  const filteredExercises = INITIAL_EXERCISES.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "Tutti" || ex.muscleGroup === selectedGroup;
    const matchesEquipment = selectedEquipment === "Tutti" || ex.equipment === selectedEquipment;
    return matchesSearch && matchesGroup && matchesEquipment;
  });

  return (
    <div className="min-h-screen bg-[#0c0e12] text-zinc-100 pb-20 md:pb-8">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-zinc-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <BookOpen className="h-5 w-5" />
              </span>
              <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white">
                Libreria Esercizi
              </h1>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Esplora oltre 1.300+ esercizi con indicazioni sui gruppi muscolari e istruzioni di esecuzione.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              {filteredExercises.length} esercizi trovati
            </span>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl space-y-4 shadow-xl">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cerca per nome esercizio o muscolo target (es. Panca, Bicipiti)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          {/* Muscle Group Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-amber-400" /> Gruppo Muscolare
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MUSCLE_GROUPS.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`text-xs px-3 py-1.5 rounded-xl transition-all font-medium ${
                    selectedGroup === group
                      ? "bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20"
                      : "bg-zinc-950 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Equipment Pills */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/60">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-indigo-400" /> Attrezzatura
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_TYPES.map((equip) => (
                <button
                  key={equip}
                  onClick={() => setSelectedEquipment(equip)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                    selectedEquipment === equip
                      ? "bg-indigo-600 text-white font-bold"
                      : "bg-zinc-950/60 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800/80"
                  }`}
                >
                  {equip}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((ex) => (
            <div
              key={ex.id}
              className="bg-zinc-900/60 border border-zinc-800/80 hover:border-emerald-500/40 rounded-2xl p-5 transition-all hover:bg-zinc-900/90 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                
                {/* Header info */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {ex.muscleGroup}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1.5 group-hover:text-emerald-300 transition-colors">
                      {ex.name}
                    </h3>
                  </div>

                  <span className="text-[11px] font-medium px-2 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700/50">
                    {ex.equipment}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                  {ex.description}
                </p>

                {/* Secondary Muscles */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {ex.secondaryMuscles.map((sec, idx) => (
                    <span key={idx} className="text-[10px] bg-zinc-950 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                      +{sec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-zinc-800/60 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 font-mono">
                  {ex.category}
                </span>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedExercise(ex)}
                      className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 gap-1.5 h-8 px-3 rounded-xl"
                    >
                      <Info className="h-3.5 w-3.5" /> Dettagli
                    </Button>
                  </DialogTrigger>
                  
                  {selectedExercise && selectedExercise.id === ex.id && (
                    <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100 rounded-2xl p-6">
                      <DialogHeader>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {selectedExercise.muscleGroup}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                            {selectedExercise.equipment}
                          </span>
                        </div>
                        <DialogTitle className="text-xl font-bold text-white mt-2">
                          {selectedExercise.name}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-3">
                        {/* Muscle Visualizer simulation */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-zinc-400">Target Muscolare Primario</p>
                            <p className="text-base font-bold text-emerald-400 mt-0.5">{selectedExercise.muscleGroup}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-zinc-400">Difficoltà</p>
                            <p className="text-sm font-semibold text-amber-400 mt-0.5">{selectedExercise.difficulty}</p>
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Descrizione</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed">{selectedExercise.description}</p>
                        </div>

                        {/* Step by step instructions */}
                        <div>
                          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2">Istruzioni di Esecuzione</h4>
                          <ul className="space-y-2">
                            {selectedExercise.instructions.map((step, idx) => (
                              <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800/60">
                                <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>
              </div>

            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
