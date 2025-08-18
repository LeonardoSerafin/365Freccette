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
  border: '#d1d5db',
  // Nuovi: sfondo righe per x2 (argento) e x3 (oro)
  rowX2Bg: '#f0f1f4',
  rowX3Bg: '#fff7e6'
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

  // Snapshot dello stato corrente (stato COMPLETO)
  const takeSnapshot = () => {
    const snapshot = {
      players: players.map(p => ({ ...p })),
      currentPlayer,
      currentTurnThrows: [...currentTurnThrows],
      throwsCount,
      winner
    };
    setGameHistory(prev => [...prev, snapshot]);
  };

  // Annulla ultima mossa: ripristina ESATTAMENTE l’ultimo snapshot e rimuovilo
  const undoLastMove = () => {
    if (gameHistory.length === 0) return;

    const last = gameHistory[gameHistory.length - 1];
    setPlayers(last.players.map(p => ({ ...p })));
    setCurrentPlayer(last.currentPlayer);
    setCurrentTurnThrows([...last.currentTurnThrows]);
    setThrowsCount(last.throwsCount);
    setWinner(last.winner || null);
    setGameHistory(prev => prev.slice(0, -1));
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

    // Salva uno snapshot PRIMA del tiro (una sola volta per questa azione)
    takeSnapshot();

    const score = value * multiplier;
    const newPlayers = [...players];
    const player = newPlayers[currentPlayer];
    const newScore = player.score - score;

    // Aggiungi il tiro allo storico del turno
    const throwDisplay = formatThrow(value, multiplier);
    setCurrentTurnThrows(prev => [...prev, throwDisplay]);
    setThrowsCount(prev => prev + 1);

    if (newScore < 0) {
      player.score = player.turnStartScore;
      setPlayers(newPlayers);
      return;
    }

    player.score = newScore;

    if (newScore === 0) {
      setWinner(player);
      setPlayers(newPlayers);
      return;
    }

    const otherPlayerWithSameScore = newPlayers.find(p =>
      p.id !== player.id && p.score === newScore
    );
    if (otherPlayerWithSameScore) {
      otherPlayerWithSameScore.score = 365;
      otherPlayerWithSameScore.turnStartScore = 365;
    }

    setPlayers(newPlayers);
  };

  // Passa al prossimo giocatore
  const nextPlayer = () => {
    // Blocca il cambio giocatore finché non ci sono 3 tiri o se c'è un vincitore
    if (winner || throwsCount < 3) return;

    // Salva snapshot per poter annullare anche il cambio giocatore (azione singola)
    takeSnapshot();

    const newPlayers = [...players];
    newPlayers[currentPlayer].turnStartScore = newPlayers[currentPlayer].score;

    const nextPlayerIndex = (currentPlayer + 1) % numPlayers;
    setCurrentPlayer(nextPlayerIndex);
    setPlayers(newPlayers);

    // Reset del turno
    setCurrentTurnThrows([]);
    setThrowsCount(0);
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

  // Ordine inattivi: per id crescente, escludendo l'attivo
  const getInactiveOrder = () => {
    if (!players.length) return [];
    return players
      .filter((_, idx) => idx !== currentPlayer)
      .slice()
      .sort((a, b) => a.id - b.id);
  };

  // Render pulito dei punteggi (niente ternari annidati per evitare errori di parentesi)
  const renderScoreboard = () => {
    if (numPlayers <= 2) {
      return (
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
              <div className="text-4xl font-bold mb-1">{player.score}</div>
              <div className="text-sm font-medium mb-2">{player.name}</div>
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
      );
    }

    if (numPlayers === 5) {
      const orderedOthers = getInactiveOrder(); // [prev, next, next+1, next+2]
      const row1 = orderedOthers.slice(0, 2);   // seconda riga
      const row2 = orderedOthers.slice(2, 4);   // terza riga

      return (
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-1 gap-4 mb-4">
            {players[currentPlayer] && (
              <div
                key={players[currentPlayer].id}
                className="rounded-lg p-4 text-center"
                style={{ backgroundColor: COLORS.primary, color: 'white' }}
              >
                <div className="text-4xl font-bold mb-1">{players[currentPlayer].score}</div>
                <div className="text-sm font-medium mb-2">{players[currentPlayer].name}</div>
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
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {row1.map(player => (
              <div
                key={player.id}
                className="rounded-lg p-4 text-center"
                style={{ backgroundColor: COLORS.secondary, color: 'white' }}
              >
                <div className="text-4xl font-bold mb-1">{player.score}</div>
                <div className="text-sm font-medium mb-2">{player.name}</div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {row2.map(player => (
              <div
                key={player.id}
                className="rounded-lg p-4 text-center"
                style={{ backgroundColor: COLORS.secondary, color: 'white' }}
              >
                <div className="text-4xl font-bold mb-1">{player.score}</div>
                <div className="text-sm font-medium mb-2">{player.name}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 3-4 giocatori: inattivi in ordine [precedente, poi successivi]
    const othersInOrder = getInactiveOrder();

    return (
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-4 mb-4">
          {players[currentPlayer] && (
            <div
              key={players[currentPlayer].id}
              className="rounded-lg p-4 text-center"
              style={{ backgroundColor: COLORS.primary, color: 'white' }}
            >
              <div className="text-4xl font-bold mb-1">{players[currentPlayer].score}</div>
              <div className="text-sm font-medium mb-2">{players[currentPlayer].name}</div>
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
            </div>
          )}
        </div>

        <div className={`grid gap-4 ${numPlayers === 3 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {othersInOrder.map(player => (
            <div
              key={player.id}
              className="rounded-lg p-4 text-center"
              style={{ backgroundColor: COLORS.secondary, color: 'white' }}
            >
              <div className="text-4xl font-bold mb-1">{player.score}</div>
              <div className="text-sm font-medium mb-2">{player.name}</div>
            </div>
          ))}
        </div>
      </div>
    );
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
            {[2, 3, 4, 5].map(num => (
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
                {num} Giocatori
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
        {renderScoreboard()}
      </div>

      {/* Griglia punteggi */}
      <div className="p-4">
        <div className="mx-auto w-full bg-white rounded-lg shadow-sm p-3">
          
          {/* Righe con separatori e sfondi per x2/x3 */}
          <div className="space-y-1">
            {DART_VALUES.map((row, rowIndex) => {
              const mult = MULTIPLIERS[rowIndex];
              const rowBg =
                mult === 2 ? COLORS.rowX2Bg :
                mult === 3 ? COLORS.rowX3Bg : 'transparent';
              const isGroupStart = rowIndex === 2 || rowIndex === 4;

              return (
                <div
                  key={`row-${rowIndex}`}
                  className={`grid grid-cols-10 gap-[2px] rounded-md px-1 py-1 ${isGroupStart ? 'mt-3' : ''}`}
                  style={{ backgroundColor: rowBg }}
                >
                  {row.map((value, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      onClick={() => handleScore(value, MULTIPLIERS[rowIndex])}
                      disabled={throwsCount >= 3 || winner}
                      className="aspect-square rounded-md font-semibold text-lg transition-colors active:scale-95 disabled:opacity-50 shadow-sm"
                      style={{
                        backgroundColor: throwsCount >= 3 ? COLORS.border : COLORS.button,
                        color: COLORS.text,
                        border: `1px solid ${COLORS.border}`,
                        cursor: throwsCount >= 3 ? 'not-allowed' : 'pointer'
                      }}
                      onTouchStart={(e) => {
                        if (throwsCount < 3) e.currentTarget.style.backgroundColor = COLORS.buttonHover;
                      }}
                      onTouchEnd={(e) => {
                        if (throwsCount < 3) e.currentTarget.style.backgroundColor = COLORS.button;
                      }}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Pulsanti speciali */}
          <div className="mt-4 space-y-2">
            {/* Riga 1: Miss, 25 e 50 */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleScore(0, 1)}
                disabled={throwsCount >= 3 || winner}
                className="py-4 rounded-md font-semibold text-lg transition-colors disabled:opacity-50"
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
                className="py-4 rounded-md font-semibold text-lg transition-colors disabled:opacity-50"
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
                className="py-4 rounded-md font-semibold text-lg transition-colors disabled:opacity-50"
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
            
            {/* Riga 2: BACK e Next Player */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={undoLastMove}
                disabled={gameHistory.length <= 1}
                className="py-4 rounded-md font-semibold text-lg transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: gameHistory.length > 1 ? COLORS.button : COLORS.border,
                  color: COLORS.text,
                  border: `1px solid ${COLORS.border}`,
                  cursor: gameHistory.length <= 1 ? 'not-allowed' : 'pointer'
                }}
              >
                BACK
              </button>
              <button
                onClick={nextPlayer}
                disabled={winner || throwsCount < 3}
                className="py-4 rounded-md font-semibold text-white text-lg transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: (winner || throwsCount < 3) ? COLORS.border : COLORS.primary,
                  cursor: (winner || throwsCount < 3) ? 'not-allowed' : 'pointer'
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