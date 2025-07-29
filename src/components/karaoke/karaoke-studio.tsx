
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { UploadForm } from './upload-form';
import { Player } from './player';
import { LoadingOverlay } from './loading-overlay';
import type { TimedLyric } from '@/types';

type View = 'upload' | 'player';

const lrcTimeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
const hasLRCTimestamps = (lyrics: string): boolean => {
  if (!lyrics) return false;
  return lyrics.split('\n').some((line) => lrcTimeRegex.test(line.trim()));
};


const parseLRC = (lrc: string): TimedLyric[] => {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const timedLyrics: TimedLyric[] = [];

  for (const line of lines) {
    const match = line.match(lrcTimeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
      const time = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(lrcTimeRegex, '').trim();
      if (text) {
        timedLyrics.push({ time, text });
      }
    }
  }
  return timedLyrics.sort((a, b) => a.time - b.time);
};

export function KaraokeStudio() {
  const [view, setView] = useState<View>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [timedLyrics, setTimedLyrics] = useState<TimedLyric[]>([]);
  const { toast } = useToast();

  const handleUploadSubmit = (file: File, rawLyrics: string) => {
    setIsLoading(true);

    // Artificial delay to ensure loading animation is visible
    setTimeout(() => {
        const trimmedLyrics = rawLyrics.trim();

        if (!trimmedLyrics) {
            toast({
                variant: 'destructive',
                title: 'Missing Lyrics',
                description: 'Please provide lyrics for the song.',
            });
            setIsLoading(false);
            return;
        }

        if (!hasLRCTimestamps(trimmedLyrics)) {
        toast({
            variant: 'destructive',
            title: 'Invalid Lyric Format',
            description: 'Please provide lyrics with LRC timestamps. e.g., [mm:ss.xx] Your lyric text.',
        });
        setIsLoading(false);
        return;
        }

        const parsedLyrics = parseLRC(trimmedLyrics);
        if (parsedLyrics.length === 0) {
            toast({
            variant: 'destructive',
            title: 'Processing Error',
            description: 'Could not parse lyrics or the file is empty. Please check the format and try again.',
            });
            setIsLoading(false);
        } else {
            setAudioFile(file);
            setTimedLyrics(parsedLyrics);
            setView('player');
            setIsLoading(false);
        }
    }, 1500); // Minimum 1.5 second loading screen
  };

  const handleStartOver = () => {
    setAudioFile(null);
    setTimedLyrics([]);
    setView('upload');
  };

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />
      <div className="w-full">
        {view === 'upload' && <UploadForm onSubmit={handleUploadSubmit} isLoading={isLoading} />}
        {view === 'player' && audioFile && (
          <Player audioFile={audioFile} timedLyrics={timedLyrics} onStartOver={handleStartOver} />
        )}
      </div>
    </>
  );
}
