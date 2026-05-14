// Ceny ulepszeń (poziomy 1-9)
var upgradePrices = [100, 150, 250, 400, 600, 900, 1300, 1800, 2500];

// Wymiary areny gry
var ARENA_W = 1200;
var ARENA_H = 800;

// Ceny skinów (do kupienia w grze)
var skinPrices = {
    'default': 0,
    'scary': 500,
    'golden': 1000,
    'ninja': 750,
    'cosmic': 600,
    'grill': 800,
    'goldbacon': 1200,
    'burnt': 400,
    'aurora': 700,
    'diamond': 900,
    'darkfrost': 450,
    'lavaking': 1500,
    'badzombi': 800
};

// Dialog z bossem (zamek)
var bossDialogs = [
    { text: "Czekaj... to TY?!", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "Ty... żywy?! Nie powinieneś tu wchodzić!", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "Jesteś tylko zwykłym zombie z wioski... ale masz w sobie coś innego.", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "Czułem, że kiedyś ktoś przyjdzie mnie pokonać. Myślałem, że zgnijesz na arenie!", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "A jednak dotarłeś przez cały zamek. Jesteś wyjątkowy...", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "Ale to koniec! Nikt nie pokona Króla Ciemności!", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "...ja... ja nie jestem twoim sługą!", speaker: "🧟 ZOMBIE" },
    { text: "Zmieniłeś mnie w potwora i terroryzujesz świat!", speaker: "🧟 ZOMBIE" },
    { text: "Teraz wszystko rozumiem. Pokonam cię i uratuję świat!", speaker: "🧟 ZOMBIE" },
    { text: "Uratujesz?! Głupcze! Ja JESTEM światem! Teraz cię zniszczę!", speaker: "👑 KRÓL CIEMNOŚCI" }
];

// adminCode zdefiniowany w js/ui/panels.js

// Kolory postaci dla listy wyboru (używane przez refreshCharList())
var charColors = {
    'Zombie': { icon: '🧟', bg: '#5d8a66' },
    'Blazer': { icon: '🥓', bg: '#e85d04' },
    'Frostik': { icon: '❄️', bg: '#29b6f6' },
    'Cieniak': { icon: '🌑', bg: '#311b92' },
    'Magmak': { icon: '🏔️', bg: '#ff5722' },
    'Toksyk': { icon: '🟢', bg: '#66bb6a' },
    'Duszek': { icon: '⚪', bg: '#bdbdbd' },
    'Złotek': { icon: '👑', bg: '#ffd700' },
    'UltraZombi': { icon: '🧟‍♀️', bg: '#e91e63' },
    'Czarodziej': { icon: '🔮', bg: '#7b1fa2' }
};
