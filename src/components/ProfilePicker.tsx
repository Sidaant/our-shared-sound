import { User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Profile } from '@/types';

interface ProfilePickerProps {
  profiles: Profile[];
  onSelect: (profile: Profile) => void;
}

export function ProfilePicker({ profiles, onSelect }: ProfilePickerProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-background via-muted to-background">
      <h1 className="text-4xl font-bold mb-2 gradient-text">Who's Listening?</h1>
      <p className="text-muted-foreground mb-12">Pick your profile to continue</p>
      
      <div className="flex gap-8 flex-wrap justify-center">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            onClick={() => onSelect(profile)}
            className="group cursor-pointer p-6 w-48 flex flex-col items-center gap-4 hover:scale-105 transition-transform hover:ring-2 hover:ring-primary"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:animate-pulse-glow">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-primary-foreground" />
              )}
            </div>
            <p className="font-semibold text-lg">{profile.display_name}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
