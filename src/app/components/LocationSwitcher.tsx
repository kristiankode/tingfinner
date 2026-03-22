import { ChevronDown, Home, TreePine, Anchor, Building2, MapPin, Layers } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet'
import { useState } from 'react'
import { useHousehold } from '../context/HouseholdContext'
import type { LocationType } from '../lib/data'

const locationIcons: Record<LocationType, React.ElementType> = {
  hus: Home,
  hytte: TreePine,
  bat: Anchor,
  leilighet: Building2,
  annet: MapPin,
}

export function LocationSwitcher() {
  const { locations, activeLocationId, setActiveLocationId } = useHousehold()
  const [open, setOpen] = useState(false)

  const active = locations.find(l => l.id === activeLocationId)
  const Icon = active ? locationIcons[active.type] : Layers

  function select(id: string | null) {
    setActiveLocationId(id)
    setOpen(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary rounded-full text-sm hover:bg-muted transition-colors"
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        <span className="max-w-[110px] truncate">{active?.name ?? 'Alle steder'}</span>
        <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[70vh] flex flex-col p-0 rounded-t-2xl">
          <SheetHeader className="px-4 pt-4 pb-3 border-b border-border shrink-0">
            <SheetTitle className="text-base text-left">Velg sted</SheetTitle>
          </SheetHeader>

          <div className="overflow-y-auto">
            <button
              onClick={() => select(null)}
              className={`w-full flex items-center gap-3 px-4 py-4 border-b border-border transition-colors ${
                !activeLocationId ? 'bg-primary/5' : 'hover:bg-muted'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <Layers className="h-4 w-4 text-muted-foreground" />
              </div>
              <span className={`text-sm font-medium ${!activeLocationId ? 'text-primary' : ''}`}>
                Alle steder
              </span>
            </button>

            {locations.map(loc => {
              const LocIcon = locationIcons[loc.type]
              const isActive = loc.id === activeLocationId
              return (
                <button
                  key={loc.id}
                  onClick={() => select(loc.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 border-b border-border transition-colors ${
                    isActive ? 'bg-primary/5' : 'hover:bg-muted'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <LocIcon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <span className={`text-sm font-medium ${isActive ? 'text-primary' : ''}`}>
                    {loc.name}
                  </span>
                </button>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
