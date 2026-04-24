import { Download, ChevronLeft, HardHat, FileText, Home, Loader2 } from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  project: Project | null;
  onExportPDF: () => void;
  onExportWord: () => void;
  onNewProject: () => void;
  onGoHome: () => void;
  backLabel?: string;
  exporting?: 'pdf' | 'word' | null;
}

export function Header({ project, onExportPDF, onExportWord, onNewProject, onGoHome, backLabel, exporting }: HeaderProps) {
  return (
    <header className="bg-gray-950 border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={onNewProject}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm font-medium mr-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{backLabel ?? 'Indietro'}</span>
            </button>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <HardHat style={{ width: '16px', height: '16px' }} className="text-white" />
              </div>
              {project && (
                <div>
                  <p className="text-white font-semibold text-sm leading-tight">{project.name}</p>
                  <p className="text-gray-500 text-xs leading-tight">{project.location}</p>
                </div>
              )}
            </div>
          </div>

          <a
            href="https://github.com/ArStanton82"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block text-xs text-gray-600 hover:text-gray-400 transition-colors absolute left-1/2 -translate-x-1/2"
          >
            ArStanton82
          </a>

          <div className="flex items-center gap-2">
            {project && (
              <>
                <button
                  onClick={onExportWord}
                  disabled={!!exporting}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-sm font-medium border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting === 'word'
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <FileText className="h-4 w-4" />}
                  <span className="hidden sm:inline">{exporting === 'word' ? 'Generazione...' : 'Esporta Word'}</span>
                </button>
                <button
                  onClick={onExportPDF}
                  disabled={!!exporting}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-sm font-medium border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting === 'pdf'
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Download className="h-4 w-4" />}
                  <span className="hidden sm:inline">{exporting === 'pdf' ? 'Generazione...' : 'Esporta PDF'}</span>
                </button>
                <div className="w-px h-5 bg-white/10" />
              </>
            )}
            <button
              onClick={onGoHome}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-sm font-medium border border-white/10"
              title="Torna alla Home"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
