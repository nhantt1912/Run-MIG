import { _decorator, Component, Node } from "cc";
import EventManager from "../../core/EventManager";
import { EVENT_TYPE } from "../Cores/DefinesStudy";
const { ccclass, property } = _decorator;

@ccclass("UIManager")
export class UIManager extends Component {
  @property(Node)
  gameOverPopup: Node = null;

  protected start(): void {
    EventManager.GetInstance().on(
      EVENT_TYPE.GAME_OVER,
      this.showGameOverPopup,
      this
    );
  }

  showGameOverPopup() {
    // this.gameOverPopup.active = true;
  }
}
