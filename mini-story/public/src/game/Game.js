import { SCENARIO } from './Scenario.js';
import { TextViewer } from '../ui/TextViewer.js';
import { ChoiceManager } from '../ui/ChoiceManager.js';

export class Game {
    constructor() {
        this.currentSceneId = 'start';
        this.textViewer = new TextViewer();
        this.choiceManager = new ChoiceManager((nextId) => this.setScene(nextId));
        
        this.bgLayer = document.getElementById('bgLayer');
        this.nameBox = document.getElementById('nameBox');
        this.charBox = document.getElementById('character');
        
        this.isWaitingForChoice = false;
    }

    start() {
        this.setScene('start');
    }

    reset() {
        this.setScene('start');
    }

    setScene(sceneId) {
        if (!sceneId || !SCENARIO[sceneId]) return;
        
        this.currentSceneId = sceneId;
        const scene = SCENARIO[sceneId];
        
        // Update UI
        this.bgLayer.style.backgroundColor = scene.bg;
        this.charBox.style.backgroundColor = scene.char;
        this.nameBox.innerText = scene.name;
        
        // Start text
        this.isWaitingForChoice = false;
        this.choiceManager.hide();
        this.textViewer.show(scene.text);
    }

    handleInput() {
        if (this.isWaitingForChoice) return;

        if (this.textViewer.isTyping) {
            this.textViewer.skip();
        } else {
            const scene = SCENARIO[this.currentSceneId];
            if (scene.choices) {
                this.isWaitingForChoice = true;
                this.choiceManager.show(scene.choices);
            } else if (scene.next) {
                this.setScene(scene.next);
            } else {
                // End of game, maybe restart or do nothing
                console.log("End of Story");
            }
        }
    }
}
