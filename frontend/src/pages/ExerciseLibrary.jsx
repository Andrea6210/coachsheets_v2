import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Search, 
  BookOpen, 
  Flame, 
  Info, 
  SlidersHorizontal,
  Plus
} from "lucide-react";
import { EXERCISE_CATALOG, MUSCLE_GROUPS, EQUIPMENT_TYPES } from "@/lib/exerciseCatalog";

export default function ExerciseLibrary() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Tutti");
  const [selectedEquipment, setSelectedEquipment] = useState("Tutti");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [customExercises, setCustomExercises] = useState(() => {
    try {
      const saved = localStorage.getItem("coachsheets_custom_exercises");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [newExerciseName, setNewExerciseName] = useState("");
  const [newExerciseGroup, setNewExerciseGroup] = useState("Petto");
  const [newExerciseOpen, setNewExerciseOpen] = useState(false);

  const allExercises = [...EXERCISE_CATALOG, ...customExercises];

  const filteredExercises = allExercises.filter((ex) => {
    const matchesSearch = ex.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          ex.muscleGroup.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = selectedGroup === "Tutti" || ex.muscleGroup === selectedGroup;
    const matchesEquipment = selectedEquipment === "Tutti" || ex.equipment === selectedEquipment;
    return matchesSearch && matchesGroup && matchesEquipment;
  });

  const handleAddCustomExercise = (e) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;
    const created = {
      id: `custom_${Date.now()}`,
      name: newExerciseName.trim(),
      category: "Personalizzato",
      muscleGroup: newExerciseGroup,
      secondaryMuscles: [],
      equipment: "Personalizzato",
      difficulty: "Personalizzato",
      description: "Esercizio personalizzato aggiunto alla tua libreria CoachSheets.",
      instructions: ["Esegui l'esercizio secondo le indicazioni del tuo coach."]
    };
    const updated = [created, ...customExercises];
    setCustomExercises(updated);
    try {
      localStorage.setItem("coachsheets_custom_exercises", JSON.stringify(updated));
    } catch {}
    setNewExerciseName("");
    setNewExerciseOpen(false);
  };

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
                Libreria Esercizi CoachSheets
              </h1>
            </div>
            <p className="text-sm text-zinc-400 mt-1">
              Esplora il catalogo esercizi, filtra per gruppo muscolare o crea nuovi esercizi personalizzati.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              {filteredExercises.length} esercizi trovati
            </span>

            <Dialog open={newExerciseOpen} onOpenChange={setNewExerciseOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold gap-2 text-xs rounded-xl shadow-lg shadow-emerald-500/20">
                  <Plus className="h-4 w-4" /> Crea Esercizio
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-950 border-zinc-800 text-white rounded-2xl">
                <DialogHeader>
                  <DialogTitle className="text-base font-bold text-white">Crea Nuovo Esercizio</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCustomExercise} className="space-y-4 py-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nome Esercizio</label>
                    <Input
                      placeholder="es. Hip Thrust con Bilanciere"
                      value={newExerciseName}
                      onChange={(e) => setNewExerciseName(e.target.value)}
                      className="bg-zinc-900 border-zinc-800 text-white text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Gruppo Muscolare Primario</label>
                    <select
                      value={newExerciseGroup}
                      onChange={(e) => setNewExerciseGroup(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 text-white text-xs rounded-xl px-3 py-2"
                    >
                      {MUSCLE_GROUPS.filter(g => g !== "Tutti").map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs rounded-xl">
                    Aggiungi alla Libreria
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters & Search Bar */}
        <div className="bg-zinc-900/80 border border-zinc-800/80 p-4 rounded-2xl space-y-4 shadow-xl">
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              type="text"
              placeholder="Cerca esercizio per nome o muscolo (es. Panca, Squat, Bicipiti)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-zinc-950/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 rounded-xl focus:border-emerald-500 focus:ring-emerald-500/20"
            />
          </div>

          {/* Muscle Group Pills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-emerald-400" /> Gruppo Muscolare
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
              <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-400" /> Attrezzatura
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EQUIPMENT_TYPES.map((equip) => (
                <button
                  key={equip}
                  onClick={() => setSelectedEquipment(equip)}
                  className={`text-xs px-2.5 py-1 rounded-lg transition-all font-medium ${
                    selectedEquipment === equip
                      ? "bg-zinc-800 text-emerald-400 border border-emerald-500/40 font-bold"
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

                {ex.secondaryMuscles && ex.secondaryMuscles.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {ex.secondaryMuscles.map((sec, idx) => (
                      <span key={idx} className="text-[10px] bg-zinc-950 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                        +{sec}
                      </span>
                    ))}
                  </div>
                )}
              </div>

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
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {selectedExercise.equipment}
                          </span>
                        </div>
                        <DialogTitle className="text-xl font-bold text-white mt-2">
                          {selectedExercise.name}
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 py-3">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-zinc-400">Target Muscolare Primario</p>
                            <p className="text-base font-bold text-emerald-400 mt-0.5">{selectedExercise.muscleGroup}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-zinc-400">Difficoltà</p>
                            <p className="text-sm font-semibold text-emerald-400 mt-0.5">{selectedExercise.difficulty}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">Descrizione</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed">{selectedExercise.description}</p>
                        </div>

                        {selectedExercise.instructions && (
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
                        )}
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
