import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { mockItems, type Room } from '../lib/data';

export function RoomOverview() {
  const navigate = useNavigate();
  const { room } = useParams<{ room: Room }>();
  
  const roomItems = mockItems.filter(item => item.room === room);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-4 flex items-center gap-3">
          <Button
            onClick={() => navigate('/')}
            variant="ghost"
            size="icon"
            className="rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2>{room}</h2>
            <p className="text-sm text-muted-foreground">
              {roomItems.length} {roomItems.length === 1 ? 'gjenstand' : 'gjenstander'}
            </p>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <div className="p-4">
        {roomItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Ingen gjenstander i dette rommet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {roomItems.map(item => (
              <Card
                key={item.id}
                onClick={() => navigate(`/item/${item.id}`)}
                className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden"
              >
                <img
                  src={item.photo}
                  alt={item.name}
                  className="w-full h-40 object-cover bg-muted"
                />
                <div className="p-3">
                  <h4 className="mb-1 truncate">{item.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">{item.category}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}