export type Category = string; // stable dot-notation slug e.g. "elektronikk.mobil-nettbrett"
export type Condition = 'Ny' | 'God' | 'Slitt';
export type Room = string;

export interface CategoryNode {
  id: string;   // stable slug e.g. "elektronikk", "elektronikk.mobil-nettbrett"
  name: string; // Norwegian display label
  subcategories?: CategoryNode[];
}

export const categoryTree: CategoryNode[] = [
  {
    id: 'elektronikk',
    name: 'Elektronikk',
    subcategories: [
      { id: 'elektronikk.mobil-nettbrett', name: 'Mobil og nettbrett' },
      { id: 'elektronikk.tv-lyd', name: 'TV og lyd' },
      { id: 'elektronikk.datamaskiner-tilbehor', name: 'Datamaskiner og tilbehør' },
      { id: 'elektronikk.hvitevarer', name: 'Hvitevarer' },
      { id: 'elektronikk.foto-kamera', name: 'Foto og kamera' },
      { id: 'elektronikk.spillkonsoller-spill', name: 'Spillkonsoller og spill' },
      { id: 'elektronikk.nettverksutstyr', name: 'Nettverksutstyr' },
      { id: 'elektronikk.gps-navigasjon', name: 'GPS og navigasjon' },
      { id: 'elektronikk.annet', name: 'Annet elektronikk' },
    ],
  },
  {
    id: 'mobler-interior',
    name: 'Møbler og interiør',
    subcategories: [
      { id: 'mobler-interior.sofaer-lengestoler', name: 'Sofaer og lengestoler' },
      { id: 'mobler-interior.stoler-benker', name: 'Stoler og benker' },
      { id: 'mobler-interior.bord-spisegrupper', name: 'Bord og spisegrupper' },
      { id: 'mobler-interior.senger-madrasser', name: 'Senger og madrasser' },
      { id: 'mobler-interior.skap-kommoder', name: 'Skap og kommoder' },
      { id: 'mobler-interior.belysning', name: 'Belysning' },
      { id: 'mobler-interior.tepper-gardiner', name: 'Tepper og gardiner' },
      { id: 'mobler-interior.puter-tekstiler', name: 'Puter og tekstiler' },
      { id: 'mobler-interior.dekorasjon-kunst', name: 'Dekorasjon og kunst' },
      { id: 'mobler-interior.kjokkenutstyr-servise', name: 'Kjøkkenutstyr og servise' },
      { id: 'mobler-interior.annet', name: 'Annet møbler og interiør' },
    ],
  },
  {
    id: 'klaer-sko',
    name: 'Klær og sko',
    subcategories: [
      { id: 'klaer-sko.herre', name: 'Herre' },
      { id: 'klaer-sko.dame', name: 'Dame' },
      { id: 'klaer-sko.barn-ungdom', name: 'Barn og ungdom' },
      { id: 'klaer-sko.sko', name: 'Sko' },
      { id: 'klaer-sko.vesker-tilbehor', name: 'Vesker og tilbehør' },
      { id: 'klaer-sko.smykker-klokker', name: 'Smykker og klokker' },
      { id: 'klaer-sko.annet', name: 'Annet klær og sko' },
    ],
  },
  {
    id: 'sport-friluft',
    name: 'Sport og friluft',
    subcategories: [
      { id: 'sport-friluft.sykler-tilbehor', name: 'Sykler og tilbehør' },
      { id: 'sport-friluft.ski-vintersport', name: 'Ski og vintersport' },
      { id: 'sport-friluft.lop-trening', name: 'Løp og trening' },
      { id: 'sport-friluft.racketsport', name: 'Racketsport' },
      { id: 'sport-friluft.camping-friluft', name: 'Camping og friluft' },
      { id: 'sport-friluft.vannsport', name: 'Vannsport' },
      { id: 'sport-friluft.jakt-fiske', name: 'Jakt og fiske' },
      { id: 'sport-friluft.ridning', name: 'Ridning' },
      { id: 'sport-friluft.annet', name: 'Annet sport og friluft' },
    ],
  },
  {
    id: 'barneutstyr',
    name: 'Barneutstyr',
    subcategories: [
      { id: 'barneutstyr.barnevogner-sykler', name: 'Barnevogner og sykler' },
      { id: 'barneutstyr.bilseter', name: 'Bilseter' },
      { id: 'barneutstyr.leker-spill', name: 'Leker og spill' },
      { id: 'barneutstyr.barneklaer-sko', name: 'Barneklær og -sko' },
      { id: 'barneutstyr.mobler-utstyr', name: 'Møbler og utstyr til barn' },
      { id: 'barneutstyr.annet', name: 'Annet barneutstyr' },
    ],
  },
  {
    id: 'boker-musikk-film',
    name: 'Bøker, musikk og film',
    subcategories: [
      { id: 'boker-musikk-film.boker-blader', name: 'Bøker og blader' },
      { id: 'boker-musikk-film.musikkinstrumenter', name: 'Musikkinstrumenter' },
      { id: 'boker-musikk-film.film-dvd', name: 'Film og DVD' },
      { id: 'boker-musikk-film.musikk-cd-vinyl', name: 'Musikk (CD og vinyl)' },
      { id: 'boker-musikk-film.spill', name: 'Spill' },
      { id: 'boker-musikk-film.annet', name: 'Annet bøker, musikk og film' },
    ],
  },
  {
    id: 'hus-hage',
    name: 'Hus og hage',
    subcategories: [
      { id: 'hus-hage.verktoy-maskiner', name: 'Verktøy og maskiner' },
      { id: 'hus-hage.hageartikler-utemobler', name: 'Hageartikler og utemøbler' },
      { id: 'hus-hage.maling-byggevarer', name: 'Maling og byggevarer' },
      { id: 'hus-hage.rorleggerartikler', name: 'Rørleggerartikler' },
      { id: 'hus-hage.el-artikler', name: 'El-artikler' },
      { id: 'hus-hage.annet', name: 'Annet hus og hage' },
    ],
  },
  {
    id: 'hobby-samleobjekter',
    name: 'Hobby og samleobjekter',
    subcategories: [
      { id: 'hobby-samleobjekter.kunst-antikviteter', name: 'Kunst og antikviteter' },
      { id: 'hobby-samleobjekter.frimerker-mynter', name: 'Frimerker og mynter' },
      { id: 'hobby-samleobjekter.modeller-samleobjekter', name: 'Modeller og samleobjekter' },
      { id: 'hobby-samleobjekter.spill-brettspill', name: 'Spill og brettspill' },
      { id: 'hobby-samleobjekter.annet', name: 'Annet hobby og samleobjekter' },
    ],
  },
  {
    id: 'kjaeldyr',
    name: 'Kjæledyr',
    subcategories: [
      { id: 'kjaeldyr.hund', name: 'Hund' },
      { id: 'kjaeldyr.katt', name: 'Katt' },
      { id: 'kjaeldyr.fugl', name: 'Fugl' },
      { id: 'kjaeldyr.fisk-akvarium', name: 'Fisk og akvarium' },
      { id: 'kjaeldyr.gnagere', name: 'Gnagere' },
      { id: 'kjaeldyr.annet', name: 'Annet kjæledyr' },
    ],
  },
  {
    id: 'mat-drikke',
    name: 'Mat og drikke',
    subcategories: [
      { id: 'mat-drikke.vin-ol-sprit', name: 'Vin, øl og sprit' },
      { id: 'mat-drikke.annet', name: 'Annet mat og drikke' },
    ],
  },
  {
    id: 'kjoretoy',
    name: 'Kjøretøy',
    subcategories: [
      { id: 'kjoretoy.bil-motorsykkel', name: 'Bil og motorsykkel' },
      { id: 'kjoretoy.sykler-elsparkesykler', name: 'Sykler og elsparkesykler' },
      { id: 'kjoretoy.bildeler-tilbehor', name: 'Bildeler og tilbehør' },
      { id: 'kjoretoy.annet', name: 'Annet kjøretøy' },
    ],
  },
  { id: 'annet', name: 'Annet' },
];

export interface Item {
  id: string;
  name: string;
  category: Category;
  room: Room;
  placement: string;
  condition: Condition;
  estimatedValue?: number;
  notes?: string;
  photo: string;
  createdAt: Date;
}

// Mock data
export const mockItems: Item[] = [
  {
    id: '1',
    name: 'MacBook Pro',
    category: 'elektronikk.datamaskiner-tilbehor',
    room: 'Kontor',
    placement: 'Skrivebord',
    condition: 'God',
    estimatedValue: 15000,
    photo: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
    createdAt: new Date('2024-03-15'),
  },
  {
    id: '2',
    name: 'Bosch Drill',
    category: 'hus-hage.verktoy-maskiner',
    room: 'Garasje',
    placement: 'Verktøybenk, nederste skuff',
    condition: 'God',
    estimatedValue: 1200,
    photo: 'https://images.unsplash.com/photo-1572981779307-e6d70a87b98f?w=400',
    createdAt: new Date('2024-03-14'),
  },
  {
    id: '3',
    name: 'Eames Lenestol',
    category: 'mobler-interior.sofaer-lengestoler',
    room: 'Stue',
    placement: 'Ved vinduet',
    condition: 'God',
    estimatedValue: 8500,
    notes: 'Arvet fra bestemor',
    photo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400',
    createdAt: new Date('2024-03-13'),
  },
  {
    id: '4',
    name: 'KitchenAid Kjøkkenmaskin',
    category: 'mobler-interior.kjokkenutstyr-servise',
    room: 'Kjøkken',
    placement: 'Benkeskap under kaffemaskinen',
    condition: 'Ny',
    estimatedValue: 4500,
    photo: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400',
    createdAt: new Date('2024-03-10'),
  },
  {
    id: '5',
    name: 'Barbour Jakke',
    category: 'klaer-sko.herre',
    room: 'Gang',
    placement: 'Garderobeskap',
    condition: 'God',
    estimatedValue: 3200,
    photo: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
    createdAt: new Date('2024-03-08'),
  },
  {
    id: '6',
    name: 'Stihl Gressklipper',
    category: 'hus-hage.hageartikler-utemobler',
    room: 'Garasje',
    placement: 'Høyre vegg',
    condition: 'God',
    estimatedValue: 2800,
    photo: 'https://images.unsplash.com/photo-1592838644029-b7d1e6d840d5?w=400',
    createdAt: new Date('2024-03-05'),
  },
];

export const defaultRooms: string[] = ['Stue', 'Kjøkken', 'Garasje', 'Soverom', 'Bad', 'Gang', 'Kontor'];
export const conditions: Condition[] = ['Ny', 'God', 'Slitt'];

export interface FlatCategory { id: string; name: string; label: string; }

/** Flat list of all categories with stable IDs and display labels */
export function flattenCategories(nodes: CategoryNode[] = categoryTree, labelPrefix = ''): FlatCategory[] {
  return nodes.flatMap(node => {
    const label = labelPrefix ? `${labelPrefix} > ${node.name}` : node.name;
    const entry: FlatCategory = { id: node.id, name: node.name, label };
    return node.subcategories?.length
      ? [entry, ...flattenCategories(node.subcategories, label)]
      : [entry];
  });
}

/** Find the best-matching category ID for a raw string (e.g. from AI) */
export function matchCategory(raw: string): string {
  if (!raw) return 'annet';
  const all = flattenCategories();
  const lower = raw.toLowerCase();
  const exact = all.find(c => c.label.toLowerCase() === lower);
  if (exact) return exact.id;
  const leaf = all.find(c => {
    const l = c.name.toLowerCase();
    return l.includes(lower) || lower.includes(l);
  });
  if (leaf) return leaf.id;
  return all.find(c => c.label.toLowerCase().includes(lower))?.id ?? 'annet';
}

/** Lazy index for O(1) ID → label lookups */
const _byId = new Map<string, FlatCategory>();
function _index() { if (!_byId.size) flattenCategories().forEach(c => _byId.set(c.id, c)); }

/** Get a display label for a stored category value (ID or legacy path string) */
export function getCategoryLabel(value: string): string {
  if (!value) return '';
  _index();
  const found = _byId.get(value);
  if (found) return found.label;
  // Backward compat: old " > " path strings shown as-is
  return value;
}
