
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Beat } from '../types';

interface PlayerContextType {
  currentBeat: Beat | null;
  isPlaying: boolean;
  progress: number;
  playBeat: (beat: Beat) => void;
  pauseBeat: () => void;
  togglePlay: () => void;
  seek: (percentage: number) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    
    if (audioRef.current.paused) {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    } else {
      audioRef.current.pause();
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Désactiver le comportement par défaut de l'espace (scroll)
      if (e.code === 'Space') {
        const activeElement = document.activeElement;
        const isInput = activeElement instanceof HTMLInputElement || 
                        activeElement instanceof HTMLTextAreaElement || 
                        (activeElement instanceof HTMLElement && activeElement.isContentEditable);
        
        if (!isInput) {
          e.preventDefault();
          togglePlay();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay]);

  const playBeat = useCallback((beat: Beat) => {
    if (currentBeat?.id === beat.id) {
      togglePlay();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    if (beat.audioUrl) {
      const audio = new Audio(beat.audioUrl);
      audioRef.current = audio;
      
      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
      });

      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));

      audio.play().catch(e => console.error("Playback failed", e));
      setCurrentBeat(beat);
    }
  }, [currentBeat, togglePlay]);

  const pauseBeat = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const seek = (percentage: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const targetTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = targetTime;
      setProgress(percentage);
    }
  };

  return (
    <PlayerContext.Provider value={{ currentBeat, isPlaying, progress, playBeat, pauseBeat, togglePlay, seek }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
