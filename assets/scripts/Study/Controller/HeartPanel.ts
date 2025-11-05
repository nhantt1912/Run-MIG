import { _decorator, Component, Label, Node } from "cc";
import { PanelBase } from "./PanelBase";
import EventManager from "../../core/EventManager";
import { EventType } from "../../Defines";
const { ccclass, property } = _decorator;

@ccclass("HeartPanel")
export class HeartPanel extends PanelBase {
  @property(Label)
  heartLable: Label = null;

  private heartCurrent: number = 5;

  protected start(): void {
    EventManager.GetInstance().on(
      EventType.UPDATE_HEART,
      this.updateHeart,
      this
    );
  }

  updateHeart(heart: number) {
    this.heartCurrent -= heart;
    this.updateText(this.heartLable, this.heartCurrent.toString());
  }
}
