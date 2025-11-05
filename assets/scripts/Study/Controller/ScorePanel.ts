import { _decorator, Component, Label, Node } from "cc";
import { PanelBase } from "./PanelBase";
import EventManager from "../../core/EventManager";
import { EventType } from "../../Defines";
const { ccclass, property } = _decorator;

@ccclass("ScorePanel")
export class ScorePanel extends PanelBase {
  @property(Label)
  scoreLabel: Label = null;

  private scoreCurrent: number = 0;

  protected start(): void {
    EventManager.GetInstance().on(
      EventType.UPDATE_SCORE,
      this.updateScore,
      this
    );
  }

  updateScore(score: number) {
    this.scoreCurrent += score;
    this.updateText(this.scoreLabel, this.scoreCurrent.toString());
    console.log(`Score: ${this.scoreCurrent}`);
  }
}
