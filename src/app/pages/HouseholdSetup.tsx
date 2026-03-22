import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Home, Users } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useHousehold } from '../context/HouseholdContext'

type Mode = 'choose' | 'create' | 'join'

export function HouseholdSetup() {
  const navigate = useNavigate()
  const { createHousehold, acceptInvite } = useHousehold()
  const [mode, setMode] = useState<Mode>('choose')
  const [householdName, setHouseholdName] = useState('')
  const [inviteToken, setInviteToken] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!householdName.trim()) return
    setError(null)
    setLoading(true)
    try {
      await createHousehold(householdName.trim())
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    const token = inviteToken.trim().split('/').pop() ?? '' // support pasted full URL
    if (!token) return
    setError(null)
    setLoading(true)
    try {
      await acceptInvite(token)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 gap-8">
      <div className="text-center">
        <h1 className="mb-2">Tingfinner</h1>
        <p className="text-muted-foreground text-sm">Opprett eller bli med i en husholdning</p>
      </div>

      {mode === 'choose' && (
        <div className="w-full space-y-3">
          <button
            onClick={() => setMode('create')}
            className="w-full flex items-center gap-4 px-5 py-4 bg-card border border-border rounded-2xl hover:bg-muted transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Opprett husholdning</p>
              <p className="text-xs text-muted-foreground">Start en ny husholdning og inviter andre</p>
            </div>
          </button>

          <button
            onClick={() => setMode('join')}
            className="w-full flex items-center gap-4 px-5 py-4 bg-card border border-border rounded-2xl hover:bg-muted transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Bli med via invitasjon</p>
              <p className="text-xs text-muted-foreground">Lim inn invitasjonslenke fra noen du kjenner</p>
            </div>
          </button>
        </div>
      )}

      {mode === 'create' && (
        <form onSubmit={handleCreate} className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Navn på husholdningen</Label>
            <Input
              id="name"
              value={householdName}
              onChange={e => setHouseholdName(e.target.value)}
              placeholder="F.eks. «Familie Hansen»"
              className="bg-input-background rounded-xl"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full rounded-xl" disabled={loading || !householdName.trim()}>
            {loading ? 'Oppretter...' : 'Opprett'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => { setMode('choose'); setError(null) }}>
            Tilbake
          </Button>
        </form>
      )}

      {mode === 'join' && (
        <form onSubmit={handleJoin} className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token">Invitasjonslenke eller kode</Label>
            <Input
              id="token"
              value={inviteToken}
              onChange={e => setInviteToken(e.target.value)}
              placeholder="Lim inn lenke her..."
              className="bg-input-background rounded-xl"
              autoFocus
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full rounded-xl" disabled={loading || !inviteToken.trim()}>
            {loading ? 'Kobler til...' : 'Bli med'}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={() => { setMode('choose'); setError(null) }}>
            Tilbake
          </Button>
        </form>
      )}
    </div>
  )
}
