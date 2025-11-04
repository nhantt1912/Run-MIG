
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CheckBox')
export class CheckBox extends Component {
    @property(Node)
    check: Node;

    private isChecked: boolean;
    
    protected onEnable(): void {
        this.initCheckBox();
    }

    initCheckBox() {
        this.isChecked = false;
        this.check.active = this.isChecked;
    }

    onCheck() {
        this.isChecked = !this.isChecked;
        this.check.active = this.isChecked;
    }

    IsChecked() {
        return this.check.active;
    }
}
