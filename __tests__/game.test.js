const { loadGame } = require('./loadGame');

let G; // game context (all globals from game.js)

beforeAll(() => {
  G = loadGame();
});

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

describe('cl (clamp)', () => {
  test('returns value when within range', () => {
    expect(G.cl(5, 0, 10)).toBe(5);
  });
  test('clamps to min when below', () => {
    expect(G.cl(-3, 0, 10)).toBe(0);
  });
  test('clamps to max when above', () => {
    expect(G.cl(15, 0, 10)).toBe(10);
  });
  test('returns min when min equals max', () => {
    expect(G.cl(5, 7, 7)).toBe(7);
  });
  test('handles negative ranges', () => {
    expect(G.cl(-5, -10, -1)).toBe(-5);
    expect(G.cl(-15, -10, -1)).toBe(-10);
    expect(G.cl(0, -10, -1)).toBe(-1);
  });
});

describe('di (distance)', () => {
  test('returns 0 for same point', () => {
    expect(G.di(3, 4, 3, 4)).toBe(0);
  });
  test('returns correct distance for 3-4-5 triangle', () => {
    expect(G.di(0, 0, 3, 4)).toBe(5);
  });
  test('handles negative coordinates', () => {
    expect(G.di(-1, -1, 2, 3)).toBe(5);
  });
  test('is commutative', () => {
    expect(G.di(1, 2, 5, 8)).toBe(G.di(5, 8, 1, 2));
  });
});

describe('hexRgb', () => {
  test('parses 6-digit hex', () => {
    expect(G.hexRgb('#ff0000')).toEqual([255, 0, 0]);
    expect(G.hexRgb('#00ff00')).toEqual([0, 255, 0]);
    expect(G.hexRgb('#0000ff')).toEqual([0, 0, 255]);
  });
  test('parses 3-digit shorthand', () => {
    expect(G.hexRgb('#fff')).toEqual([255, 255, 255]);
    expect(G.hexRgb('#000')).toEqual([0, 0, 0]);
    expect(G.hexRgb('#f00')).toEqual([255, 0, 0]);
  });
  test('works without # prefix', () => {
    expect(G.hexRgb('ff8800')).toEqual([255, 136, 0]);
  });
  test('defaults to white for falsy input', () => {
    expect(G.hexRgb(null)).toEqual([255, 255, 255]);
    expect(G.hexRgb(undefined)).toEqual([255, 255, 255]);
    expect(G.hexRgb('')).toEqual([255, 255, 255]);
  });
});

describe('rgba', () => {
  test('builds rgba string from hex and alpha', () => {
    expect(G.rgba('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)');
  });
  test('handles full opacity', () => {
    expect(G.rgba('#00ff00', 1)).toBe('rgba(0,255,0,1)');
  });
  test('handles zero opacity', () => {
    expect(G.rgba('#0000ff', 0)).toBe('rgba(0,0,255,0)');
  });
});

describe('keyLabel', () => {
  test('strips Key prefix', () => {
    expect(G.keyLabel('KeyW')).toBe('W');
    expect(G.keyLabel('KeyA')).toBe('A');
  });
  test('strips Digit prefix', () => {
    expect(G.keyLabel('Digit1')).toBe('1');
    expect(G.keyLabel('Digit3')).toBe('3');
  });
  test('replaces Arrow prefix with space', () => {
    expect(G.keyLabel('ArrowUp')).toBe('Arrow Up');
    expect(G.keyLabel('ArrowLeft')).toBe('Arrow Left');
  });
  test('replaces Space with Spacebar', () => {
    expect(G.keyLabel('Space')).toBe('Spacebar');
  });
  test('passes through unknown codes', () => {
    expect(G.keyLabel('F5')).toBe('F5');
    expect(G.keyLabel('Escape')).toBe('Escape');
  });
});

describe('angleDelta', () => {
  test('returns 0 for equal angles', () => {
    expect(G.angleDelta(0, 0)).toBeCloseTo(0);
    expect(G.angleDelta(Math.PI, Math.PI)).toBeCloseTo(0);
  });
  test('returns correct delta for small angles', () => {
    expect(G.angleDelta(0, 0.5)).toBeCloseTo(0.5);
    expect(G.angleDelta(0.5, 0)).toBeCloseTo(-0.5);
  });
  test('wraps around correctly', () => {
    const d = G.angleDelta(0.1, 2 * Math.PI - 0.1);
    expect(d).toBeCloseTo(-0.2, 4);
  });
});

describe('escHtml', () => {
  test('escapes ampersand', () => {
    expect(G.escHtml('a&b')).toBe('a&amp;b');
  });
  test('escapes angle brackets', () => {
    expect(G.escHtml('<div>')).toBe('&lt;div&gt;');
  });
  test('escapes quotes', () => {
    expect(G.escHtml('"hello"')).toBe('&quot;hello&quot;');
    expect(G.escHtml("it's")).toBe("it&#39;s");
  });
  test('handles empty string', () => {
    expect(G.escHtml('')).toBe('');
  });
  test('leaves safe text alone', () => {
    expect(G.escHtml('hello world')).toBe('hello world');
  });
  test('coerces non-strings', () => {
    expect(G.escHtml(42)).toBe('42');
  });
});

describe('rk (room key)', () => {
  test('produces comma-separated key', () => {
    expect(G.rk(0, 0)).toBe('0,0');
    expect(G.rk(3, -2)).toBe('3,-2');
    expect(G.rk(-1, 5)).toBe('-1,5');
  });
});

describe('rarityForGun', () => {
  test('returns cursed for bad quality guns', () => {
    // Gun with quality marker 'bad' at index 9
    const badGun = ['Test', 0.5, 500, 5, 0.2, 7, 1, 0, '#fff', 'bad'];
    expect(G.rarityForGun(badGun)).toBe('cursed');
  });
  test('returns legendary for high-score guns', () => {
    // score = dmg + shots*3 + pierce*8 + (rate<.08 ? 14 : 0)
    // 92 + 1*3 + 6*8 + 14 = 92+3+48+14 = 157 -> legendary
    const gun = ['Royal Railgun', 0.05, 1400, 92, 0.005, 25, 1, 6, '#fff', 'good'];
    expect(G.rarityForGun(gun)).toBe('legendary');
  });
  test('returns epic for mid-high score guns', () => {
    // score = 44 + 1*3 + 1*8 + 14 = 69 -> epic (56-95 range)
    const gun = ['Sunspike', 0.05, 900, 44, 0.035, 3, 1, 1, '#fff', 'good'];
    expect(G.rarityForGun(gun)).toBe('epic');
  });
  test('returns rare for mid-score guns', () => {
    // score = 14 + 1*3 + 0*8 + 14 = 31 -> rare
    const gun = ['Pulse', 0.05, 780, 14, 0.04, 2, 1, 0, '#62e3ff', 'good'];
    expect(G.rarityForGun(gun)).toBe('rare');
  });
  test('returns common for low-score guns', () => {
    // score = 5 + 1*3 + 0*8 + 0 = 8 -> common
    const gun = ['Weak', 0.5, 430, 5, 0.5, 7, 1, 0, '#c0a070', 'mid'];
    expect(G.rarityForGun(gun)).toBe('common');
  });
});

describe('rarityClass', () => {
  test('returns rarity- prefix + lowercase', () => {
    expect(G.rarityClass('legendary')).toBe('rarity-legendary');
    expect(G.rarityClass('epic')).toBe('rarity-epic');
    expect(G.rarityClass('RARE')).toBe('rarity-rare');
    expect(G.rarityClass('Common')).toBe('rarity-common');
    expect(G.rarityClass('cursed')).toBe('rarity-cursed');
  });
});

// ---------------------------------------------------------------------------
// RNG class
// ---------------------------------------------------------------------------

describe('RNG', () => {
  test('produces deterministic output for same seed', () => {
    const a = new G.RNG(12345);
    const b = new G.RNG(12345);
    for (let i = 0; i < 20; i++) {
      expect(a.n()).toBe(b.n());
    }
  });

  test('n() returns values in [0, 1)', () => {
    const rng = new G.RNG(42);
    for (let i = 0; i < 100; i++) {
      const v = rng.n();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test('r(a, b) returns values in [a, b)', () => {
    const rng = new G.RNG(99);
    for (let i = 0; i < 100; i++) {
      const v = rng.r(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(10);
    }
  });

  test('i(a, b) returns integers in [a, b]', () => {
    const rng = new G.RNG(7);
    const seen = new Set();
    for (let i = 0; i < 200; i++) {
      const v = rng.i(1, 5);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(5);
      seen.add(v);
    }
    // with 200 rolls over 5 values, we should see all of them
    expect(seen.size).toBe(5);
  });

  test('p(array) picks elements from the array', () => {
    const rng = new G.RNG(55);
    const arr = ['a', 'b', 'c'];
    const seen = new Set();
    for (let i = 0; i < 100; i++) {
      const v = rng.p(arr);
      expect(arr).toContain(v);
      seen.add(v);
    }
    expect(seen.size).toBe(3);
  });

  test('different seeds produce different sequences', () => {
    const a = new G.RNG(1);
    const b = new G.RNG(2);
    let same = true;
    for (let i = 0; i < 10; i++) {
      if (a.n() !== b.n()) { same = false; break; }
    }
    expect(same).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Character system
// ---------------------------------------------------------------------------

describe('characterAt', () => {
  test('returns first character for index 0', () => {
    const c = G.characterAt(0);
    expect(c.name).toBe('Sheldon Cooper');
    expect(c.role).toBe('Precision Controller');
  });
  test('clamps negative index to 0', () => {
    expect(G.characterAt(-5).name).toBe('Sheldon Cooper');
  });
  test('clamps large index to last character', () => {
    const last = G.characterAt(999);
    expect(last.name).toBe('George Cooper');
  });
  test('returns valid character for each valid index', () => {
    for (let i = 0; i < G.CHARACTERS.length; i++) {
      const c = G.characterAt(i);
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('role');
      expect(c).toHaveProperty('apply');
      expect(typeof c.apply).toBe('function');
    }
  });
});

describe('stampCharacterFields', () => {
  test('stamps character metadata onto a player object', () => {
    const p = {};
    G.stampCharacterFields(p, 0);
    expect(p.charName).toBe('Sheldon Cooper');
    expect(p.charRole).toBe('Precision Controller');
    expect(p.charId).toBe(0);
  });
  test('clamps out-of-range index', () => {
    const p = {};
    G.stampCharacterFields(p, -1);
    expect(p.charId).toBe(0);
    expect(p.charName).toBe('Sheldon Cooper');
  });
});

// ---------------------------------------------------------------------------
// Difficulty system
// ---------------------------------------------------------------------------

describe('difficultyAt', () => {
  test('returns requested difficulty', () => {
    expect(G.difficultyAt('easy').id).toBe('easy');
    expect(G.difficultyAt('medium').id).toBe('medium');
    expect(G.difficultyAt('hard').id).toBe('hard');
    expect(G.difficultyAt('epstein').id).toBe('epstein');
  });
  test('falls back to medium for unknown id', () => {
    expect(G.difficultyAt('impossible').id).toBe('medium');
    expect(G.difficultyAt(null).id).toBe('medium');
    expect(G.difficultyAt(undefined).id).toBe('medium');
  });
  test('difficulty objects have required fields', () => {
    for (const d of Object.values(G.DIFFICULTIES)) {
      expect(d).toHaveProperty('enemyHp');
      expect(d).toHaveProperty('enemySpeed');
      expect(d).toHaveProperty('enemyDamage');
      expect(d).toHaveProperty('playerHull');
      expect(d).toHaveProperty('playerShield');
      expect(d).toHaveProperty('playerEnergy');
      expect(typeof d.enemyHp).toBe('number');
    }
  });
  test('harder difficulties have higher enemy HP multipliers', () => {
    const easy = G.difficultyAt('easy');
    const medium = G.difficultyAt('medium');
    const hard = G.difficultyAt('hard');
    const epstein = G.difficultyAt('epstein');
    expect(easy.enemyHp).toBeLessThan(medium.enemyHp);
    expect(medium.enemyHp).toBeLessThan(hard.enemyHp);
    expect(hard.enemyHp).toBeLessThan(epstein.enemyHp);
  });
  test('harder difficulties have lower player hull multipliers', () => {
    const easy = G.difficultyAt('easy');
    const medium = G.difficultyAt('medium');
    const hard = G.difficultyAt('hard');
    expect(easy.playerHull).toBeGreaterThan(medium.playerHull);
    expect(medium.playerHull).toBeGreaterThan(hard.playerHull);
  });
});

describe('applyDifficultyToPlayer', () => {
  test('scales player stats according to difficulty', () => {
    // Temporarily set difficulty to easy
    G.selectedDifficulty = 'easy';
    const easyP = G.applyDifficultyToPlayer({ mh: 100, h: 100, ms: 50, s: 50, me: 100, e: 100, armor: 2 });
    G.selectedDifficulty = 'hard';
    const hardP = G.applyDifficultyToPlayer({ mh: 100, h: 100, ms: 50, s: 50, me: 100, e: 100, armor: 2 });
    // Easy should give more hull than hard
    expect(easyP.mh).toBeGreaterThan(hardP.mh);
    expect(easyP.ms).toBeGreaterThan(hardP.ms);
    // Reset
    G.selectedDifficulty = 'medium';
  });
  test('enforces minimum values', () => {
    G.selectedDifficulty = 'epstein';
    const p = G.applyDifficultyToPlayer({ mh: 10, h: 10, ms: 5, s: 5, me: 30, e: 30, armor: 0 });
    expect(p.mh).toBeGreaterThanOrEqual(70);
    expect(p.ms).toBeGreaterThanOrEqual(10);
    expect(p.me).toBeGreaterThanOrEqual(45);
    expect(p.armor).toBeGreaterThanOrEqual(0);
    G.selectedDifficulty = 'medium';
  });
});

// ---------------------------------------------------------------------------
// Level scaling
// ---------------------------------------------------------------------------

describe('levelScale', () => {
  test('returns base values at level 1', () => {
    // Temporarily disable G state to make dungeonLevel return 1
    const origRun = G.G.run;
    G.G.run = 0;
    const ls = G.levelScale();
    expect(ls.L).toBe(1);
    expect(ls.hp).toBe(1);
    expect(ls.speed).toBe(1);
    expect(ls.damage).toBe(1);
    expect(ls.count).toBe(0);
    expect(ls.reward).toBe(1);
    G.G.run = origRun;
  });
});

// ---------------------------------------------------------------------------
// Gun profile
// ---------------------------------------------------------------------------

describe('gunProfile', () => {
  test('returns default profile for Pulse', () => {
    const p = G.gunProfile(G.STARTER_WEAPON);
    expect(p.name).toBe('Pulse');
    expect(p.scope).toBe(1);
    expect(p.scatter).toBe(0);
    expect(p.launcher).toBe(0);
  });
  test('returns correct profile for Void Choir', () => {
    const gun = ['Void Choir', 0.34, 650, 13, 0.28, 10, 9, 0, '#b28dff', 'good'];
    const p = G.gunProfile(gun);
    expect(p.name).toBe('Void Choir');
    expect(p.scatter).toBe(1);
    expect(p.scope).toBe(0);
  });
  test('returns correct profile for Royal Railgun', () => {
    const gun = ['Royal Railgun', 0.9, 1400, 92, 0.005, 25, 1, 6, '#ffffff', 'good'];
    const p = G.gunProfile(gun);
    expect(p.name).toBe('Royal Railgun');
    expect(p.rail).toBe(1);
    expect(p.scope).toBe(1);
  });
  test('returns correct profile for Glass Cannon', () => {
    const gun = ['Glass Cannon', 0.72, 1250, 68, 0.015, 20, 1, 4, '#ff8fab', 'good'];
    const p = G.gunProfile(gun);
    expect(p.name).toBe('Glass Cannon');
    expect(p.launcher).toBe(1);
  });
  test('returns correct profile for Needle Printer', () => {
    const gun = ['Needle Printer', 0.045, 860, 6, 0.055, 2, 1, 0, '#62e3ff', 'mid'];
    const p = G.gunProfile(gun);
    expect(p.name).toBe('Needle Printer');
    expect(p.needle).toBe(1);
  });
  test('returns correct profile for Wet Cardboard Gun', () => {
    const gun = ['Wet Cardboard Gun', 0.5, 430, 5, 0.5, 7, 1, 0, '#c0a070', 'bad'];
    const p = G.gunProfile(gun);
    expect(p.name).toBe('Wet Cardboard Gun');
    expect(p.scrap).toBe(1);
  });
  test('handles null / undefined weapon gracefully', () => {
    const p = G.gunProfile(null);
    expect(p.name).toBe('Pulse');
  });
});

// ---------------------------------------------------------------------------
// Weapon management
// ---------------------------------------------------------------------------

describe('resetWeapons', () => {
  test('resets weps array to starter weapon only', () => {
    G.weps.push(['Extra Gun']);
    G.resetWeapons();
    expect(G.weps.length).toBe(1);
    expect(G.weps[0][0]).toBe('Pulse');
  });
});

describe('ensureWeaponIndex', () => {
  test('returns 0 when player is null', () => {
    const origP = G.P;
    G.P = null;
    expect(G.ensureWeaponIndex()).toBe(0);
    G.P = origP;
  });
  test('clamps weapon index to valid range', () => {
    G.resetWeapons();
    G.P = { w: 5 };
    const idx = G.ensureWeaponIndex();
    expect(idx).toBe(0);
    G.P = null;
  });
});

// ---------------------------------------------------------------------------
// Record shot tracking
// ---------------------------------------------------------------------------

describe('recordShot', () => {
  test('increments shot count and tracks favorite weapon', () => {
    G.runStats = { damage: 0, shots: 0, rooms: 0, startTime: 0, fav: {}, bestWeapon: 'Pulse' };
    const w = ['Railgun', 0.9, 1400, 92, 0.005, 25, 1, 6, '#fff'];
    G.recordShot(w);
    expect(G.runStats.shots).toBe(1);
    expect(G.runStats.fav['Railgun']).toBe(1);
    expect(G.runStats.bestWeapon).toBe('Railgun');

    G.recordShot(w);
    expect(G.runStats.shots).toBe(2);
    expect(G.runStats.fav['Railgun']).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Puzzle system
// ---------------------------------------------------------------------------

describe('makePuzzle', () => {
  test('returns a puzzle object with required fields', () => {
    const p = G.makePuzzle();
    expect(p).toHaveProperty('kind');
    expect(p).toHaveProperty('prompt');
    expect(p).toHaveProperty('hint');
    expect(p).toHaveProperty('answer');
    expect(p).toHaveProperty('choices');
    expect(Array.isArray(p.choices)).toBe(true);
    expect(p.choices.length).toBeGreaterThanOrEqual(2);
  });
  test('answer is always one of the choices', () => {
    for (let i = 0; i < 50; i++) {
      const p = G.makePuzzle();
      expect(p.choices).toContain(p.answer);
    }
  });
  test('has chips for terminal display', () => {
    const p = G.makePuzzle();
    expect(p).toHaveProperty('chips');
    expect(Array.isArray(p.chips)).toBe(true);
  });
});

describe('makeForgePuzzle', () => {
  test('returns a puzzle with forge flag and max timer', () => {
    const p = G.makeForgePuzzle();
    expect(p.forge).toBe(1);
    expect(p.max).toBe(45);
    expect(p).toHaveProperty('kind');
    expect(p).toHaveProperty('answer');
  });
});

// ---------------------------------------------------------------------------
// Room key and room theme
// ---------------------------------------------------------------------------

describe('roomTheme', () => {
  test('returns dungeon theme for combat rooms', () => {
    G.G.cur = { type: 'combat' };
    const theme = G.roomTheme();
    expect(theme[2]).toBe('DUNGEON');
  });
  test('returns market theme for shop rooms', () => {
    G.G.cur = { type: 'shop' };
    const theme = G.roomTheme();
    expect(theme[2]).toBe('MARKET');
  });
  test('returns boss theme for boss rooms', () => {
    G.G.cur = { type: 'boss' };
    const theme = G.roomTheme();
    expect(theme[2]).toBe('BOSS ROOM');
  });
  test('returns archive theme for lore rooms', () => {
    G.G.cur = { type: 'lore' };
    const theme = G.roomTheme();
    expect(theme[2]).toBe('ARCHIVE');
  });
  test('returns mini-boss theme for miniboss rooms', () => {
    G.G.cur = { type: 'miniboss' };
    const theme = G.roomTheme();
    expect(theme[2]).toBe('MINI-BOSS');
  });
});

// ---------------------------------------------------------------------------
// Constants and data integrity
// ---------------------------------------------------------------------------

describe('CHARACTERS', () => {
  test('has 6 characters', () => {
    expect(G.CHARACTERS.length).toBe(6);
  });
  test('each character has required fields', () => {
    for (const c of G.CHARACTERS) {
      expect(c).toHaveProperty('id');
      expect(c).toHaveProperty('name');
      expect(c).toHaveProperty('role');
      expect(c).toHaveProperty('summary');
      expect(c).toHaveProperty('passive');
      expect(c).toHaveProperty('img');
      expect(c).toHaveProperty('apply');
    }
  });
  test('character names are unique', () => {
    const names = G.CHARACTERS.map(c => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe('DIFFICULTIES', () => {
  test('has 4 difficulty levels', () => {
    expect(Object.keys(G.DIFFICULTIES).length).toBe(4);
  });
  test('each difficulty has an id matching its key', () => {
    for (const [key, val] of Object.entries(G.DIFFICULTIES)) {
      expect(val.id).toBe(key);
    }
  });
});

describe('FORGE_GUNS', () => {
  test('each forge gun has 11 elements', () => {
    for (const gun of G.FORGE_GUNS) {
      expect(gun.length).toBe(11);
    }
  });
  test('each forge gun has a quality tag (good/bad/mid)', () => {
    for (const gun of G.FORGE_GUNS) {
      expect(['good', 'bad', 'mid']).toContain(gun[9]);
    }
  });
  test('each forge gun has a description string', () => {
    for (const gun of G.FORGE_GUNS) {
      expect(typeof gun[10]).toBe('string');
      expect(gun[10].length).toBeGreaterThan(0);
    }
  });
});

describe('DEFAULT_BINDINGS', () => {
  test('has bindings for all expected actions', () => {
    const expected = ['up', 'down', 'left', 'right', 'dash', 'shock', 'repair',
      'lightning', 'interact', 'pause', 'codex', 'save', 'load',
      'weapon1', 'weapon2', 'weapon3'];
    for (const action of expected) {
      expect(G.DEFAULT_BINDINGS).toHaveProperty(action);
    }
  });
  test('BIND_LABELS covers all default bindings', () => {
    for (const key of Object.keys(G.DEFAULT_BINDINGS)) {
      expect(G.BIND_LABELS).toHaveProperty(key);
      expect(typeof G.BIND_LABELS[key]).toBe('string');
    }
  });
});

describe('STARTER_WEAPON', () => {
  test('is named Pulse', () => {
    expect(G.STARTER_WEAPON[0]).toBe('Pulse');
  });
  test('has 9 elements', () => {
    expect(G.STARTER_WEAPON.length).toBe(9);
  });
});

describe('UP (upgrades)', () => {
  test('each upgrade has [tag, name, description, applyFn]', () => {
    for (const u of G.UP) {
      expect(u.length).toBe(4);
      expect(typeof u[0]).toBe('string');
      expect(typeof u[1]).toBe('string');
      expect(typeof u[2]).toBe('string');
      expect(typeof u[3]).toBe('function');
    }
  });
  test('upgrade names are unique', () => {
    const names = G.UP.map(u => u[1]);
    expect(new Set(names).size).toBe(names.length);
  });
});

// ---------------------------------------------------------------------------
// rollForgedGun
// ---------------------------------------------------------------------------

describe('rollForgedGun', () => {
  test('returns a valid gun array', () => {
    for (let i = 0; i < 20; i++) {
      const gun = G.rollForgedGun(0.5);
      expect(gun.length).toBe(11);
      expect(typeof gun[0]).toBe('string');
    }
  });
  test('high ratio biases toward good guns', () => {
    let good = 0;
    for (let i = 0; i < 100; i++) {
      const gun = G.rollForgedGun(0.95);
      if (gun[9] === 'good') good++;
    }
    // Should get a decent proportion of good guns with high ratio
    expect(good).toBeGreaterThan(20);
  });
  test('low ratio can produce bad guns', () => {
    let bad = 0;
    for (let i = 0; i < 100; i++) {
      const gun = G.rollForgedGun(0.1);
      if (gun[9] === 'bad') bad++;
    }
    expect(bad).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// shopItems
// ---------------------------------------------------------------------------

describe('shopItems', () => {
  test('returns an array of shop items', () => {
    // Need P to be defined for shopItems
    G.P = { h: 50, mh: 100, e: 50, me: 100, dm: 1, armor: 1, ms: 50, s: 50, scrap: 100 };
    G.G.drones = 0;
    const items = G.shopItems();
    expect(Array.isArray(items)).toBe(true);
    expect(items.length).toBe(7);
  });
  test('each shop item has [name, cost, description, canBuyFn, buyFn]', () => {
    G.P = { h: 50, mh: 100, e: 50, me: 100, dm: 1, armor: 1, ms: 50, s: 50, scrap: 100 };
    G.G.drones = 0;
    const items = G.shopItems();
    for (const item of items) {
      expect(item.length).toBe(5);
      expect(typeof item[0]).toBe('string');
      expect(typeof item[1]).toBe('number');
      expect(typeof item[2]).toBe('string');
      expect(typeof item[3]).toBe('function');
      expect(typeof item[4]).toBe('function');
    }
  });
  test('Hull Repair is unavailable at full health', () => {
    G.P = { h: 100, mh: 100, e: 100, me: 100, dm: 1, armor: 1, ms: 50, s: 50, scrap: 100 };
    const items = G.shopItems();
    const hullRepair = items.find(i => i[0] === 'Hull Repair');
    expect(hullRepair[3]()).toBeFalsy();
  });
  test('Hull Repair is available when damaged', () => {
    G.P = { h: 50, mh: 100, e: 100, me: 100, dm: 1, armor: 1, ms: 50, s: 50, scrap: 100 };
    const items = G.shopItems();
    const hullRepair = items.find(i => i[0] === 'Hull Repair');
    expect(hullRepair[3]()).toBeTruthy();
  });
  test('Combat Drone is unavailable at max drones', () => {
    G.P = { h: 100, mh: 100, e: 100, me: 100, dm: 1, armor: 1, ms: 50, s: 50, scrap: 100 };
    G.G.drones = 4;
    const items = G.shopItems();
    const drone = items.find(i => i[0] === 'Combat Drone');
    expect(drone[3]()).toBeFalsy();
    G.G.drones = 0;
  });
});

// ---------------------------------------------------------------------------
// isDown (keybind check)
// ---------------------------------------------------------------------------

describe('isDown', () => {
  test('returns true when the bound key is pressed', () => {
    G.K.add('KeyW');
    expect(G.isDown('up')).toBe(true);
    G.K.delete('KeyW');
  });
  test('returns false when the bound key is not pressed', () => {
    G.K.clear();
    expect(G.isDown('up')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Wall collision
// ---------------------------------------------------------------------------

describe('wall', () => {
  test('returns true when bullet is inside an obstacle', () => {
    G.G.cur = { obs: [{ x: 100, y: 100, w: 50, h: 50 }] };
    expect(G.wall({ x: 125, y: 125 })).toBe(true);
  });
  test('returns false when bullet is outside obstacles', () => {
    G.G.cur = { obs: [{ x: 100, y: 100, w: 50, h: 50 }] };
    expect(G.wall({ x: 10, y: 10 })).toBe(false);
  });
  test('returns false on boundary edge', () => {
    G.G.cur = { obs: [{ x: 100, y: 100, w: 50, h: 50 }] };
    // exactly on left edge x=100 is not inside (x > o.x is false)
    expect(G.wall({ x: 100, y: 125 })).toBe(false);
  });
});
