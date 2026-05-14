// Nagrody z drogi robuxów (odblokowanie postaci)
var robuxRewards = [
    { req: 10, prize: '🥓 Postać: Blazer', type: 'character', charName: 'Blazer', rarity: 'common', rarityColor: '#9e9e9e', rarityName: 'ZWYKŁA' },
    { req: 25, prize: '❄️ Postać: Frostik', type: 'character', charName: 'Frostik', rarity: 'uncommon', rarityColor: '#4caf50', rarityName: 'NIEZWYKŁA' },
    { req: 60, prize: '🌑 Postać: Cieniak', type: 'character', charName: 'Cieniak', rarity: 'rare', rarityColor: '#2196f3', rarityName: 'RZADKA' },
    { req: 150, prize: '🔥 Postać: Magmak', type: 'character', charName: 'Magmak', rarity: 'epic', rarityColor: '#9c27b0', rarityName: 'EPICKA' },
    { req: 300, prize: '☠️ Postać: Toksyk', type: 'character', charName: 'Toksyk', rarity: 'epic', rarityColor: '#9c27b0', rarityName: 'EPICKA' },
    { req: 500, prize: '👻 Postać: Duszek', type: 'character', charName: 'Duszek', rarity: 'mythic', rarityColor: '#ff9800', rarityName: 'MITYCZNA' },
    { req: 1000, prize: '👑 Postać: Złotek', type: 'character', charName: 'Złotek', rarity: 'legendary', rarityColor: '#f44336', rarityName: 'LEGENDARNA' },
    { req: 2000, prize: '💀 Postać: UltraZombi', type: 'character', charName: 'UltraZombi', rarity: 'ultralegendarny', rarityColor: '#ff69b4', rarityName: 'ULTRALEGENDARNA' }
];

// Nagrody z drogi pucharów
var trophyRewards = [
    // Poziomy 1-10 (10-500 pucharów) - monety i robuxy
    { req: 10, prize: '💰 100 monet', type: 'coins', amount: 100 },
    { req: 25, prize: '💎 5 robuxów', type: 'robux', amount: 5 },
    { req: 50, prize: '💰 250 monet', type: 'coins', amount: 250 },
    { req: 100, prize: '💎 10 robuxów', type: 'robux', amount: 10 },
    { req: 150, prize: '💰 400 monet', type: 'coins', amount: 400 },
    { req: 250, prize: '👹 Skórka: Scary Zombie', type: 'skin', skinId: 'scary' },
    { req: 400, prize: '💰 800 monet', type: 'coins', amount: 800 },
    { req: 500, prize: '💎 15 robuxów', type: 'robux', amount: 15 },
    { req: 750, prize: '💰 1200 monet', type: 'coins', amount: 1200 },
    { req: 1000, prize: '🌟 Skórka: Złoty Zombie', type: 'skin', skinId: 'golden' },
    // Poziomy 11-20 (1500-5000 pucharów)
    { req: 1500, prize: '💰 2000 monet', type: 'coins', amount: 2000 },
    { req: 2000, prize: '💎 20 robuxów', type: 'robux', amount: 20 },
    { req: 2500, prize: '💰 3000 monet', type: 'coins', amount: 3000 },
    { req: 3000, prize: '🥷 Skórka: Ninja Zombie', type: 'skin', skinId: 'ninja' },
    { req: 3500, prize: '💎 25 robuxów', type: 'robux', amount: 25 },
    { req: 4000, prize: '💰 5000 monet', type: 'coins', amount: 5000 },
    { req: 4500, prize: '💎 30 robuxów', type: 'robux', amount: 30 },
    { req: 5000, prize: '🚀 Skórka: Kosmiczny Zombie', type: 'skin', skinId: 'cosmic' },
    { req: 6000, prize: '💰 8000 monet', type: 'coins', amount: 8000 },
    { req: 7000, prize: '💎 35 robuxów', type: 'robux', amount: 35 },
    // Poziomy 21-30 (8000-20000 pucharów)
    { req: 8000, prize: '💰 10000 monet', type: 'coins', amount: 10000 },
    { req: 9000, prize: '💎 40 robuxów', type: 'robux', amount: 40 },
    { req: 10000, prize: '🔥 Skórka: Grill Master Blazer', type: 'skin', skinId: 'grill' },
    { req: 12000, prize: '💰 15000 monet', type: 'coins', amount: 15000 },
    { req: 14000, prize: '💎 45 robuxów', type: 'robux', amount: 45 },
    { req: 16000, prize: '💰 20000 monet', type: 'coins', amount: 20000 },
    { req: 18000, prize: '🥇 Skórka: Złoty Boczek', type: 'skin', skinId: 'goldbacon' },
    { req: 20000, prize: '💎 50 robuxów', type: 'robux', amount: 50 },
    { req: 25000, prize: '💰 30000 monet', type: 'coins', amount: 30000 },
    { req: 30000, prize: '⚫ Skórka: Spalony Boczek', type: 'skin', skinId: 'burnt' },
    // Poziomy 31-40 (35000-60000 pucharów)
    { req: 35000, prize: '💎 60 robuxów', type: 'robux', amount: 60 },
    { req: 40000, prize: '💰 50000 monet', type: 'coins', amount: 50000 },
    { req: 45000, prize: '🌌 Skórka: Aurora Frost', type: 'skin', skinId: 'aurora' },
    { req: 50000, prize: '💎 75 robuxów', type: 'robux', amount: 75 },
    { req: 55000, prize: '💰 75000 monet', type: 'coins', amount: 75000 },
    { req: 60000, prize: '💎 Skórka: Diamond Ice', type: 'skin', skinId: 'diamond' },
    { req: 65000, prize: '💰 90000 monet', type: 'coins', amount: 90000 },
    { req: 70000, prize: '💎 100 robuxów', type: 'robux', amount: 100 },
    { req: 80000, prize: '💰 120000 monet', type: 'coins', amount: 120000 },
    { req: 90000, prize: '🌑 Skórka: Dark Frost', type: 'skin', skinId: 'darkfrost' },
    // Poziomy 41-50 (95000-100000 pucharów) - mega nagrody
    { req: 95000, prize: '💎 150 robuxów', type: 'robux', amount: 150 },
    { req: 100000, prize: '💰 200000 monet + 💎 200 robuxów', type: 'mixed', coins: 200000, robux: 200 }
];

// Rzadkości Star Drop
var starRarities = [
    { name: 'rzadki', color: '#42a5f5', chance: 40 },      // 40% - niebieski
    { name: 'bardzo rzadki', color: '#66bb6a', chance: 25 }, // 25% - zielony
    { name: 'epicki', color: '#ab47bc', chance: 20 },      // 20% - fioletowy
    { name: 'mityczny', color: '#ff9800', chance: 10 },    // 10% - pomarańczowy
    { name: 'legendarny', color: '#ffd700', chance: 4 },   // 4% - złoty
    { name: 'ultralegendarny', color: '#ff69b4', chance: 1 } // 1% - różowy
];

// Nagrody dla każdej rzadkości Star Drop
var starRewards = {
    'rzadki': [
        { type: 'coins', amount: 100 },
        { type: 'coins', amount: 150 },
        { type: 'coins', amount: 200 },
        { type: 'robux', amount: 5 }
    ],
    'bardzo rzadki': [
        { type: 'coins', amount: 300 },
        { type: 'coins', amount: 400 },
        { type: 'coins', amount: 500 },
        { type: 'robux', amount: 10 },
        { type: 'robux', amount: 15 }
    ],
    'epicki': [
        { type: 'coins', amount: 600 },
        { type: 'coins', amount: 800 },
        { type: 'coins', amount: 1000 },
        { type: 'robux', amount: 20 },
        { type: 'robux', amount: 25 }
    ],
    'mityczny': [
        { type: 'coins', amount: 1500 },
        { type: 'coins', amount: 2000 },
        { type: 'robux', amount: 50 },
        { type: 'skin', skinId: 'scary' },
        { type: 'skin', skinId: 'ninja' },
        { type: 'skin', skinId: 'cosmic' },
        { type: 'skin', skinId: 'aurora' },
        { type: 'character', charName: 'Frostik' },
        { type: 'character', charName: 'Cieniak' }
    ],
    'legendarny': [
        { type: 'coins', amount: 5000 },
        { type: 'coins', amount: 8000 },
        { type: 'robux', amount: 100 },
        { type: 'skin', skinId: 'golden' },
        { type: 'skin', skinId: 'goldbacon' },
        { type: 'skin', skinId: 'grill' },
        { type: 'skin', skinId: 'diamond' },
        { type: 'character', charName: 'Cieniak' },
        { type: 'character', charName: 'Blazer' }
    ]
};
