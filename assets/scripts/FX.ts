import { _decorator, Component, Node } from "cc";
const { ccclass, property } = _decorator;

@ccclass("FX")
export class FX extends Component {
  Destroy() {
    this.node.destroy();
  }
}
