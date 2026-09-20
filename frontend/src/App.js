import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

// Pages
import Landing from "@/pages/Landing";
import AuthPage from "@/pages/AuthPage";
import ChatPage from "@/pages/ChatPage";
import ProgressPage from "@/pages/ProgressPage";
import ExerciseLibrary from "@/pages/ExerciseLibrary";
import AthleteProfile from "@/pages/AthleteProfile";

// Coach Features
import CoachDashboard from "@/features/coach/CoachDashboard";
import SheetEditor from "@/features/coach/SheetEditor";
import SheetHistory from "@/features/coach/SheetHistory";

// Athlete Features
import AthleteDashboard from "@/features/athlete/AthleteDashboard";
import WorkoutMode from "@/features/athlete/WorkoutMode";

// App styles
import "@/App.css";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="App transition-theme bg-[#0c0e12] min-h-screen text-zinc-100">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/register" element={<AuthPage mode="register" />} />
              <Route path="/coach" element={<ProtectedRoute><CoachDashboard /></ProtectedRoute>} />
              <Route path="/athlete" element={<ProtectedRoute><AthleteDashboard /></ProtectedRoute>} />
              <Route path="/atleta-profilo" element={<ProtectedRoute><AthleteProfile /></ProtectedRoute>} />
              <Route path="/esercizi" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
              <Route path="/workout/:sessionId" element={<ProtectedRoute><WorkoutMode /></ProtectedRoute>} />
              <Route path="/sheet/:sheetId" element={<ProtectedRoute><SheetEditor /></ProtectedRoute>} />
              <Route path="/sheet/:sheetId/history" element={<ProtectedRoute><SheetHistory /></ProtectedRoute>} />
              <Route path="/chat/:recipientId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/progressi" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
          <Toaster position="top-right" richColors />
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
