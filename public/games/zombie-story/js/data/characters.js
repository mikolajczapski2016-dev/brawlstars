// === REJESTR POSTACI (Data-Driven Architecture) ===
// Dodanie nowej postaci = dodanie obiektu poniżej, bez zmian w kodzie silnika!
var characters = {
    Zombie: {
        icon: '🧟',
        bgColor: '#5d8a66',
        lobbyAnim: 'bounce',
        previewAnim: 'bounce',
        skinFamily: 'noobek', // dla scary skina
        // Atak
        attackType: 'melee',
        attackRange: 70,
        attackCooldown: 20,
        attackDamage: 20,
        projectileType: null,
        attackColor: '#ff0000',
        // Super
        superType: 'jump',
        superRange: 200,
        superSpeed: 0.08,
        superDamage: 30,
        superKnockback: 40,
        superEffects: ['destroyWalls'],
        superVisual: 'circle' // żółta linia + kółko
    },
    Blazer: {
        icon: '🥓',
        bgColor: '#e85d04',
        lobbyAnim: 'bounce',
        previewAnim: 'bounce',
        skinFamily: 'blazer',
        // Atak - rzut boczkiem
        attackType: 'ranged',
        attackRange: 250,
        attackCooldown: 25,
        attackDamage: 20,
        projectileType: 'bacon',
        attackColor: '#ff6d00',
        // Super - szarża
        superType: 'charge',
        superRange: 300,
        superSpeed: 0.06,
        superDamage: 25,
        superKnockback: 30,
        superEffects: ['slow', 'destroyWalls'],
        superSlowDuration: 120, // 2 sekundy
        superVisual: 'charge' // pomarańczowa szeroka linia
    },
    Frostik: {
        icon: '❄️',
        bgColor: '#29b6f6',
        lobbyAnim: 'bounce',
        previewAnim: 'bounce',
        skinFamily: 'frostik',
        // Atak - lodowy pocisk (dłuższy zasięg, wolniejszy)
        attackType: 'ranged',
        attackRange: 300,
        attackCooldown: 30,
        attackDamage: 15,
        projectileType: 'ice',
        attackColor: '#b3e5fc',
        // Super - lodowa eksplozja (zamraża wrogów = stun)
        superType: 'jump',
        superRange: 180,
        superSpeed: 0.1,
        superDamage: 20,
        superKnockback: 20,
        superEffects: ['stun'],
        superStunDuration: 90, // 1.5 sekundy
        superVisual: 'circle'
    },
    Cieniak: {
        icon: '🌑',
        bgColor: '#311b92',
        lobbyAnim: 'bounce',
        previewAnim: 'bounce',
        skinFamily: 'cieniak',
        // Atak - rzut czarną dziurą na daleko
        attackType: 'ranged',
        attackRange: 250,
        attackCooldown: 22,
        attackDamage: 20,
        projectileType: 'darkball',
        attackColor: '#311b92',
        // Super - RZUCA czarną dziurą w miejsce celu
        superType: 'throwblackhole',
        superRange: 300,
        superSpeed: 0.15,
        superDamage: 8,
        superEffects: ['pull', 'damageOverTime'],
        superPullRadius: 180,
        superDuration: 200,
        superVisual: 'throwblackhole'
    },
    Magmak: {
        icon: '🔥',
        bgColor: '#ff5722',
        lobbyAnim: 'pulse',
        previewAnim: 'pulse',
        skinFamily: 'magmak',
        // Atak - magma bomb (wybucha przy kontakcie)
        attackType: 'ranged',
        attackRange: 200,
        attackCooldown: 35,
        attackDamage: 25,
        projectileType: 'magmabomb',
        attackColor: '#ff5722',
        // Super - strefa lawy na ziemi
        superType: 'lava',
        superRange: 150,
        superSpeed: 0.1,
        superDamage: 15,
        superEffects: ['burn'],
        superDuration: 180,
        superRadius: 120,
        superVisual: 'lava'
    },
    UltraZombi: {
        icon: '💀',
        bgColor: '#7b1fa2',
        lobbyAnim: 'dance',
        previewAnim: 'dance',
        skinFamily: 'ultrazombi',
        // Atak - różowa toksyczna mgiełka
        attackType: 'ranged',
        attackRange: 250,
        attackCooldown: 25,
        attackDamage: 25,
        projectileType: 'pinkcloud',
        attackColor: '#e91e63',
        // Super - bardzo mocny bąk który zasmradza
        superType: 'area',
        superRange: 200,
        superSpeed: 0.12,
        superDamage: 35,
        superKnockback: 50,
        superEffects: ['stink'],
        superStinkDuration: 300,
        superRadius: 150,
        superVisual: 'stink'
    },
    Złotek: {
        icon: '👑',
        bgColor: '#ffd700',
        lobbyAnim: 'spin',
        previewAnim: 'spin',
        skinFamily: 'zlotek',
        // Atak - rzuca złotymi monetami
        attackType: 'ranged',
        attackRange: 220,
        attackCooldown: 25,
        attackDamage: 22,
        projectileType: 'coin',
        attackColor: '#ffd700',
        // Super - zamienia wrogów w złoto
        superType: 'gold',
        superRange: 180,
        superSpeed: 0.15,
        superDamage: 30,
        superEffects: ['goldify'],
        superDuration: 180,
        superRadius: 100,
        superVisual: 'gold'
    },
    Toksyk: {
        icon: '🧪',
        bgColor: '#00e676',
        lobbyAnim: 'slide',
        previewAnim: 'slide',
        skinFamily: 'toksyk',
        // Atak - trucizna w kulkach
        attackType: 'ranged',
        attackRange: 180,
        attackCooldown: 22,
        attackDamage: 16,
        projectileType: 'poisonball',
        attackColor: '#00e676',
        // Super - rzuca butelką trucizny która zatruwa obszar
        superType: 'throw',
        superRange: 250,
        superSpeed: 0.15,
        superDamage: 40,
        superKnockback: 45,
        superEffects: ['poison'],
        superDuration: 200,
        superRadius: 100,
        superVisual: 'poisoncloud'
    },
    Duszek: {
        icon: '👻',
        bgColor: '#b39ddb',
        lobbyAnim: 'float',
        previewAnim: 'float',
        skinFamily: 'duszek',
        // Atak - przeraźliwy wrzask (aura wokół)
        attackType: 'area',
        attackRange: 80,
        attackCooldown: 30,
        attackDamage: 22,
        projectileType: null,
        attackColor: '#e0e0e0',
        // Super - przerażenie - wszyscy wrogowie uciekają w panice
        superType: 'scare',
        superRange: 300,
        superSpeed: 0.2,
        superDamage: 35,
        superKnockback: 100,
        superEffects: ['fear'],
        superDuration: 180,
        superRadius: 200,
        superVisual: 'ghost'
    },
    Czarodziej: {
        icon: '🔮',
        bgColor: '#7b1fa2',
        lobbyAnim: 'float',
        previewAnim: 'float',
        skinFamily: 'czarodziej',
        // Atak - szybki skok (dash) w stronę celu
        attackType: 'dash',
        attackRange: 180,
        attackCooldown: 25,
        attackDamage: 25,
        projectileType: null,
        attackColor: '#e040fb',
        // Super - potężny skok z zamrożeniem
        superType: 'jump',
        superRange: 250,
        superSpeed: 0.12,
        superDamage: 40,
        superKnockback: 50,
        superEffects: ['stun'],
        superStunDuration: 60,
        superVisual: 'circle'
    }
};
