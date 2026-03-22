export type Category = 'Elektronikk' | 'Møbler' | 'Verktøy' | 'Kjøkkenutstyr' | 'Klær' | 'Annet';
export type Condition = 'Ny' | 'God' | 'Slitt';
export type Room = 'Stue' | 'Kjøkken' | 'Garasje' | 'Soverom' | 'Bad' | 'Gang' | 'Kontor';

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
    category: 'Elektronikk',
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
    category: 'Verktøy',
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
    category: 'Møbler',
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
    category: 'Kjøkkenutstyr',
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
    category: 'Klær',
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
    category: 'Verktøy',
    room: 'Garasje',
    placement: 'Høyre vegg',
    condition: 'God',
    estimatedValue: 2800,
    photo: 'https://images.unsplash.com/photo-1592838644029-b7d1e6d840d5?w=400',
    createdAt: new Date('2024-03-05'),
  },
];

export const rooms: Room[] = ['Stue', 'Kjøkken', 'Garasje', 'Soverom', 'Bad', 'Gang', 'Kontor'];
export const categories: Category[] = ['Elektronikk', 'Møbler', 'Verktøy', 'Kjøkkenutstyr', 'Klær', 'Annet'];
export const conditions: Condition[] = ['Ny', 'God', 'Slitt'];
