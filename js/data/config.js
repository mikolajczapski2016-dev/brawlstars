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
    'lavaking': 1500
};

// Dialog z bossem (zamek)
var bossDialogs = [
    { text: "Czekaj... to TY?!", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "Pamiętam cię, zombie. Byłeś moim najwierniejszym sługą!", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "Służyłeś mi wiernie przez setki lat... ale mnie zdradziłeś!", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "Przestałeś mi służyć, opuściłeś mój zamek, zbuntowałeś się!", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "Za to cię wygnałem do świata śmiertelników. Myślałem, że tam zgnijesz...", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "A teraz wracasz? Z twoimi wspomnieniami?", speaker: "👑 KRÓL CIEMNOŚCI" },
    { text: "...pamiętam... byłem królem... służyłem mu... ale on mnie zdradził!", speaker: "🧟 ZOMBIE" },
    { text: "TO JA BYŁEM ZDRADZONY! Zmienił mnie w potwora!", speaker: "🧟 ZOMBIE" },
    { text: "Teraz wszystko rozumiem. Zemścię się!", speaker: "🧟 ZOMBIE" },
    { text: "Zemsta? TWOJA?! To ja zapragnąłem zemsty za twoją zdradę! Teraz cię zniszczę!", speaker: "👑 KRÓL CIEMNOŚCI" }
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
    'UltraZombi': { icon: '🧟‍♀️', bg: '#e91e63' }
};
