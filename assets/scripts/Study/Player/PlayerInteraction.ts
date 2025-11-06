import {
  _decorator,
  BoxCollider2D,
  Component,
  Contact2DType,
  IPhysics2DContact,
  Node,
} from "cc";
import { EventType, Layer } from "../../Defines";
import EventManager from "../../core/EventManager";
const { ccclass, property } = _decorator;

@ccclass("PlayerInteraction")
export class PlayerInteraction extends Component {
  @property(BoxCollider2D)
  boxCollider: BoxCollider2D;

  protected start(): void {
    this.boxCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    this.boxCollider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
  }

  onBeginContact(
    selfCollider: BoxCollider2D,
    otherCollider: BoxCollider2D,
    contact: IPhysics2DContact | null
  ) {
    switch (otherCollider.node.layer) {
      case Layer.ITEM:
        EventManager.GetInstance().emit(EventType.ON_HIT, otherCollider.node);
        break;
      case Layer.OBSTACLE:
        break;
      case Layer.PLATFORM:
        break;
    }
  }

  onEndContact(
    selfCollider: BoxCollider2D,
    otherCollider: BoxCollider2D,
    contact: IPhysics2DContact | null
  ) {
    EventManager.GetInstance().emit(EventType.END_CONTACT, otherCollider.node);
  }
}
