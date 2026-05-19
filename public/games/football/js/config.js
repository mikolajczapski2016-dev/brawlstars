// ============ KONFIGURACJA MINI PIŁKA ============

var FOOTBALL_FIELD_W = 1000;
var FOOTBALL_FIELD_H = 600;
var MATCH_DURATION = 120; // sekundy
var GOAL_WIDTH = 20;
var GOAL_HEIGHT = 120;

// Nagrody za mecz
var MATCH_REWARDS = {
    win: { min: 100, max: 300 },
    draw: 50,
    loss: 10
};

// Dostępni piłkarze do kupienia
var FOOTBALL_PLAYERS = [
    { id: 'basic', name: 'Kamil', icon: '⚽', position: 'Napastnik', speed: 3, shot: 5, defense: 2, price: 0, color: '#4caf50' },
    { id: 'keeper', name: 'Wojtek', icon: '🧤', position: 'Bramkarz', speed: 2, shot: 1, defense: 8, price: 0, color: '#ff9800' },
    { id: 'defender', name: 'Jan', icon: '🛡️', position: 'Obrońca', speed: 2.5, shot: 2, defense: 7, price: 200, color: '#2196f3' },
    { id: 'fast', name: 'Piotrek', icon: '💨', position: 'Skrzydłowy', speed: 5, shot: 3, defense: 2, price: 300, color: '#9c27b0' },
    { id: 'sniper', name: 'Robert', icon: '🎯', position: 'Strzelec', speed: 3, shot: 8, defense: 1, price: 500, color: '#f44336' },
    { id: 'tank', name: 'Grzegorz', icon: '🏔️', position: 'Stoper', speed: 1.5, shot: 2, defense: 9, price: 600, color: '#795548' },
    { id: 'star', name: 'Lewy', icon: '⭐', position: 'Gwiazda', speed: 4, shot: 9, defense: 4, price: 1500, color: '#ffd700' },
    { id: 'legend', name: 'Zidane', icon: '🌟', position: 'Legenda', speed: 4.5, shot: 8, defense: 6, price: 3000, color: '#e91e63' }
];

// Kolory drużyn
var TEAM_PLAYER_COLOR = '#2196f3'; // niebiescy
var TEAM_ENEMY_COLOR = '#e53935';   // czerwoni
var BALL_COLOR = '#ffffff';
var FIELD_COLOR = '#2e7d32';
var FIELD_LINES = '#ffffff';
