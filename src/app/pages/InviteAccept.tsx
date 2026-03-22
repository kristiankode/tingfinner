import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useHousehold } from '../context/HouseholdContext';

export function InviteAccept() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { acceptInvite, household } = useHousehold();
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [householdName, setHouseholdName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If user already has a household, redirect home
  useEffect(() => {
    if (household) navigate('/', { replace: true });
  }, [household]);

  async function handleAccept() {
    if (!token) return;
    setStatus('loading');
    try {
      const result = await acceptInvite(token);
      setHouseholdName(result.householdName);
      setStatus('done');
      setTimeout(() => navigate('/'), 1500);
    } catch (err) {
      setError((err as Error).message);
      setStatus('error');
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
        <Users className="h-8 w-8 text-primary" />
      </div>

      {status === 'idle' && (
        <>
          <div>
            <h2 className="mb-2">Du er invitert!</h2>
            <p className="text-sm text-muted-foreground">Trykk nedenfor for å bli med i husholdningen.</p>
          </div>
          <Button className="w-full rounded-xl" onClick={handleAccept}>
            Bli med
          </Button>
        </>
      )}

      {status === 'loading' && (
        <p className="text-muted-foreground text-sm">Kobler til husholdning...</p>
      )}

      {status === 'done' && (
        <div>
          <h2 className="mb-2">Velkommen!</h2>
          <p className="text-sm text-muted-foreground">Du er nå med i {householdName ?? 'husholdningen'}.</p>
        </div>
      )}

      {status === 'error' && (
        <>
          <div>
            <h2 className="mb-2">Noe gikk galt</h2>
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <Button variant="outline" className="w-full rounded-xl" onClick={() => navigate('/')}>
            Til forsiden
          </Button>
        </>
      )}
    </div>
  );
}
