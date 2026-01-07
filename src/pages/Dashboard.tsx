import { useState, useMemo } from 'react';
import { Plus, LogOut, Heart, Disc3, User, MoreVertical, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useSongs } from '@/hooks/useSongs';
import { SongCard } from '@/components/SongCard';
import { AudioPlayer } from '@/components/AudioPlayer';
import { UploadModal } from '@/components/UploadModal';
import { WeeklyStats } from '@/components/WeeklyStats';
import { Skeleton } from '@/components/ui/skeleton';
import { SongWithStats } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function Dashboard() {
  const { profile, partner, signOut } = useAuth();
  const { songs, loading, recordPlay, toggleFavorite, uploadSong, deleteSong } = useSongs();
  
  const [currentSong, setCurrentSong] = useState<SongWithStats | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [tab, setTab] = useState('all');

  const filteredSongs = useMemo(() => {
    switch (tab) {
      case 'favorites':
        return songs.filter(s => s.is_favorite);
      case 'mine':
        return songs.filter(s => s.uploaded_by === profile?.id);
      case 'theirs':
        return songs.filter(s => s.uploaded_by === partner?.id);
      default:
        return songs;
    }
  }, [songs, tab, profile, partner]);

  const playSong = (song: SongWithStats) => {
    setCurrentSong(song);
  };

  const playNext = () => {
    if (!currentSong) return;
    const currentIndex = filteredSongs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % filteredSongs.length;
    if (filteredSongs[nextIndex]) {
      playSong(filteredSongs[nextIndex]);
    }
  };

  const playPrevious = () => {
    if (!currentSong) return;
    const currentIndex = filteredSongs.findIndex(s => s.id === currentSong.id);
    const prevIndex = currentIndex === 0 ? filteredSongs.length - 1 : currentIndex - 1;
    if (filteredSongs[prevIndex]) {
      playSong(filteredSongs[prevIndex]);
    }
  };

  const handlePlayComplete = () => {
    if (currentSong) {
      recordPlay(currentSong.id);
    }
  };

  const handlePlaySong = (songId: string) => {
    const song = songs.find(s => s.id === songId);
    if (song) {
      playSong(song);
    }
  };

  return (
    <div className="relative min-h-screen pb-32 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,hsl(var(--primary)/0.16),transparent_32%),radial-gradient(circle_at_80%_0%,hsl(var(--accent)/0.14),transparent_30%),linear-gradient(160deg,hsl(315_24%_8%),hsl(300_18%_10%))]" />
      <div className="noise-layer" />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/70">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-11 w-11 rounded-2xl overflow-hidden shadow-[0_10px_30px_hsl(var(--primary)/0.35)] border border-border/70 bg-muted/40">
                <img
                  src="/polaroid.png"
                  alt="Our Spotify"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-black gradient-text leading-tight">Our Spotify</h1>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Our voices</p>
              </div>
            </div>
            <span className="text-muted-foreground hidden sm:block">
              💕 {profile?.display_name} & {partner?.display_name || 'waiting...'}
            </span>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full border border-border/60">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Weekly Stats Section */}
        <section className="relative rounded-3xl border border-border/60 bg-gradient-to-br from-primary/10 via-background/40 to-secondary/10 p-6 shadow-[0_24px_80px_hsl(var(--primary)/0.12)] backdrop-blur">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_25%_10%,hsl(var(--primary)/0.2),transparent_32%),radial-gradient(circle_at_80%_10%,hsl(var(--accent)/0.16),transparent_32%)] opacity-70" />
          <div className="relative">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Disc3 className="h-6 w-6 text-primary animate-spin-slow" />
              This Week's Highlights
            </h2>
            <WeeklyStats onPlaySong={handlePlaySong} />
          </div>
        </section>

        {/* Songs Library */}
        <section className="relative">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Library</h2>
            <p className="text-muted-foreground">{songs.length} songs</p>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="mb-6">
            <TabsList className="pill-tabs flex flex-wrap gap-2 w-fit">
              <TabsTrigger value="all" className="gap-2 pill-tab">
                <Music className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="favorites" className="gap-2 pill-tab">
                <Heart className="h-4 w-4" />
                Favorites
              </TabsTrigger>
              <TabsTrigger value="mine" className="gap-2 pill-tab">
                <User className="h-4 w-4" />
                Mine
              </TabsTrigger>
              {partner && (
                <TabsTrigger value="theirs" className="gap-2 pill-tab">
                  <User className="h-4 w-4" />
                  {partner.display_name}'s
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-square rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredSongs.length === 0 ? (
            <div className="text-center py-16">
              <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No songs yet!</h3>
              <p className="text-muted-foreground mb-6">
                {tab === 'favorites' 
                  ? "Heart some songs to see them here 💕"
                  : "Upload your first song to get started 🎵"}
              </p>
              {tab === 'all' && (
                <Button onClick={() => setShowUpload(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Song
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredSongs.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  onPlay={() => playSong(song)}
                  onToggleFavorite={() => toggleFavorite(song.id)}
                  onDelete={() => deleteSong(song.id)}
                  isPlaying={currentSong?.id === song.id}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Audio Player */}
      <AudioPlayer
        song={currentSong}
        onNext={playNext}
        onPrevious={playPrevious}
        onPlayComplete={handlePlayComplete}
        onToggleFavorite={toggleFavorite}
      />

      {/* Upload Modal */}
      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={uploadSong}
      />
    </div>
  );
}
