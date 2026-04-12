export const WORDS = [
    'APPLE', 'BEACH', 'BRAIN', 'BREAD', 'BRUSH', 'CHAIR', 'CHEST', 'CHORD',
    'CLICK', 'CLOCK', 'CLOUD', 'DANCE', 'DIARY', 'DRINK', 'EARTH', 'FEAST',
    'FIELD', 'FRUIT', 'GLASS', 'GRAPE', 'GREEN', 'GHOST', 'HEART', 'HOUSE',
    'JUICE', 'LIGHT', 'LEMON', 'MELON', 'MONEY', 'MUSIC', 'NIGHT', 'OCEAN',
    'PARTY', 'PIANO', 'PILOT', 'PLANE', 'PLANT', 'RADIO', 'RIVER', 'ROBOT',
    'SHIRT', 'SHOES', 'SMILE', 'SNAKE', 'SPACE', 'SPOON', 'STORM', 'TABLE',
    'TIGER', 'TOAST', 'TOUCH', 'TRAIN', 'TRUCK', 'VOICE', 'WATER', 'WATCH',
    'WHALE', 'WORLD', 'WRITE', 'YOUTH', 'ZEBRA'
];

export class Dictionary {
    static getRandomWord() {
        return WORDS[Math.floor(Math.random() * WORDS.length)];
    }

    static isValidWord(word) {
        return WORDS.includes(word.toUpperCase());
    }
}
