import { _decorator, Component, Node } from "cc";
import { DeltaTime_Monitor } from "../Cores/DefinesStudy";
import { MapControllerStudy } from "../Controller/MapControllerStudy";
import Timer from "../../core/Timer";
import { GameStateManager } from "./GameStateManager";
import EventManager from "../../core/EventManager";
import { EventType } from "../../Defines";
const { ccclass, property } = _decorator;

@ccclass("InGameManagerStudy")
export class InGameManagerStudy extends Component {
  @property(MapControllerStudy)
  mapController: MapControllerStudy = null!;

  private bonusSpeed: number = 0.8;
  private bonusSlow: number = 0.8;

  private currentHeart: number = 5;

  timerMain: Timer = new Timer();

  private mSpeed = 1;
  private deltaTime = 0;

  protected start(): void {
    GameStateManager.Instance.play();
    EventManager.GetInstance().on(
      EventType.UPDATE_HEART,
      this.checkHeartCurrent,
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
    let timeScale = Math.min((this.mSpeed * deltaTime) / DeltaTime_Monitor, 2);

    this.timerMain.Update(deltaTime);

    this.mapController.update(timeScale * this.bonusSpeed * this.bonusSlow);
  }

  checkHeartCurrent(heart: number) {
    this.currentHeart = heart;

    if (this.currentHeart <= 0) {
      GameStateManager.Instance.gameOver();
    }
  }
}
