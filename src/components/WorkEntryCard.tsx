import { useState } from 'react';
import { Calendar, Cloud, Thermometer, Users, Package, Truck, Shield, FileText, CreditCard as Edit, Trash2, Camera, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkEntry } from '../types';

interface WorkEntryCardProps {
  entry: WorkEntry;
  onEdit: (entry: WorkEntry) => void;
  onDelete: (id: string) => void;
}

export function WorkEntryCard({ entry, onEdit, onDelete }: WorkEntryCardProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const photos = entry.photos || [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gray-900 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-4.5 w-4.5 text-blue-400 flex-shrink-0" style={{ width: '18px', height: '18px' }} />
          <h3 className="text-base font-semibold text-white capitalize">
            {formatDate(entry.date)}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(entry)}
            className="p-1.5 text-gray-500 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(entry.id)}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {(entry.weather || entry.temperature) && (
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
          {entry.weather && (
            <div className="flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5" />
              <span>{entry.weather}</span>
            </div>
          )}
          {entry.temperature && (
            <div className="flex items-center gap-1.5">
              <Thermometer className="h-3.5 w-3.5" />
              <span>{entry.temperature}</span>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1.5">
          <FileText className="h-3.5 w-3.5 text-gray-500" />
          <h4 className="text-sm font-medium text-gray-300">Lavori Eseguiti</h4>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed pl-5">{entry.workDescription}</p>
      </div>

      {entry.materials.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Package className="h-3.5 w-3.5 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-300">Materiali ({entry.materials.length})</h4>
          </div>
          <div className="space-y-1 pl-5">
            {entry.materials.map((material) => (
              <div key={material.id} className="text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
                <span className="text-gray-200 font-medium">{material.name}</span>
                {material.quantity && <span> — {material.quantity} {material.unit}</span>}
                {material.supplier && <span className="text-gray-500"> ({material.supplier})</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.workers.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-3.5 w-3.5 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-300">Manodopera ({entry.workers.length})</h4>
          </div>
          <div className="space-y-1 pl-5">
            {entry.workers.map((worker) => (
              <div key={worker.id} className="text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
                <span className="text-gray-200 font-medium">{worker.name}</span>
                {worker.role && <span> — {worker.role}</span>}
                <span className="ml-1 text-xs text-gray-500">({worker.attendance === 'mezza' ? 'mezza giornata' : 'giornata intera'})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.equipment.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Truck className="h-3.5 w-3.5 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-300">Mezzi e Attrezzature ({entry.equipment.length})</h4>
          </div>
          <div className="space-y-1 pl-5">
            {entry.equipment.map((item) => (
              <div key={item.id} className="text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg">
                <span className="text-gray-200 font-medium">{item.name}</span>
                {item.hours && item.hours > 0 && <span> ({item.hours}h)</span>}
                {item.notes && <span> — {item.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {entry.safetyNotes && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="h-3.5 w-3.5 text-yellow-500" />
            <h4 className="text-sm font-medium text-gray-300">Sicurezza</h4>
          </div>
          <p className="text-sm text-yellow-200/80 bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-lg pl-5">
            {entry.safetyNotes}
          </p>
        </div>
      )}

      {entry.additionalNotes && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-1.5">Note Aggiuntive</h4>
          <p className="text-sm text-gray-400 bg-white/5 px-3 py-2 rounded-lg">
            {entry.additionalNotes}
          </p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <Camera className="h-3.5 w-3.5 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-300">Foto ({photos.length})</h4>
          </div>
          <div className="flex gap-2 pl-5 flex-wrap">
            {photos.map((src, i) => (
              <button key={i} type="button" onClick={() => setLightboxIndex(i)}
                className="w-16 h-16 rounded-lg overflow-hidden border border-white/10 hover:border-white/30 transition-colors flex-shrink-0">
                <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

      {lightboxIndex !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
          {photos.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? (i - 1 + photos.length) % photos.length : 0); }}
                className="absolute left-4 p-2 text-white/60 hover:text-white transition-colors">
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button onClick={e => { e.stopPropagation(); setLightboxIndex(i => i !== null ? (i + 1) % photos.length : 0); }}
                className="absolute right-16 p-2 text-white/60 hover:text-white transition-colors">
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}
          <img src={photos[lightboxIndex]} alt="Anteprima"
            className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()} />
          <span className="absolute bottom-4 text-sm text-white/50">{lightboxIndex + 1} / {photos.length}</span>
        </div>
      )}
    </div>
  );
}
