import { Trophy, Heart, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeeklyStats } from '@/hooks/useWeeklyStats';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface WeeklyStatsProps {
  onPlaySong: (songId: string) => void;
}

export function WeeklyStats({ onPlaySong }: WeeklyStatsProps) {
  const { profile, partner } = useAuth();
  const { stats, loading } = useWeeklyStats();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map(j => (
                <Skeleton key={j} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* My Top Songs */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            {profile?.display_name}'s Top 5
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {stats.myTopSongs.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No plays this week yet! 🎵
            </p>
          ) : (
            <div className="space-y-3">
              {stats.myTopSongs.map((item, index) => (
                <div 
                  key={item.song.id}
                  onClick={() => onPlaySong(item.song.id)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <span className="text-lg font-bold text-primary w-6">
                    {index + 1}
                  </span>
                  <div className="w-10 h-10 rounded overflow-hidden bg-gradient-to-br from-primary to-secondary flex-shrink-0">
                    {item.song.cover_url ? (
                      <img 
                        src={item.song.cover_url} 
                        alt={item.song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        🎵
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{item.song.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.plays} plays
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Partner's Top Songs */}
      {partner && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-secondary/10 to-secondary/5">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-5 w-5 text-secondary" />
              {partner.display_name}'s Top 5
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {stats.partnerTopSongs.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">
                No plays this week yet! 🎵
              </p>
            ) : (
              <div className="space-y-3">
                {stats.partnerTopSongs.map((item, index) => (
                  <div 
                    key={item.song.id}
                    onClick={() => onPlaySong(item.song.id)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  >
                    <span className="text-lg font-bold text-secondary w-6">
                      {index + 1}
                    </span>
                    <div className="w-10 h-10 rounded overflow-hidden bg-gradient-to-br from-secondary to-accent flex-shrink-0">
                      {item.song.cover_url ? (
                        <img 
                          src={item.song.cover_url} 
                          alt={item.song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          🎵
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate text-sm">{item.song.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.plays} plays
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Shared Favorites */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-accent/10 to-accent/5">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-accent fill-accent" />
            Songs We Both Love
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {stats.sharedFavorites.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">
              No shared favorites yet! 💕
            </p>
          ) : (
            <div className="space-y-3">
              {stats.sharedFavorites.slice(0, 5).map((song) => (
                <div 
                  key={song.id}
                  onClick={() => onPlaySong(song.id)}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 rounded overflow-hidden bg-gradient-to-br from-accent to-primary flex-shrink-0">
                    {song.cover_url ? (
                      <img 
                        src={song.cover_url} 
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        💕
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{song.title}</p>
                  </div>
                  <Heart className="h-4 w-4 text-accent fill-accent flex-shrink-0" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
