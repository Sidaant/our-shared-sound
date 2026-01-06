export interface Profile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Song {
  id: string;
  title: string;
  audio_url: string;
  cover_url: string | null;
  uploaded_by: string;
  created_at: string;
  uploader?: Profile;
}

export interface Play {
  id: string;
  song_id: string;
  played_by: string;
  played_at: string;
}

export interface Favorite {
  id: string;
  song_id: string;
  user_id: string;
  created_at: string;
}

export interface SongWithStats extends Song {
  my_plays: number;
  partner_plays: number;
  total_plays: number;
  is_favorite: boolean;
}
