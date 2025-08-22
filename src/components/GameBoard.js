import React from 'react';
import { COLORS, DART_VALUES, MULTIPLIERS, SPECIAL_BUTTONS } from '../utils/constants';
import { getRedButtonStyle, ShineEffect } from '../utils/animations';
import { formatThrow } from '../utils/gameLogic';

export const GameBoard = ({ 
  onScore, 
  onUndo, 
  onNextPlayer, 
  throwsCount, 
  winner, 
  gameHistory, 
  pressedButton, 
  darkMode, 
  isLandscape 
}) => {
  const colors = darkMode ? COLORS.dark : COLORS.light;

  const handleButtonPress = (value, multiplier) => {
    if (winner || throwsCount >= 3) return;
    onScore(value, multiplier);
  };

  // Layout landscape ottimizzato
  if (isLandscape) {
    return (
      <div className="h-full flex justify-center pt-4">
        <div 
          className="rounded-lg shadow-sm p-2"
          style={{ 
            backgroundColor: colors.cardBg,
            width: 'min(100%, 80vh)', 
            aspectRatio: '10/9.5',
            maxHeight: 'calc(100vh - 100px)'
          }}
        >
          <div className="h-full flex flex-col">
            {/* Griglia principale dei numeri - ogni riga occupa uguale spazio */}
            <div className="flex-1 flex flex-col gap-1">
              {DART_VALUES.map((row, rowIndex) => (
                <div
                  key={`row-${rowIndex}`}
                  className="flex-1 grid grid-cols-10 gap-1"
                >
                  {row.map((value, colIndex) => {
                    const multiplier = MULTIPLIERS[rowIndex];
                    const dotCount = multiplier;
                    const buttonId = `${value}-${multiplier}`;
                    const isPressed = pressedButton === buttonId;

                    return (
                      <button
                        key={`${rowIndex}-${colIndex}`}
                        onClick={() => handleButtonPress(value, multiplier)}
                        disabled={throwsCount >= 3 || winner}
                        className="relative rounded-md font-semibold disabled:opacity-50 shadow-sm flex items-center justify-center aspect-square"
                        style={{
                          backgroundColor: isPressed ? colors.primary : (throwsCount >= 3 ? colors.border : colors.button),
                          color: isPressed ? 'white' : colors.text,
                          border: `1px solid ${colors.border}`,
                          cursor: throwsCount >= 3 ? 'not-allowed' : 'pointer',
                          transform: isPressed ? 'scale(1.1)' : 'scale(1)',
                          transition: isPressed ? 'none' : 'all 100ms ease-out',
                          outline: 'none',
                          WebkitTapHighlightColor: 'transparent',
                          fontSize: 'clamp(0.6rem, 1.4vh, 1rem)',
                          width: '100%' // Rimuovi height: '100%' e aspectRatio dal CSS
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
                                width: 'clamp(3px, 0.7vh, 6px)',
                                height: 'clamp(3px, 0.7vh, 6px)',
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
              ))}
            </div>

            {/* Pulsanti speciali e controlli - altezza proporzionale */}
            <div className="mt-2 space-y-1 flex-shrink-0">
              {/* MISS, 25, 50 */}
              <div className="grid grid-cols-3 gap-1">
                {SPECIAL_BUTTONS.map(({ value, multiplier, label }) => {
                  const buttonId = `${value}-${multiplier}`;
                  const isPressed = pressedButton === buttonId;
                  
                  return (
                    <button
                      key={buttonId}
                      onClick={() => handleButtonPress(value, multiplier)}
                      disabled={winner || throwsCount >= 3}
                      className="rounded-md font-semibold transition-colors disabled:opacity-50 relative overflow-hidden"
                      style={{ 
                        ...(isPressed 
                          ? getRedButtonStyle(true, darkMode)
                          : {
                              backgroundColor: colors.button,
                              border: `1px solid ${colors.border}`,
                              color: colors.text
                            }),
                        cursor: (winner || throwsCount >= 3) ? 'not-allowed' : 'pointer',
                        outline: 'none',
                        WebkitTapHighlightColor: 'transparent',
                        fontSize: 'clamp(0.8rem, 1.6vh, 1.1rem)',
                        height: 'calc((100vh - 100px) / 12)', // Altezza proporzionale ai bottoni normali
                        minHeight: '35px'
                      }}
                    >
                      <ShineEffect show={isPressed} />
                      <span className="relative z-10">{label}</span>
                    </button>
                  );
                })}
              </div>
              
              {/* BACK e NEXT PLAYER */}
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={onUndo}
                  disabled={gameHistory.length <= 1}
                  className="rounded-md font-semibold transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: gameHistory.length > 1 ? colors.button : colors.border,
                    color: colors.text,
                    border: `1px solid ${colors.border}`,
                    cursor: gameHistory.length <= 1 ? 'not-allowed' : 'pointer',
                    outline: 'none',
                    WebkitTapHighlightColor: 'transparent',
                    fontSize: 'clamp(0.8rem, 1.6vh, 1.1rem)',
                    height: 'calc((100vh - 100px) / 12)', // Stessa altezza dei bottoni speciali
                    minHeight: '35px'
                  }}
                >
                  BACK
                </button>
                
                <button
                  onClick={onNextPlayer}
                  disabled={winner || throwsCount < 3}
                  className="rounded-md font-semibold text-white transition-colors disabled:opacity-50 relative overflow-hidden"
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
                    WebkitTapHighlightColor: 'transparent',
                    fontSize: 'clamp(0.8rem, 1.6vh, 1.1rem)',
                    height: 'calc((100vh - 100px) / 12)', // Stessa altezza dei bottoni speciali
                    minHeight: '35px'
                  }}
                >
                  <ShineEffect show={!winner && throwsCount >= 3} />
                  <span className="relative z-10">NEXT PLAYER</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Layout portrait originale (unchanged)
  return (
    <div className="mx-auto w-full rounded-lg shadow-sm p-[1px] pb-[1px]" style={{ backgroundColor: colors.cardBg }}>
      {/* Griglia principale dei numeri */}
      <div className="space-y-1 px-[1px]">
        {DART_VALUES.map((row, rowIndex) => {
          const isGroupStart = rowIndex === 2 || rowIndex === 4;

          return (
            <div
              key={`row-${rowIndex}`}
              className={`grid gap-[2px] rounded-md px-1 py-1 ${isGroupStart ? 'mt-3' : ''} grid-cols-10`}
            >
              {row.map((value, colIndex) => {
                const multiplier = MULTIPLIERS[rowIndex];
                const dotCount = multiplier;
                const buttonId = `${value}-${multiplier}`;
                const isPressed = pressedButton === buttonId;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => handleButtonPress(value, multiplier)}
                    disabled={throwsCount >= 3 || winner}
                    className="relative aspect-square rounded-md font-semibold text-lg disabled:opacity-50 shadow-sm flex items-center justify-center"
                    style={{
                      backgroundColor: isPressed ? colors.primary : (throwsCount >= 3 ? colors.border : colors.button),
                      color: isPressed ? 'white' : colors.text,
                      border: `1px solid ${colors.border}`,
                      cursor: throwsCount >= 3 ? 'not-allowed' : 'pointer',
                      transform: isPressed ? 'scale(1.1)' : 'scale(1)',
                      transition: isPressed ? 'none' : 'all 100ms ease-out',
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

      {/* Pulsanti speciali e controlli */}
      <div className="mt-4 space-y-1 px-[5px] pb-[5px]">
        {/* MISS, 25, 50 */}
        <div className="grid grid-cols-3 gap-1">
          {SPECIAL_BUTTONS.map(({ value, multiplier, label }) => {
            const buttonId = `${value}-${multiplier}`;
            const isPressed = pressedButton === buttonId;
            
            return (
              <button
                key={buttonId}
                onClick={() => handleButtonPress(value, multiplier)}
                disabled={winner || throwsCount >= 3}
                className="py-4 rounded-md font-semibold text-lg transition-colors disabled:opacity-50 relative overflow-hidden"
                style={{ 
                  ...(isPressed 
                    ? getRedButtonStyle(true, darkMode)
                    : {
                        backgroundColor: colors.button,
                        border: `1px solid ${colors.border}`,
                        color: colors.text
                      }),
                  cursor: (winner || throwsCount >= 3) ? 'not-allowed' : 'pointer',
                  outline: 'none',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <ShineEffect show={isPressed} />
                <span className="relative z-10">{label}</span>
              </button>
            );
          })}
        </div>
        
        {/* BACK e NEXT PLAYER */}
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={onUndo}
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
            onClick={onNextPlayer}
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
            <ShineEffect show={!winner && throwsCount >= 3} />
            <span className="relative z-10">NEXT PLAYER</span>
          </button>
        </div>
      </div>
    </div>
  );
};