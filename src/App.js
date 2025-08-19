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

  // Nuovo stato per tracciare i nomi duplicati
  const [duplicateNames, setDuplicateNames] = useState([]);

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
    if (value === 25) return '25';
    if (value === 50) return '50';
    
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
    const newInputs = [...nameInputs];
    newInputs[idx] = value.slice(0, 8); // max 8 caratteri
    setNameInputs(newInputs);

    // Controlla duplicati
    const duplicates = [];
    newInputs.forEach((name, index) => {
      const trimmedName = name.trim().toLowerCase();
      if (trimmedName) {
        // Conta quante volte appare questo nome
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
    if (!selectedNumPlayers) return;
    
    // Controlla se ci sono nomi duplicati
    if (duplicateNames.length > 0) return;
    
    const finalNames = nameInputs.map((n, i) => (n && n.trim()) ? n.trim() : `PLAYER ${i + 1}`);
    initGame(selectedNumPlayers, finalNames);
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
                        backgroundColor: colors.cardBg
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
                className="w-full py-3 rounded-lg font-semibold text-white text-lg transition-colors"
                style={{ 
                  backgroundColor: duplicateNames.length > 0 ? '#6b7280' : colors.primary,
                  opacity: duplicateNames.length > 0 ? 0.5 : 1,
                  cursor: duplicateNames.length > 0 ? 'not-allowed' : 'pointer'
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
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: colors.background }}>
        {/* Sfondo animato con gradiente dinamico */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(circle at 20% 80%, ${colors.primary}40 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, #fbbf2440 0%, transparent 50%),
              radial-gradient(circle at 40% 40%, ${colors.primary}30 0%, transparent 50%)
            `,
            animation: 'pulse 3s ease-in-out infinite alternate'
          }}
        />
        
        {/* Particelle animate */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-70"
            style={{
              width: Math.random() * 8 + 4 + 'px',
              height: Math.random() * 8 + 4 + 'px',
              backgroundColor: i % 3 === 0 ? colors.primary : i % 3 === 1 ? '#fbbf24' : '#8b5cf6',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite alternate`,
              animationDelay: Math.random() * 2 + 's'
            }}
          />
        ))}

        {/* Card principale con effetto glassmorphism */}
        <div 
          className="rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center relative z-10"
          style={{ 
            backgroundColor: darkMode ? 'rgba(22, 27, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}
        >
          {/* Corona animata */}
          <div className="mb-6 relative">
            <div 
              className="text-8xl mx-auto w-fit relative"
              style={{ 
                animation: 'bounce 2s ease-in-out infinite',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
              }}
            >
              👑
            </div>
            {/* Brillantini intorno alla corona */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute text-2xl"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-60px)`,
                  animation: `twinkle ${1.5 + Math.random()}s ease-in-out infinite alternate`,
                  animationDelay: Math.random() * 1 + 's'
                }}
              >
                ✨
              </div>
            ))}
          </div>

          {/* Titolo principale con gradiente */}
          <h1 
            className="text-5xl font-black mb-2"
            style={{ 
              background: `linear-gradient(45deg, ${colors.primary}, #fbbf24, ${colors.primary})`,
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'gradientShift 3s ease-in-out infinite'
            }}
          >
            VITTORIA!
          </h1>

          {/* Nome vincitore con effetto neon */}
          <div className="mb-8">
            <h2 
              className="text-3xl font-bold mb-2"
              style={{ 
                color: colors.text,
                textShadow: `0 0 20px ${colors.primary}40, 0 0 40px ${colors.primary}20`,
                animation: 'glow 2s ease-in-out infinite alternate'
              }}
            >
              {winner.name}
            </h2>
            <p className="text-xl font-medium" style={{ color: colors.textSecondary }}>
              è il CAMPIONE! 🏆
            </p>
          </div>

          {/* Statistiche della partita */}
          <div 
            className="rounded-xl p-4 mb-6"
            style={{ 
              backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
            }}
          >
            <h3 className="text-lg font-semibold mb-3" style={{ color: colors.text }}>
              Classifica Finale
            </h3>
            <div className="space-y-2">
              {players
                .slice()
                .sort((a, b) => a.score - b.score)
                .map((player, index) => (
                  <div 
                    key={player.id}
                    className="flex justify-between items-center py-2 px-3 rounded-lg"
                    style={{
                      backgroundColor: player.id === winner.id 
                        ? `${colors.primary}20` 
                        : darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)'
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅'}
                      </span>
                      <span 
                        className="font-medium"
                        style={{ 
                          color: player.id === winner.id ? colors.primary : colors.text 
                        }}
                      >
                        {player.name}
                      </span>
                    </span>
                    <span 
                      className="font-bold"
                      style={{ 
                        color: player.id === winner.id ? colors.primary : colors.textSecondary 
                      }}
                    >
                      {player.score}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Pulsante nuova partita con effetto hover spettacolare */}
          <button
            onClick={resetGame}
            className="relative py-4 px-10 rounded-xl font-bold text-xl text-white transition-all duration-300 overflow-hidden group"
            style={{ 
              background: `linear-gradient(45deg, ${colors.primary}, #dc2626, ${colors.primary})`,
              backgroundSize: '200% 200%',
              animation: 'gradientShift 3s ease-in-out infinite',
              boxShadow: `0 8px 32px ${colors.primary}40`,
              transform: 'scale(1)',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = `0 12px 48px ${colors.primary}60`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = `0 8px 32px ${colors.primary}40`;
            }}
          >
            <span className="relative z-10"> NUOVA PARTITA </span>
            
            {/* Effetto shine */}
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300"
              style={{ transform: 'skewX(-45deg) translateX(-100%)' }}
            />
          </button>
        </div>

        {/* Stili CSS per le animazioni */}
        <style jsx>{`
          @keyframes bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-20px); }
            60% { transform: translateY(-10px); }
          }
          
          @keyframes float {
            from { transform: translateY(0px) rotate(0deg); }
            to { transform: translateY(-20px) rotate(180deg); }
          }
          
          @keyframes twinkle {
            from { opacity: 0.3; transform: scale(0.8); }
            to { opacity: 1; transform: scale(1.2); }
          }
          
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          
          @keyframes glow {
            from { text-shadow: 0 0 20px ${colors.primary}40, 0 0 40px ${colors.primary}20; }
            to { text-shadow: 0 0 30px ${colors.primary}60, 0 0 60px ${colors.primary}40; }
          }
          
          @keyframes pulse {
            from { transform: scale(1); }
            to { transform: scale(1.1); }
          }
        `}</style>
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
                { value: 25, multiplier: 1, label: '25' },
                { value: 50, multiplier: 1, label: '50' }
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