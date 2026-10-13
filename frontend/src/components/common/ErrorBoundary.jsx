import React from "react";
import { Dumbbell, RefreshCw, Home, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CoachSheets ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c0e12] text-zinc-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl shadow-emerald-500/5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold tracking-tight text-white">Qualcosa è andato storto</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Si è verificato un errore imprevisto durante il caricamento di questa sezione. Non preoccuparti, i tuoi dati sono al sicuro.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-zinc-950/80 rounded-xl border border-zinc-800/80 text-left overflow-hidden">
                <p className="text-[11px] font-mono text-rose-400 truncate">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Button
                onClick={this.handleReload}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl gap-2 text-xs h-10 shadow-lg shadow-emerald-600/20"
              >
                <RefreshCw className="h-4 w-4" /> Ricarica Pagina
              </Button>
              <Button
                variant="outline"
                onClick={this.handleHome}
                className="w-full border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-medium rounded-xl gap-2 text-xs h-10"
              >
                <Home className="h-4 w-4" /> Vai alla Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
