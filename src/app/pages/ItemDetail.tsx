import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Edit2, Trash2, MapPin, Tag, DollarSign, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { mockItems } from '../lib/data';

export function ItemDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const item = mockItems.find(i => i.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Gjenstand ikke funnet</p>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm('Er du sikker på at du vil slette denne gjenstanden?')) {
      // In a real app, this would delete from database
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate(-1)}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2>Detaljer</h2>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/item/${id}/edit`)}
              variant="ghost"
              size="icon"
              className="rounded-full"
            >
              <Edit2 className="h-5 w-5" />
            </Button>
            <Button
              onClick={handleDelete}
              variant="ghost"
              size="icon"
              className="rounded-full text-destructive hover:text-destructive"
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Photo */}
      <div className="p-4">
        <img
          src={item.photo}
          alt={item.name}
          className="w-full h-80 object-cover rounded-2xl bg-muted shadow-lg"
        />
      </div>

      {/* Item Information */}
      <div className="px-4 py-2 space-y-6">
        {/* Name */}
        <div>
          <h1 className="mb-2">{item.name}</h1>
          <div className="inline-block px-3 py-1 bg-secondary rounded-full text-sm text-secondary-foreground">
            {item.condition}
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
            <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Kategori</p>
              <p>{item.category}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">Plassering</p>
              <p>{item.room}</p>
              <p className="text-sm text-muted-foreground mt-1">{item.placement}</p>
            </div>
          </div>

          {item.estimatedValue && (
            <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimert verdi</p>
                <p>{item.estimatedValue.toLocaleString('nb-NO')} kr</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 p-4 bg-card rounded-xl border border-border">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Registrert</p>
              <p>{item.createdAt.toLocaleDateString('nb-NO', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}</p>
            </div>
          </div>

          {item.notes && (
            <div className="p-4 bg-card rounded-xl border border-border">
              <p className="text-sm text-muted-foreground mb-2">Notater</p>
              <p className="text-sm">{item.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}