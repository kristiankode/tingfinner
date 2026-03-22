import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { getCategoryLabel, type Item } from '../lib/data';
import { supabase } from '../lib/supabase';

export function RoomOverview() {
  const navigate = useNavigate();
  const { room } = useParams<{ room: string }>();
  const [roomItems, setRoomItems] = useState<Item[]>([]);

  useEffect(() => {
    if (!room) return;
    supabase
      .from('items')
      .select('*')
      .eq('room', room)
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        if (!data) return;
        const mapped = data.map(row => ({
          ...row,
          estimatedValue: row.estimated_value,
          createdAt: new Date(row.created_at),
        }));

        const paths = mapped.filter(i => i.photo).map(i => i.photo as string);
        if (paths.length > 0) {
          const { data: signed } = await supabase.storage
            .from('item-photos')
            .createSignedUrls(paths, 3600);
          if (signed) {
            const urlMap = new Map(signed.map(s => [s.path, s.signedUrl]));
            setRoomItems(mapped.map(item => ({
              ...item,
              photo: item.photo ? (urlMap.get(item.photo) ?? item.photo) : item.photo,
            })) as Item[]);
            return;
          }
        }
        setRoomItems(mapped as Item[]);
      });
  }, [room]);

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
                  <p className="text-sm text-muted-foreground truncate">{getCategoryLabel(item.category)}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
