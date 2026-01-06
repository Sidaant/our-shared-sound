import { Play, Heart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SongWithStats } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SongCardProps {
  song: SongWithStats;
  onPlay: () => void;
  onToggleFavorite: () => void;
  onDelete?: () => void;
  isPlaying?: boolean;
}

export function SongCard({ 
  song, 
  onPlay, 
  onToggleFavorite, 
  onDelete,
  isPlaying 
}: SongCardProps) {
  const { profile, partner } = useAuth();
  const canDelete = song.uploaded_by === profile?.id;

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
      isPlaying && "ring-2 ring-primary animate-pulse-glow"
    )}>
      {/* Cover Image */}
      <div className="aspect-square relative overflow-hidden">
        {song.cover_url ? (
          <img 
            src={song.cover_url} 
            alt={song.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary via-secondary to-accent flex items-center justify-center">
            <span className="text-6xl">🎵</span>
          </div>
        )}
        
        {/* Play Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button 
            size="icon" 
            onClick={onPlay}
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90"
          >
            <Play className="h-7 w-7 ml-0.5" />
          </Button>
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 right-2 bg-black/30 hover:bg-black/50"
        >
          <Heart 
            className={cn(
              "h-5 w-5 text-white transition-colors",
              song.is_favorite && "fill-primary text-primary"
            )} 
          />
        </Button>

        {/* Delete Button */}
        {canDelete && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="absolute top-2 left-2 bg-black/30 hover:bg-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="h-5 w-5 text-white" />
          </Button>
        )}
      </div>

      {/* Song Info */}
      <div className="p-4">
        <h3 className="font-semibold truncate">{song.title}</h3>
        <p className="text-sm text-muted-foreground">
          by {song.uploader?.display_name || 'Unknown'}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {format(new Date(song.created_at), 'MMM d, yyyy')}
        </p>

        {/* Play Stats */}
        <div className="mt-3 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <span className="font-semibold text-primary">{profile?.display_name}:</span>
            <span>{song.my_plays}</span>
          </div>
          {partner && (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-secondary">{partner.display_name}:</span>
              <span>{song.partner_plays}</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-bold">{song.total_plays}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
