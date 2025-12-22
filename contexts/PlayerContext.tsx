
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Beat } from '../types';

interface PlayerContextType {
  currentBeat: Beat | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  currentTime: number;
  volume: number;
  playlist: Beat[];
  playBeat: (beat: Beat, list?: Beat[]) => void;
  pauseBeat: () => void;
  togglePlay: () => void;
  seek: (percentage: number) => void;
  setVolume: (level: number) => void;
  nextTrack: () => void;
  prevTrack: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentBeat, setCurrentBeat] = useState<Beat | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [playlist, setPlaylist] = useState<Beat[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    } else {
      audioRef.current.pause();
    }
  }, []);

  const nextTrack = useCallback(() => {
    if (!currentBeat || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(b => b.id === currentBeat.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playBeat(playlist[nextIndex]);
  }, [currentBeat, playlist]);

  const prevTrack = useCallback(() => {
    if (!currentBeat || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(b => b.id === currentBeat.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playBeat(playlist[prevIndex]);
  }, [currentBeat, playlist]);

  const setVolume = (level: number) => {
    const safeLevel = Math.max(0, Math.min(1, level));
    setVolumeState(safeLevel);
    if (audioRef.current) {
      audioRef.current.volume = safeLevel;
    }
  };

  const playBeat = useCallback((beat: Beat, list?: Beat[]) => {
    if (list) setPlaylist(list);
    
    if (currentBeat?.id === beat.id) {
      togglePlay();
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (beat.audioUrl) {
      const audio = new Audio(beat.audioUrl);
      audio.volume = volume;
      audioRef.current = audio;
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(audio.duration);
      });

      audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
          setCurrentTime(audio.currentTime);
          setProgress((audio.currentTime / audio.duration) * 100);
        }
      });

      audio.addEventListener('ended', () => {
        nextTrack();
      });

      audio.addEventListener('play', () => setIsPlaying(true));
      audio.addEventListener('pause', () => setIsPlaying(false));

      audio.play().catch(e => console.error("Playback failed", e));
      setCurrentBeat(beat);
    }
  }, [currentBeat, togglePlay, volume, nextTrack]);

  const pauseBeat = () => {
    if (audioRef.current) audioRef.current.pause();
  };

  const seek = (percentage: number) => {
    if (audioRef.current && audioRef.current.duration) {
      const targetTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = targetTime;
      setProgress(percentage);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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

  return (
    <PlayerContext.Provider value={{ 
      currentBeat, isPlaying, progress, duration, currentTime, volume, playlist,
      playBeat, pauseBeat, togglePlay, seek, setVolume, nextTrack, prevTrack 
    }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) throw new Error('usePlayer must be used within a PlayerProvider');
  return context;
};
