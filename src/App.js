import React, { useState, useEffect } from 'react';

// Configurazione colori per modalità chiara e scura
const COLORS = {
  light: {
    primary: '#dc2626',
    secondary: '#6b7280',
    background: '#f9fafb',
    cardBg: '#ffffff',
    button: '#e5e7eb',
    buttonHover: '#d1d5db',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#d1d5db',
    modalBg: 'rgba(0, 0, 0, 0.5)',
    modalCard: '#ffffff',
  },
  dark: {
    primary: '#dc2626',
    secondary: '#6b7280',
    background: '#0d1117',
    cardBg: '#161b22',
    button: '#21262d',
    buttonHover: '#30363d',
    text: '#f0f6fc',
    textSecondary: '#8b949e',
    border: '#30363d',
    modalBg: 'rgba(0, 0, 0, 0.7)',
    modalCard: '#161b22',
  }
};

// Configurazione animazioni
const ANIMATION_DURATION = 100;

const DART_VALUES = [
  [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
  [20, 19, 18, 17, 16, 15, 14, 13, 12, 11],
  [10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
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
  const [darkMode, setDarkMode] = useState(false);
  const [pressedButton, setPressedButton] = useState(null);
  const [duplicateNames, setDuplicateNames] = useState([]);
  
  // Stati per le animazioni migliorati
  const [playerTransition, setPlayerTransition] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);
  const [gameId, setGameId] = useState(null);
  const [resetAnimations, setResetAnimations] = useState(new Set());
  const [nextPlayerAnimation, setNextPlayerAnimation] = useState('');

  // Rileva orientamento schermo - migliorato per essere più preciso
  useEffect(() => {
    const checkOrientation = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      // Solo schermi grandi in landscape (tablet/desktop)
      setIsLandscape(width > height && width >= 1024);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 100);
    });
    
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Effetto per rilevare preferenza tema
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  // Carica partita salvata all'avvio
  useEffect(() => {
    const loadSavedGame = () => {
      try {
        const saved = window.localStorage?.getItem('darts_game_save');
        if (saved) {
          const gameState = JSON.parse(saved);
          
          if (gameState.gameStarted && gameState.players && gameState.players.length > 0) {
            setNumPlayers(gameState.numPlayers);
            setPlayers(gameState.players);
            setCurrentPlayer(gameState.currentPlayer);
            setGameHistory(gameState.gameHistory || []);
            setGameStarted(gameState.gameStarted);
            setWinner(gameState.winner);
            setCurrentTurnThrows(gameState.currentTurnThrows || []);
            setThrowsCount(gameState.throwsCount || 0);
            setGameId(gameState.gameId);
            
            console.log('Partita caricata automaticamente');
          }
        }
      } catch (error) {
        console.error('Errore nel caricamento della partita:', error);
        try {
          window.localStorage?.removeItem('darts_game_save');
        } catch (e) {}
      }
    };
    
    loadSavedGame();
  }, []);

  // Salva automaticamente la partita quando cambia lo stato
  useEffect(() => {
    if (gameStarted && players.length > 0) {
      const gameState = {
        numPlayers,
        players,
        currentPlayer,
        gameHistory,
        gameStarted,
        winner,
        currentTurnThrows,
        throwsCount,
        gameId,
        lastSaved: Date.now()
      };
      
      try {
        window.localStorage?.setItem('darts_game_save', JSON.stringify(gameState));
      } catch (error) {
        console.error('Errore nel salvataggio automatico:', error);
      }
    }
  }, [numPlayers, players, currentPlayer, gameHistory, gameStarted, winner, currentTurnThrows, throwsCount, gameId]);

  // Funzione helper per creare l'effetto shine sui pulsanti rossi
  const getRedButtonStyle = (isActive, darkMode) => {
    if (!isActive) return {};
    
    return {
      background: darkMode 
        ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1bff 100%)'
        : 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
      boxShadow: darkMode
        ? '0 8px 32px rgba(220, 38, 38, 0.3), 0 2px 8px rgba(220, 38, 38, 0.1)'
        : '0 8px 32px rgba(220, 38, 38, 0.2), 0 2px 8px rgba(220, 38, 38, 0.1)',
      border: '2px solid rgba(255, 255, 255, 0.2)'
    };
  };

  // Componente per l'effetto shine
  const ShineEffect = ({ show = true }) => (
    show && (
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
          transform: 'translateX(-100%)',
          animation: 'shine 3s ease-in-out infinite'
        }}
      />
    )
  );

  // Funzione per ottenere i colori attuali
  const getColors = () => darkMode ? COLORS.dark : COLORS.light;

  // Toggle modalità scura
  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  // Componente toggle modalità scura
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

  // Animazione pulsante premuto
  const animateButtonPress = (buttonId, callback) => {
    setPressedButton(buttonId);
    setTimeout(() => {
      setPressedButton(null);
      if (callback) callback();
    }, ANIMATION_DURATION);
  };

  // Inizializza giocatori con nuovo ID partita
  const initGame = (playerCount, names = []) => {
    const newGameId = Date.now().toString();
    const newPlayers = Array.from({ length: playerCount }, (_, i) => ({
      id: i + 1,
      name: names[i] && names[i].trim() ? names[i].trim() : `PLAYER ${i + 1}`,
      score: 365,
      turnStartScore: 365
    }));
    
    setGameId(newGameId);
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
      winner
    };
    setGameHistory(prev => [...prev, snapshot]);
  };

  // Annulla ultima mossa
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

    const buttonId = `${value}-${multiplier}`;
    
    animateButtonPress(buttonId, () => {
      takeSnapshot();

      const score = value * multiplier;
      const newPlayers = [...players];
      const player = newPlayers[currentPlayer];
      const newScore = player.score - score;

      const throwDisplay = formatThrow(value, multiplier);
      setCurrentTurnThrows(prev => [...prev, throwDisplay]);
      setThrowsCount(prev => prev + 1);

      if (newScore < 0) {
        player.score = player.turnStartScore;
        setPlayers(newPlayers);
        setThrowsCount(3);
        return;
      }

      player.score = newScore;

      if (newScore === 0) {
        setWinner(player);
        setPlayers(newPlayers);
        return;
      }

      // Animazione reset a 365 migliorata
      const otherPlayerWithSameScore = newPlayers.find(p =>
        p.id !== player.id && p.score === newScore
      );
      if (otherPlayerWithSameScore) {
        // Aggiungi animazione di reset
        setResetAnimations(prev => new Set([...prev, otherPlayerWithSameScore.id]));
        
        // Rimuovi animazione dopo 2 secondi
        setTimeout(() => {
          setResetAnimations(prev => {
            const newSet = new Set(prev);
            newSet.delete(otherPlayerWithSameScore.id);
            return newSet;
          });
        }, 2000);
        
        otherPlayerWithSameScore.score = 365;
        otherPlayerWithSameScore.turnStartScore = 365;
      }

      setPlayers(newPlayers);
    });
  };

  // Passa al prossimo giocatore con animazione semplice
  const nextPlayer = () => {
    if (winner || throwsCount < 3) return;

    takeSnapshot();

    const newPlayers = [...players];
    newPlayers[currentPlayer].turnStartScore = newPlayers[currentPlayer].score;
    const nextPlayerIndex = (currentPlayer + 1) % numPlayers;
    
    // Prima cambia il giocatore
    setCurrentPlayer(nextPlayerIndex);
    setPlayers(newPlayers);
    setCurrentTurnThrows([]);
    setThrowsCount(0);
    
    // Poi applica la pulsazione al nuovo giocatore attivo
    setTimeout(() => {
      setNextPlayerAnimation('pulse');
      
      // Rimuovi l'animazione dopo che è finita
      setTimeout(() => {
        setNextPlayerAnimation('');
      }, 400);
    }, 50); // Piccolo delay per permettere al DOM di aggiornarsi
  };

  // Reset del gioco con conferma
  const handleResetRequest = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    try {
      window.localStorage?.removeItem('darts_game_save');
    } catch (e) {}
    
    setNumPlayers(null);
    setPlayers([]);
    setCurrentPlayer(0);
    setGameHistory([]);
    setGameStarted(false);
    setWinner(null);
    setCurrentTurnThrows([]);
    setThrowsCount(0);
    setGameId(null);
    setShowResetConfirm(false);
    setPlayerTransition(false);
    setResetAnimations(new Set());
    setNextPlayerAnimation('');
  };

  const cancelReset = () => {
    setShowResetConfirm(false);
  };

  // Modal di conferma reset
  const ResetConfirmModal = () => {
    if (!showResetConfirm) return null;
    
    const colors = getColors();
    
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: colors.modalBg }}
        onClick={cancelReset}
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
              onClick={cancelReset}
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
              onClick={confirmReset}
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

  // Selezione numero giocatori
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
    if (!selectedNumPlayers) return;
    if (duplicateNames.length > 0) return;
    
    const finalNames = nameInputs.map((n, i) => (n && n.trim()) ? n.trim() : `PLAYER ${i + 1}`);
    initGame(selectedNumPlayers, finalNames);
  };

  // Ordine inattivi
  const getInactiveOrder = () => {
    if (!players.length) return [];
    return players
      .filter((_, idx) => idx !== currentPlayer)
      .slice()
      .sort((a, b) => a.id - b.id);
  };

  // Render scoreboard con animazioni fluide migliorate
  const renderScoreboard = () => {
    const colors = getColors();
    
    const getPlayerGradient = (isActive, darkMode) => {
      if (isActive) {
        return darkMode 
          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)'
          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)';
      } else {
        return darkMode
          ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)'
          : 'linear-gradient(135deg, #9ca3af 0%, #6b7280 50%, #4b5563 100%)';
      }
    };

    const getBoxShadow = (isActive, darkMode) => {
      if (isActive) {
        return darkMode
          ? '0 8px 32px rgba(220, 38, 38, 0.3), 0 2px 8px rgba(220, 38, 38, 0.1)'
          : '0 8px 32px rgba(220, 38, 38, 0.2), 0 2px 8px rgba(220, 38, 38, 0.1)';
      } else {
        return darkMode
          ? '0 4px 16px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.1)'
          : '0 4px 16px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05)';
      }
    };

    // Funzione per ottenere la classe di animazione
    const getPlayerCardClass = (playerId, isCurrentPlayer) => {
      let baseClass = "rounded-lg p-4 text-center relative overflow-hidden transition-all duration-500";
      
      if (resetAnimations.has(playerId)) {
        baseClass += " reset-animation";
      }
      
      if (isCurrentPlayer && nextPlayerAnimation === 'pulse') {
        baseClass += " player-change-pulse";
      }
      
      return baseClass;
    };

    // Layout landscape ottimizzato per tablet/desktop
    if (isLandscape && numPlayers > 2) {
      return (
        <div className="flex justify-center items-start gap-6 max-w-7xl mx-auto">
          <div className="flex-shrink-0">
            {players[currentPlayer] && (
              <div
                className={getPlayerCardClass(players[currentPlayer].id, true)}
                style={{
                  background: getPlayerGradient(true, darkMode),
                  color: 'white',
                  boxShadow: getBoxShadow(true, darkMode),
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  width: '220px',
                }}
              >
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                    transform: 'translateX(-100%)',
                    animation: 'shine 3s ease-in-out infinite'
                  }}
                />
                
                <div className="relative z-10">
                  <div className="text-5xl font-bold mb-2 drop-shadow-lg">{players[currentPlayer].score}</div>
                  <div className="text-sm font-medium mb-3 opacity-90">{players[currentPlayer].name}</div>
                  <div className="flex justify-center gap-1">
                    {[0, 1, 2].map(throwIndex => (
                      <div
                        key={throwIndex}
                        className="w-12 h-6 rounded text-xs flex items-center justify-center font-medium transition-all duration-200"
                        style={{
                          backgroundColor: currentTurnThrows[throwIndex] 
                            ? 'rgba(255,255,255,0.95)' 
                            : 'rgba(255,255,255,0.2)',
                          color: currentTurnThrows[throwIndex] ? '#111827' : 'white',
                          boxShadow: currentTurnThrows[throwIndex] 
                            ? '0 2px 4px rgba(0,0,0,0.2)' 
                            : 'none'
                        }}
                      >
                        {currentTurnThrows[throwIndex] || ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="grid gap-3" style={{ 
            gridTemplateColumns: numPlayers === 3 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)'
          }}>
            {getInactiveOrder().map(player => (
              <div
                key={player.id}
                className={getPlayerCardClass(player.id, false)}
                style={{
                  background: getPlayerGradient(false, darkMode),
                  color: 'white',
                  boxShadow: getBoxShadow(false, darkMode),
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  width: '160px'
                }}
              >
                <div className="relative z-10">
                  <div className="text-3xl font-bold mb-1 drop-shadow-lg">{player.score}</div>
                  <div className="text-xs font-medium opacity-90">{player.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Layout standard per portrait e <= 2 giocatori
    if (numPlayers <= 2) {
      return (
        <div className="grid gap-4 max-w-md mx-auto" style={{ gridTemplateColumns: `repeat(${numPlayers}, 1fr)` }}>
          {players.map((player, index) => (
            <div
              key={player.id}
              className={getPlayerCardClass(player.id, index === currentPlayer)}
              style={{
                background: getPlayerGradient(index === currentPlayer, darkMode),
                color: 'white',
                boxShadow: getBoxShadow(index === currentPlayer, darkMode),
                border: index === currentPlayer ? '2px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {index === currentPlayer && (
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                    transform: 'translateX(-100%)',
                    animation: 'shine 3s ease-in-out infinite'
                  }}
                />
              )}
              
              <div className="relative z-10">
                <div className="text-4xl font-bold mb-1 drop-shadow-lg">{player.score}</div>
                <div className="text-sm font-medium mb-2 opacity-90">{player.name}</div>
                {index === currentPlayer && (
                  <div className="flex justify-center gap-1 mt-2">
                    {[0, 1, 2].map(throwIndex => (
                      <div
                        key={throwIndex}
                        className="w-12 h-6 rounded text-xs flex items-center justify-center font-medium transition-all duration-200"
                        style={{
                          backgroundColor: currentTurnThrows[throwIndex] 
                            ? 'rgba(255,255,255,0.95)' 
                            : 'rgba(255,255,255,0.2)',
                          color: currentTurnThrows[throwIndex] ? '#111827' : 'white',
                          boxShadow: currentTurnThrows[throwIndex] 
                            ? '0 2px 4px rgba(0,0,0,0.2)' 
                            : 'none'
                        }}
                      >
                        {currentTurnThrows[throwIndex] || ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Layout per 3-5 giocatori in portrait (resta uguale)
    if (numPlayers === 5) {
      const orderedOthers = getInactiveOrder();
      const row1 = orderedOthers.slice(0, 2);
      const row2 = orderedOthers.slice(2, 4);

      return (
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-1 gap-4 mb-4">
            {players[currentPlayer] && (
              <div
                className={getPlayerCardClass(players[currentPlayer].id, true)}
                style={{
                  background: getPlayerGradient(true, darkMode),
                  color: 'white',
                  boxShadow: getBoxShadow(true, darkMode),
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
              >
                <div 
                  className="absolute inset-0 opacity-10"
                  style={{
                    background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                    transform: 'translateX(-100%)',
                    animation: 'shine 3s ease-in-out infinite'
                  }}
                />
                
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-1 drop-shadow-lg">{players[currentPlayer].score}</div>
                  <div className="text-sm font-medium mb-2 opacity-90">{players[currentPlayer].name}</div>
                  <div className="flex justify-center gap-1 mt-2">
                    {[0, 1, 2].map(throwIndex => (
                      <div
                        key={throwIndex}
                        className="w-12 h-6 rounded text-xs flex items-center justify-center font-medium transition-all duration-200"
                        style={{
                          backgroundColor: currentTurnThrows[throwIndex] 
                            ? 'rgba(255,255,255,0.95)' 
                            : 'rgba(255,255,255,0.2)',
                          color: currentTurnThrows[throwIndex] ? '#111827' : 'white',
                          boxShadow: currentTurnThrows[throwIndex] 
                            ? '0 2px 4px rgba(0,0,0,0.2)' 
                            : 'none'
                        }}
                      >
                        {currentTurnThrows[throwIndex] || ''}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {row1.map(player => (
              <div
                key={player.id}
                className={getPlayerCardClass(player.id, false)}
                style={{
                  background: getPlayerGradient(false, darkMode),
                  color: 'white',
                  boxShadow: getBoxShadow(false, darkMode),
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-1 drop-shadow-lg">{player.score}</div>
                  <div className="text-sm font-medium mb-2 opacity-90">{player.name}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {row2.map(player => (
              <div
                key={player.id}
                className={getPlayerCardClass(player.id, false)}
                style={{
                  background: getPlayerGradient(false, darkMode),
                  color: 'white',
                  boxShadow: getBoxShadow(false, darkMode),
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="relative z-10">
                  <div className="text-4xl font-bold mb-1 drop-shadow-lg">{player.score}</div>
                  <div className="text-sm font-medium mb-2 opacity-90">{player.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Layout per 3-4 giocatori in portrait
    const othersInOrder = getInactiveOrder();

    return (
      <div className="max-w-md mx-auto">
        <div className="grid grid-cols-1 gap-4 mb-4">
          {players[currentPlayer] && (
            <div
              className={getPlayerCardClass(players[currentPlayer].id, true)}
              style={{
                background: getPlayerGradient(true, darkMode),
                color: 'white',
                boxShadow: getBoxShadow(true, darkMode),
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                  transform: 'translateX(-100%)',
                  animation: 'shine 3s ease-in-out infinite'
                }}
              />
              
              <div className="relative z-10">
                <div className="text-4xl font-bold mb-1 drop-shadow-lg">{players[currentPlayer].score}</div>
                <div className="text-sm font-medium mb-2 opacity-90">{players[currentPlayer].name}</div>
                <div className="flex justify-center gap-1 mt-2">
                  {[0, 1, 2].map(throwIndex => (
                    <div
                      key={throwIndex}
                      className="w-12 h-6 rounded text-xs flex items-center justify-center font-medium transition-all duration-200"
                      style={{
                        backgroundColor: currentTurnThrows[throwIndex] 
                          ? 'rgba(255,255,255,0.95)' 
                          : 'rgba(255,255,255,0.2)',
                        color: currentTurnThrows[throwIndex] ? '#111827' : 'white',
                        boxShadow: currentTurnThrows[throwIndex] 
                          ? '0 2px 4px rgba(0,0,0,0.2)' 
                          : 'none'
                      }}
                    >
                      {currentTurnThrows[throwIndex] || ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`grid gap-4 ${numPlayers === 3 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {othersInOrder.map(player => (
            <div
              key={player.id}
              className={getPlayerCardClass(player.id, false)}
              style={{
                background: getPlayerGradient(false, darkMode),
                color: 'white',
                boxShadow: getBoxShadow(false, darkMode),
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              <div className="relative z-10">
                <div className="text-4xl font-bold mb-1 drop-shadow-lg">{player.score}</div>
                <div className="text-sm font-medium mb-2 opacity-90">{player.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Schermata di selezione giocatori
  if (!gameStarted) {
    const colors = getColors();
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: colors.background }}>
        <div className="fixed top-4 left-4 z-10">
          <DarkModeToggle />
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
  }

  // Schermata di vittoria
  if (winner) {
    const colors = getColors();
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: colors.background }}>
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
        
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`bg-particle-${i}`}
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

        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute text-2xl"
            style={{
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `sparkleFloat ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: Math.random() * 2 + 's',
              opacity: 0.8
            }}
          >
            ✨
          </div>
        ))}

        <div 
          className="rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center relative z-10"
          style={{ 
            backgroundColor: darkMode ? 'rgba(22, 27, 34, 0.9)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
          }}
        >
          <div className="mb-6 relative">
            <div 
              className="text-8xl mx-auto w-fit"
              style={{ 
                animation: 'bounce 2s ease-in-out infinite',
                filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
              }}
            >
              👑
            </div>
          </div>

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

          <button
            onClick={confirmReset}
            className="relative py-4 px-10 rounded-xl font-bold text-xl text-white transition-all duration-300 overflow-hidden group"
            style={{ 
              background: `linear-gradient(45deg, ${colors.primary}, #dc2626, ${colors.primary})`,
              backgroundSize: '200% 200%',
              animation: 'gradientShift 3s ease-in-out infinite',
              boxShadow: darkMode
                ? '0 8px 32px rgba(220, 38, 38, 0.4), 0 2px 8px rgba(220, 38, 38, 0.2)'
                : '0 8px 32px rgba(220, 38, 38, 0.3), 0 2px 8px rgba(220, 38, 38, 0.15)',
              transform: 'scale(1)',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent'
            }}
          >
            <ShineEffect show={true} />
            <div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-300"
              style={{ 
                transform: 'skewX(-45deg) translateX(-100%)',
                animation: 'shine 2s ease-in-out infinite'
              }}
            />
            
            <span className="relative z-10 drop-shadow-lg"> NUOVA PARTITA </span>
          </button>
        </div>

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
          
          @keyframes sparkleFloat {
            0%, 100% { 
              opacity: 0.3; 
              transform: translateY(0px) scale(0.8) rotate(0deg); 
            }
            50% { 
              opacity: 1; 
              transform: translateY(-15px) scale(1.2) rotate(180deg); 
            }
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
          
          @keyframes shine {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
        `}</style>
      </div>
    );
  }

  const colors = getColors();

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <ResetConfirmModal />
      
      {/* Header */}
      <div className="shadow-sm p-4" style={{ backgroundColor: colors.cardBg }}>
        <div className={`flex justify-between items-center mx-auto ${isLandscape ? 'max-w-7xl' : 'max-w-md'}`}>
          <DarkModeToggle />
          
          <h1 className="text-xl font-bold" style={{ color: colors.text }}>
            365 DARTS
          </h1>
          
          <button
            onClick={handleResetRequest}
            className="p-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: colors.button,
              color: colors.text,
              border: `1px solid ${colors.border}`
            }}
          >
            <b>RESTART</b>
          </button>
        </div>
      </div>

      {/* Layout principale - adattivo per landscape */}
      <div className={isLandscape ? 'flex gap-6' : ''}>
        {/* Punteggi giocatori */}
        <div className={isLandscape ? 'flex-shrink-0 p-4' : 'p-4'}>
          {renderScoreboard()}
        </div>

        {/* Griglia punteggi */}
        <div className={`p-4 ${isLandscape ? 'flex-1 max-w-2xl' : ''}`}>
          <div className="mx-auto w-full rounded-lg shadow-sm p-[1px] pb-[1px]" style={{ backgroundColor: colors.cardBg }}>
            
            <div className="space-y-1 px-[1px]">
              {DART_VALUES.map((row, rowIndex) => {
                const isGroupStart = rowIndex === 2 || rowIndex === 4;

                return (
                  <div
                    key={`row-${rowIndex}`}
                    className={`grid gap-[2px] rounded-md px-1 py-1 ${isGroupStart ? 'mt-3' : ''} ${
                      isLandscape ? 'grid-cols-5' : 'grid-cols-10'
                    }`}
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
                          <span>{value}</span>

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

            <div className="mt-4 space-y-1 px-[5px] pb-[5px]">
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
                  className="py-4 rounded-md font-semibold text-white text-lg transition-colors disabled:opacity-50 relative overflow-hidden"
                  style={{ 
                    background: (winner || throwsCount < 3) 
                      ? colors.border 
                      : (darkMode 
                          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)'
                          : 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)'),
                    boxShadow: (winner || throwsCount < 3) 
                      ? 'none' 
                      : (darkMode
                          ? '0 8px 32px rgba(220, 38, 38, 0.3), 0 2px 8px rgba(220, 38, 38, 0.1)'
                          : '0 8px 32px rgba(220, 38, 38, 0.2), 0 2px 8px rgba(220, 38, 38, 0.1)'),
                    border: (winner || throwsCount < 3) 
                      ? `1px solid ${colors.border}` 
                      : '2px solid rgba(255, 255, 255, 0.2)',
                    cursor: (winner || throwsCount < 3) ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                >
                  {!winner && throwsCount >= 3 && (
                    <div 
                      className="absolute inset-0 opacity-10"
                      style={{
                        background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.3) 50%, transparent 70%)',
                        transform: 'translateX(-100%)',
                        animation: 'shine 3s ease-in-out infinite'
                      }}
                    />
                  )}
                  <span className="relative z-10">NEXT PLAYER</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS per le animazioni migliorate */}
      <style jsx>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        /* Animazione cambio giocatore - semplice pulsazione */
        .player-change-pulse {
          animation: changePlayerPulse 0.4s ease-in-out;
        }

        @keyframes changePlayerPulse {
          0% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(1.05);
          }
          100% { 
            transform: scale(1);
          }
        }

        /* Animazione reset a 365 con riempimento rosso */
        .reset-animation {
          animation: resetTo365 2s ease-in-out;
          overflow: hidden;
          position: relative;
        }

        .reset-animation::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: radial-gradient(circle, ${darkMode ? 'rgba(220, 38, 38, 0.4)' : 'rgba(220, 38, 38, 0.3)'} 0%, ${darkMode ? 'rgba(185, 28, 28, 0.2)' : 'rgba(185, 28, 28, 0.15)'} 100%);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          animation: redWaveExpansion 2s ease-out;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes resetTo365 {
          0% { 
            transform: scale(1);
            filter: brightness(1);
          }
          15% { 
            transform: scale(1.02);
            filter: brightness(1.1);
          }
          100% { 
            transform: scale(1);
            filter: brightness(1);
          }
        }

        @keyframes redWaveExpansion {
          0% {
            width: 20px;
            height: 20px;
            opacity: 0;
          }
          10% {
            width: 40px;
            height: 40px;
            opacity: 0.9;
          }
          30% {
            width: 120%;
            height: 120%;
            opacity: 0.8;
          }
          60% {
            width: 200%;
            height: 200%;
            opacity: 0.7;
            border-radius: 20%;
          }
          80% {
            width: 300%;
            height: 300%;
            opacity: 0.5;
            border-radius: 10%;
          }
          100% {
            width: 400%;
            height: 400%;
            opacity: 0;
            border-radius: 0%;
          }
        }

        /* Animazioni responsive per landscape */
        @media (min-width: 1024px) and (orientation: landscape) {
          .reset-animation {
            animation: resetTo365Large 2s ease-in-out;
          }

          @keyframes resetTo365Large {
            0% { 
              transform: scale(1);
              filter: brightness(1);
            }
            20% { 
              transform: scale(1.05);
              filter: brightness(1.2);
            }
            100% { 
              transform: scale(1);
              filter: brightness(1);
            }
          }

          /* Pulsazione leggermente più pronunciata in landscape */
          .player-change-pulse {
            animation: changePlayerPulseLarge 0.4s ease-in-out;
          }

          @keyframes changePlayerPulseLarge {
            0% { 
              transform: scale(1);
            }
            50% { 
              transform: scale(1.08);
            }
            100% { 
              transform: scale(1);
            }
          }
        }

        /* Effetti hover migliorati */
        @media (hover: hover) {
          .rounded-lg:not(.disabled):hover {
            transform: scale(1.02);
            transition: transform 0.2s ease;
          }
        }

        /* Animazioni per il cambio tema */
        * {
          transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
        }

        /* Ottimizzazioni per performance */
        .rounded-lg {
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        /* Accessibilità per animazioni ridotte */
        @media (prefers-reduced-motion: reduce) {
          .player-change-pulse,
          .reset-animation {
            animation-duration: 0.3s;
          }
          
          .reset-animation::before {
            animation-duration: 0.5s;
          }
        }
      `}</style>
    </div>
  );
};

export default DartsGame;