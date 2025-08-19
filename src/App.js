import React, { useState, useEffect } from 'react';

// Configurazione colori per modalità chiara e scura
const COLORS = {
  light: {
    primary: '#dc2626', // rosso per giocatore attivo (invariato)
    secondary: '#6b7280', // grigio per giocatori inattivi
    background: '#f9fafb',
    cardBg: '#ffffff',
    button: '#e5e7eb',
    buttonHover: '#d1d5db',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#d1d5db',
  },
  dark: {
    primary: '#dc2626', // rosso per giocatore attivo (invariato)
    secondary: '#6b7280', // grigio per giocatori inattivi (invariato)
    background: '#0d1117', // quasi nero come VS Code
    cardBg: '#161b22',    // grigio molto scuro
    button: '#21262d',    // grigio scuro per pulsanti
    buttonHover: '#30363d', // grigio leggermente più chiaro per hover
    text: '#f0f6fc',      // bianco molto chiaro
    textSecondary: '#8b949e', // grigio chiaro per testo secondario
    border: '#30363d',    // bordi grigio scuro
  }
};

// Configurazione animazioni
const ANIMATION_DURATION = 100; // millisecondi - modifica qui per cambiare velocità

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
  const [selectedNumPlayers, setSelectedNumPlayers] = useState(null);
  const [nameInputs, setNameInputs] = useState([]);
  
  // Nuovo stato per la modalità scura
  const [darkMode, setDarkMode] = useState(false);
  
  // Stato per l'animazione dei pulsanti
  const [pressedButton, setPressedButton] = useState(null);

  // Effetto per rilevare la preferenza del sistema
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  // Funzione per ottenere i colori attuali
  const getColors = () => darkMode ? COLORS.dark : COLORS.light;

  // Funzione per toggleare la modalità scura
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Componente per il pulsante modalità scura
  const DarkModeToggle = () => {
    const colors = getColors();
    
    return (
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-lg transition-colors"
        style={{ 
          backgroundColor: colors.button,
          color: colors.text
        }}
        title={darkMode ? 'Modalità chiara' : 'Modalità scura'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
    );
  };

  // Funzione per animare il pulsante premuto
  const animateButtonPress = (buttonId, callback) => {
    setPressedButton(buttonId);
    setTimeout(() => {
      setPressedButton(null);
      if (callback) callback();
    }, ANIMATION_DURATION);
  };

  // Inizializza giocatori (aggiornata per accettare nomi)
  const initGame = (playerCount, names = []) => {
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: names[i] && names[i].trim() ? names[i].trim() : `PLAYER ${i + 1}`,
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

  // Annulla ultima mossa: ripristina ESATTAMENTE l'ultimo snapshot e rimuovilo
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

  // Gestisce il punteggio con animazione
  const handleScore = (value, multiplier) => {
    if (winner || throwsCount >= 3) return;

    // Crea ID univoco per il pulsante
    const buttonId = `${value}-${multiplier}`;
    
    // Anima il pulsante e poi esegui la logica
    animateButtonPress(buttonId, () => {
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
    });
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

  // Selezione numero giocatori (non avvia la partita)
  const selectPlayers = (num) => {
    setSelectedNumPlayers(num);
    setNameInputs(prev => {
      const next = prev.slice(0, num);
      while (next.length < num) next.push('');
      return next;
    });
  };

  const handleNameChange = (idx, value) => {
    setNameInputs(prev => {
      const next = [...prev];
      next[idx] = value.slice(0, 8); // max 8 caratteri
      return next;
    });
  };

  const startGame = () => {
    if (!selectedNumPlayers) return;
    const names = nameInputs.map((n, i) => (n && n.trim()) ? n.trim() : `PLAYER ${i + 1}`);
    initGame(selectedNumPlayers, names);
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
    const colors = getColors();
    
    if (numPlayers <= 2) {
      return (
        <div className="grid gap-4 max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${numPlayers}, 1fr)` }}>
          {players.map((player, index) => (
            <div
              key={player.id}
              className="rounded-lg p-4 text-center"
              style={{
                backgroundColor: index === currentPlayer ? colors.primary : colors.secondary,
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
                        color: currentTurnThrows[throwIndex] ? '#111827' : 'white'
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
                style={{ backgroundColor: colors.primary, color: 'white' }}
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
                        color: currentTurnThrows[throwIndex] ? '#111827' : 'white'
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
                style={{ backgroundColor: colors.secondary, color: 'white' }}
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
                style={{ backgroundColor: colors.secondary, color: 'white' }}
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
              style={{ backgroundColor: colors.primary, color: 'white' }}
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
                        color: currentTurnThrows[throwIndex] ? '#111827' : 'white'
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
              style={{ backgroundColor: colors.secondary, color: 'white' }}
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
    const colors = getColors();
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        {/* Toggle modalità scura in alto a sinistra */}
        <div className="fixed top-4 left-4 z-10">
          <DarkModeToggle />
        </div>
        
        <div className="rounded-lg shadow-lg p-8 max-w-md w-full" style={{ backgroundColor: colors.cardBg }}>
          {/* Header senza toggle */}
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
                  className="py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
                  style={{ 
                    backgroundColor: selected ? colors.primary : colors.button,
                    color: selected ? 'white' : colors.text,
                    border: `2px solid ${selected ? colors.primary : colors.border}`,
                    cursor: 'pointer'
                  }}
                >
                  {num} Giocatori
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
                  <input
                    key={i}
                    type="text"
                    maxLength={8}
                    value={nameInputs[i] || ''}
                    onChange={(e) => handleNameChange(i, e.target.value)}
                    placeholder={`PLAYER ${i + 1}`}
                    className="w-full px-3 py-2 rounded-md"
                    style={{
                      border: `1px solid ${colors.border}`,
                      color: colors.text,
                      backgroundColor: colors.cardBg
                    }}
                  />
                ))}
              </div>

              <button
                onClick={startGame}
                className="w-full py-3 rounded-lg font-semibold text-white text-lg transition-colors"
                style={{ 
                  backgroundColor: colors.primary,
                  cursor: 'pointer'
                }}
              >
                Avvia Partita
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Schermata di vittoria
  if (winner) {
    const colors = getColors();
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        <div className="rounded-lg shadow-lg p-8 max-w-md w-full text-center" style={{ backgroundColor: colors.cardBg }}>
          <h1 className="text-4xl font-bold mb-4" style={{ color: colors.primary }}>
            🎉 VITTORIA! 🎉
          </h1>
          <h2 className="text-2xl font-semibold mb-6" style={{ color: colors.text }}>
            {winner.name} HA VINTO!
          </h2>
          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-lg font-semibold text-lg transition-colors"
            style={{ 
              backgroundColor: colors.primary,
              color: 'white'
            }}
          >
            Nuova Partita
          </button>
        </div>
      </div>
    );
  }

  const colors = getColors();

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Header */}
      <div className="shadow-sm p-4" style={{ backgroundColor: colors.cardBg }}>
        <div className="flex justify-between items-center max-w-md mx-auto">
          <DarkModeToggle />
          
          <h1 className="text-xl font-bold" style={{ color: colors.text }}>
            365 DARTS
          </h1>
          
          <button
            onClick={resetGame}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: colors.button,
              color: colors.text
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
        <div className="mx-auto w-full rounded-lg shadow-sm p-[1px] pb-[1px]" style={{ backgroundColor: colors.cardBg }}>
          
          {/* Righe con separatori e sfondi per x2/x3 */}
          <div className="space-y-1 px-[1px]">
            {DART_VALUES.map((row, rowIndex) => {
              const isGroupStart = rowIndex === 2 || rowIndex === 4;

              return (
                <div
                  key={`row-${rowIndex}`}
                  className={`grid grid-cols-10 gap-[2px] rounded-md px-1 py-1 ${isGroupStart ? 'mt-3' : ''}`}
                >
                  {row.map((value, colIndex) => {
                    const multiplier = MULTIPLIERS[rowIndex];
                    const dotCount = multiplier;
                    const buttonId = `${value}-${multiplier}`;
                    const isPressed = pressedButton === buttonId;

                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleScore(value, multiplier)}
                        disabled={throwsCount >= 3 || winner}
                        className="relative aspect-square rounded-md font-semibold text-lg disabled:opacity-50 shadow-sm flex items-center justify-center"
                        style={{
                          backgroundColor: isPressed ? colors.primary : (throwsCount >= 3 ? colors.border : colors.button),
                          color: isPressed ? 'white' : colors.text,
                          border: `1px solid ${colors.border}`,
                          cursor: throwsCount >= 3 ? 'not-allowed' : 'pointer',
                          transform: isPressed ? 'scale(1.1)' : 'scale(1)',
                          transition: isPressed ? 'none' : `all ${ANIMATION_DURATION}ms ease-out`,
                          outline: 'none',
                          WebkitTapHighlightColor: 'transparent'
                        }}
                      >
                        {/* Valore numerico */}
                        <span>{value}</span>

                        {/* Contenitore per i pallini */}
                        <div
                          className="absolute bottom-0 left-0 right-0 flex justify-center items-center"
                          style={{ transform: 'translateY(50%)' }}
                        >
                          {Array.from({ length: dotCount }).map((_, i) => (
                            <div
                              key={i}
                              className="rounded-full"
                              style={{
                                width: '6px',
                                height: '6px',
                                backgroundColor: isPressed ? 'white' : colors.text,
                                border: `1px solid ${isPressed ? 'white' : colors.border}`,
                                margin: '0 1px'
                              }}
                            />
                          ))}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Pulsanti speciali */}
          <div className="mt-4 space-y-1 px-[5px] pb-[5px]">
            {/* Riga 1: Miss, 25 e 50 */}
            <div className="grid grid-cols-3 gap-1">
              {[
                { value: 0, multiplier: 1, label: 'MISS' },
                { value: 25, multiplier: 1, label: 'BULL (25)' },
                { value: 50, multiplier: 1, label: 'BULL (50)' }
              ].map(({ value, multiplier, label }) => {
                const buttonId = `${value}-${multiplier}`;
                const isPressed = pressedButton === buttonId;
                
                return (
                  <button
                    key={buttonId}
                    onClick={() => handleScore(value, multiplier)}
                    disabled={throwsCount >= 3 || winner}
                    className="py-4 rounded-md font-semibold text-lg disabled:opacity-50"
                    style={{
                      backgroundColor: isPressed ? colors.primary : (throwsCount >= 3 ? colors.border : colors.button),
                      color: isPressed ? 'white' : colors.text,
                      border: `1px solid ${colors.border}`,
                      cursor: throwsCount >= 3 ? 'not-allowed' : 'pointer',
                      transform: isPressed ? 'scale(1.05)' : 'scale(1)',
                      transition: isPressed ? 'none' : `all ${ANIMATION_DURATION}ms ease-out`,
                      outline: 'none',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            
            {/* Riga 2: BACK e Next Player */}
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={undoLastMove}
                disabled={gameHistory.length <= 1}
                className="py-4 rounded-md font-semibold text-lg transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: gameHistory.length > 1 ? colors.button : colors.border,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  cursor: gameHistory.length <= 1 ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                BACK
              </button>
              <button
                onClick={nextPlayer}
                disabled={winner || throwsCount < 3}
                className="py-4 rounded-md font-semibold text-white text-lg transition-colors disabled:opacity-50"
                style={{ 
                  backgroundColor: (winner || throwsCount < 3) ? colors.border : colors.primary,
                  cursor: (winner || throwsCount < 3) ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent'
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