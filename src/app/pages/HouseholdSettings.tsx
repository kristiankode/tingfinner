import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Trash2, Copy, Check, LogOut, Home, TreePine, Anchor, Building2, MapPin, Pencil } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useHousehold } from '../context/HouseholdContext';
import { useAuth } from '../context/AuthContext';
import { locationTypeLabels, type LocationType } from '../lib/data';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';

const locationIcons: Record<LocationType, React.ElementType> = {
  hus: Home, hytte: TreePine, bat: Anchor, leilighet: Building2, annet: MapPin,
};

const locationTypes: LocationType[] = ['hus', 'hytte', 'bat', 'leilighet', 'annet'];

export function HouseholdSettings() {
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const {
    household, locations, members, invites,
    updateHouseholdName, createLocation, updateLocation, deleteLocation,
    createInvite, deleteInvite, removeMember, leaveHousehold,
  } = useHousehold();

  const [householdName, setHouseholdName] = useState(household?.name ?? '');
  const [editingName, setEditingName] = useState(false);

  const [addLocOpen, setAddLocOpen] = useState(false);
  const [newLocName, setNewLocName] = useState('');
  const [newLocType, setNewLocType] = useState<LocationType>('hus');

  const [editLocId, setEditLocId] = useState<string | null>(null);
  const [editLocName, setEditLocName] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEier = members.find(m => m.userId === session?.user.id)?.role === 'eier';

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!householdName.trim()) return;
    await updateHouseholdName(householdName.trim());
    setEditingName(false);
  }

  async function handleAddLocation(e: React.FormEvent) {
    e.preventDefault();
    if (!newLocName.trim()) return;
    setLoading(true);
    try {
      await createLocation(newLocName.trim(), newLocType);
      setNewLocName('');
      setNewLocType('hus');
      setAddLocOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveLocName(id: string) {
    if (!editLocName.trim()) return;
    await updateLocation(id, editLocName.trim());
    setEditLocId(null);
  }

  async function handleDeleteLocation(id: string, name: string) {
    if (!confirm(`Slett «${name}»? Alle gjenstander på dette stedet beholdes, men mister stedstilknytningen.`)) return;
    await deleteLocation(id);
  }

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const invite = await createInvite(inviteEmail.trim() || 'ingen-epost@tingfinner.no');
      const link = `${window.location.origin}/invitasjon/${invite.token}`;
      setInviteLink(link);
      setInviteEmail('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSignOut() {
    await signOut();
    navigate('/login');
  }

  async function handleLeave() {
    if (!confirm('Er du sikker på at du vil forlate husholdningen?')) return;
    await leaveHousehold();
    navigate('/husholdning/oppsett');
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm('Fjern dette medlemmet fra husholdningen?')) return;
    await removeMember(userId);
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button onClick={() => navigate('/')} variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2>Husholdning</h2>
        </div>
      </div>

      <div className="px-4 py-6 space-y-8">

        {/* Household name */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Navn</h3>
          {editingName ? (
            <form onSubmit={handleSaveName} className="flex gap-2">
              <Input
                value={householdName}
                onChange={e => setHouseholdName(e.target.value)}
                className="bg-input-background rounded-xl flex-1"
                autoFocus
              />
              <Button type="submit" className="rounded-xl shrink-0">Lagre</Button>
            </form>
          ) : (
            <div className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl">
              <span className="text-sm font-medium">{household?.name}</span>
              {isEier && (
                <button onClick={() => { setHouseholdName(household?.name ?? ''); setEditingName(true); }}>
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          )}
        </section>

        {/* Locations */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Steder</h3>
            {isEier && (
              <button
                onClick={() => setAddLocOpen(true)}
                className="flex items-center gap-1 text-sm text-primary"
              >
                <Plus className="h-4 w-4" /> Legg til
              </button>
            )}
          </div>

          <div className="space-y-2">
            {locations.map(loc => {
              const Icon = locationIcons[loc.type];
              return (
                <div key={loc.id} className="flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl">
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  {editLocId === loc.id ? (
                    <Input
                      value={editLocName}
                      onChange={e => setEditLocName(e.target.value)}
                      onBlur={() => handleSaveLocName(loc.id)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveLocName(loc.id); }}
                      className="bg-input-background rounded-lg flex-1 h-8 text-sm"
                      autoFocus
                    />
                  ) : (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{loc.name}</p>
                      <p className="text-xs text-muted-foreground">{locationTypeLabels[loc.type]}</p>
                    </div>
                  )}
                  {isEier && editLocId !== loc.id && (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditLocId(loc.id); setEditLocName(loc.name); }}>
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                      {locations.length > 1 && (
                        <button onClick={() => handleDeleteLocation(loc.id, loc.name)}>
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Members */}
        <section className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Medlemmer</h3>
          <div className="space-y-2">
            {members.map(m => {
              const isMe = m.userId === session?.user.id;
              return (
                <div key={m.userId} className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl">
                  <div>
                    <p className="text-sm font-medium">{isMe ? 'Deg' : `Bruker …${m.userId.slice(-6)}`}</p>
                    <p className="text-xs text-muted-foreground capitalize">{m.role}</p>
                  </div>
                  {isEier && !isMe && (
                    <button onClick={() => handleRemoveMember(m.userId)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Invitations */}
        {isEier && (
          <section className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Inviter</h3>

            <form onSubmit={handleCreateInvite} className="space-y-2">
              <Label htmlFor="invite-email">E-post (valgfritt)</Label>
              <div className="flex gap-2">
                <Input
                  id="invite-email"
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="navn@eksempel.no"
                  className="bg-input-background rounded-xl flex-1"
                />
                <Button type="submit" className="rounded-xl shrink-0" disabled={loading}>
                  Generer lenke
                </Button>
              </div>
            </form>

            {inviteLink && (
              <div className="flex items-center gap-2 px-4 py-3 bg-card border border-border rounded-xl">
                <p className="text-xs text-muted-foreground flex-1 truncate">{inviteLink}</p>
                <button onClick={handleCopy} className="shrink-0">
                  {copied
                    ? <Check className="h-4 w-4 text-green-500" />
                    : <Copy className="h-4 w-4 text-muted-foreground" />
                  }
                </button>
              </div>
            )}

            {invites.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">Ventende invitasjoner</p>
                {invites.map(inv => (
                  <div key={inv.id} className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl">
                    <div>
                      <p className="text-sm truncate">{inv.invitedEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        Utløper {inv.expiresAt.toLocaleDateString('nb-NO')}
                      </p>
                    </div>
                    <button onClick={() => deleteInvite(inv.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {error && <p className="text-sm text-destructive">{error}</p>}
          </section>
        )}

        {/* Danger zone */}
        <section className="space-y-2 pt-4 border-t border-border">
          {!isEier && (
            <Button variant="outline" className="w-full rounded-xl text-destructive border-destructive/30" onClick={handleLeave}>
              <LogOut className="h-4 w-4 mr-2" /> Forlat husholdning
            </Button>
          )}
          <Button variant="ghost" className="w-full rounded-xl" onClick={handleSignOut}>
            Logg ut
          </Button>
        </section>
      </div>

      {/* Add location sheet */}
      <Sheet open={addLocOpen} onOpenChange={setAddLocOpen}>
        <SheetContent side="bottom" className="h-auto flex flex-col p-0 rounded-t-2xl">
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border">
            <SheetTitle className="text-base text-left">Legg til sted</SheetTitle>
          </SheetHeader>
          <form onSubmit={handleAddLocation} className="px-4 py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loc-name">Navn</Label>
              <Input
                id="loc-name"
                value={newLocName}
                onChange={e => setNewLocName(e.target.value)}
                placeholder="F.eks. «Hytta i Hemsedal»"
                className="bg-input-background rounded-xl"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {locationTypes.map(type => {
                  const Icon = locationIcons[type];
                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNewLocType(type)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-xl border transition-colors ${
                        newLocType === type
                          ? 'bg-primary/10 border-primary text-primary'
                          : 'bg-card border-border text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs">{locationTypeLabels[type]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl" disabled={loading || !newLocName.trim()}>
              {loading ? 'Legger til...' : 'Legg til'}
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
