import { _decorator, Component, Label, Node } from "cc";
import { PanelBase } from "./PanelBase";
import EventManager from "../../core/EventManager";
import { EventType } from "../../Defines";
const { ccclass, property } = _decorator;

@ccclass("ScorePanel")
export class ScorePanel extends PanelBase {
  @property(Label)
  scoreLabel: Label = null;

  protected start(): void {
    EventManager.GetInstance().on(
      EventType.ON_SCORE_CHANGE,
      this.updateScore,
      this
    );
  }

  updateScore(score: number) {
    console.log("updateScore", score);
    this.updateText(this.scoreLabel, score.toString());
  }
}
