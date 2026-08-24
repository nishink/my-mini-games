// ============================================================
// Board.js — Match-3 grid logic (pure, no DOM)
// ============================================================

export const COLS = 8;
export const ROWS = 8;
export const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'];

// Special gem types
export const SPECIAL = {
    NONE: null,
    ROW:  'row',   // clears entire row
    COL:  'col',   // clears entire column
    BOMB: 'bomb',  // clears 3x3 area
};

export const GEM_ICONS = {
    [SPECIAL.ROW]:  '↔',
    [SPECIAL.COL]:  '↕',
    [SPECIAL.BOMB]: '💣',
};

/**
 * @typedef {{ color: string, special: string|null, id: number }} Gem
 */

let _nextId = 1;

function makeGem(color, special = SPECIAL.NONE) {
    return { color, special, id: _nextId++ };
}

function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}

/**
 * Build an initial board with no pre-existing matches.
 * @returns {Gem[][]} grid[row][col]
 */
export function createBoard() {
    const grid = [];
    for (let r = 0; r < ROWS; r++) {
        grid[r] = [];
        for (let c = 0; c < COLS; c++) {
            let color;
            do {
                color = randomColor();
            } while (
                (c >= 2 && grid[r][c-1].color === color && grid[r][c-2].color === color) ||
                (r >= 2 && grid[r-1][c].color === color && grid[r-2][c].color === color)
            );
            grid[r][c] = makeGem(color);
        }
    }
    return grid;
}

/**
 * Swap two gems (mutates grid).
 */
export function swapGems(grid, r1, c1, r2, c2) {
    const tmp = grid[r1][c1];
    grid[r1][c1] = grid[r2][c2];
    grid[r2][c2] = tmp;
}

/**
 * Find all matches of 3+ gems in rows and columns.
 * @returns {{ cells: Set<string>, matches: Array<{cells: [number,number][], special?: string}> }}
 */
export function findMatches(grid) {
    const matchGroups = [];

    // Horizontal
    for (let r = 0; r < ROWS; r++) {
        let c = 0;
        while (c < COLS) {
            let len = 1;
            while (c + len < COLS && grid[r][c + len].color === grid[r][c].color) len++;
            if (len >= 3) {
                const cells = [];
                for (let i = 0; i < len; i++) cells.push([r, c + i]);
                matchGroups.push({ cells, dir: 'h', len });
            }
            c += len;
        }
    }

    // Vertical
    for (let c = 0; c < COLS; c++) {
        let r = 0;
        while (r < ROWS) {
            let len = 1;
            while (r + len < ROWS && grid[r + len][c].color === grid[r][c].color) len++;
            if (len >= 3) {
                const cells = [];
                for (let i = 0; i < len; i++) cells.push([r + i, c]);
                matchGroups.push({ cells, dir: 'v', len });
            }
            r += len;
        }
    }

    // Merge overlapping groups and assign special types
    const allMatched = new Set();
    const processed = matchGroups.map(g => {
        g.cells.forEach(([r, c]) => allMatched.add(`${r},${c}`));
        let special = SPECIAL.NONE;
        if (g.len >= 5) special = SPECIAL.BOMB;
        else if (g.len === 4) special = (g.dir === 'h') ? SPECIAL.ROW : SPECIAL.COL;
        return { ...g, special };
    });

    return { allMatched, matchGroups: processed };
}

/**
 * Collect all cells that should be cleared given a set of matched cells
 * (expanding special gems in the cleared set).
 * Returns array of [r, c] positions.
 */
export function expandSpecials(grid, initialSet) {
    const toRemove = new Set(initialSet);
    const queue = [...initialSet];

    while (queue.length) {
        const key = queue.shift();
        const [r, c] = key.split(',').map(Number);
        const gem = grid[r]?.[c];
        if (!gem || !gem.special) continue;

        let expansion = [];
        if (gem.special === SPECIAL.ROW) {
            for (let cc = 0; cc < COLS; cc++) expansion.push([r, cc]);
        } else if (gem.special === SPECIAL.COL) {
            for (let rr = 0; rr < ROWS; rr++) expansion.push([rr, c]);
        } else if (gem.special === SPECIAL.BOMB) {
            for (let dr = -1; dr <= 1; dr++)
                for (let dc = -1; dc <= 1; dc++) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) expansion.push([nr, nc]);
                }
        }
        expansion.forEach(([nr, nc]) => {
            const k = `${nr},${nc}`;
            if (!toRemove.has(k)) { toRemove.add(k); queue.push(k); }
        });
    }
    return [...toRemove].map(k => k.split(',').map(Number));
}

/**
 * Remove matched gems, drop gems down, fill from top.
 * Mutates grid. Returns newly placed gems (for fall animation).
 * @param {Gem[][]} grid
 * @param {[number,number][]} toRemove
 * @param {Map<string,[number,number]>} specialToPlace  key=`r,c` of where to place, value=[r,c] center
 */
export function collapseAndFill(grid, toRemove, specialToPlace = new Map()) {
    const removeSet = new Set(toRemove.map(([r, c]) => `${r},${c}`));

    // Null out removed cells
    toRemove.forEach(([r, c]) => { grid[r][c] = null; });

    // Place specials at specified positions (before fill)
    specialToPlace.forEach((spec, key) => {
        const [r, c] = key.split(',').map(Number);
        grid[r][c] = makeGem(spec.color, spec.special);
    });

    // Drop gems down column by column
    const newGems = []; // [r, c]
    for (let c = 0; c < COLS; c++) {
        let writeRow = ROWS - 1;
        for (let r = ROWS - 1; r >= 0; r--) {
            if (grid[r][c] !== null) {
                grid[writeRow][c] = grid[r][c];
                if (writeRow !== r) grid[r][c] = null;
                writeRow--;
            }
        }
        // Fill empty from top
        for (let r = writeRow; r >= 0; r--) {
            grid[r][c] = makeGem(randomColor());
            newGems.push([r, c]);
        }
    }

    return newGems;
}

/**
 * Score for a match group: base 50 per gem, bonus for length, multiplied by combo.
 */
export function scoreGroup(len, combo) {
    const base = 50 * len + (len >= 4 ? 100 : 0) + (len >= 5 ? 200 : 0);
    return base * combo;
}

/**
 * Check if any valid move exists.
 */
export function hasValidMove(grid) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            // Try swap right
            if (c + 1 < COLS) {
                swapGems(grid, r, c, r, c + 1);
                const { allMatched } = findMatches(grid);
                swapGems(grid, r, c, r, c + 1);
                if (allMatched.size > 0) return true;
            }
            // Try swap down
            if (r + 1 < ROWS) {
                swapGems(grid, r, c, r + 1, c);
                const { allMatched } = findMatches(grid);
                swapGems(grid, r, c, r + 1, c);
                if (allMatched.size > 0) return true;
            }
        }
    }
    return false;
}

/**
 * Find a hint move (first valid swap).
 * Returns [[r1,c1],[r2,c2]] or null.
 */
export function findHint(grid) {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (c + 1 < COLS) {
                swapGems(grid, r, c, r, c + 1);
                const { allMatched } = findMatches(grid);
                swapGems(grid, r, c, r, c + 1);
                if (allMatched.size > 0) return [[r, c], [r, c + 1]];
            }
            if (r + 1 < ROWS) {
                swapGems(grid, r, c, r + 1, c);
                const { allMatched } = findMatches(grid);
                swapGems(grid, r, c, r + 1, c);
                if (allMatched.size > 0) return [[r, c], [r + 1, c]];
            }
        }
    }
    return null;
}
