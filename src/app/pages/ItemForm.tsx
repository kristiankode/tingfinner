import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { categories, rooms, conditions, mockItems, type Category, type Room, type Condition } from '../lib/data';

export function ItemForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  
  const photoData = location.state?.photoData;
  const aiData = location.state?.aiData;
  const existingItem = id ? mockItems.find(item => item.id === id) : null;

  const [formData, setFormData] = useState({
    name: aiData?.name || existingItem?.name || '',
    category: (aiData?.category || existingItem?.category || 'Annet') as Category,
    estimatedValue: aiData?.estimatedValue?.toString() || existingItem?.estimatedValue?.toString() || '',
    condition: (aiData?.condition || existingItem?.condition || 'God') as Condition,
    room: (existingItem?.room || 'Stue') as Room,
    placement: existingItem?.placement || '',
    notes: existingItem?.notes || '',
  });

  const [photo] = useState(photoData || existingItem?.photo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would save to database
    console.log('Saving item:', formData);
    navigate('/');
  };

  const handleDiscard = () => {
    if (confirm('Er du sikker på at du vil forkaste endringene?')) {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2>{id ? 'Rediger gjenstand' : 'Ny gjenstand'}</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Photo */}
        {photo && (
          <div className="p-4">
            <img
              src={photo}
              alt="Item"
              className="w-full h-64 object-cover rounded-xl bg-muted"
            />
          </div>
        )}

        {/* Form Fields */}
        <div className="px-4 py-4 space-y-6">
          {/* AI Pre-filled Section */}
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Foreslått av AI (kan redigeres)</p>
            
            {/* Item Name */}
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

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value as Category })}
              >
                <SelectTrigger className="bg-input-background rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimated Value */}
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

            {/* Condition */}
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

          {/* User Required Section */}
          <div className="space-y-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">Fyll ut informasjon</p>

            {/* Room */}
            <div className="space-y-2">
              <Label htmlFor="room">Rom / Plassering</Label>
              <Select
                value={formData.room}
                onValueChange={(value) => setFormData({ ...formData, room: value as Room })}
              >
                <SelectTrigger className="bg-input-background rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map(room => (
                    <SelectItem key={room} value={room}>
                      {room}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Specific Placement */}
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

            {/* Notes */}
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

        {/* Action Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 space-y-2 max-w-[390px] mx-auto">
          <Button type="submit" className="w-full rounded-xl">
            Lagre
          </Button>
          <Button type="button" onClick={handleDiscard} variant="outline" className="w-full rounded-xl">
            Forkast
          </Button>
        </div>
      </form>
    </div>
  );
}