import { _decorator, Component, Node, tween, Vec3 } from "cc";
import EventManager from "../../core/EventManager";
import { EVENT_TYPE } from "../Cores/DefinesStudy";
const { ccclass, property } = _decorator;

@ccclass("LeaderBoardPopup")
export class LeaderBoardPopup extends Component {
  onShow() {
    this.node.active = true;
    this.node.setScale(Vec3.ZERO);
    tween(this.node)
      .to(0.3, { scale: new Vec3(1.1, 1.1, 1) }, { easing: "backOut" })
      .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: "sineOut" })
      .start();
  }

  onHide() {
    tween(this.node)
      .to(0.2, { scale: Vec3.ZERO }, { easing: "backIn" })
      .call(() => {
        this.node.active = false;
      })
      .start();
  }
}
