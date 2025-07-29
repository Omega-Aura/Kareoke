import { KaraokeStudio } from '@/components/karaoke/karaoke-studio';
import { ThemeToggle } from '@/components/theme-toggle';

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background text-foreground">
      <div className="absolute inset-0 z-0 h-full w-full bg-transparent bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>
      <div className="container relative z-10 mx-auto flex h-full max-w-4xl flex-col items-center justify-center p-4">
        <KaraokeStudio />
      </div>
    </main>
  );
}
