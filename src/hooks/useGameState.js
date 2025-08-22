import { useState, useEffect } from 'react';
import { initializePlayers, formatThrow } from '../utils/gameLogic';
import { useLocalStorage } from './useLocalStorage';

export const useGameState = () => {
  const [gameData, setGameData, clearGameData] = useLocalStorage('darts_game_save', {});
  
  const [numPlayers, setNumPlayers] = useState(gameData.numPlayers || null);
  const [players, setPlayers] = useState(gameData.players || []);
  const [currentPlayer, setCurrentPlayer] = useState(gameData.currentPlayer || 0);
  const [gameHistory, setGameHistory] = useState(gameData.gameHistory || []);
  const [gameStarted, setGameStarted] = useState(gameData.gameStarted || false);
  const [winner, setWinner] = useState(gameData.winner || null);
  const [currentTurnThrows, setCurrentTurnThrows] = useState(gameData.currentTurnThrows || []);
  const [throwsCount, setThrowsCount] = useState(gameData.throwsCount || 0);
  const [gameId, setGameId] = useState(gameData.gameId || null);
  const [resetAnimations, setResetAnimations] = useState(new Set());
  const [nextPlayerAnimation, setNextPlayerAnimation] = useState('');

  // Auto-save game state
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
      setGameData(gameState);
    }
  }, [numPlayers, players, currentPlayer, gameHistory, gameStarted, winner, currentTurnThrows, throwsCount, gameId, setGameData]);

  const initGame = (playerCount, names = []) => {
    const newGameId = Date.now().toString();
    const newPlayers = initializePlayers(playerCount, names);
    
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

  const resetGame = () => {
    clearGameData();
    setNumPlayers(null);
    setPlayers([]);
    setCurrentPlayer(0);
    setGameHistory([]);
    setGameStarted(false);
    setWinner(null);
    setCurrentTurnThrows([]);
    setThrowsCount(0);
    setGameId(null);
    setResetAnimations(new Set());
    setNextPlayerAnimation('');
  };

  return {
    // State
    numPlayers,
    players,
    currentPlayer,
    gameHistory,
    gameStarted,
    winner,
    currentTurnThrows,
    throwsCount,
    gameId,
    resetAnimations,
    nextPlayerAnimation,
    
    // Setters
    setPlayers,
    setCurrentPlayer,
    setCurrentTurnThrows,
    setThrowsCount,
    setWinner,
    setResetAnimations,
    setNextPlayerAnimation,
    
    // Methods
    initGame,
    takeSnapshot,
    undoLastMove,
    resetGame
  };
};