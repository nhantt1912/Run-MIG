import {
  _decorator,
  Component,
  Node,
  Sprite,
  SpriteFrame,
  tween,
  UIOpacity,
} from "cc";
import { Ingame } from "./views/Ingame";
const { ccclass, property } = _decorator;

@ccclass("FrameChanger")
export class FrameChanger extends Component {
  @property(Node)
  normalSprite: Node;
  @property(Node)
  blurringSprite: Node;

  private isBlurring: boolean;

  protected onEnable(): void {
    this.isBlurring = false;
    this.normalSprite.active = true;
    this.blurringSprite.active = true;
    this.blurringSprite.getComponent(UIOpacity).opacity = 5;
  }

  onBlur() {
    if (this.isBlurring) return;
    this.isBlurring = true;
    tween(this.blurringSprite.getComponent(UIOpacity))
      .to(0.5, { opacity: 255 })
      .start();
  }

  onNormal() {
    if (!this.isBlurring) return;
    this.isBlurring = false;
    tween(this.blurringSprite.getComponent(UIOpacity))
      .to(0.5, { opacity: 0 })
      .start();
  }
}
