import React from 'react';
import { COLORS } from '../utils/constants';
import { getRedButtonStyle, ShineEffect } from '../utils/animations';

export const ResetConfirmModal = ({ 
  showResetConfirm, 
  darkMode, 
  onConfirm, 
  onCancel 
}) => {
  if (!showResetConfirm) return null;
  
  const colors = darkMode ? COLORS.dark : COLORS.light;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: colors.modalBg }}
      onClick={onCancel}
    >
      <div 
        className="rounded-lg shadow-xl p-6 max-w-sm w-full"
        style={{ backgroundColor: colors.modalCard }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4" style={{ color: colors.text }}>
          Conferma Reset
        </h3>
        <p className="mb-6" style={{ color: colors.textSecondary }}>
          Sei sicuro di voler resettare la partita? Tutti i progressi andranno persi.
        </p>
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
            style={{
              backgroundColor: colors.button,
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 px-4 rounded-lg font-medium text-white transition-colors relative overflow-hidden"
            style={{
              ...getRedButtonStyle(true, darkMode)
            }}
          >
            <ShineEffect show={true} />
            <span className="relative z-10">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};