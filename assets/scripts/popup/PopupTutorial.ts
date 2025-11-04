import {
  _decorator,
  Component,
  Vec3,
  tween,
  UITransform,
  view,
  Node,
  Prefab,
  instantiate,
  v3,
  Button,
} from "cc";
import EventManager from "../core/EventManager";
import { ActionPopupTutorial, EventType } from "../Defines";
const { ccclass, property } = _decorator;

@ccclass("PopupTutorial")
export class PopupTutorial extends Component {
  @property(Node)
  container: Node;
  @property(Node)
  tutorials: Node[] = [];
  @property(Node)
  btnExit: Node = null;
  @property(Node)
  hands: Node[] = [];

  private currentTutorial: number;

  protected onLoad(): void {
    this.node.on(Node.EventType.TOUCH_END, this.onTouch, this);
    this.btnExit.active = false;
    this.currentTutorial = 0;
    this.tutorials.forEach((tutorial, i) => {
      tutorial.active = this.currentTutorial == i;
    });
    this.hands.forEach((hand, i) => {
      hand.active = this.currentTutorial == i;
    });
  }

  onEnable() {
    this.container.setScale(new Vec3(0, 0, 1));
    tween(this.container)
      .to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: "elasticOut" })
      .start();

    this.node.getComponent(UITransform).contentSize = view.getVisibleSize();
  }

  onNextTutorial() {
    if (this.currentTutorial == this.tutorials.length - 1) {
      return;
    }
    this.currentTutorial++;
    this.tutorials.forEach((tutorial, i) => {
      tutorial.active = this.currentTutorial == i;
    });
    this.hands.forEach((hand, i) => {
      hand.active = this.currentTutorial == i;
    });
  }

  onTouch() {
    // this.btnExit.active = !(window as any).isOutfit7;
    if (this.currentTutorial == this.tutorials.length - 1) {
      this.node.off(Node.EventType.TOUCH_END);
      this.OnHide();
      return;
    }
    this.currentTutorial++;
    this.tutorials.forEach((tutorial, i) => {
      tutorial.active = this.currentTutorial == i;
    });
    this.hands.forEach((hand, i) => {
      hand.active = this.currentTutorial == i;
    });
  }

  Show() {
    this.node.active = true;
  }

  IsShowing() {
    return this.node.active;
  }

  Hide(callback: any) {
    this.hands.forEach((hand, i) => {
      hand.active = false;
    });
    tween(this.container)
      .to(0.5, { scale: new Vec3(0, 0, 1) }, { easing: "elasticIn" })
      .call(() => {
        this.node.active = false;
        callback();
      })
      .start();
  }

  OnHide() {
    let paramaters = {
      action: ActionPopupTutorial.HIDE,
      data: {},
    };
    EventManager.GetInstance().emit(EventType.POPUP_TUTORIAL, paramaters);
    this.hands.forEach((hand, i) => {
      hand.active = false;
    });
  }
}
