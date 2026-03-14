import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AlertTriangle, User, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register, guestLogin } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await register(name, email, password);
        // Explicitly go to setup after registering a brand new account
        navigate('/setup');
      } else {
        await login(email, password);
        // Let the Guard/Routes handle login logic naturally, but give it a push
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="text-center space-y-3">
          <Link to="/" className="inline-flex flex-col items-center gap-3 transition-opacity hover:opacity-90">
            <img
              src="/logo-1.png"
              alt="SEAGuard logo"
              className="mx-auto h-16 w-16 rounded-2xl object-cover shadow-clay"
            />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">SEAGuard</h1>
          </Link>
          <p className="text-sm text-muted-foreground">AI-Driven Intelligence for Regional Safety</p>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-destructive/10 border border-destructive/20 shadow-clay-sm p-3">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-xs text-destructive font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 h-12 bg-card shadow-clay-inset border-none rounded-xl text-foreground placeholder:text-muted-foreground"
                  required={isSignUp}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-card shadow-clay-inset border-none rounded-xl text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-card shadow-clay-inset border-none rounded-xl text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-bold rounded-xl shadow-clay" disabled={loading}>
            {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>



        <p className="text-center text-xs text-muted-foreground">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError(null);
            }}
            className="text-primary hover:underline font-semibold"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
