import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'

export function Login() {
  const navigate = useNavigate()
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn(email, password)
      } else {
        await signUp(email, password)
      }
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="mb-2">Tingfinner</h1>
          <p className="text-muted-foreground text-sm">
            {mode === 'login' ? 'Logg inn for å fortsette' : 'Opprett en ny konto'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-post</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="din@epost.no"
              required
              className="bg-input-background rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passord</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="bg-input-background rounded-xl"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full rounded-xl" disabled={loading}>
            {loading ? 'Laster...' : mode === 'login' ? 'Logg inn' : 'Registrer deg'}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
            className="text-sm text-primary hover:underline"
          >
            {mode === 'login' ? 'Har du ikke konto? Registrer deg' : 'Har du allerede konto? Logg inn'}
          </button>
        </div>
      </div>
    </div>
  )
}
