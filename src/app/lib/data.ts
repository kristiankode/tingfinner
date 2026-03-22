export type Category = string; // hierarchical path, e.g. "Elektronikk > Mobil og nettbrett"
export type Condition = 'Ny' | 'God' | 'Slitt';
export type Room = 'Stue' | 'Kjøkken' | 'Garasje' | 'Soverom' | 'Bad' | 'Gang' | 'Kontor';

export interface CategoryNode {
  name: string;
  subcategories?: CategoryNode[];
}

export const categoryTree: CategoryNode[] = [
  {
    name: 'Elektronikk',
    subcategories: [
      { name: 'Mobil og nettbrett' },
      { name: 'TV og lyd' },
      { name: 'Datamaskiner og tilbehør' },
      { name: 'Hvitevarer' },
      { name: 'Foto og kamera' },
      { name: 'Spillkonsoller og spill' },
      { name: 'Nettverksutstyr' },
      { name: 'GPS og navigasjon' },
      { name: 'Annet elektronikk' },
    ],
  },
  {
    name: 'Møbler og interiør',
    subcategories: [
      { name: 'Sofaer og lengestoler' },
      { name: 'Stoler og benker' },
      { name: 'Bord og spisegrupper' },
      { name: 'Senger og madrasser' },
      { name: 'Skap og kommoder' },
      { name: 'Belysning' },
      { name: 'Tepper og gardiner' },
      { name: 'Puter og tekstiler' },
      { name: 'Dekorasjon og kunst' },
      { name: 'Kjøkkenutstyr og servise' },
      { name: 'Annet møbler og interiør' },
    ],
  },
  {
    name: 'Klær og sko',
    subcategories: [
      { name: 'Herre' },
      { name: 'Dame' },
      { name: 'Barn og ungdom' },
      { name: 'Sko' },
      { name: 'Vesker og tilbehør' },
      { name: 'Smykker og klokker' },
      { name: 'Annet klær og sko' },
    ],
  },
  {
    name: 'Sport og friluft',
    subcategories: [
      { name: 'Sykler og tilbehør' },
      { name: 'Ski og vintersport' },
      { name: 'Løp og trening' },
      { name: 'Racketsport' },
      { name: 'Camping og friluft' },
      { name: 'Vannsport' },
      { name: 'Jakt og fiske' },
      { name: 'Ridning' },
      { name: 'Annet sport og friluft' },
    ],
  },
  {
    name: 'Barneutstyr',
    subcategories: [
      { name: 'Barnevogner og sykler' },
      { name: 'Bilseter' },
      { name: 'Leker og spill' },
      { name: 'Barneklær og -sko' },
      { name: 'Møbler og utstyr til barn' },
      { name: 'Annet barneutstyr' },
    ],
  },
  {
    name: 'Bøker, musikk og film',
    subcategories: [
      { name: 'Bøker og blader' },
      { name: 'Musikkinstrumenter' },
      { name: 'Film og DVD' },
      { name: 'Musikk (CD og vinyl)' },
      { name: 'Spill' },
      { name: 'Annet bøker, musikk og film' },
    ],
  },
  {
    name: 'Hus og hage',
    subcategories: [
      { name: 'Verktøy og maskiner' },
      { name: 'Hageartikler og utemøbler' },
      { name: 'Maling og byggevarer' },
      { name: 'Rørleggerartikler' },
      { name: 'El-artikler' },
      { name: 'Annet hus og hage' },
    ],
  },
  {
    name: 'Hobby og samleobjekter',
    subcategories: [
      { name: 'Kunst og antikviteter' },
      { name: 'Frimerker og mynter' },
      { name: 'Modeller og samleobjekter' },
      { name: 'Spill og brettspill' },
      { name: 'Annet hobby og samleobjekter' },
    ],
  },
  {
    name: 'Kjæledyr',
    subcategories: [
      { name: 'Hund' },
      { name: 'Katt' },
      { name: 'Fugl' },
      { name: 'Fisk og akvarium' },
      { name: 'Gnagere' },
      { name: 'Annet kjæledyr' },
    ],
  },
  {
    name: 'Mat og drikke',
    subcategories: [
      { name: 'Vin, øl og sprit' },
      { name: 'Annet mat og drikke' },
    ],
  },
  { name: 'Annet' },
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
    category: 'Elektronikk > Datamaskiner og tilbehør',
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
    category: 'Hus og hage > Verktøy og maskiner',
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
    category: 'Møbler og interiør > Sofaer og lengestoler',
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
    category: 'Møbler og interiør > Kjøkkenutstyr og servise',
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
    category: 'Klær og sko > Herre',
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
    category: 'Hus og hage > Hageartikler og utemøbler',
    room: 'Garasje',
    placement: 'Høyre vegg',
    condition: 'God',
    estimatedValue: 2800,
    photo: 'https://images.unsplash.com/photo-1592838644029-b7d1e6d840d5?w=400',
    createdAt: new Date('2024-03-05'),
  },
];

export const rooms: Room[] = ['Stue', 'Kjøkken', 'Garasje', 'Soverom', 'Bad', 'Gang', 'Kontor'];
export const conditions: Condition[] = ['Ny', 'God', 'Slitt'];

/** Flat list of all category paths for matching/display */
export function flattenCategories(nodes: CategoryNode[] = categoryTree, prefix = ''): string[] {
  return nodes.flatMap(node => {
    const path = prefix ? `${prefix} > ${node.name}` : node.name;
    if (node.subcategories?.length) {
      return [path, ...flattenCategories(node.subcategories, path)];
    }
    return [path];
  });
}

/** Find the best-matching category path for a raw string (e.g. from AI) */
export function matchCategory(raw: string): string {
  if (!raw) return 'Annet';
  const all = flattenCategories();
  const lower = raw.toLowerCase();
  // Exact match first
  const exact = all.find(c => c.toLowerCase() === lower);
  if (exact) return exact;
  // Starts-with / contains on leaf name
  const leaf = all.find(c => {
    const leafName = c.split(' > ').pop()!.toLowerCase();
    return leafName.includes(lower) || lower.includes(leafName);
  });
  if (leaf) return leaf;
  // Parent-level contains
  const parent = all.find(c => c.toLowerCase().includes(lower) || lower.includes(c.toLowerCase()));
  return parent ?? 'Annet';
}
