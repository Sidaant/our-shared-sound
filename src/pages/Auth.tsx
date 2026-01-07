import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const displayNameSchema = z.string().min(1, 'Please enter your name');

export default function Auth() {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading } = useAuth();
  
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; displayName?: string }>({});

  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    const emailResult = emailSchema.safeParse(email);
    if (!emailResult.success) {
      newErrors.email = emailResult.error.errors[0].message;
    }
    
    const passwordResult = passwordSchema.safeParse(password);
    if (!passwordResult.success) {
      newErrors.password = passwordResult.error.errors[0].message;
    }
    
    if (tab === 'signup') {
      const nameResult = displayNameSchema.safeParse(displayName);
      if (!nameResult.success) {
        newErrors.displayName = nameResult.error.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes('Invalid login')) {
        toast.error('Invalid email or password');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Welcome back! 💕');
      navigate('/');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    const { error } = await signUp(email, password, displayName);
    setIsSubmitting(false);
    
    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('This email is already registered. Try logging in!');
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success('Account created! Welcome! 🎉');
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.16),transparent_32%),radial-gradient(circle_at_80%_0%,hsl(var(--accent)/0.16),transparent_28%),linear-gradient(145deg,hsl(315_24%_9%),hsl(300_18%_6%))]" />
      <div className="noise-layer" />

      <div className="relative z-10 w-full max-w-md">
        <Card className="neon-card shadow-2xl border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-2xl overflow-hidden shadow-[0_12px_40px_hsl(var(--primary)/0.4)] border border-border/70 bg-muted/40">
                <img
                  src="/polaroid.png"
                  alt="Our Spotify"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <Heart className="h-8 w-8 text-primary fill-primary animate-pulse drop-shadow-[0_0_18px_hsl(var(--primary)/0.75)]" />
            </div>
            <CardTitle className="text-3xl font-black tracking-tight gradient-text">Our Spotify</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')}>
              <TabsList className="pill-tabs grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login" className="pill-tab text-sm font-semibold">
                  Log In
                </TabsTrigger>
                <TabsTrigger value="signup" className="pill-tab text-sm font-semibold">
                  Sign Up
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="rounded-2xl p-4 border border-border/60 bg-muted/40 backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground/80">
                    Returning duo
                  </div>
                  <div className="text-sm text-white font-medium">Welcome back to your private stage.</div>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/70"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/70"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-[0_12px_30px_hsl(var(--primary)/0.35)]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Log In'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="rounded-2xl p-4 border border-border/60 bg-gradient-to-br from-primary/10 via-background/30 to-secondary/10 backdrop-blur">
                  <div className="text-xs uppercase tracking-[0.08em] text-muted-foreground/80">
                    New account
                  </div>
                  <div className="text-sm text-white font-medium">Craft your alias and drop the first track.</div>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Your Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="What should we call you?"
                      className="bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/70"
                    />
                    {errors.displayName && (
                      <p className="text-sm text-destructive">{errors.displayName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/70"
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="bg-muted/60 focus-visible:ring-2 focus-visible:ring-primary/70"
                    />
                    {errors.password && (
                      <p className="text-sm text-destructive">{errors.password}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-secondary hover:brightness-110 shadow-[0_12px_30px_hsl(var(--primary)/0.35)]"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
