
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Volume1, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TimedLyric } from '@/types';

interface PlayerProps {
  audioFile: File;
  timedLyrics: TimedLyric[];
  onStartOver: () => void;
}

const formatTime = (seconds: number) => {
  if (isNaN(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function Player({ audioFile, timedLyrics, onStartOver }: PlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [lastVolume, setLastVolume] = useState(0.75);
  const [currentLineIndex, setCurrentLineIndex] = useState(-1);

  const audioRef = useRef<HTMLAudioElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioFile) return;

    const objectUrl = URL.createObjectURL(audioFile);
    audio.src = objectUrl;
    audio.volume = volume;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      URL.revokeObjectURL(objectUrl);
    };
  }, [audioFile]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      isPlaying ? audio.play().catch(console.error) : audio.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const newIndex = timedLyrics.findIndex((line, index) => {
      const nextLine = timedLyrics[index + 1];
      return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
    });

    setCurrentLineIndex(newIndex);
  }, [currentTime, timedLyrics]);

  useEffect(() => {
    if (activeLineRef.current && scrollViewportRef.current) {
      const lineEl = activeLineRef.current;
      const viewportEl = scrollViewportRef.current;
      const lineTop = lineEl.offsetTop;
      const lineHeight = lineEl.clientHeight;
      const viewportHeight = viewportEl.clientHeight;
      viewportEl.scrollTo({
        top: lineTop - viewportHeight / 2 + lineHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [currentLineIndex]);


  const togglePlay = () => setIsPlaying(!isPlaying);

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleLyricClick = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
      if (!isPlaying) {
        setIsPlaying(true);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
      const newVolume = value[0];
      setVolume(newVolume);
      if (newVolume > 0) {
        setLastVolume(newVolume);
      }
  };
  
  const toggleMute = () => {
    if (volume > 0) {
      setLastVolume(volume);
      setVolume(0);
    } else {
      setVolume(lastVolume > 0 ? lastVolume : 0.75);
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <Card className="w-full h-full md:h-auto md:max-w-4xl shadow-2xl bg-card border-none md:rounded-lg">
      <audio ref={audioRef} />
      <CardHeader>
        <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-headline truncate" title={audioFile.name}>
            {audioFile.name}
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onStartOver}>
                <RotateCcw className="h-5 w-5" />
                <span className="sr-only">Start Over</span>
            </Button>
        </div>
      </CardHeader>
      <CardContent className="px-2 md:px-6 h-[calc(100%-240px)] md:h-auto">
        <ScrollArea
          className="h-full md:h-80 w-full rounded-md"
          viewportRef={scrollViewportRef}
        >
          <div className="p-4 md:p-8 text-center space-y-6 md:space-y-8 [&:first-child]:pt-24 [&:first-child]:md:pt-32 [&:last-child]:pb-24 [&:last-child]:md:pb-32">
            {timedLyrics.length === 0 && (
              <p className="text-muted-foreground text-lg md:text-xl">No lyrics to display.</p>
            )}
            {timedLyrics.map((line, index) => (
              <p
                key={index}
                ref={index === currentLineIndex ? activeLineRef : null}
                onClick={() => handleLyricClick(line.time)}
                className={cn(
                  'text-2xl md:text-3xl font-headline transition-all duration-300 ease-in-out font-bold leading-tight cursor-pointer',
                  index === currentLineIndex
                    ? 'text-primary scale-105'
                    : 'text-muted-foreground/80 opacity-60 hover:opacity-100 hover:text-foreground'
                )}
              >
                {line.text}
              </p>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex flex-col gap-4 pt-4 md:pt-6 px-2 md:px-6 absolute bottom-0 w-full md:relative">
        <div className="w-full flex items-center gap-2 md:gap-4">
          <span className="font-mono text-xs md:text-sm text-muted-foreground w-12 text-center">{formatTime(currentTime)}</span>
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            disabled={!duration}
            className="w-full"
          />
          <span className="font-mono text-xs md:text-sm text-muted-foreground w-12 text-center">{formatTime(duration)}</span>
        </div>
        <div className="w-full flex items-center justify-between gap-2 md:gap-4">
           <div className="w-12 h-12 md:w-16 md:h-16"></div>
          <Button onClick={togglePlay} size="icon" className="w-16 h-16 md:w-20 md:h-20 rounded-full shadow-lg bg-primary hover:bg-primary/90" disabled={!duration}>
            {isPlaying ? <Pause className="h-8 w-8 md:h-10 md:w-10" /> : <Play className="h-8 w-8 md:h-10 md:w-10 ml-1" />}
          </Button>
          <div className="flex items-center gap-2 w-24 md:w-32">
            <Button variant="ghost" size="icon" onClick={toggleMute} className="text-muted-foreground hover:text-foreground">
                <VolumeIcon className="h-5 w-5 md:h-6 md:h-6" />
                <span className="sr-only">Mute/Unmute</span>
            </Button>
            <Slider value={[volume]} max={1} step={0.05} onValueChange={handleVolumeChange} />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
