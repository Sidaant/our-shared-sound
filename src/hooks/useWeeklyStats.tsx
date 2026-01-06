import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Song, Profile } from '@/types';

interface WeeklyTopSong {
  song: Song;
  plays: number;
  uploader?: Profile;
}

interface WeeklyStats {
  myTopSongs: WeeklyTopSong[];
  partnerTopSongs: WeeklyTopSong[];
  sharedFavorites: Song[];
}

export function useWeeklyStats() {
  const { profile, partner } = useAuth();
  const [stats, setStats] = useState<WeeklyStats>({
    myTopSongs: [],
    partnerTopSongs: [],
    sharedFavorites: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!profile) return;

      // Get date from 7 days ago
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: playsData } = await supabase
        .from('plays')
        .select('*')
        .gte('played_at', weekAgo.toISOString());

      const { data: songsData } = await supabase
        .from('songs')
        .select('*');

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*');

      const { data: favoritesData } = await supabase
        .from('favorites')
        .select('*');

      if (playsData && songsData && profilesData) {
        // Calculate my top songs
        const myPlayCounts: Record<string, number> = {};
        const partnerPlayCounts: Record<string, number> = {};

        playsData.forEach(play => {
          if (play.played_by === profile.id) {
            myPlayCounts[play.song_id] = (myPlayCounts[play.song_id] || 0) + 1;
          } else if (partner && play.played_by === partner.id) {
            partnerPlayCounts[play.song_id] = (partnerPlayCounts[play.song_id] || 0) + 1;
          }
        });

        const getTopSongs = (playCounts: Record<string, number>): WeeklyTopSong[] => {
          return Object.entries(playCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([songId, plays]) => {
              const song = songsData.find(s => s.id === songId);
              const uploader = profilesData.find(p => p.id === song?.uploaded_by);
              return { song: song!, plays, uploader };
            })
            .filter(item => item.song);
        };

        // Find shared favorites
        const myFavIds = new Set(
          favoritesData?.filter(f => f.user_id === profile.id).map(f => f.song_id)
        );
        const partnerFavIds = partner 
          ? new Set(favoritesData?.filter(f => f.user_id === partner.id).map(f => f.song_id))
          : new Set();
        
        const sharedFavIds = [...myFavIds].filter(id => partnerFavIds.has(id));
        const sharedFavorites = songsData.filter(s => sharedFavIds.includes(s.id));

        setStats({
          myTopSongs: getTopSongs(myPlayCounts),
          partnerTopSongs: getTopSongs(partnerPlayCounts),
          sharedFavorites
        });
      }
      setLoading(false);
    };

    fetchStats();
  }, [profile, partner]);

  return { stats, loading };
}
