import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Share2, Copy, Check, Printer, Send
} from "lucide-react";

export const ShareSheetModal = ({ open, onOpenChange, sheet, athletes = [] }) => {
  const [copied, setCopied] = useState(false);

  const shareText = useMemo(() => {
    if (!open || !sheet) return "";
    try {
      const safeAthletes = Array.isArray(athletes) ? athletes : [];
      const sheetAthleteIds = Array.isArray(sheet.athlete_ids) ? sheet.athlete_ids : [];
      const athleteNames = safeAthletes
        .filter(a => a && sheetAthleteIds.includes(a.id))
        .map(a => a.name)
        .join(", ") || "Atleta";

      let text = `🏋️‍♂️ *COACHSHEETS - ${sheet.title?.toUpperCase() || "SCHEDA DI ALLENAMENTO"}*\n`;
      text += `👤 *Atleta:* ${athleteNames}\n`;
      text += `📅 *Programma:* ${sheet.weeks?.length || 1} Settimane\n\n`;

      const safeWeeks = Array.isArray(sheet.weeks) ? sheet.weeks : [];
      safeWeeks.forEach((week, wIdx) => {
        if (!week) return;
        text += `━━━━━━━━━━━━━━━━━━━━━\n`;
        text += `📍 *${week.label || `Settimana ${wIdx + 1}`}*\n`;
        text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

        const safeDays = Array.isArray(week.days) ? week.days : [];
        safeDays.forEach((day, dIdx) => {
          if (!day) return;
          text += `🔹 *${day.name || `Giorno ${dIdx + 1}`}*\n`;
          if (day.notes) text += `_Note sessione: ${day.notes}_\n`;

          const safeExercises = Array.isArray(day.exercises) ? day.exercises : [];
          safeExercises.forEach((ex, eIdx) => {
            if (!ex) return;
            const supersetTag = ex.superset_group ? ` [⚡ SUPERSET ${ex.superset_group}]` : "";
            text += `${eIdx + 1}. *${ex.exercise || "Esercizio"}*${supersetTag}\n`;

            const rawDetails = ex.set_details || ex.setDetails;
            const details = Array.isArray(rawDetails) ? rawDetails : [];
            if (details.length > 0) {
              details.forEach((s, sIdx) => {
                if (!s) return;
                const tag = s.type === 'top_set' ? ' (Top Set)' : s.type === 'back_off' ? ' (Back-off)' : '';
                text += `   • Set ${s.set_number || sIdx + 1}${tag}: ${s.reps || "8"} reps @ ${s.intensity || s.weight || "75%"}\n`;
              });
            } else {
              text += `   • Serie: ${ex.sets || "3"} | Reps: ${ex.reps || "8-10"} | Carico: ${ex.weight || "-"} | Rec: ${ex.rest || "90s"}\n`;
            }

            if (ex.notes) text += `   _Note: ${ex.notes}_\n`;
            if (ex.video_url) text += `   🎥 Video: ${ex.video_url}\n`;
          });
          text += `\n`;
        });
      });

      text += `Buon allenamento e spacca tutto! 💪🔥`;
      return text;
    } catch (err) {
      console.error("Error generating share text:", err);
      return `🏋️‍♂️ COACHSHEETS - ${sheet.title || "Scheda"}\nBuon allenamento! 💪`;
    }
  }, [open, sheet, athletes]);

  if (!open || !sheet) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast.success("Testo scheda copiato negli appunti!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank");
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-emerald-400" />
            Condividi & Stampa Scheda
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Copia il testo formattato pronto per WhatsApp o stampa la versione pulita in PDF.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2 pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">Anteprima messaggio WhatsApp:</span>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="h-7 text-xs border-zinc-700 gap-1 text-zinc-300 hover:text-white"
              >
                <Printer className="h-3.5 w-3.5" /> Stampa / PDF
              </Button>
              <Button
                size="sm"
                onClick={handleOpenWhatsApp}
                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white gap-1"
              >
                <Send className="h-3.5 w-3.5" /> Apri WhatsApp
              </Button>
            </div>
          </div>

          <Textarea
            value={shareText}
            readOnly
            className="font-mono text-xs bg-zinc-900 border-zinc-800 text-zinc-200 min-h-[300px] rounded-xl focus-visible:ring-emerald-500"
          />
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between w-full pt-2 border-t border-zinc-800">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Chiudi
          </Button>

          <Button
            onClick={handleCopy}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold gap-1.5"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copiato!" : "Copia Testo per WhatsApp"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
