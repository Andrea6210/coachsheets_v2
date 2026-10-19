import { EXERCISE_CATALOG } from "./exerciseCatalog";

export const MUSCLE_PALETTE = {
  "Petto": { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", bar: "bg-emerald-400" },
  "Dorso": { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-400", bar: "bg-sky-400" },
  "Spalle": { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-400", bar: "bg-violet-400" },
  "Quadricipiti": { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", bar: "bg-amber-400" },
  "Catena Posteriore": { bg: "bg-rose-500/10", border: "border-rose-500/30", text: "text-rose-400", bar: "bg-rose-400" },
  "Bicipiti": { bg: "bg-cyan-500/10", border: "border-cyan-500/30", text: "text-cyan-400", bar: "bg-cyan-400" },
  "Tricipiti": { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-400", bar: "bg-indigo-400" },
  "Addome / Core": { bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-400", bar: "bg-teal-400" },
  "Polpacci": { bg: "bg-orange-500/10", border: "border-orange-500/30", text: "text-orange-400", bar: "bg-orange-400" },
  "Altro / Complementari": { bg: "bg-zinc-800/50", border: "border-zinc-700/50", text: "text-zinc-400", bar: "bg-zinc-500" }
};

export const getMuscleStyle = (muscle) => {
  return MUSCLE_PALETTE[muscle] || MUSCLE_PALETTE["Altro / Complementari"];
};

/**
 * Classifica il gruppo muscolare primario e secondario in base al catalogo o a euristiche sul nome.
 */
export const classifyExerciseMuscle = (exerciseName) => {
  if (!exerciseName) {
    return { primary: "Altro / Complementari", secondary: [] };
  }

  const cleanName = exerciseName.trim().toLowerCase();

  // 1. Cerca nel catalogo ufficiale
  if (Array.isArray(EXERCISE_CATALOG)) {
    const found = EXERCISE_CATALOG.find(
      c => c && c.name && c.name.toLowerCase() === cleanName
    );
    if (found && found.muscleGroup) {
      return {
        primary: normalizeMuscleName(found.muscleGroup),
        secondary: (found.secondaryMuscles || []).map(normalizeMuscleName)
      };
    }
  }

  // 2. Euristiche avanzate per nomi personalizzati
  if (cleanName.includes("panca") || cleanName.includes("chest") || cleanName.includes("croci") || cleanName.includes("dip") || cleanName.includes("spinte manubri")) {
    return { primary: "Petto", secondary: ["Tricipiti", "Spalle"] };
  }
  if (cleanName.includes("trazioni") || cleanName.includes("rematore") || cleanName.includes("lat") || cleanName.includes("pulley") || cleanName.includes("dorso") || cleanName.includes("pull down")) {
    return { primary: "Dorso", secondary: ["Bicipiti", "Spalle"] };
  }
  if (cleanName.includes("military") || cleanName.includes("lento") || cleanName.includes("alzate") || cleanName.includes("shoulder") || cleanName.includes("spalle") || cleanName.includes("deltoid")) {
    return { primary: "Spalle", secondary: ["Tricipiti"] };
  }
  if (cleanName.includes("squat") || cleanName.includes("pressa") || cleanName.includes("leg extension") || cleanName.includes("hack") || cleanName.includes("affondi") || cleanName.includes("quadricipit")) {
    return { primary: "Quadricipiti", secondary: ["Catena Posteriore", "Polpacci"] };
  }
  if (cleanName.includes("stacco") || cleanName.includes("leg curl") || cleanName.includes("hip thrust") || cleanName.includes("femorali") || cleanName.includes("glutei") || cleanName.includes("good morning")) {
    return { primary: "Catena Posteriore", secondary: ["Quadricipiti", "Dorso"] };
  }
  if (cleanName.includes("curl") || cleanName.includes("bicipit")) {
    return { primary: "Bicipiti", secondary: ["Dorso"] };
  }
  if (cleanName.includes("french") || cleanName.includes("pushdown") || cleanName.includes("tricipit") || cleanName.includes("skull crusher")) {
    return { primary: "Tricipiti", secondary: ["Petto"] };
  }
  if (cleanName.includes("plank") || cleanName.includes("crunch") || cleanName.includes("addominal") || cleanName.includes("core") || cleanName.includes("hollow")) {
    return { primary: "Addome / Core", secondary: [] };
  }
  if (cleanName.includes("calf") || cleanName.includes("polpacci")) {
    return { primary: "Polpacci", secondary: [] };
  }

  return { primary: "Altro / Complementari", secondary: [] };
};

const normalizeMuscleName = (raw) => {
  if (!raw) return "Altro / Complementari";
  const str = raw.toLowerCase();
  if (str.includes("petto")) return "Petto";
  if (str.includes("dorso")) return "Dorso";
  if (str.includes("spall")) return "Spalle";
  if (str.includes("quad") || (str.includes("gamb") && !str.includes("femor"))) return "Quadricipiti";
  if (str.includes("femor") || str.includes("glut") || str.includes("posteri")) return "Catena Posteriore";
  if (str.includes("bicipit")) return "Bicipiti";
  if (str.includes("tricipit")) return "Tricipiti";
  if (str.includes("core") || str.includes("addom")) return "Addome / Core";
  if (str.includes("polpacc") || str.includes("calf")) return "Polpacci";
  return raw;
};

/**
 * Calcola in tempo reale la scomposizione muscolare da una sessione con setLogs reali completati.
 */
export const computeSessionMuscleImpact = (exercises = [], setLogs = {}) => {
  const muscleMap = {};
  let totalSetsCompleted = 0;
  let totalTonnageKg = 0;
  let totalRepsCount = 0;

  exercises.forEach((ex, exIdx) => {
    const classification = classifyExerciseMuscle(ex.name);
    const targetSets = ex.targetSets || 3;
    let completedSetsForEx = 0;
    let tonnageForEx = 0;
    let repsForEx = 0;

    for (let i = 0; i < targetSets; i++) {
      const key = `${ex.id}-${i}`;
      const log = setLogs[key];
      const detailedSet = ex.set_details?.[i];
      const fallbackWeight = detailedSet?.weight ? parseFloat(detailedSet.weight) : (parseFloat(ex.lastWeight) || 0);
      const fallbackReps = detailedSet?.reps ? parseInt(detailedSet.reps) : (parseInt(ex.targetReps) || 8);

      const isExplicitlyDone = Boolean(log && log.completed);
      const hasEnteredValues = Boolean(log && ((log.weight !== undefined && log.weight !== '') || (log.reps !== undefined && log.reps !== '')));

      if (isExplicitlyDone || hasEnteredValues) {
        completedSetsForEx++;
        totalSetsCompleted++;

        const weightVal = (log?.weight !== undefined && log?.weight !== '') ? parseFloat(log.weight) : fallbackWeight;
        const repsVal = (log?.reps !== undefined && log?.reps !== '') ? parseInt(log.reps) : fallbackReps;
        const validWeight = isNaN(weightVal) ? 0 : Math.max(0, weightVal);
        const validReps = isNaN(repsVal) ? 0 : Math.max(0, repsVal);
        const setTonnage = validWeight * validReps;

        tonnageForEx += setTonnage;
        totalTonnageKg += setTonnage;
        repsForEx += validReps;
        totalRepsCount += validReps;
      }
    }

    if (completedSetsForEx > 0) {
      const primary = classification.primary;
      if (!muscleMap[primary]) {
        muscleMap[primary] = {
          muscle: primary,
          completedSets: 0,
          totalReps: 0,
          tonnageKg: 0,
          exercises: []
        };
      }
      muscleMap[primary].completedSets += completedSetsForEx;
      muscleMap[primary].totalReps += repsForEx;
      muscleMap[primary].tonnageKg += tonnageForEx;
      if (!muscleMap[primary].exercises.includes(ex.name)) {
        muscleMap[primary].exercises.push(ex.name);
      }
    }
  });

  const sortedMuscles = Object.values(muscleMap).sort((a, b) => b.completedSets - a.completedSets);

  return {
    muscles: sortedMuscles,
    totalSetsCompleted,
    totalTonnageKg: Math.round(totalTonnageKg * 10) / 10,
    totalRepsCount
  };
};
