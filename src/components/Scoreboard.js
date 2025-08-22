import React from 'react';
import { COLORS } from '../utils/constants';
import { getPlayerGradient, getBoxShadow } from '../utils/animations';

export const Scoreboard = ({ 
  players, 
  currentPlayer, 
  currentTurnThrows, 
  darkMode, 
  isLandscape, 
  numPlayers, 
  resetAnimations,
  nextPlayerAnimation 
}) => {
  const colors = darkMode ? COLORS.dark : COLORS.light;

  const getInactiveOrder = () => {
    if (!players.length) return [];
    return players
      .filter((_, idx) => idx !== currentPlayer)
      .slice()
      .sort((a, b) => a.id - b.id);
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

  // Layout per 5 giocatori in portrait
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
};