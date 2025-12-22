import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Beat } from '../types';

interface PlayerContextType {
  currentBeat: Beat | null;
  isPlaying: boolean;
  progress: number;
  playBeat: (beat: Beat) => void;
  pauseBeat: () => void;
  togglePlay: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const playBeat = (beat: Beat) => {
    // If clicking the same beat
    if (currentBeat?.id === beat.id) {
      if (audioRef.current) {
        if (audioRef.current.paused) {
            audioRef.current.play();
            setIsPlaying(true);
        } else {
            audioRef.current.pause();
            setIsPlaying(false);
        }
      }
      return;
    }

    // New beat
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
        setIsPlaying(true);
    }
  };

  const pauseBeat = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const togglePlay = () => {
    if (!currentBeat || !audioRef.current) return;
    if (isPlaying) {
        audioRef.current.pause();
    } else {
        audioRef.current.play();
    }
  };

  return (
    <PlayerContext.Provider value={{ currentBeat, isPlaying, progress, playBeat, pauseBeat, togglePlay }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};