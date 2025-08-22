import React, { useState } from 'react';
import { COLORS } from '../utils/constants';
import { getRedButtonStyle, ShineEffect } from '../utils/animations';
import { DarkModeToggle } from './DarkModeToggle';

export const GameSetup = ({ darkMode, toggleDarkMode, onStartGame }) => {
  const [selectedNumPlayers, setSelectedNumPlayers] = useState(null);
  const [nameInputs, setNameInputs] = useState([]);
  const [duplicateNames, setDuplicateNames] = useState([]);

  const colors = darkMode ? COLORS.dark : COLORS.light;

  const selectPlayers = (num) => {
    setSelectedNumPlayers(num);
    setNameInputs(prev => {
      const next = prev.slice(0, num);
      while (next.length < num) next.push('');
      return next;
    });
  };

  const handleNameChange = (idx, value) => {
    const newInputs = [...nameInputs];
    newInputs[idx] = value.slice(0, 8);
    setNameInputs(newInputs);

    const duplicates = [];
    newInputs.forEach((name, index) => {
      const trimmedName = name.trim().toLowerCase();
      if (trimmedName) {
        const sameNameCount = newInputs.filter(otherName => 
          otherName.trim().toLowerCase() === trimmedName
        ).length;
        
        if (sameNameCount > 1) {
          duplicates.push(index);
        }
      }
    });
    
    setDuplicateNames([...new Set(duplicates)]);
  };

  const startGame = () => {
    if (!selectedNumPlayers || duplicateNames.length > 0) return;
    
    const finalNames = nameInputs.map((n, i) => (n && n.trim()) ? n.trim() : `PLAYER ${i + 1}`);
    onStartGame(selectedNumPlayers, finalNames);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
      <div className="fixed top-4 left-4 z-10">
        <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      </div>
      
      <div className="rounded-lg shadow-lg p-8 max-w-md w-full" style={{ backgroundColor: colors.cardBg }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-center" style={{ color: colors.text }}>
            365 DARTS
          </h1>
        </div>
        
        <p className="text-center mb-6" style={{ color: colors.textSecondary }}>
          Seleziona il numero di giocatori
        </p>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {[2, 3, 4, 5].map(num => {
            const selected = selectedNumPlayers === num;
            return (
              <button
                key={num}
                onClick={() => selectPlayers(num)}
                className="py-4 px-6 rounded-lg font-semibold text-lg transition-colors relative overflow-hidden"
                style={{ 
                  ...(selected 
                    ? {
                        ...getRedButtonStyle(true, darkMode),
                        color: 'white'
                      }
                    : {
                        backgroundColor: colors.button,
                        color: colors.text,
                        border: `2px solid ${colors.border}`
                      }),
                  cursor: 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <ShineEffect show={selected} />
                <span className="relative z-10">{num} Giocatori</span>
              </button>
            );
          })}
        </div>

        {selectedNumPlayers && (
          <div className="space-y-3">
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Inserisci i nomi (max 8 caratteri)
            </p>
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr' }}>
              {Array.from({ length: selectedNumPlayers }, (_, i) => (
                <div key={i} className="relative">
                  <input
                    type="text"
                    maxLength={8}
                    value={nameInputs[i] || ''}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    placeholder={`PLAYER ${i + 1}`}
                    className="w-full px-3 py-2 rounded-md"
                    style={{
                      border: `1px solid ${duplicateNames.includes(i) ? '#dc2626' : colors.border}`,
                      color: colors.text,
                      backgroundColor: colors.cardBg,
                      outline: 'none'
                    }}
                  />
                  {duplicateNames.includes(i) && nameInputs[i] && nameInputs[i].trim() && (
                    <p className="text-xs mt-1" style={{ color: '#dc2626' }}>
                      Non ci possono essere due nomi uguali
                    </p>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={startGame}
              disabled={duplicateNames.length > 0}
              className="w-full py-3 rounded-lg font-semibold text-white text-lg transition-colors relative overflow-hidden"
              style={{ 
                ...(duplicateNames.length > 0 
                  ? {
                      backgroundColor: '#6b7280',
                      opacity: 0.5,
                      cursor: 'not-allowed'
                    }
                  : {
                      ...getRedButtonStyle(true, darkMode),
                      cursor: 'pointer'
                    }),
                outline: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              <ShineEffect show={duplicateNames.length === 0} />
              <span className="relative z-10">Avvia Partita</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};