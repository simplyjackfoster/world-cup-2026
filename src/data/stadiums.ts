import { Fixture } from './groups';

export interface Stadium {
  id: string;
  stadiumName: string;
  city: string;
  country: 'USA' | 'Canada' | 'Mexico';
  capacity: number;
  matches: Fixture['id'][];
}

export const STADIUMS: Stadium[] = [
  {
    id: 'azteca',
    stadiumName: 'Estadio Azteca',
    city: 'Mexico City',
    country: 'Mexico',
    capacity: 87000,
    matches: ['A-1', 'C-2', 'K-1'],
  },
  {
    id: 'metlife',
    stadiumName: 'MetLife Stadium',
    city: 'East Rutherford',
    country: 'USA',
    capacity: 82500,
    matches: ['B-1', 'F-2', 'H-1', 'R32-1'],
  },
  {
    id: 'sofistadium',
    stadiumName: 'SoFi Stadium',
    city: 'Los Angeles',
    country: 'USA',
    capacity: 70000,
    matches: ['D-2', 'G-1', 'R16-4'],
  },
  {
    id: 'bcplace',
    stadiumName: 'BC Place',
    city: 'Vancouver',
    country: 'Canada',
    capacity: 54000,
    matches: ['E-1', 'I-2', 'SF-1'],
  },
  {
    id: 'lumen',
    stadiumName: 'Lumen Field',
    city: 'Seattle',
    country: 'USA',
    capacity: 68000,
    matches: ['J-2', 'L-1', 'QF-2'],
  },
  {
    id: 'mercedes',
    stadiumName: 'Mercedes-Benz Stadium',
    city: 'Atlanta',
    country: 'USA',
    capacity: 71000,
    matches: ['R32-8', 'R16-1', '3P-1'],
  },
];
