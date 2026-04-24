import React, { useState } from 'react';
import { Building2, MapPin, User, Calendar } from 'lucide-react';
import { Project } from '../types';

interface ProjectSetupProps {
  onProjectCreate: (project: Project) => void;
}

export function ProjectSetup({ onProjectCreate }: ProjectSetupProps) {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    contractor: '',
    contractorFiscalCode: '',
    contractorPhone: '',
    contractorEmail: '',
    subcontractors: '',
    client: '',
    contract: '',
    contractAmount: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const project: Project = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString()
    };
    
    onProjectCreate(project);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Nuovo Progetto
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Configura i dettagli del cantiere per iniziare
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nome Progetto *
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Es. Costruzione Villa Rossi"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Ubicazione *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Es. Via Roma 123, Milano"
                />
              </div>
            </div>

            <div>
              <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
                Cliente *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="client"
                  name="client"
                  type="text"
                  required
                  value={formData.client}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Es. Mario Rossi"
                />
              </div>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Data Inizio *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrizione (opzionale)
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                placeholder="Breve descrizione del progetto..."
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 text-lg"
          >
            Crea Progetto
          </button>
        </form>
      </div>
    </div>
  );
}