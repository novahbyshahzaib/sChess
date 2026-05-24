import React from 'react';

interface SquareProps {
  square: string;
  isLight: boolean;
  isSelected: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  hasLegalMoveDot: boolean;
  isOccupied: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export const Square: React.FC<SquareProps> = ({
  isLight,
  isSelected,
  isLastMove,
  isInCheck,
  hasLegalMoveDot,
  isOccupied,
  onClick,
  children,
}) => {
  return (
    <div
      onClick={onClick}
      className="relative w-full h-full touch-manipulation select-none"
      style={{
        backgroundColor: isLight ? 'var(--light-sq)' : 'var(--dark-sq)',
      }}
    >
      {/* Highlights */}
      {isLastMove && (
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--last-move)' }} />
      )}
      {isSelected && (
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--selected-sq)' }} />
      )}
      {isInCheck && (
        <div className="absolute inset-0" style={{ backgroundColor: 'var(--check-highlight)' }} />
      )}

      {/* Legal move indicators */}
      {hasLegalMoveDot && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isOccupied ? (
            <div 
              className="w-full h-full rounded-full border-4 opacity-80" 
              style={{ borderColor: 'var(--legal-dot)' }} 
            />
          ) : (
            <div 
              className="w-[30%] h-[30%] rounded-full opacity-80" 
              style={{ backgroundColor: 'var(--legal-dot)' }} 
            />
          )}
        </div>
      )}

      {/* The Piece */}
      {children}
    </div>
  );
};
