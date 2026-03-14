import { ArrowLeft, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EvacuationPage = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-destructive/10 pointer-events-none" />

      {/* Back button */}
      <div className="relative z-10 flex justify-start px-5 pt-[env(safe-area-inset-top)] pt-5">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-4 py-2 text-sm text-foreground hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 pb-[env(safe-area-inset-bottom)] gap-6 text-center">
        <img
          src="/install-app.png"
          alt="Install SeaGuard App"
          className="w-full max-w-sm object-contain"
        />

        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Download SEAGuard App</h2>
          <p className="text-sm text-muted-foreground">
            Get AR Navigation and full evacuation guidance on the SEAGuard mobile app.
          </p>
        </div>

        <a
          href="https://drive.google.com/drive/folders/1mtSj_nQmXwJLVnQTn9R34xf5T2Km5tDt"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-400 active:bg-red-600 transition-colors rounded-2xl px-8 py-4 text-white font-semibold text-base shadow-lg shadow-red-500/30 w-full max-w-sm"
        >
          <Download className="h-5 w-5" />
          Download App
        </a>
      </div>
    </div>
  );
};

export default EvacuationPage;
