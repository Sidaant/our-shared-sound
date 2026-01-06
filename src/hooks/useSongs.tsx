import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Song, SongWithStats, Play, Favorite, Profile } from '@/types';

export function useSongs() {
  const { profile, partner } = useAuth();
  const [songs, setSongs] = useState<SongWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSongs = async () => {
    if (!profile) return;

    const { data: songsData } = await supabase
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false });

    const { data: playsData } = await supabase
      .from('plays')
      .select('*');

    const { data: favoritesData } = await supabase
      .from('favorites')
      .select('*');

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('*');

    if (songsData) {
      const enrichedSongs: SongWithStats[] = songsData.map(song => {
        const songPlays = playsData?.filter(p => p.song_id === song.id) || [];
        const myPlays = songPlays.filter(p => p.played_by === profile.id).length;
        const partnerPlays = partner 
          ? songPlays.filter(p => p.played_by === partner.id).length 
          : 0;
        const isFavorite = favoritesData?.some(
          f => f.song_id === song.id && f.user_id === profile.id
        ) || false;
        const uploader = profilesData?.find(p => p.id === song.uploaded_by);

        return {
          ...song,
          my_plays: myPlays,
          partner_plays: partnerPlays,
          total_plays: myPlays + partnerPlays,
          is_favorite: isFavorite,
          uploader
        };
      });

      setSongs(enrichedSongs);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      fetchSongs();
    }
  }, [profile, partner]);

  const recordPlay = async (songId: string) => {
    if (!profile) return;

    await supabase.from('plays').insert({
      song_id: songId,
      played_by: profile.id
    });

    // Update local state
    setSongs(prev => prev.map(song => {
      if (song.id === songId) {
        return {
          ...song,
          my_plays: song.my_plays + 1,
          total_plays: song.total_plays + 1
        };
      }
      return song;
    }));
  };

  const toggleFavorite = async (songId: string) => {
    if (!profile) return;

    const song = songs.find(s => s.id === songId);
    if (!song) return;

    if (song.is_favorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('song_id', songId)
        .eq('user_id', profile.id);
    } else {
      await supabase.from('favorites').insert({
        song_id: songId,
        user_id: profile.id
      });
    }

    setSongs(prev => prev.map(s => {
      if (s.id === songId) {
        return { ...s, is_favorite: !s.is_favorite };
      }
      return s;
    }));
  };

  const uploadSong = async (
    title: string, 
    audioFile: File, 
    coverFile?: File
  ): Promise<{ success: boolean; error?: string }> => {
    if (!profile) return { success: false, error: 'Not authenticated' };

    try {
      // Upload audio
      const audioPath = `${profile.id}/${Date.now()}-${audioFile.name}`;
      const { error: audioError } = await supabase.storage
        .from('audio')
        .upload(audioPath, audioFile);

      if (audioError) throw audioError;

      const { data: audioUrlData } = supabase.storage
        .from('audio')
        .getPublicUrl(audioPath);

      let coverUrl = null;
      if (coverFile) {
        const coverPath = `${profile.id}/${Date.now()}-${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverPath, coverFile);

        if (!coverError) {
          const { data: coverUrlData } = supabase.storage
            .from('covers')
            .getPublicUrl(coverPath);
          coverUrl = coverUrlData.publicUrl;
        }
      }

      const { error: insertError } = await supabase.from('songs').insert({
        title,
        audio_url: audioUrlData.publicUrl,
        cover_url: coverUrl,
        uploaded_by: profile.id
      });

      if (insertError) throw insertError;

      await fetchSongs();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const deleteSong = async (songId: string) => {
    await supabase.from('songs').delete().eq('id', songId);
    setSongs(prev => prev.filter(s => s.id !== songId));
  };

  return {
    songs,
    loading,
    recordPlay,
    toggleFavorite,
    uploadSong,
    deleteSong,
    refetch: fetchSongs
  };
}
