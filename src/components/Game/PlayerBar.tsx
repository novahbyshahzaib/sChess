import React from 'react';
import { User, Cpu } from 'lucide-react';
import { CapturedPieces } from './CapturedPieces';

interface PlayerBarProps {
  name: string;
  isAI: boolean;
  elo?: number;
  isActive: boolean;
  capturedPieces: string[];
  capturedColor: 'w' | 'b';
  materialAdvantage: number;
}

export const PlayerBar: React.FC<PlayerBarProps> = ({ 
  name, 
  isAI, 
  elo, 
  isActive, 
  capturedPieces, 
  capturedColor, 
  materialAdvantage 
}) => {
  return (
    <div className="flex flex-col py-2">
      <CapturedPieces pieces={capturedPieces} color={capturedColor} advantage={materialAdvantage} />
      
      <div className={`flex items-center justify-between p-2 mt-1 rounded-lg transition-colors ${isActive ? 'bg-white/10 border-accent/50' : 'bg-transparent border-transparent'} border`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded flex items-center justify-center ${isActive ? 'bg-accent text-background' : 'bg-panel border border-border text-text-secondary'}`}>
            {isAI ? <Cpu size={18} /> : <User size={18} />}
          </div>
          <div className="flex flex-col">
            <span className={`font-bold ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
              {name}
            </span>
            {elo && <span className="text-xs text-text-secondary">{elo}</span>}
          </div>
        </div>
        
        {/* Timer placeholder if we want to add clocks later */}
        {/* <div className={`font-mono font-bold text-lg ${isActive ? 'text-text-primary' : 'text-text-secondary'}`}>
          10:00
        </div> */}
      </div>
    </div>
  );
};
