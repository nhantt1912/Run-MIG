
import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Buff')
export class Buff extends Component {
    @property(Label)
    time: Label;

    setTime(time: number) {
        this.time.string = Math.floor(time + 1) + 's'
    }
}