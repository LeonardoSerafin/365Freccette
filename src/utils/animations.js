import { COLORS } from './constants';

export const getRedButtonStyle = (isActive, darkMode) => {
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

export const getPlayerGradient = (isActive, darkMode) => {
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

export const getBoxShadow = (isActive, darkMode) => {
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

export const ShineEffect = ({ show = true }) => (
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