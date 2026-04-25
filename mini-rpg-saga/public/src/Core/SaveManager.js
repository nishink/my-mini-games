import { state } from './GlobalState.js';

export class SaveManager {
    static SAVE_KEY = 'MINI_RPG_SAGA_SAVE';

    static save() {
        const data = state.serialize();
        localStorage.setItem(this.SAVE_KEY, data);
        console.log('Game Saved');
    }

    static load() {
        const data = localStorage.getItem(this.SAVE_KEY);
        if (data) {
            if (state.deserialize(data)) {
                console.log('Game Loaded');
                return true;
            }
        }
        return false;
    }

    static clear() {
        localStorage.removeItem(this.SAVE_KEY);
        state.reset();
        console.log('Save Data Cleared');
    }

    static exists() {
        return localStorage.getItem(this.SAVE_KEY) !== null;
    }
}
