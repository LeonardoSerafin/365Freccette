import React, { useState, useEffect } from 'react';

// Configurazione colori - file separato simulato
const COLORS = {
  primary: '#dc2626', // rosso per giocatore attivo
  secondary: '#4b5563', // grigio per giocatori inattivi
  background: '#f3f4f6',
  cardBg: '#ffffff',
  button: '#e5e7eb',
  buttonHover: '#d1d5db',
  text: '#111827',
  textSecondary: '#6b7280',
  border: '#d1d5db'
};

const DART_VALUES = [
  // Prima fascia (x1) - righe 1-2
  [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  // Seconda fascia (x2) - righe 3-4  
  [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  // Terza fascia (x3) - righe 5-6
  [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
];

const MULTIPLIERS = [1, 1, 2, 2, 3, 3];

const DartsGame = () => {
  const [numPlayers, setNumPlayers] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentTurnThrows, setCurrentTurnThrows] = useState([]);
  const [throwsCount, setThrowsCount] = useState(0);

  // Inizializza giocatori
  const initGame = (playerCount) => {
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: `PLAYER ${i + 1}`,
      score: 365,
      turnStartScore: 365
    }));
    
    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setGameHistory([{ players: newPlayers, currentPlayer: 0, currentTurnThrows: [], throwsCount: 0 }]);
    setNumPlayers(playerCount);
    setGameStarted(true);
    setWinner(null);
    setCurrentTurnThrows([]);
    setThrowsCount(0);
  };

  // Snapshot dello stato corrente
  const takeSnapshot = () => {
    const snapshot = {
      players: players.map(p => ({ ...p })),
      currentPlayer,
      currentTurnThrows: [...currentTurnThrows],
      throwsCount,
      timestamp: Date.now()
    };
    setGameHistory(prev => [...prev, snapshot]);
  };

  // Annulla ultima mossa
  const undoLastMove = () => {
    if (gameHistory.length > 1) {
      const newHistory = [...gameHistory];
      newHistory.pop(); // Rimuovi stato corrente
      const previousState = newHistory[newHistory.length - 1];
      
      setPlayers(previousState.players);
      setCurrentPlayer(previousState.currentPlayer);
      setCurrentTurnThrows(previousState.currentTurnThrows);
      setThrowsCount(previousState.throwsCount);
      setGameHistory(newHistory);
      setWinner(null);
    }
  };

  // Formatta il tiro per la visualizzazione
  const formatThrow = (value, multiplier) => {
    if (value === 0) return 'MISS';
    if (value === 25) return 'BULL';
    if (value === 50) return 'BULL';
    
    if (multiplier === 1) return value.toString();
    if (multiplier === 2) return `D${value}`;
    if (multiplier === 3) return `T${value}`;
    
    return value.toString();
  };

  // Gestisce il punteggio
  const handleScore = (value, multiplier) => {
    if (winner || throwsCount >= 3) return;

    const score = value * multiplier;
    const newPlayers = [...players];
    const player = newPlayers[currentPlayer];
    const newScore = player.score - score;
    
    // Aggiungi il tiro allo storico del turno
    const throwDisplay = formatThrow(value, multiplier);
    const newTurnThrows = [...currentTurnThrows, throwDisplay];
    setCurrentTurnThrows(newTurnThrows);
    setThrowsCount(throwsCount + 1);

    // Se va sotto zero, bust - torna al punteggio di inizio turno
    if (newScore < 0) {
      player.score = player.turnStartScore;
      setPlayers(newPlayers);
      takeSnapshot();
      return;
    }

    // Aggiorna il punteggio
    player.score = newScore;

    // Controlla se ha vinto
    if (newScore === 0) {
      setWinner(player);
      setPlayers(newPlayers);
      takeSnapshot();
      return;
    }

    // Controlla se ha raggiunto il punteggio di un altro giocatore (bust rule)
    const otherPlayerWithSameScore = newPlayers.find(p => 
      p.id !== player.id && p.score === newScore
    );

    if (otherPlayerWithSameScore) {
      // Il giocatore che aveva questo punteggio torna a 365
      otherPlayerWithSameScore.score = 365;
      otherPlayerWithSameScore.turnStartScore = 365;
    }

    setPlayers(newPlayers);
    takeSnapshot();
  };

  // Passa al prossimo giocatore
  const nextPlayer = () => {
    const newPlayers = [...players];
    // Aggiorna il punteggio di inizio turno per il giocatore corrente
    newPlayers[currentPlayer].turnStartScore = newPlayers[currentPlayer].score;
    
    const nextPlayerIndex = (currentPlayer + 1) % numPlayers;
    setCurrentPlayer(nextPlayerIndex);
    setPlayers(newPlayers);
    
    // Reset del turno
    setCurrentTurnThrows([]);
    setThrowsCount(0);
    
    takeSnapshot();
  };

  // Reset del gioco
  const resetGame = () => {
    setNumPlayers(null);
    setPlayers([]);
    setCurrentPlayer(0);
    setGameHistory([]);
    setGameStarted(false);
    setWinner(null);
    setCurrentTurnThrows([]);
    setThrowsCount(0);
  };

  // Schermata di selezione giocatori
  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold text-center mb-8" style={{ color: COLORS.text }}>
            365 DARTS
          </h1>
          <p className="text-center mb-6" style={{ color: COLORS.textSecondary }}>
            Seleziona il numero di giocatori
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                onClick={() => initGame(num)}
                className="py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
                style={{ 
                  backgroundColor: COLORS.button,
                  color: COLORS.text,
                  border: `2px solid ${COLORS.border}`
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = COLORS.buttonHover}
                onMouseOut={(e) => e.target.style.backgroundColor = COLORS.button}
              >
                {num} {num === 1 ? 'Giocatore' : 'Giocatori'}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Schermata di vittoria
  if (winner) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4" style={{ color: COLORS.primary }}>
            🎉 VITTORIA! 🎉
          </h1>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: COLORS.text }}>
            {winner.name} HA VINTO!
          </h2>
          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-lg font-semibold text-lg transition-colors"
            style={{ 
              backgroundColor: COLORS.primary,
              color: 'white'
            }}
          >
            Nuova Partita
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center max-w-md mx-auto">
          
          <h1 className="text-xl font-bold" style={{ color: COLORS.text }}>
            365 DARTS
          </h1>
          
          <button
            onClick={resetGame}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: COLORS.button,
              color: COLORS.text
            }}
          >
            <b>RESTART</b>
          </button>
        </div>
      </div>

      {/* Punteggi giocatori */}
      <div className="p-4">
        <div className="grid gap-4 max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${numPlayers}, 1fr)` }}>
          {players.map((player, index) => (
            <div
              key={player.id}
              className="rounded-lg p-4 text-center"
              style={{
                backgroundColor: index === currentPlayer ? COLORS.primary : COLORS.secondary,
                color: 'white'
              }}
            >
              <div className="text-4xl font-bold mb-1">
                {player.score}
              </div>
              <div className="text-sm font-medium mb-2">
                {player.name}
              </div>
              {/* Storico tiri del turno corrente - solo per il giocatore attivo */}
              {index === currentPlayer && (
                <div className="flex justify-center gap-1 mt-2">
                  {[0, 1, 2].map(throwIndex => (
                    <div
                      key={throwIndex}
                      className="w-12 h-6 rounded text-xs flex items-center justify-center font-medium"
                      style={{
                        backgroundColor: currentTurnThrows[throwIndex] ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)',
                        color: currentTurnThrows[throwIndex] ? COLORS.text : 'white'
                      }}
                    >
                      {currentTurnThrows[throwIndex] || ''}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Griglia punteggi */}
      <div className="p-4">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-10 gap-1">
            {DART_VALUES.map((row, rowIndex) => 
              row.map((value, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleScore(value, MULTIPLIERS[rowIndex])}
                  disabled={throwsCount >= 3 || winner}
                  className="aspect-square rounded-lg font-semibold text-sm transition-colors active:scale-95 disabled:opacity-50"
                  style={{
                    backgroundColor: throwsCount >= 3 ? COLORS.border : COLORS.button,
                    color: COLORS.text,
                    border: `1px solid ${COLORS.border}`,
                    cursor: throwsCount >= 3 ? 'not-allowed' : 'pointer'
                  }}
                  onTouchStart={(e) => {
                    if (throwsCount < 3) e.target.style.backgroundColor = COLORS.buttonHover;
                  }}
                  onTouchEnd={(e) => {
                    if (throwsCount < 3) e.target.style.backgroundColor = COLORS.button;
                  }}
                >
                  {value}
                  {MULTIPLIERS[rowIndex] > 1 && (
                    <div className="text-xs opacity-70">
                      ×{MULTIPLIERS[rowIndex]}
                    </div>
                  )}
                </button>
              ))
            )}
          </div>
          
          {/* Pulsanti speciali */}
          <div className="mt-4 space-y-2">
            {/* Riga 1: 25, 50 e Miss */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleScore(0, 1)}
                disabled={throwsCount >= 3 || winner}
                className="py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: throwsCount >= 3 ? COLORS.border : COLORS.button,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  cursor: throwsCount >= 3 ? 'not-allowed' : 'pointer'
                }}
              >
                MISS
              </button>
              <button
                onClick={() => handleScore(25, 1)}
                disabled={throwsCount >= 3 || winner}
                className="py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: throwsCount >= 3 ? COLORS.border : COLORS.button,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  cursor: throwsCount >= 3 ? 'not-allowed' : 'pointer'
                }}
              >
                BULL (25)
              </button>
              <button
                onClick={() => handleScore(50, 1)}
                disabled={throwsCount >= 3 || winner}
                className="py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: throwsCount >= 3 ? COLORS.border : COLORS.button,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  cursor: throwsCount >= 3 ? 'not-allowed' : 'pointer'
                }}
              >
                BULL (50)
              </button>
            </div>
            
            {/* Riga 2: Indietro e Next Player */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={undoLastMove}
                disabled={gameHistory.length <= 1}
                className="py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: gameHistory.length > 1 ? COLORS.button : COLORS.border,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  cursor: gameHistory.length <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                INDIETRO
              </button>
              <button
                onClick={nextPlayer}
                disabled={winner}
                className="py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: winner ? COLORS.border : COLORS.primary,
                  cursor: winner ? 'not-allowed' : 'pointer'
                }}
              >
                NEXT PLAYER
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DartsGame;