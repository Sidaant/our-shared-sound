import { Trophy, Heart, Music } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
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
    <Card className="neon-card border-border/70 overflow-hidden">
      <CardHeader className="space-y-1">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Music className="h-5 w-5 text-primary" />
          Our Wrapped
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Quick stats for this week — compact for mobile, rich on desktop.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="space-y-3">
          <AccordionItem value="mine" className="border border-border/60 rounded-2xl px-3">
            <AccordionTrigger className="py-3 text-sm font-semibold flex items-center gap-2">
              <span className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" />
                {profile?.display_name}'s Top 5
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {stats.myTopSongs.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-3">
                  No plays this week yet! 🎵
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.myTopSongs.map((item, index) => (
                    <div 
                      key={item.song.id}
                      onClick={() => onPlaySong(item.song.id)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                    >
                      <span className="text-base font-bold text-primary w-6 text-center">
                        {index + 1}
                      </span>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-secondary flex-shrink-0">
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
                        <p className="font-semibold truncate text-sm">{item.song.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.plays} plays • you
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>

          {partner && (
            <AccordionItem value="partner" className="border border-border/60 rounded-2xl px-3">
              <AccordionTrigger className="py-3 text-sm font-semibold flex items-center gap-2">
                <span className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-secondary" />
                  {partner.display_name}'s Top 5
                </span>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {stats.partnerTopSongs.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-3">
                    No plays this week yet! 🎵
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stats.partnerTopSongs.map((item, index) => (
                      <div 
                        key={item.song.id}
                        onClick={() => onPlaySong(item.song.id)}
                        className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                      >
                        <span className="text-base font-bold text-secondary w-6 text-center">
                          {index + 1}
                        </span>
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-secondary to-accent flex-shrink-0">
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
                          <p className="font-semibold truncate text-sm">{item.song.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.plays} plays • {partner.display_name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="shared" className="border border-border/60 rounded-2xl px-3">
            <AccordionTrigger className="py-3 text-sm font-semibold flex items-center gap-2">
              <span className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-accent fill-accent" />
                Songs We Both Love
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {stats.sharedFavorites.length === 0 ? (
                <p className="text-muted-foreground text-sm text-center py-3">
                  No shared favorites yet! 💕
                </p>
              ) : (
                <div className="space-y-2">
                  {stats.sharedFavorites.slice(0, 5).map((song) => (
                    <div 
                      key={song.id}
                      onClick={() => onPlaySong(song.id)}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted cursor-pointer transition-colors"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-accent to-primary flex-shrink-0">
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
                        <p className="font-semibold truncate text-sm">{song.title}</p>
                        <p className="text-xs text-muted-foreground">Both favorited</p>
                      </div>
                      <Heart className="h-4 w-4 text-accent fill-accent flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
