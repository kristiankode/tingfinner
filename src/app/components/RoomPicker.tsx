import { useState, useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { defaultRooms } from '../lib/data';
import { supabase } from '../lib/supabase';

interface Props {
  value: string;
  onChange: (value: string) => void;
  userId: string;
}

export function RoomPicker({ value, onChange, userId }: Props) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [existingRooms, setExistingRooms] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleOpen() {
    setInputValue(value);
    const { data } = await supabase
      .from('items')
      .select('room')
      .eq('user_id', userId)
      .order('room');
    const fetched = data ? [...new Set(data.map((r: { room: string }) => r.room))].sort() : [];
    setExistingRooms(fetched.length > 0 ? fetched : defaultRooms);
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }

  function confirm(room: string) {
    if (!room.trim()) return;
    onChange(room.trim());
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="w-full flex items-center justify-between px-4 py-3 bg-input-background rounded-xl text-sm text-left hover:bg-muted transition-colors"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || 'Velg rom'}
        </span>
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-[70vh] flex flex-col p-0 rounded-t-2xl">
          <SheetHeader className="px-4 pt-4 pb-2 border-b border-border shrink-0">
            <SheetTitle className="text-base text-left">Velg rom</SheetTitle>
          </SheetHeader>

          {/* Text input for custom room */}
          <div className="px-4 py-3 border-b border-border shrink-0 flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); confirm(inputValue); } }}
              placeholder="Skriv romnavn..."
              className="bg-input-background rounded-xl flex-1"
            />
            <Button type="button" onClick={() => confirm(inputValue)} className="rounded-xl shrink-0">
              Bekreft
            </Button>
          </div>

          {/* Existing rooms list */}
          <div className="flex-1 overflow-y-auto">
            {existingRooms.map(room => {
              const isSelected = value === room;
              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => confirm(room)}
                  className={`w-full flex items-center justify-between px-4 py-4 border-b border-border transition-colors ${
                    isSelected ? 'bg-primary/5' : 'hover:bg-muted'
                  }`}
                >
                  <span className={`text-sm ${isSelected ? 'text-primary font-medium' : 'text-foreground'}`}>
                    {room}
                  </span>
                  {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
