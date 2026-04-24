import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Save, X, Users, Camera, Image, ZoomIn } from 'lucide-react';
import { WorkEntry, Material, Worker, Equipment, PersonnelMember } from '../types';

interface WorkEntryFormProps {
  onSave: (entry: WorkEntry) => void;
  onCancel: () => void;
  initialEntry?: WorkEntry;
  savedPersonnel?: PersonnelMember[];
}

export function WorkEntryForm({ onSave, onCancel, initialEntry, savedPersonnel = [] }: WorkEntryFormProps) {
  const operai = savedPersonnel.filter(p => p.role === 'Operaio');
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showPicker) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) setShowPicker(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPicker]);
  const [formData, setFormData] = useState({
    date: initialEntry?.date || new Date().toISOString().split('T')[0],
    weather: initialEntry?.weather || '',
    temperature: initialEntry?.temperature || '',
    workDescription: initialEntry?.workDescription || '',
    safetyNotes: initialEntry?.safetyNotes || '',
    additionalNotes: initialEntry?.additionalNotes || ''
  });

  const [materials, setMaterials] = useState<Material[]>(
    initialEntry?.materials || [{ id: '1', name: '', quantity: '', unit: '', supplier: '' }]
  );
  const [workers, setWorkers] = useState<Worker[]>(
    initialEntry?.workers || [{ id: '1', name: '', role: '', attendance: 'intera' }]
  );
  const [equipment, setEquipment] = useState<Equipment[]>(
    initialEntry?.equipment || [{ id: '1', name: '', hours: 0, notes: '' }]
  );
  const [photos, setPhotos] = useState<string[]>(initialEntry?.photos || []);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const MAX_PHOTOS = 5;

  const handlePhotoFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_PHOTOS - photos.length;
    const toProcess = Array.from(files).slice(0, remaining);
    toProcess.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPhotos(prev => prev.length < MAX_PHOTOS ? [...prev, result] : prev);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => setPhotos(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: WorkEntry = {
      id: initialEntry?.id || Date.now().toString(),
      ...formData,
      materials: materials.filter(m => m.name.trim() !== ''),
      workers: workers.filter(w => w.name.trim() !== ''),
      equipment: equipment.filter(e => e.name.trim() !== ''),
      photos
    };
    onSave(entry);
  };

  const addMaterial = () => setMaterials([...materials, { id: Date.now().toString(), name: '', quantity: '', unit: '', supplier: '' }]);
  const removeMaterial = (id: string) => setMaterials(materials.filter(m => m.id !== id));
  const updateMaterial = (id: string, field: keyof Material, value: string) =>
    setMaterials(materials.map(m => m.id === id ? { ...m, [field]: value } : m));

  const addWorker = () => setWorkers([...workers, { id: Date.now().toString(), name: '', role: '', attendance: 'intera' }]);
  const addWorkerFromPersonnel = (member: PersonnelMember) => {
    if (workers.some(w => w.name === member.name && w.role === (member.company || ''))) return;
    setWorkers(prev => [...prev, { id: Date.now().toString(), name: member.name, role: member.company || '', attendance: 'intera' }]);
    setShowPicker(false);
  };
  const removeWorker = (id: string) => setWorkers(workers.filter(w => w.id !== id));
  const updateWorker = (id: string, field: keyof Worker, value: string | number) =>
    setWorkers(workers.map(w => w.id === id ? { ...w, [field]: value } : w));

  const addEquipment = () => setEquipment([...equipment, { id: Date.now().toString(), name: '', hours: 0, notes: '' }]);
  const removeEquipment = (id: string) => setEquipment(equipment.filter(e => e.id !== id));
  const updateEquipment = (id: string, field: keyof Equipment, value: string | number) =>
    setEquipment(equipment.map(e => e.id === id ? { ...e, [field]: value } : e));

  return (
    <>
    {lightbox && (
      <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
        onClick={() => setLightbox(null)}>
        <button onClick={() => setLightbox(null)}
          className="absolute top-4 right-4 p-2 text-white/60 hover:text-white transition-colors">
          <X className="h-6 w-6" />
        </button>
        <img src={lightbox} alt="Anteprima"
          className="max-w-full max-h-full rounded-xl shadow-2xl object-contain"
          onClick={e => e.stopPropagation()} />
      </div>
    )}
    <div className="max-w-4xl mx-auto px-4 pb-12">
      <div className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden">
        {/* Form header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">
            {initialEntry ? 'Modifica Giornata' : 'Nuova Giornata di Lavoro'}
          </h2>
          <button onClick={onCancel} className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Informazioni generali */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Data *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="form-label">Condizioni Meteo</label>
              <select
                value={formData.weather}
                onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                className="input-field"
              >
                <option value="">Seleziona...</option>
                <option value="Sereno">Sereno</option>
                <option value="Nuvoloso">Nuvoloso</option>
                <option value="Pioggia">Pioggia</option>
                <option value="Neve">Neve</option>
                <option value="Nebbia">Nebbia</option>
                <option value="Vento">Vento</option>
              </select>
            </div>
            <div>
              <label className="form-label">Temperatura</label>
              <input
                type="text"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
                className="input-field"
                placeholder="Es. 15°C"
              />
            </div>
          </div>

          {/* Descrizione lavori */}
          <div>
            <label className="form-label">Descrizione Lavori Eseguiti *</label>
            <textarea
              required
              rows={4}
              value={formData.workDescription}
              onChange={(e) => setFormData({ ...formData, workDescription: e.target.value })}
              className="input-field"
              placeholder="Descrivi i lavori eseguiti durante la giornata..."
            />
          </div>

          {/* Materiali */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-white">Materiali Utilizzati</h3>
              <button type="button" onClick={addMaterial} className="btn-secondary flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Aggiungi</span>
              </button>
            </div>
            <div className="space-y-2">
              {materials.map((material) => (
                <div key={material.id} className="grid grid-cols-1 md:grid-cols-5 gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                  <input type="text" placeholder="Nome materiale" value={material.name}
                    onChange={(e) => updateMaterial(material.id, 'name', e.target.value)} className="input-field" />
                  <input type="text" placeholder="Quantità" value={material.quantity}
                    onChange={(e) => updateMaterial(material.id, 'quantity', e.target.value)} className="input-field" />
                  <input type="text" placeholder="Unità" value={material.unit}
                    onChange={(e) => updateMaterial(material.id, 'unit', e.target.value)} className="input-field" />
                  <input type="text" placeholder="Fornitore" value={material.supplier}
                    onChange={(e) => updateMaterial(material.id, 'supplier', e.target.value)} className="input-field" />
                  <button type="button" onClick={() => removeMaterial(material.id)}
                    className="btn-danger flex items-center justify-center">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Manodopera */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-white">Manodopera</h3>
              <div className="flex items-center gap-2">
                {operai.length > 0 && (
                  <div className="relative" ref={pickerRef}>
                    <button type="button" onClick={() => setShowPicker(v => !v)}
                      className="btn-secondary flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Da personale</span>
                    </button>
                    {showPicker && (
                      <div className="absolute right-0 top-full mt-1 z-20 w-64 bg-gray-800 border border-white/10 rounded-xl shadow-xl overflow-hidden">
                        <div className="px-3 py-2 border-b border-white/10">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Operai salvati</p>
                        </div>
                        <ul className="max-h-56 overflow-y-auto">
                          {operai.map(member => {
                            const alreadyAdded = workers.some(w => w.name === member.name && w.role === (member.company || ''));
                            return (
                              <li key={member.id}>
                                <button type="button" disabled={alreadyAdded}
                                  onClick={() => addWorkerFromPersonnel(member)}
                                  className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                  <div>
                                    <p className="text-sm font-medium text-white">{member.name}</p>
                                    {member.company && <p className="text-xs text-gray-500">{member.company}</p>}
                                  </div>
                                  {alreadyAdded
                                    ? <span className="text-xs text-gray-600">Aggiunto</span>
                                    : <Plus className="h-4 w-4 text-blue-400" />}
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                <button type="button" onClick={addWorker} className="btn-secondary flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Aggiungi</span>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {workers.map((worker) => (
                <div key={worker.id} className="flex flex-wrap items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                  <input type="text" placeholder="Nome operaio" value={worker.name}
                    onChange={(e) => updateWorker(worker.id, 'name', e.target.value)}
                    className="input-field flex-1 min-w-[140px]" />
                  <input type="text" placeholder="Mansione" value={worker.role}
                    onChange={(e) => updateWorker(worker.id, 'role', e.target.value)}
                    className="input-field flex-1 min-w-[120px]" />
                  <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden shrink-0">
                    <button type="button"
                      onClick={() => updateWorker(worker.id, 'attendance', 'intera')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        worker.attendance === 'intera'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}>
                      Intera
                    </button>
                    <button type="button"
                      onClick={() => updateWorker(worker.id, 'attendance', 'mezza')}
                      className={`px-3 py-2 text-sm font-medium transition-colors ${
                        worker.attendance === 'mezza'
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:text-white'
                      }`}>
                      Mezza
                    </button>
                  </div>
                  <button type="button" onClick={() => removeWorker(worker.id)}
                    className="btn-danger flex items-center justify-center shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mezzi e Attrezzature */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold text-white">Mezzi e Attrezzature</h3>
              <button type="button" onClick={addEquipment} className="btn-secondary flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Aggiungi</span>
              </button>
            </div>
            <div className="space-y-2">
              {equipment.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                  <input type="text" placeholder="Nome mezzo/attrezzatura" value={item.name}
                    onChange={(e) => updateEquipment(item.id, 'name', e.target.value)} className="input-field" />
                  <input type="number" placeholder="Ore utilizzo" value={item.hours}
                    onChange={(e) => updateEquipment(item.id, 'hours', parseFloat(e.target.value) || 0)}
                    className="input-field" min="0" step="0.5" />
                  <input type="text" placeholder="Note" value={item.notes}
                    onChange={(e) => updateEquipment(item.id, 'notes', e.target.value)} className="input-field" />
                  <button type="button" onClick={() => removeEquipment(item.id)}
                    className="btn-danger flex items-center justify-center">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Foto */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div>
                <h3 className="text-base font-semibold text-white">Foto</h3>
                <p className="text-xs text-gray-500 mt-0.5">{photos.length}/{MAX_PHOTOS} foto</p>
              </div>
              {photos.length < MAX_PHOTOS && (
                <div className="flex items-center gap-2">
                  <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
                    className="hidden" onChange={e => handlePhotoFiles(e.target.files)} />
                  <input ref={galleryInputRef} type="file" accept="image/*" multiple
                    className="hidden" onChange={e => handlePhotoFiles(e.target.files)} />
                  <button type="button" onClick={() => galleryInputRef.current?.click()}
                    className="btn-secondary flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    <span>Galleria</span>
                  </button>
                  <button type="button" onClick={() => cameraInputRef.current?.click()}
                    className="btn-secondary flex items-center gap-2">
                    <Camera className="h-4 w-4" />
                    <span>Fotocamera</span>
                  </button>
                </div>
              )}
            </div>
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {photos.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
                    <img src={src} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button type="button" onClick={() => setLightbox(src)}
                        className="p-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                        <ZoomIn className="h-4 w-4 text-white" />
                      </button>
                      <button type="button" onClick={() => removePhoto(i)}
                        className="p-1.5 bg-red-500/80 rounded-lg hover:bg-red-500 transition-colors">
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    </div>
                    <span className="absolute top-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded font-medium">{i + 1}</span>
                  </div>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <button type="button" onClick={() => galleryInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 flex flex-col items-center justify-center gap-1 transition-colors text-gray-500 hover:text-gray-300">
                    <Plus className="h-5 w-5" />
                    <span className="text-xs">Aggiungi</span>
                  </button>
                )}
              </div>
            ) : (
              <button type="button" onClick={() => galleryInputRef.current?.click()}
                className="w-full border-2 border-dashed border-white/15 hover:border-white/30 rounded-xl py-8 flex flex-col items-center justify-center gap-2 transition-colors text-gray-500 hover:text-gray-300">
                <Camera className="h-8 w-8" />
                <span className="text-sm">Aggiungi fino a 5 foto</span>
                <span className="text-xs text-gray-600">Fotocamera o galleria</span>
              </button>
            )}
          </div>

          {/* Note sicurezza */}
          <div>
            <label className="form-label">Note sulla Sicurezza</label>
            <textarea
              rows={3}
              value={formData.safetyNotes}
              onChange={(e) => setFormData({ ...formData, safetyNotes: e.target.value })}
              className="input-field"
              placeholder="Osservazioni sulla sicurezza, incidenti, near miss..."
            />
          </div>

          {/* Note aggiuntive */}
          <div>
            <label className="form-label">Note Aggiuntive</label>
            <textarea
              rows={3}
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              className="input-field"
              placeholder="Altre informazioni rilevanti..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="btn-secondary">
              Annulla
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" />
              <span>Salva Giornata</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
