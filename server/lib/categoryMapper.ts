import type { Category, Condition } from '../../src/app/lib/data.js';

// English label → Norwegian Category
const labelToCategory: Record<string, Category> = {
  // Elektronikk
  laptop: 'Elektronikk',
  computer: 'Elektronikk',
  smartphone: 'Elektronikk',
  phone: 'Elektronikk',
  tablet: 'Elektronikk',
  television: 'Elektronikk',
  tv: 'Elektronikk',
  monitor: 'Elektronikk',
  keyboard: 'Elektronikk',
  mouse: 'Elektronikk',
  camera: 'Elektronikk',
  headphones: 'Elektronikk',
  speaker: 'Elektronikk',
  electronics: 'Elektronikk',
  'computer hardware': 'Elektronikk',
  'output device': 'Elektronikk',
  // Møbler
  chair: 'Møbler',
  table: 'Møbler',
  desk: 'Møbler',
  sofa: 'Møbler',
  couch: 'Møbler',
  bed: 'Møbler',
  shelf: 'Møbler',
  bookcase: 'Møbler',
  cabinet: 'Møbler',
  wardrobe: 'Møbler',
  furniture: 'Møbler',
  // Verktøy
  drill: 'Verktøy',
  hammer: 'Verktøy',
  screwdriver: 'Verktøy',
  saw: 'Verktøy',
  wrench: 'Verktøy',
  tool: 'Verktøy',
  toolbox: 'Verktøy',
  'lawn mower': 'Verktøy',
  // Kjøkkenutstyr
  'kitchen appliance': 'Kjøkkenutstyr',
  blender: 'Kjøkkenutstyr',
  toaster: 'Kjøkkenutstyr',
  microwave: 'Kjøkkenutstyr',
  oven: 'Kjøkkenutstyr',
  pot: 'Kjøkkenutstyr',
  pan: 'Kjøkkenutstyr',
  knife: 'Kjøkkenutstyr',
  cutlery: 'Kjøkkenutstyr',
  dishwasher: 'Kjøkkenutstyr',
  refrigerator: 'Kjøkkenutstyr',
  // Klær
  clothing: 'Klær',
  shirt: 'Klær',
  jacket: 'Klær',
  coat: 'Klær',
  pants: 'Klær',
  shoes: 'Klær',
  boot: 'Klær',
  dress: 'Klær',
  hat: 'Klær',
};

// English name → Norwegian translation for item names
const nameTranslation: Record<string, string> = {
  laptop: 'Bærbar PC',
  computer: 'Datamaskin',
  smartphone: 'Smarttelefon',
  phone: 'Telefon',
  tablet: 'Nettbrett',
  television: 'TV',
  monitor: 'Skjerm',
  keyboard: 'Tastatur',
  camera: 'Kamera',
  headphones: 'Hodetelefoner',
  speaker: 'Høyttaler',
  chair: 'Stol',
  table: 'Bord',
  desk: 'Skrivebord',
  sofa: 'Sofa',
  bed: 'Seng',
  shelf: 'Hylle',
  bookcase: 'Bokhylle',
  cabinet: 'Skap',
  wardrobe: 'Klesskap',
  drill: 'Drill',
  hammer: 'Hammer',
  screwdriver: 'Skrutrekker',
  saw: 'Sag',
  wrench: 'Skiftenøkkel',
  toolbox: 'Verktøykasse',
  blender: 'Blender',
  toaster: 'Brødrister',
  microwave: 'Mikrobølgeovn',
  oven: 'Ovn',
  pot: 'Gryte',
  pan: 'Stekepanne',
  knife: 'Kniv',
  refrigerator: 'Kjøleskap',
  dishwasher: 'Oppvaskmaskin',
  jacket: 'Jakke',
  coat: 'Frakk',
  shoes: 'Sko',
  hat: 'Hatt',
};

export interface MappedResult {
  name: string;
  category: Category;
  condition: Condition;
}

export function mapLabelsToItem(
  labels: string[],
  objects: string[]
): MappedResult {
  // Objects are more specific (e.g. "Drill" vs generic "Tool")
  const allTerms = [...objects, ...labels].map((t) => t.toLowerCase());

  // Pick name from first recognized object, then first recognized label
  let name = 'Ukjent gjenstand';
  for (const term of allTerms) {
    const translated = nameTranslation[term];
    if (translated) {
      name = translated;
      break;
    }
  }
  // If no translation found, use the first object name as-is (capitalize)
  if (name === 'Ukjent gjenstand' && objects.length > 0) {
    name = objects[0].charAt(0).toUpperCase() + objects[0].slice(1);
  }

  // Pick category from first matching term
  let category: Category = 'Annet';
  for (const term of allTerms) {
    const mapped = labelToCategory[term];
    if (mapped) {
      category = mapped;
      break;
    }
  }

  // Vision API cannot assess wear — default to 'God', user can override
  const condition: Condition = 'God';

  return { name, category, condition };
}
