export const formatThrow = (value, multiplier) => {
  if (value === 0) return 'MISS';
  if (value === 25) return '25';
  if (value === 50) return '50';
  
  if (multiplier === 1) return value.toString();
  if (multiplier === 2) return `D${value}`;
  if (multiplier === 3) return `T${value}`;
  
  return value.toString();
};

export const initializePlayers = (playerCount, names = []) => {
  return Array.from({ length: playerCount }, (_, i) => ({
    id: i + 1,
    name: names[i] && names[i].trim() ? names[i].trim() : `PLAYER ${i + 1}`,
    score: 365,
    turnStartScore: 365
  }));
};

export const calculateScore = (currentScore, throwValue, multiplier) => {
  const points = throwValue * multiplier;
  return currentScore - points;
};

export const checkForReset = (players, currentPlayer, newScore) => {
  return players.find(p => 
    p.id !== players[currentPlayer].id && p.score === newScore
  );
};

export const getInactivePlayersOrder = (players, currentPlayer) => {
  if (!players.length) return [];
  return players
    .filter((_, idx) => idx !== currentPlayer)
    .slice()
    .sort((a, b) => a.id - b.id);
};