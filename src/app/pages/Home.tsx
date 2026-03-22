import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Camera, X, LogOut } from 'lucide-react';
import { rooms, getCategoryLabel, type Room, type Item } from '../lib/data';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function Home() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([]);
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
      .then(async ({ data }) => {
        if (!data) return;
        const mapped = data.map(row => ({
          ...row,
          estimatedValue: row.estimated_value,
          createdAt: new Date(row.created_at),
        }));

        // Generate signed URLs for all items that have a photo path
        const paths = mapped.filter(i => i.photo).map(i => i.photo as string);
        if (paths.length > 0) {
          const { data: signed } = await supabase.storage
            .from('item-photos')
            .createSignedUrls(paths, 3600);
          if (signed) {
            const urlMap = new Map(signed.map(s => [s.path, s.signedUrl]));
            setItems(mapped.map(item => ({
              ...item,
              photo: item.photo ? (urlMap.get(item.photo) ?? item.photo) : item.photo,
            })) as Item[]);
            return;
          }
        }
        setItems(mapped as Item[]);
      });
  }, []);

  const toggleRoom = (room: Room) => {
    setSelectedRooms(prev =>
      prev.includes(room) ? prev.filter(r => r !== room) : [...prev, room]
    );
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRoom = selectedRooms.length === 0 || selectedRooms.includes(item.room);
    return matchesSearch && matchesRoom;
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1>Tingfinner</h1>
            <Button onClick={handleSignOut} variant="ghost" size="icon" className="rounded-full">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Søk etter gjenstander..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-input-background border-input rounded-xl"
            />
          </div>
        </div>

        {/* Room Filter Chips */}
        <div className="px-4 pb-4 flex gap-2 overflow-x-auto scrollbar-hide">
          {rooms.map(room => {
            const isSelected = selectedRooms.includes(room);
            const roomCount = items.filter(item => item.room === room).length;
            return (
              <button
                key={room}
                onClick={() => toggleRoom(room)}
                onDoubleClick={() => navigate(`/room/${room}`)}
                className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }`}
              >
                {room} ({roomCount})
                {isSelected && <X className="inline-block ml-1 h-3 w-3" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Item List */}
      <div className="px-4 py-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Ingen gjenstander funnet</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <Card
              key={item.id}
              onClick={() => navigate(`/item/${item.id}`)}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <img
                  src={item.photo}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-lg bg-muted"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1 truncate">{item.name}</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{getCategoryLabel(item.category)}</p>
                    <p className="text-sm text-muted-foreground">{item.room}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Floating Action Button */}
      <Button
        onClick={() => navigate('/camera')}
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-20"
        size="icon"
      >
        <Camera className="h-7 w-7" />
      </Button>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}