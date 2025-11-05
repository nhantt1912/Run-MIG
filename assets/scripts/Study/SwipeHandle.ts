import { _decorator, Component, Node, EventTouch, Vec2, EventTarget } from "cc";
import EventManager from "../core/EventManager";
import { EVENT_TYPE } from "./Cores/DefinesStudy";
const { ccclass, property } = _decorator;

@ccclass("SwipeHandler")
export class SwipeHandler extends Component {
  @property
  private swipeThreshold: number = 50;

  private startTouchPos: Vec2 | null = null;
  private hasSwipedUp: boolean = false;

  onEnable() {
    this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  onDisable() {
    this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
    this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }

  private onTouchStart(event: EventTouch) {
    const pos = event.getLocation();
    this.startTouchPos = new Vec2(pos.x, pos.y);
    this.hasSwipedUp = false;
  }

  private onTouchMove(event: EventTouch) {
    if (!this.startTouchPos || this.hasSwipedUp) return;

    const currentPos = event.getLocation();
    const deltaY = currentPos.y - this.startTouchPos.y;

    if (deltaY > this.swipeThreshold) {
      this.hasSwipedUp = true;
      EventManager.GetInstance().emit(EVENT_TYPE.SWIPE_UP);
      console.log("swipe up");
    }
  }

  private onTouchEnd() {
    this.startTouchPos = null;
    this.hasSwipedUp = false;
  }
}
