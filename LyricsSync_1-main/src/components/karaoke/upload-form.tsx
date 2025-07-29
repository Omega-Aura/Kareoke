
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Wand2, FileAudio, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadFormProps {
  isLoading: boolean;
  onSubmit: (audioFile: File, lyrics: string) => void;
}

const LoadingIndicator = () => (
    <div className="flex items-center justify-center gap-1">
        <span className="sr-only">Loading...</span>
        <div className="h-4 w-1 animate-bounce rounded-full bg-primary-foreground/80 [animation-delay:-0.3s]"></div>
        <div className="h-4 w-1 animate-bounce rounded-full bg-primary-foreground/80 [animation-delay:-0.15s]"></div>
        <div className="h-4 w-1 animate-bounce rounded-full bg-primary-foreground/80"></div>
    </div>
);


export function UploadForm({ isLoading, onSubmit }: UploadFormProps) {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [lyrics, setLyrics] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
          setError('Audio file must be under 10MB.');
          setAudioFile(null);
      } else {
        setAudioFile(file);
        setError('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioFile) {
      setError('Please select an audio file.');
      return;
    }
    if (!lyrics.trim()) {
      setError('Please enter the song lyrics.');
      return;
    }
    setError('');
    onSubmit(audioFile, lyrics);
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-center px-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-2 font-headline">
            LyricSync Karaoke
        </h1>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tighter font-headline text-primary">
            Your Personal Karaoke Stage.
        </h2>
        <p className="mt-4 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground">
            Upload any song, paste the lyrics, and get a perfectly timed karaoke experience.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 md:mt-12">
            <Card className="bg-card/80 backdrop-blur-sm border rounded-xl p-4 md:p-8">
                <CardContent className="flex flex-col md:flex-row gap-6 md:gap-8 p-0">
                    <div className="flex-1 space-y-3 text-left">
                        <Label htmlFor="audio-upload" className="flex items-center gap-2 text-base md:text-lg font-medium text-foreground">
                            <FileAudio className="w-5 h-5 md:w-6 md:h-6 text-primary"/>
                            <span>Upload Audio</span>
                        </Label>
                        <Label htmlFor="audio-upload" className={cn("flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-input bg-background/50 p-4 md:p-6 text-center text-muted-foreground transition-colors hover:border-primary/50", audioFile && "border-primary/30 text-primary")}>
                            <Upload className="h-6 w-6 md:h-8 md:w-8" />
                            <span className="font-semibold text-sm md:text-base">{audioFile ? audioFile.name : 'Click to upload song'}</span>
                            <p className="text-xs">(MP3, WAV, etc. Max 10MB)</p>
                        </Label>
                        <Input id="audio-upload" type="file" accept="audio/*" className="sr-only" onChange={handleFileChange} disabled={isLoading} />
                    </div>

                    <div className="flex-1 space-y-3 text-left">
                        <Label htmlFor="lyrics-input" className="flex items-center gap-2 text-base md:text-lg font-medium text-foreground">
                            <FileText className="w-5 h-5 md:w-6 md:h-6 text-primary"/>
                            <span>Paste Lyrics (with LRC)</span>
                        </Label>
                        <Textarea
                            id="lyrics-input"
                            placeholder="[00:12.34] Your lyric line starts here...
[00:15.50] The next one appears...
[00:18.75] ...and so on!"
                            className="min-h-[124px] md:min-h-[148px] text-sm md:text-base bg-background/50"
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                </CardContent>
            </Card>
            
            <div className="mt-6 md:mt-8 flex flex-col items-center gap-4">
                <Button type="submit" size="lg" className="w-full max-w-xs text-base md:text-lg py-6 md:py-7 font-bold group rounded-lg shadow-lg shadow-primary/20" disabled={isLoading}>
                    {isLoading ? (
                        <>
                           <span className="mr-2">Synchronizing</span>
                           <LoadingIndicator />
                        </>
                    ) : (
                        <>
                            <Wand2 className="mr-3 h-5 w-5 md:h-6 md:h-6 transition-transform group-hover:rotate-12" />
                            Create Karaoke
                        </>
                    )}
                </Button>
                {error && <p className="text-destructive text-sm font-medium">{error}</p>}
            </div>
        </form>
    </div>
  );
}
