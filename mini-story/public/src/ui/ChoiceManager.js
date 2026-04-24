export class ChoiceManager {
    constructor(onChoiceSelected) {
        this.layer = document.getElementById('choiceLayer');
        this.container = document.getElementById('choiceContainer');
        this.onChoiceSelected = onChoiceSelected;
    }

    show(choices) {
        this.container.innerHTML = "";
        choices.forEach(choice => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.innerText = choice.text;
            btn.onclick = () => {
                this.hide();
                this.onChoiceSelected(choice.next);
            };
            this.container.appendChild(btn);
        });
        this.layer.style.display = 'flex';
    }

    hide() {
        this.layer.style.display = 'none';
    }
}
