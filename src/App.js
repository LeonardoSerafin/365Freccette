import React, { useState, useEffect } from 'react';
import { GameSetup } from './components/GameSetup';
import { GameBoard } from './components/GameBoard';
import { Scoreboard } from './components/Scoreboard';
import { VictoryScreen } from './components/VictoryScreen';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { DarkModeToggle } from './components/DarkModeToggle';
import { useGameState } from './hooks/useGameState';
import { useOrientation } from './hooks/useOrientation';
import { COLORS } from './utils/constants';
import { formatThrow } from './utils/gameLogic';
import './styles/animations.css';

const DartsGame = () => {
  const {
    numPlayers,
    players,
    currentPlayer,
    gameHistory,
    gameStarted,
    winner,
    currentTurnThrows,
    throwsCount,
    resetAnimations,
    nextPlayerAnimation,
    setPlayers,
    setCurrentPlayer,
    setCurrentTurnThrows,
    setThrowsCount,
    setWinner,
    setResetAnimations,
    setNextPlayerAnimation,
    initGame,
    takeSnapshot,
    undoLastMove,
    resetGame
  } = useGameState();

  const [darkMode, setDarkMode] = useState(false);
  const [pressedButton, setPressedButton] = useState(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const isLandscape = useOrientation();

  // Rileva preferenza tema
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
  }, []);

  const colors = darkMode ? COLORS.dark : COLORS.light;
  const toggleDarkMode = () => setDarkMode(prev => !prev);

  // Gestione punteggio (logica complessa estratta)
  const handleScore = (value, multiplier) => {
    if (winner || throwsCount >= 3) return;

    const buttonId = `${value}-${multiplier}`;
    
    setPressedButton(buttonId);
    setTimeout(() => {
      setPressedButton(null);
      
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

      const otherPlayerWithSameScore = newPlayers.find(p =>
        p.id !== player.id && p.score === newScore
      );
      
      if (otherPlayerWithSameScore) {
        setResetAnimations(prev => new Set([...prev, otherPlayerWithSameScore.id]));
        
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
    }, 100);
  };

  const nextPlayer = () => {
    if (winner || throwsCount < 3) return;

    takeSnapshot();
    const newPlayers = [...players];
    newPlayers[currentPlayer].turnStartScore = newPlayers[currentPlayer].score;
    const nextPlayerIndex = (currentPlayer + 1) % numPlayers;
    
    setCurrentPlayer(nextPlayerIndex);
    setPlayers(newPlayers);
    setCurrentTurnThrows([]);
    setThrowsCount(0);
    
    setTimeout(() => {
      setNextPlayerAnimation('pulse');
      setTimeout(() => setNextPlayerAnimation(''), 400);
    }, 50);
  };

  const handleResetRequest = () => setShowResetConfirm(true);
  const confirmReset = () => {
    resetGame();
    setShowResetConfirm(false);
  };
  const cancelReset = () => setShowResetConfirm(false);

  // Render condizionale per le diverse schermate
  if (!gameStarted) {
    return (
      <GameSetup 
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        onStartGame={initGame}
      />
    );
  }

  if (winner) {
    return (
      <VictoryScreen 
        winner={winner}
        players={players}
        darkMode={darkMode}
        onNewGame={confirmReset}
      />
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      <ResetConfirmModal 
        showResetConfirm={showResetConfirm}
        darkMode={darkMode}
        onConfirm={confirmReset}
        onCancel={cancelReset}
      />
      
      {/* Header */}
      <div className="shadow-sm p-4" style={{ backgroundColor: colors.cardBg }}>
        <div className={`flex justify-between items-center mx-auto ${isLandscape ? 'max-w-7xl' : 'max-w-md'}`}>
          <DarkModeToggle darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
          
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

      {/* Layout principale */}
      <div className="flex-1 flex overflow-hidden">
        {isLandscape ? (
          // Layout landscape
          <>
            <div className="p-4 flex-shrink-0">
              <Scoreboard 
                players={players}
                currentPlayer={currentPlayer}
                currentTurnThrows={currentTurnThrows}
                darkMode={darkMode}
                isLandscape={isLandscape}
                numPlayers={numPlayers}
                resetAnimations={resetAnimations}
                nextPlayerAnimation={nextPlayerAnimation}
              />
            </div>

            <div className="flex-1 p-4 overflow-hidden">
              <GameBoard 
                onScore={handleScore}
                onUndo={undoLastMove}
                onNextPlayer={nextPlayer}
                throwsCount={throwsCount}
                winner={winner}
                gameHistory={gameHistory}
                pressedButton={pressedButton}
                darkMode={darkMode}
                isLandscape={isLandscape}
              />
            </div>
          </>
        ) : (
          // Layout portrait
          <div className="flex-1 flex flex-col">
            <div className="p-4">
              <Scoreboard 
                players={players}
                currentPlayer={currentPlayer}
                currentTurnThrows={currentTurnThrows}
                darkMode={darkMode}
                isLandscape={isLandscape}
                numPlayers={numPlayers}
                resetAnimations={resetAnimations}
                nextPlayerAnimation={nextPlayerAnimation}
              />
            </div>

            <div className="p-4 flex-1">
              <GameBoard 
                onScore={handleScore}
                onUndo={undoLastMove}
                onNextPlayer={nextPlayer}
                throwsCount={throwsCount}
                winner={winner}
                gameHistory={gameHistory}
                pressedButton={pressedButton}
                darkMode={darkMode}
                isLandscape={isLandscape}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modal sempre presente */}
      {showResetConfirm && (
        <ResetConfirmModal
          onConfirm={confirmReset}
          onCancel={cancelReset}
          darkMode={darkMode}
        />
      )}
    </div>
  );
};

export default DartsGame;