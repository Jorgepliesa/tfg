import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ExerciseInRoutine {
  exerciseName: string;
  description: string;
  category: string;
  difficulty: string;
  numReps: number;
  numSeries: number;
  duration: string | null;
  rest: number;
  videoUrl: string | null;
}

export interface WellnessTestData {
  pain: number;
  sleepiness: number;
  mood: number;
  fatigue: number;
}

export interface ExecutedExercise {
  exercise: string;
  numRepsDone: number;
  numSeriesDone: number;
  tInitial: Date;
  tFinal: Date;
}

export interface SessionContextType {
  // Datos de sesión
  sessionDate: Date | null;
  routineName: string | null;
  category: string | null;
  exercises: ExerciseInRoutine[];
  currentExerciseIndex: number;
  isCoop: boolean;

  // Tests de bienestar
  initialTest: WellnessTestData | null;
  finalTest: WellnessTestData | null;

  // Ejercicios ejecutados
  executedExercises: ExecutedExercise[];

  // Puntos ganados
  fpGained: number;
  sessionDuration: number; // en segundos

  // Acciones
  initSession: (category: string, routineName: string, exercises: ExerciseInRoutine[]) => void;
  setInitialTest: (test: WellnessTestData) => void;
  setFinalTest: (test: WellnessTestData) => void;
  addExecutedExercise: (exercise: ExecutedExercise) => void;
  moveToNextExercise: () => void;
  setFpGained: (fp: number) => void;
  setSessionDuration: (duration: number) => void;
  resetSession: () => void;
  setIsCoop: (isCoop: boolean) => void;

}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sessionDate, setSessionDate] = useState<Date | null>(null);
  const [routineName, setRoutineName] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [exercises, setExercises] = useState<ExerciseInRoutine[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [initialTest, setInitialTest] = useState<WellnessTestData | null>(null);
  const [finalTest, setFinalTest] = useState<WellnessTestData | null>(null);
  const [executedExercises, setExecutedExercises] = useState<ExecutedExercise[]>([]);
  const [fpGained, setFpGained] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [isCoop, setIsCoop] = useState(false);

  const initSession = (cat: string, rout: string, exs: ExerciseInRoutine[]) => {
    setSessionDate(new Date());
    setCategory(cat);
    setRoutineName(rout);
    setExercises(exs);
    setCurrentExerciseIndex(0);
  };

  const addExecutedExercise = (exercise: ExecutedExercise) => {
    setExecutedExercises([...executedExercises, exercise]);
  };

  const moveToNextExercise = () => {
    setCurrentExerciseIndex(currentExerciseIndex + 1);
  };

  const resetSession = () => {
    setSessionDate(null);
    setRoutineName(null);
    setCategory(null);
    setExercises([]);
    setInitialTest(null);
    setFinalTest(null);
    setExecutedExercises([]);
    setCurrentExerciseIndex(0);
    setFpGained(0);
    setSessionDuration(0);
    setIsCoop(false);
  };

  return (
    <SessionContext.Provider
      value={{
        sessionDate,
        routineName,
        category,
        exercises,
        currentExerciseIndex,
        initialTest,
        finalTest,
        executedExercises,
        fpGained,
        sessionDuration,
        initSession,
        setInitialTest,
        setFinalTest,
        addExecutedExercise,
        moveToNextExercise,
        setFpGained,
        setSessionDuration,
        resetSession,
        isCoop,
        setIsCoop,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }
  return context;
};
