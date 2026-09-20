export const EXERCISE_CATALOG = [
  // PETTO
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
    name: "Panca Inclinata con Manubri",
    category: "Ipertrofia",
    muscleGroup: "Petto",
    secondaryMuscles: ["Spalle (Anteriore)", "Tricipiti"],
    equipment: "Manubri",
    difficulty: "Intermedio",
    defaultRest: "90s",
    description: "Focalizzato sul fascio clavicolare (petto alto).",
    instructions: [
      "Inclina la panca a 30°-45°.",
      "Spingi i manubri verso l'alto fino a quasi farli toccare."
    ]
  },
  {
    id: "ex_3",
    name: "Croci ai Cavi Alti",
    category: "Isolamento",
    muscleGroup: "Petto",
    secondaryMuscles: ["Spalle"],
    equipment: "Cavi",
    difficulty: "Principiante",
    defaultRest: "60s",
    description: "Isolamento pettorale con tensione continua ai cavi.",
    instructions: [
      "Posizionati al centro della torretta cavi e porta le mani ad incrociarsi davanti al bacino."
    ]
  },
  {
    id: "ex_4",
    name: "Chest Press Macchina",
    category: "Macchina",
    muscleGroup: "Petto",
    secondaryMuscles: ["Tricipiti"],
    equipment: "Macchina",
    difficulty: "Principiante",
    defaultRest: "75s",
    description: "Movimento guidato in sicurezza per l'ipertrofia pettorale.",
    instructions: ["Regola il seggiolino e spingi fino a distendere le braccia."]
  },

  // DORSO
  {
    id: "ex_5",
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
    id: "ex_6",
    name: "Trazioni alla Sbarra (Pull-ups)",
    category: "Corpo Libero",
    muscleGroup: "Dorso",
    secondaryMuscles: ["Bicipiti", "Spalle"],
    equipment: "Corpo Libero",
    difficulty: "Intermedio",
    defaultRest: "90s",
    description: "Trazione a corpo libero per la larghezza del dorsale.",
    instructions: ["Afferra la sbarra con presa prona e tirati su finché il mento supera la barra."]
  },
  {
    id: "ex_7",
    name: "Rematore con Bilanciere",
    category: "Forza",
    muscleGroup: "Dorso",
    secondaryMuscles: ["Bicipiti", "Lombari"],
    equipment: "Bilanciere",
    difficulty: "Intermedio",
    defaultRest: "90s",
    description: "Sviluppa spessore nel centro schiena e trapezi.",
    instructions: ["Fletti il busto a 45° e tira il bilanciere verso l'ombelico."]
  },
  {
    id: "ex_8",
    name: "Lat Machine Avanti",
    category: "Macchina",
    muscleGroup: "Dorso",
    secondaryMuscles: ["Bicipiti"],
    equipment: "Cavi",
    difficulty: "Principiante",
    defaultRest: "75s",
    description: "Trazione guidata al cavo per il gran dorsale.",
    instructions: ["Tira la sbarra verso la parte alta del petto abbassando le scapole."]
  },
  {
    id: "ex_9",
    name: "Pulley Basso Presa Stretta",
    category: "Macchina",
    muscleGroup: "Dorso",
    secondaryMuscles: ["Bicipiti"],
    equipment: "Cavi",
    difficulty: "Principiante",
    defaultRest: "75s",
    description: "Rematore al cavo per la parte centrale del dorso.",
    instructions: ["Mantiens la schiena dritta e tira la maniglia verso l'addome."]
  },

  // GAMBE
  {
    id: "ex_10",
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
      "Scendi flettendo anche ed ginocchia mantenendo il petto alto."
    ]
  },
  {
    id: "ex_11",
    name: "Leg Press 45°",
    category: "Macchina",
    muscleGroup: "Gambe",
    secondaryMuscles: ["Glutei"],
    equipment: "Macchina",
    difficulty: "Principiante",
    defaultRest: "90s",
    description: "Lavoro guidato per lo sviluppo dei quadricipiti.",
    instructions: ["Posiziona i piedi sulla pedana e spingi con forza."]
  },
  {
    id: "ex_12",
    name: "Affondi Camminati con Manubri",
    category: "Ipertrofia",
    muscleGroup: "Gambe",
    secondaryMuscles: ["Glutei", "Femorali"],
    equipment: "Manubri",
    difficulty: "Intermedio",
    defaultRest: "90s",
    description: "Ottimo lavoro unilaterale per gambe e glutei.",
    instructions: ["Fai un passo in avanti e abbassa il bacino fino a quasi toccare il pavimento col ginocchio posteriore."]
  },
  {
    id: "ex_13",
    name: "Leg Extension",
    category: "Isolamento",
    muscleGroup: "Gambe",
    secondaryMuscles: [],
    equipment: "Macchina",
    difficulty: "Principiante",
    defaultRest: "60s",
    description: "Isolamento puro del quadricipite.",
    instructions: ["Estendi le gambe fino al blocco articolare controllato."]
  },
  {
    id: "ex_14",
    name: "Leg Curl Sdraiato",
    category: "Isolamento",
    muscleGroup: "Gambe",
    secondaryMuscles: ["Polpacci"],
    equipment: "Macchina",
    difficulty: "Principiante",
    defaultRest: "60s",
    description: "Isolamento dei muscoli femorali.",
    instructions: ["Fletti le gambe portando i talloni verso i glutei."]
  },
  {
    id: "ex_15",
    name: "Hip Thrust con Bilanciere",
    category: "Forza",
    muscleGroup: "Gambe",
    secondaryMuscles: ["Glutei", "Femorali"],
    equipment: "Bilanciere",
    difficulty: "Intermedio",
    defaultRest: "90s",
    description: "Re degli esercizi per l'attivazione ed ipertrofia dei glutei.",
    instructions: ["Appoggia le spalle alla panca, posiziona il bilanciere sulle anche ed estendi il bacino."]
  },

  // SPALLE
  {
    id: "ex_16",
    name: "Military Press (Spinte in Alto)",
    category: "Forza",
    muscleGroup: "Spalle",
    secondaryMuscles: ["Tricipiti", "Core"],
    equipment: "Bilanciere",
    difficulty: "Intermedio",
    defaultRest: "90s",
    description: "Spinta verticale per la massa e la forza delle spalle.",
    instructions: ["Bilanciere al petto alto, spingi verticalmente sopra la testa."]
  },
  {
    id: "ex_17",
    name: "Alzate Laterali con Manubri",
    category: "Isolamento",
    muscleGroup: "Spalle",
    secondaryMuscles: ["Trapezi"],
    equipment: "Manubri",
    difficulty: "Principiante",
    defaultRest: "60s",
    description: "Isolamento del deltoide laterale per spalle larghe.",
    instructions: ["Solleva i manubri lateralmente fino all'altezza delle spalle."]
  },
  {
    id: "ex_18",
    name: "Face Pull al Cavo",
    category: "Posturale",
    muscleGroup: "Spalle",
    secondaryMuscles: ["Dorso", "Extrarotatori"],
    equipment: "Cavi",
    difficulty: "Principiante",
    defaultRest: "60s",
    description: "Fondamentale per la salute della cuffia dei rotatori e deltoidi posteriori.",
    instructions: ["Tira la corda verso la fronte ruotando i polsi all'esterno."]
  },

  // BICIPITI
  {
    id: "ex_19",
    name: "Curl con Manubri Alternato",
    category: "Isolamento",
    muscleGroup: "Bicipiti",
    secondaryMuscles: ["Avambracci"],
    equipment: "Manubri",
    difficulty: "Principiante",
    defaultRest: "60s",
    description: "Isolamento bicipiti con supinazione del polso.",
    instructions: ["Impugna i manubri e fletti il gomito ruotando il palmo in alto."]
  },
  {
    id: "ex_20",
    name: "Curl con Bilanciere EZ",
    category: "Forza",
    muscleGroup: "Bicipiti",
    secondaryMuscles: ["Avambracci"],
    equipment: "Bilanciere",
    difficulty: "Principiante",
    defaultRest: "75s",
    description: "Costruttore di massa per i bicipiti con impugnatura sagomata.",
    instructions: ["Mantieni i gomiti vicini ai fianchi e solleva il bilanciere EZ."]
  },

  // TRICIPITI
  {
    id: "ex_21",
    name: "Dip alle Parallele",
    category: "Corpo Libero",
    muscleGroup: "Tricipiti",
    secondaryMuscles: ["Petto", "Spalle"],
    equipment: "Corpo Libero",
    difficulty: "Intermedio",
    defaultRest: "90s",
    description: "Spinta a corpo libero per tricipiti e petto basso.",
    instructions: ["Sospenditi alle parallele, fletti i gomiti fino a 90° e risali."]
  },
  {
    id: "ex_22",
    name: "Pushdown alla Corda",
    category: "Isolamento",
    muscleGroup: "Tricipiti",
    secondaryMuscles: [],
    equipment: "Cavi",
    difficulty: "Principiante",
    defaultRest: "60s",
    description: "Isolamento del capo laterale e mediale dei tricipiti.",
    instructions: ["Spingi la corda verso il basso aprendo le mani in fondo al movimento."]
  },

  // CORE & CARDIO
  {
    id: "ex_23",
    name: "Plank Addominale",
    category: "Core",
    muscleGroup: "Core",
    secondaryMuscles: ["Spalle", "Glutei"],
    equipment: "Corpo Libero",
    difficulty: "Principiante",
    defaultRest: "60s",
    description: "Tenuta isometrica per la stabilità del tronco.",
    instructions: ["Mantenere la posizione rigida sugli avambracci e sulle punte dei piedi."]
  },
  {
    id: "ex_24",
    name: "Crunches su Tappetino",
    category: "Core",
    muscleGroup: "Core",
    secondaryMuscles: [],
    equipment: "Corpo Libero",
    difficulty: "Principiante",
    defaultRest: "45s",
    description: "Flessione della colonna per i retti addominali.",
    instructions: ["Solleva le scapole dal pavimento contraendo gli addominali."]
  }
];

export const MUSCLE_GROUPS = ["Tutti", "Petto", "Dorso", "Gambe", "Spalle", "Bicipiti", "Tricipiti", "Core", "Cardio"];
export const EQUIPMENT_TYPES = ["Tutti", "Bilanciere", "Manubri", "Corpo Libero", "Cavi", "Macchina"];
