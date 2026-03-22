import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, Home, TreePine, Anchor, Building2, MapPin } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { conditions, matchCategory, locationTypeLabels, type Category, type Room, type Condition, type LocationType } from '../lib/data';
import { CategoryPicker } from '../components/CategoryPicker';
import { RoomPicker } from '../components/RoomPicker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useHousehold } from '../context/HouseholdContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';

const locationIcons: Record<LocationType, React.ElementType> = {
  hus: Home,
  hytte: TreePine,
  bat: Anchor,
  leilighet: Building2,
  annet: MapPin,
};

export function ItemForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { session } = useAuth();
  const { household, locations, activeLocationId } = useHousehold();

  const photoData = location.state?.photoData as string | undefined;
  const aiData = location.state?.aiData;

  // Resolve which location to use: active > first available
  const resolvedLocationId = activeLocationId ?? locations[0]?.id ?? '';

  const [selectedLocationId, setSelectedLocationId] = useState(resolvedLocationId);
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: aiData?.name || '',
    category: (aiData?.category ? matchCategory(aiData.category) : 'annet') as Category,
    estimatedValue: aiData?.estimatedValue?.toString() || '',
    condition: (aiData?.condition || 'God') as Condition,
    room: 'Stue' as Room,
    placement: '',
    notes: '',
  });

  const [storagePath, setStoragePath] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState(photoData || '');
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Update selectedLocationId if resolvedLocationId changes (locations loaded async)
  useEffect(() => {
    if (!id && resolvedLocationId) {
      setSelectedLocationId(resolvedLocationId);
    }
  }, [resolvedLocationId, id]);

  useEffect(() => {
    if (!id) return;
    supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .single()
      .then(async ({ data }) => {
        if (!data) return;
        setFormData({
          name: data.name,
          category: data.category as Category,
          estimatedValue: data.estimated_value?.toString() || '',
          condition: data.condition as Condition,
          room: data.room as Room,
          placement: data.placement,
          notes: data.notes || '',
        });
        setSelectedLocationId(data.location_id);
        if (data.photo) {
          setStoragePath(data.photo);
          const { data: signed } = await supabase.storage
            .from('item-photos')
            .createSignedUrl(data.photo, 3600);
          setPreviewUrl(signed?.signedUrl || '');
        }
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const userId = session?.user.id;
    if (!userId || !household) return;
    if (!selectedLocationId) {
      setSubmitError('Velg et sted for gjenstanden');
      return;
    }

    let finalPath = storagePath;

    if (photoData) {
      const base64 = photoData.replace(/^data:image\/\w+;base64,/, '');
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const path = `${household.id}/${selectedLocationId}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('item-photos')
        .upload(path, bytes, { contentType: 'image/jpeg' });
      if (uploadError) {
        setSubmitError(`Kunne ikke laste opp bilde: ${uploadError.message}`);
        return;
      }
      if (storagePath) {
        await supabase.storage.from('item-photos').remove([storagePath]);
      }
      finalPath = path;
    }

    const payload = {
      name: formData.name,
      category: formData.category,
      room: formData.room,
      placement: formData.placement,
      condition: formData.condition,
      estimated_value: formData.estimatedValue ? Number(formData.estimatedValue) : null,
      notes: formData.notes || null,
      photo: finalPath,
      user_id: userId,
      location_id: selectedLocationId,
    };

    if (id) {
      const { error } = await supabase.from('items').update(payload).eq('id', id);
      if (error) { setSubmitError(error.message); return; }
    } else {
      const { error } = await supabase.from('items').insert(payload);
      if (error) { setSubmitError(error.message); return; }
    }

    navigate('/');
  };

  const handleDiscard = () => {
    if (confirm('Er du sikker på at du vil forkaste endringene?')) {
      navigate('/');
    }
  };

  const selectedLocation = locations.find(l => l.id === selectedLocationId);
  const LocationIcon = selectedLocation ? locationIcons[selectedLocation.type] : Home;

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button onClick={() => navigate(-1)} variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2>{id ? 'Rediger gjenstand' : 'Ny gjenstand'}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {previewUrl && (
          <div className="p-4">
            <img src={previewUrl} alt="Item" className="w-full h-64 object-cover rounded-xl bg-muted" />
          </div>
        )}

        <div className="px-4 py-4 space-y-6">
          {/* AI Pre-filled Section */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Foreslått av AI (kan redigeres)</p>

            <div className="space-y-2">
              <Label htmlFor="name">Gjenstandsnavn</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="bg-input-background rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <CategoryPicker
                value={formData.category}
                onChange={(value) => setFormData({ ...formData, category: value as Category })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Estimert verdi (valgfritt)</Label>
              <Input
                id="value"
                type="number"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                placeholder="kr"
                className="bg-input-background rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Tilstand</Label>
              <div className="flex gap-2">
                {conditions.map(condition => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => setFormData({ ...formData, condition })}
                    className={`flex-1 py-3 rounded-xl transition-colors ${
                      formData.condition === condition
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-muted'
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Location + Room Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Fyll ut informasjon</p>

            {/* Location picker — only shown when multiple locations exist */}
            {locations.length > 1 && (
              <div className="space-y-2">
                <Label>Sted</Label>
                <button
                  type="button"
                  onClick={() => setLocationPickerOpen(true)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-input-background rounded-xl text-sm text-left hover:bg-muted transition-colors"
                >
                  <span className="flex items-center gap-2 text-foreground">
                    <LocationIcon className="h-4 w-4 text-muted-foreground" />
                    {selectedLocation?.name ?? 'Velg sted'}
                  </span>
                </button>
              </div>
            )}

            <div className="space-y-2">
              <Label>Rom / Plassering</Label>
              <RoomPicker
                value={formData.room}
                onChange={(value) => setFormData({ ...formData, room: value as Room })}
                locationId={selectedLocationId}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="placement">Spesifikk plassering</Label>
              <Input
                id="placement"
                type="text"
                value={formData.placement}
                onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                placeholder="F.eks. 'Øverste hylle i skapet'"
                required
                className="bg-input-background rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notater (valgfritt)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Tilleggsinformasjon..."
                rows={3}
                className="bg-input-background rounded-xl resize-none"
              />
            </div>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 space-y-2 max-w-[390px] mx-auto">
          {submitError && <p className="text-sm text-destructive text-center">{submitError}</p>}
          <Button type="submit" className="w-full rounded-xl">Lagre</Button>
          <Button type="button" onClick={handleDiscard} variant="outline" className="w-full rounded-xl">
            Forkast
          </Button>
        </div>
      </form>

      {/* Location picker sheet */}
      <Sheet open={locationPickerOpen} onOpenChange={setLocationPickerOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[60vh] flex flex-col p-0 rounded-t-2xl">
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border shrink-0">
            <SheetTitle className="text-base text-left">Velg sted</SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto">
            {locations.map(loc => {
              const LocIcon = locationIcons[loc.type];
              const isSelected = loc.id === selectedLocationId;
              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => { setSelectedLocationId(loc.id); setLocationPickerOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-4 border-b border-border transition-colors ${
                    isSelected ? 'bg-primary/5' : 'hover:bg-muted'
                  }`}
                >
                  <LocIcon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-left">
                    <p className={`text-sm font-medium ${isSelected ? 'text-primary' : ''}`}>{loc.name}</p>
                    <p className="text-xs text-muted-foreground">{locationTypeLabels[loc.type]}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
