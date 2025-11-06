import { _decorator, Component, Label, Node } from "cc";
import { PanelBase } from "./PanelBase";
import EventManager from "../../core/EventManager";
import { EventType } from "../../Defines";
const { ccclass, property } = _decorator;

@ccclass("HeartPanel")
export class HeartPanel extends PanelBase {
  @property(Label)
  heartLable: Label = null;

  protected start(): void {
    EventManager.GetInstance().on(
      EventType.ON_HEART_CHANGE,
      this.updateHeart,
      this
    );
  }

  updateHeart(heart: number) {
    console.log("updateHeart", heart);
    this.updateText(this.heartLable, heart.toString());
  }
}
