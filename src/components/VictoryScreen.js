import React, { useMemo } from 'react';
import { COLORS } from '../utils/constants';
import { getRedButtonStyle, ShineEffect } from '../utils/animations';

export const VictoryScreen = ({ winner, players, darkMode, onNewGame }) => {
  const colors = darkMode ? COLORS.dark : COLORS.light;

  // Fisso i valori casuali al primo render per evitare animazioni caotiche
  const particles = useMemo(() => 
    Array.from({ length: 8 }).map((_, i) => ({
      size: Math.random() * 8 + 4,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
      color: i % 3 === 0 ? colors.primary : i % 3 === 1 ? '#fbbf24' : '#8b5cf6'
    })), []
  );

  const stars = useMemo(() => 
    Array.from({ length: 12 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 3,
      delay: Math.random() * 2
    })), []
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ backgroundColor: colors.background }}>
      {/* Sfondo gradiente con animazione lenta */}
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
      
      {/* Particelle animate con valori fissi */}
      {particles.map((particle, i) => (
        <div
          key={`bg-particle-${i}`}
          className="absolute rounded-full opacity-70"
          style={{
            width: particle.size + 'px',
            height: particle.size + 'px',
            backgroundColor: particle.color,
            left: particle.left + '%',
            top: particle.top + '%',
            animation: `float ${particle.duration}s ease-in-out infinite alternate`,
            animationDelay: particle.delay + 's'
          }}
        />
      ))}

      {/* Stelle animate con valori fissi */}
      {stars.map((star, i) => (
        <div
          key={`star-${i}`}
          className="absolute text-2xl"
          style={{
            left: star.left + '%',
            top: star.top + '%',
            animation: `sparkleFloat ${star.duration}s ease-in-out infinite`,
            animationDelay: star.delay + 's',
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
          onClick={onNewGame}
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
};