import { _decorator, Component, Node, UITransform } from "cc";
const { ccclass, property } = _decorator;

@ccclass("Background")
export class Background extends Component {
  protected start(): void {
    let screenRaito = window.innerHeight / window.innerWidth;
    const bgRaito =
      this.getComponent(UITransform).height /
      this.getComponent(UITransform).width;
    if (screenRaito > 1) {
      screenRaito = 1 / screenRaito;
    }
    if (screenRaito > bgRaito) {
      const scale = screenRaito / bgRaito;
      this.node.setScale(scale, scale, scale);
    }
  }
}
