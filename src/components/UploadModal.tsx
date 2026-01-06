import { useState, useRef } from 'react';
import { Upload, Music, Image, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onUpload: (title: string, audioFile: File, coverFile?: File) => Promise<{ success: boolean; error?: string }>;
}

export function UploadModal({ open, onClose, onUpload }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const audioInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error('Please enter a song title');
      return;
    }
    if (!audioFile) {
      toast.error('Please select an audio file');
      return;
    }

    setUploading(true);
    const result = await onUpload(title, audioFile, coverFile || undefined);
    setUploading(false);

    if (result.success) {
      toast.success('Song uploaded! 🎵💕');
      resetForm();
      onClose();
    } else {
      toast.error(result.error || 'Failed to upload song');
    }
  };

  const resetForm = () => {
    setTitle('');
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-text text-2xl">
            Upload a Song 💕
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Title Input */}
          <div className="space-y-2">
            <Label htmlFor="title">Song Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your song a name..."
              className="bg-muted"
            />
          </div>

          {/* Audio File */}
          <div className="space-y-2">
            <Label>Audio File</Label>
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={handleAudioSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => audioInputRef.current?.click()}
              className="w-full h-20 border-dashed"
            >
              {audioFile ? (
                <div className="flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary" />
                  <span className="truncate max-w-[200px]">{audioFile.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setAudioFile(null);
                    }}
                    className="h-6 w-6 ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6" />
                  <span>Click to select audio file</span>
                </div>
              )}
            </Button>
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image (Optional)</Label>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => coverInputRef.current?.click()}
              className="w-full h-32 border-dashed overflow-hidden"
            >
              {coverPreview ? (
                <div className="relative w-full h-full">
                  <img 
                    src={coverPreview} 
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCoverFile(null);
                      setCoverPreview(null);
                    }}
                    className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70"
                  >
                    <X className="h-4 w-4 text-white" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Image className="h-6 w-6" />
                  <span>Click to add cover art</span>
                </div>
              )}
            </Button>
          </div>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit} 
            disabled={uploading}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Song
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
