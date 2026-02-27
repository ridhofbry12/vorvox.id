import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { supabase } from '../../supabase';

export default function ImageUploader({ label, value, onChange, folder = 'misc' }) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        try {
            setUploading(true);
            setError(null);

            if (!e.target.files || e.target.files.length === 0) {
                return;
            }

            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
            const filePath = `${folder}/${fileName}`;

            // Upload image to Supabase
            const { error: uploadError } = await supabase.storage
                .from('vorvox-assets')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('vorvox-assets')
                .getPublicUrl(filePath);

            onChange(publicUrl);
        } catch (error) {
            setError(error.message);
            console.error('Error uploading image: ', error);
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        // Ideally we should delete from storage here as well to save space,
        // but for simplicity we just clear the field. 
        onChange('');
    };

    return (
        <div className="space-y-2">
            {label && <label className="text-xs uppercase text-neutral-500 font-bold tracking-widest">{label}</label>}

            {value ? (
                <div className="relative w-full aspect-video bg-neutral-900 border border-neutral-700 overflow-hidden group">
                    <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            ) : (
                <div className="relative w-full aspect-video bg-neutral-900 border border-dashed border-neutral-700 hover:border-white/50 transition-colors flex flex-col items-center justify-center cursor-pointer group">
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center text-neutral-400">
                            <Loader2 size={32} className="animate-spin mb-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Mengunggah...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center text-neutral-500 group-hover:text-white transition-colors">
                            <Upload size={32} className="mb-4" />
                            <span className="text-xs font-bold uppercase tracking-widest mb-1">Pilih Gambar</span>
                            <span className="text-[10px] text-neutral-600">Maks. 5MB (JPG, PNG, WebP)</span>
                        </div>
                    )}
                </div>
            )}

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}
