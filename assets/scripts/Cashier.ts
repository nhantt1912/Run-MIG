
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Cashier')
export class Cashier extends Component {
    protected update(dt: number): void {
        if (this.node.worldPosition.x < -500) {
            this.node.active = false;
        }
    }

}
