import React, { useState } from 'react';
import { X, Printer, LayoutTemplate } from 'lucide-react';

export default function PrintOptionsModal({ onConfirm, onClose }) {
    const [orientation, setOrientation] = useState('portrait');

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-sm shadow-2xl flex flex-col">
                <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-black">
                    <h3 className="text-white font-bold uppercase tracking-widest text-sm flex items-center gap-2">
                        <LayoutTemplate size={16} /> Opsi Cetak
                    </h3>
                    <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="text-neutral-500 text-[10px] uppercase tracking-widest font-bold block mb-3">Orientasi Kertas (PDF)</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setOrientation('portrait')}
                                className={`flex flex-col items-center gap-2 p-4 border transition-colors ${orientation === 'portrait' ? 'border-purple-500 bg-purple-900/20 text-white' : 'border-neutral-700 bg-black text-neutral-400 hover:text-white hover:border-neutral-500'}`}
                            >
                                <div className="w-8 h-12 border-2 border-current rounded-sm flex items-center justify-center">
                                    <span className="text-[8px] font-bold">A4</span>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Potret</span>
                            </button>
                            <button
                                onClick={() => setOrientation('landscape')}
                                className={`flex flex-col items-center gap-2 p-4 border transition-colors ${orientation === 'landscape' ? 'border-purple-500 bg-purple-900/20 text-white' : 'border-neutral-700 bg-black text-neutral-400 hover:text-white hover:border-neutral-500'}`}
                            >
                                <div className="w-12 h-8 border-2 border-current rounded-sm flex items-center justify-center">
                                    <span className="text-[8px] font-bold">A4</span>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider text-center">Lanskap</span>
                            </button>
                        </div>
                    </div>
                    <div className="p-4 border-t border-neutral-800 bg-black flex flex-col sm:flex-row gap-3">
                        <button onClick={onClose} className="flex-1 py-3 border border-neutral-700 text-neutral-400 hover:text-white hover:border-neutral-500 font-bold uppercase tracking-widest text-xs transition-colors">
                            Batal
                        </button>
                        <button onClick={() => onConfirm(orientation, 'download')} className="flex-1 py-3 bg-blue-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                            Download PNG
                        </button>
                        <button onClick={() => onConfirm(orientation, 'print')} className="flex-1 py-3 bg-purple-600 text-white font-bold uppercase tracking-widest text-xs hover:bg-purple-500 transition-colors flex items-center justify-center gap-2">
                            <Printer size={16} /> Lanjutkan Cetak
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
