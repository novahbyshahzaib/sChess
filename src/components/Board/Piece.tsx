import React from 'react';

interface PieceProps {
  type: string;
  color: 'w' | 'b';
  theme: string;
}

export const Piece: React.FC<PieceProps> = ({ type, color, theme }) => {
  const pieceId = `${color}${type.toUpperCase()}`;
  const src = `/pieces/${theme}/${pieceId}.svg`;

  return (
    <img
      src={src}
      alt={pieceId}
      className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none drop-shadow-md"
      style={{
        transition: 'transform 120ms ease-out',
      }}
    />
  );
};
