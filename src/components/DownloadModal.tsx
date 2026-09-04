import React from 'react';
import { Info, X } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#111111] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFB800]/10 border border-[#FFB800]/20 flex items-center justify-center text-[#FFB800]">
            <Info className="w-5 h-5" />
          </div>
          <h3 id="modal-title" className="text-xl font-extrabold text-white">
            Descarga de prueba
          </h3>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-300 leading-relaxed">
          El sistema de descarga se conectará en una próxima etapa.
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={onClose}
            aria-label="Entendido"
            className="w-full py-3.5 px-4 bg-[#FFB800] hover:bg-[#FFC107] text-black font-bold text-sm rounded-xl transition-all duration-200 shadow-lg cursor-pointer active:scale-[0.99]"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
