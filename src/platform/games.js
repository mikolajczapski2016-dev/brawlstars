import { zombieStoryGame } from '../games/zombie-story/index.js';

export const games = [
  zombieStoryGame,
  {
    id: 'cosmic-mission',
    title: 'Kosmiczna Misja',
    subtitle: 'Rakiety, planety i gwiazdy',
    description: 'Przeleć przez kosmos i zbieraj gwiezdne monety.',
    icon: '🚀',
    badge: 'Wkrótce',
    tag: 'Kosmos',
    status: 'soon',
    accent: '#62d9ff'
  },
  {
    id: 'robot-race',
    title: 'Wyścig Robotów',
    subtitle: 'Szybkie tory i turbo',
    description: 'Zbuduj robota i wygraj kolorowy wyścig.',
    icon: '🤖',
    badge: 'Wkrótce',
    tag: 'Wyścigi',
    status: 'soon',
    accent: '#ffca3a'
  },
  {
    id: 'dragon-arena',
    title: 'Smocza Arena',
    subtitle: 'Ogień, skarby i magia',
    description: 'Oswajaj smoki i broń zamku przed potworami.',
    icon: '🐉',
    badge: 'Wkrótce',
    tag: 'Fantasy',
    status: 'soon',
    accent: '#ff5c8a'
  },
  {
    id: 'pirate-adventure',
    title: 'Piracka Przygoda',
    subtitle: 'Wyspy, statki i złoto',
    description: 'Szukaj skarbów i uciekaj przed morskimi potworami.',
    icon: '🏴‍☠️',
    badge: 'Wkrótce',
    tag: 'Przygoda',
    status: 'soon',
    accent: '#b36bff'
  },
  {
    id: 'mini-football',
    title: 'Mini Piłka',
    subtitle: 'Mecze na małym boisku',
    description: 'Strzelaj gole, rób zwody i wygraj puchar.',
    icon: '⚽',
    badge: 'Wkrótce',
    tag: 'Sport',
    status: 'soon',
    accent: '#42ff9e'
  }
];
