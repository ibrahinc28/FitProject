import React, { useState } from 'react';
import { evidenceService } from '../../services/evidenceService';

interface EvidenceUploadProps {
  stepId: string;
  projectId: string;
  onUpload: () => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
  });

const EvidenceUpload: React.FC<EvidenceUploadProps> = ({ stepId, projectId, onUpload }) => {
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | undefined>(undefined);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files)[0];
    if (dropped) setFile(dropped);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !description.trim() || !file) {
      alert('Por favor completa todos los campos y selecciona un archivo');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('El archivo no puede superar 2 MB');
      return;
    }

    setIsUploading(true);
    try {
      const evidenceUrl = await fileToBase64(file);
      await evidenceService.submitEvidence({
        name: file.name,
        description,
        evidenceUrl,
        submittedBy: author,
        stepId,
        projectId,
      });
      setAuthor('');
      setDescription('');
      setFile(undefined);
      onUpload();
    } catch {
      alert('Error al conectar con el servidor. Verifica que Docker esté corriendo.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir Evidencia</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Autor</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tu nombre"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe la evidencia..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Imagen (máx. 2 MB)
          </label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            {file ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                <button
                  type="button"
                  onClick={() => setFile(undefined)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remover
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <svg className="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600">
                  Arrastra una imagen o{' '}
                  <label className="text-blue-600 cursor-pointer font-medium hover:text-blue-800">
                    haz clic aquí
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
                    />
                  </label>
                </p>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isUploading}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isUploading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Subiendo...
            </span>
          ) : (
            'Subir Evidencia'
          )}
        </button>
      </form>
    </div>
  );
};

export default EvidenceUpload;