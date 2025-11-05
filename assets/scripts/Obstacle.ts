import {
  _decorator,
  Animation,
  Component,
  director,
  instantiate,
  macro,
  Node,
  Rect,
  sp,
  Sprite,
  UIOpacity,
  UITransform,
  UITransformComponent,
  v2,
  Vec3,
  view,
} from "cc";
import EventManager from "./core/EventManager";
import {
  EventType,
  ObjectType,
  ScoreAnim,
  ActionIngame,
  EnumToCCEnum,
} from "./Defines";
import { FXMgr, EFFECTS } from "./FXMgr";
import { FrameMgr } from "./core/FrameMgr";
import { Ingame, STATE } from "./views/Ingame";
import Timer from "./core/Timer";
const { ccclass, property } = _decorator;

export enum TRAFFIC_LIGHT {
  RED = 0,
  GREEN,
}

enum OBSTACLE_TYPE {
  NONE = 0,
  CAN_BE_KNOCKED_OUT,
}

@ccclass("Obstacle")
export class Obstacle extends Component {
  @property(Node)
  sprite: Node;
  @property(Animation)
  mainAnimation: Animation;
  @property({ type: EnumToCCEnum(OBSTACLE_TYPE) })
  type: number = OBSTACLE_TYPE.NONE;

  start() {
    EventManager.GetInstance().on(EventType.INGAME, this.OnIngameEvent, this);
  }

  protected onEnable(): void {
    if (this.type === OBSTACLE_TYPE.CAN_BE_KNOCKED_OUT) {
      this.sprite.active = true;
      this.mainAnimation.node.active = false;
      this.mainAnimation.node.setScale(Vec3.ONE);
      this.mainAnimation.node.setPosition(Vec3.ZERO);
      if (this.mainAnimation.node.getComponent(UIOpacity)) {
        this.mainAnimation.node.getComponent(UIOpacity).opacity = 255;
      }
    }
  }

  public onHit() {
    let param = {
      itemType: ObjectType.OBSTACLE,
    };
    //  EventManager.GetInstance().emit(EventType.COLLECT, param);
    EventManager.GetInstance().emit(EventType.UPDATE_HEART, 1);
    // this.score.setAnimation(0, ScoreAnim.OBSTACLE, false);
  }

  onKnockOut() {
    if (this.type === OBSTACLE_TYPE.CAN_BE_KNOCKED_OUT) {
      this.sprite.active = false;
      this.mainAnimation.node.active = true;
      this.mainAnimation.play();
    }
  }

  OnIngameEvent(parameters: any) {
    if (!this.node.active) {
      return;
    }

    switch (parameters.action) {
      case ActionIngame.EXIT:
        break;

      case ActionIngame.CONTINUE:
        break;
    }
  }
}
