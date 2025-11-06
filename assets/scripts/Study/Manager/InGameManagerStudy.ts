import { _decorator, Component, Node } from "cc";
import { DeltaTime_Monitor } from "../Cores/DefinesStudy";
import { MapControllerStudy } from "../Controller/MapControllerStudy";
import Timer from "../../core/Timer";
import { GameStateManager } from "./GameStateManager";
import EventManager from "../../core/EventManager";
import { EventType } from "../../Defines";
import { PlayerController } from "../Controller/PlayerController";
import { LeaderBoardManager } from "../../Leaderboard/LeaderBoardManager";
const { ccclass, property } = _decorator;

@ccclass("InGameManagerStudy")
export class InGameManagerStudy extends Component {
  @property(Number)
  currentHeart: number;

  @property(Number)
  currentScore: number = 0;

  @property(MapControllerStudy)
  mapController: MapControllerStudy = null!;

  @property(PlayerController)
  player: PlayerController = null!;

  @property(LeaderBoardManager)
  leaderBoardManager: LeaderBoardManager = null!;

  @property(Node)
  tounch: Node = null!;

  timeSlow: Timer = new Timer();
  timeBoost: Timer = new Timer();

  private mSpeed = 1;
  private deltaTime = 0;

  private bonusSpeed: number = 1;
  private bonusSlow: number = 1;

  protected start(): void {
    GameStateManager.Instance.play();
    EventManager.GetInstance().on(EventType.ON_HIT, this.onHit, this);
    EventManager.GetInstance().on(
      EventType.COLLECT_ITEM,
      this.onCollectItem,
      this
    );
  }

  update(dt: number) {
    if (!GameStateManager.Instance.isPlaying()) return;
    this.deltaTime += dt;
    if (this.deltaTime > DeltaTime_Monitor) {
      const times = Math.floor(this.deltaTime / DeltaTime_Monitor);
      this.deltaTime -= times * DeltaTime_Monitor;

      for (let i = 0; i < times; i++) {
        this.fixedUpdate(DeltaTime_Monitor);
      }
    }
  }

  fixedUpdate(deltaTime: number) {
    let timeScale = Math.min(this.mSpeed, 2);

    let gameSpeedDeltaTime = timeScale * this.bonusSpeed * this.bonusSlow;
    this.mapController.Update(gameSpeedDeltaTime);
    this.player.Update(timeScale);

    this.timeSlow.Update(deltaTime);
    this.timeBoost.Update(deltaTime);
    if (this.timeSlow.JustFinished()) {
      console.log("Timer Slow Finished");
      this.bonusSlow = 1;
    }

    if (this.timeBoost.JustFinished()) {
      console.log("Timer Boost Finished");
      this.bonusSpeed = 1;
    }
  }

  onCollectItem(type: number) {
    console.log("onCollectItem", type);
    switch (type) {
      case 7:
        this.currentScore += 10000;

        EventManager.GetInstance().emit(
          EventType.ON_SCORE_CHANGE,
          this.currentScore
        );
        break;
      case 1:
        this.timeBoost.SetDuration(2);
        this.bonusSpeed += 0.5;
        break;
    }
  }

  onHit(type: number) {
    console.log("onHit", type);
    switch (type) {
      case 0:
        this.currentHeart--;
        EventManager.GetInstance().emit(
          EventType.ON_HEART_CHANGE,
          this.currentHeart
        );

        if (this.currentHeart <= 0) {
          GameStateManager.Instance.gameOver();
          this.onGameOver();
        }
        break;
      case 1:
        this.bonusSlow -= 0.5;
        this.timeSlow.SetDuration(2);
        break;
    }
  }

  onGameOver() {
    this.player.onGameOver();
    this.mSpeed = 0;
    this.tounch.active = false;

    this.leaderBoardManager.addPlayerData(
      this.player.playerName,
      this.currentScore
    );
  }
}
