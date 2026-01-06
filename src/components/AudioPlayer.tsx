import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { SongWithStats } from '@/types';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  song: SongWithStats | null;
  onNext: () => void;
  onPrevious: () => void;
  onPlayComplete: () => void;
  onToggleFavorite: (songId: string) => void;
}

export function AudioPlayer({ 
  song, 
  onNext, 
  onPrevious, 
  onPlayComplete,
  onToggleFavorite 
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (song && audioRef.current) {
      audioRef.current.src = song.audio_url;
      audioRef.current.load();
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [song]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onPlayComplete();
      onNext();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNext, onPlayComplete]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.volume = value[0];
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!song) {
    return (
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border p-4">
        <div className="max-w-4xl mx-auto text-center text-muted-foreground">
          Select a song to play 💕
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 glass border-t border-border p-4 z-50">
      <audio ref={audioRef} />
      
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        {/* Song Info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-secondary flex-shrink-0">
            {song.cover_url ? (
              <img 
                src={song.cover_url} 
                alt={song.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-primary-foreground text-2xl">
                🎵
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{song.title}</p>
            <p className="text-sm text-muted-foreground truncate">
              by {song.uploader?.display_name || 'Unknown'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(song.id)}
            className="flex-shrink-0"
          >
            <Heart 
              className={cn(
                "h-5 w-5 transition-colors",
                song.is_favorite && "fill-primary text-primary"
              )} 
            />
          </Button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onPrevious}>
              <SkipBack className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              onClick={togglePlay}
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 ml-0.5" />
              )}
            </Button>
            <Button variant="ghost" size="icon" onClick={onNext}>
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center gap-2 w-full max-w-md">
            <span className="text-xs text-muted-foreground w-10 text-right">
              {formatTime(currentTime)}
            </span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button variant="ghost" size="icon" onClick={toggleMute}>
            {isMuted ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>
    </div>
  );
}
