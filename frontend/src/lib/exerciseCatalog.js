export const EXERCISE_CATALOG = [
  {
    id: "ex_1",
    name: "Panca Piana con Bilanciere",
    category: "Forza",
    muscleGroup: "Petto",
    secondaryMuscles: ["Tricipiti", "Spalle (Anteriore)"],
    equipment: "Bilanciere",
    difficulty: "Intermedio",
    defaultRest: "90s",
    description: "Esercizio fondamentale per lo sviluppo della forza e della massa del petto.",
    instructions: [
      "Sdraiati sulla panca con gli occhi sotto il bilanciere.",
      "Afferra la barra con una presa leggermente più ampia delle spalle.",
      "Abbassa il bilanciere fino al petto e spingi verso l'alto."
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
    defaultRest: "120s",
    description: "Fondamentale per quadricipiti, glutei e catena cinetica inferiore.",
    instructions: [
      "Posiziona il bilanciere sui trapezi.",
      "Scendi flettendo anche ed ginocchia mantenendo il petto alto.",
      "Spingi per tornare in posizione eretta."
    ]
  },
  {
    id: "ex_3",
    name: "Stacco da Terra (Deadlift)",
    category: "Forza",
    muscleGroup: "Dorso",
    secondaryMuscles: ["Glutei", "Femorali", "Trapezi"],
    equipment: "Bilanciere",
    difficulty: "Avanzato",
    defaultRest: "180s",
    description: "Lavoro completo sulla catena posteriore e forza di stacco.",
    instructions: [
      "Posizionati davanti al bilanciere con la barra vicina alle tibie.",
      "Afferra la barra e solleva stendendo anca e ginocchia insieme."
    ]
  },
  {
    id: "ex_4",
    name: "Trazioni alla Sbarra (Pull-ups)",
    category: "Corpo Libero",
    muscleGroup: "Dorso",
    secondaryMuscles: ["Bicipiti", "Spalle"],
    equipment: "Corpo Libero",
    difficulty: "Intermedio",
    defaultRest: "90s",
    description: "Trazione a corpo libero per la larghezza del dorsale.",
    instructions: [
      "Afferra la sbarra con presa prona.",
      "Tirati su finché il mento supera la sbarra."
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
    defaultRest: "90s",
    description: "Spinta verticale per la massa e la forza delle spalle.",
    instructions: [
      "Bilanciere al petto alto, spingi verticalmente sopra la testa."
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
    defaultRest: "90s",
    description: "Spinta a corpo libero per tricipiti e parte inferiore del petto.",
    instructions: [
      "Sospenditi alle parallele, fletti i gomiti fino a 90° e risali."
    ]
  },
  {
    id: "ex_7",
    name: "Curl con Manubri Alternato",
    category: "Isolamento",
    muscleGroup: "Bicipiti",
    secondaryMuscles: ["Avambracci"],
    equipment: "Manubri",
    difficulty: "Principiante",
    defaultRest: "60s",
    description: "Isolamento bicipiti con supinazione del polso.",
    instructions: [
      "Impugna i manubri e fletti il gomito ruotando il palmo in alto."
    ]
  },
  {
    id: "ex_8",
    name: "Leg Press 45°",
    category: "Macchina",
    muscleGroup: "Gambe",
    secondaryMuscles: ["Glutei"],
    equipment: "Macchina",
    difficulty: "Principiante",
    defaultRest: "90s",
    description: "Lavoro guidato per lo sviluppo dei quadricipiti.",
    instructions: [
      "Posiziona i piedi sulla pedana a larghezza spalle e spingi con forza."
    ]
  },
  {
    id: "ex_9",
    name: "Lat Machine Avanti",
    category: "Macchina",
    muscleGroup: "Dorso",
    secondaryMuscles: ["Bicipiti"],
    equipment: "Cavi",
    difficulty: "Principiante",
    defaultRest: "75s",
    description: "Trazione al cavo per il gran dorsale.",
    instructions: [
      "Tira la sbarra verso la parte alta del petto abbassando le scapole."
    ]
  },
  {
    id: "ex_10",
    name: "Alzate Laterali con Manubri",
    category: "Isolamento",
    muscleGroup: "Spalle",
    secondaryMuscles: ["Trapezi"],
    equipment: "Manubri",
    difficulty: "Principiante",
    defaultRest: "60s",
    description: "Isolamento del deltoide laterale per la larghezza delle spalle.",
    instructions: [
      "Solleva i manubri lateralmente fino all'altezza delle spalle."
    ]
  }
];

export const MUSCLE_GROUPS = ["Tutti", "Petto", "Dorso", "Gambe", "Spalle", "Bicipiti", "Tricipiti", "Core", "Cardio"];
export const EQUIPMENT_TYPES = ["Tutti", "Bilanciere", "Manubri", "Corpo Libero", "Cavi", "Macchina"];
