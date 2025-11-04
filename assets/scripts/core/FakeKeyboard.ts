
import { _decorator, Component, EditBox, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FakeKeyboard')
export class FakeKeyboard extends Component {
    @property(EditBox)
    editBox: EditBox;

    @property(Node)
    formFake: Node;

    @property(Label)
    fakeTxt: Label;

    @property(Node)
    hideTouchZone: Node;

    private keyboard;

    protected onLoad(): void {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/simple-keyboard@latest/build/css/index.css';
        document.head.appendChild(link);

        var elemDiv = document.createElement('div');
        elemDiv.className = 'simple-keyboard';
        elemDiv.id = 'virtual-keyboard';
        elemDiv.style.cssText = 'z-index: 9999; position: absolute; bottom: 0%; margin: 0;';
        document.body.appendChild(elemDiv);

        var script1 = document.createElement('script');
        script1.src = 'https://cdn.jsdelivr.net/npm/simple-keyboard@latest/build/index.js';
        document.body.appendChild(script1);

        var script2 = document.createElement('script');
        script2.src = 'src/index.js';
        document.body.appendChild(script2);
    }

    showVirtualKeyboard(show: boolean) {
        if (show) {
            document.getElementById('virtual-keyboard').style.display = 'block';
            this.hideTouchZone.active = true;
        } else {
            document.getElementById('virtual-keyboard').style.display = 'none';
            this.hideTouchZone.active = false;
        }
    }

    showFormFake() {
        let isHostGamePortrait = window.innerWidth < window.innerHeight;

        if (!this.keyboard) {
            let Keyboard = (window as any).SimpleKeyboard.default;

            this.keyboard = new Keyboard({
                onChange: (input: any) => this.onChange(input),
            });
        }
        this.editBox.blur();
        this.keyboard.setInput(this.editBox.string);
        this.showVirtualKeyboard(true);
        if (isHostGamePortrait) {
            this.formFake.active = true;
            this.editBox.node.setScale(0, 0, 0)
        }

    }

    hideFormFake() {
        this.showVirtualKeyboard(false);
        this.formFake.active = false;
        this.editBox.node.setScale(1, 1, 1)
    }

    onChange(input: any) {
        const inputElement = document.getElementById('EditBoxId_1');
        if (!inputElement) return;
        if (input.length > this.editBox.maxLength) {
            this.keyboard.setInput(this.editBox.string);
            inputElement.value = this.editBox.string;
            this.fakeTxt.string = this.editBox.string;
        } else {
            this.editBox._editBoxTextChanged(input);
            this.editBox.string = input;
            inputElement.value = input;
            this.fakeTxt.string = input;
        }
    }
}
