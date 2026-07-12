import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    const colors = {
        success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
        danger: 'bg-red-50 border-red-200 text-red-800',
        info: 'bg-blue-50 border-blue-200 text-blue-800',
    };

    const icons = {
        success: <CheckCircle className="text-emerald-500" size={18} />,
        danger: <AlertCircle className="text-red-500" size={18} />,
        info: <Info className="text-blue-500" size={18} />,
    };

    return (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 border rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-5 duration-300 ${colors[type]}`}>
            {icons[type]}
            <span className="text-sm font-medium">{message}</span>
            <button onClick={onClose} className="hover:opacity-70 transition-all ml-2">
                <X size={16} />
            </button>
        </div>
    );
}
