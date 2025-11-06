import { _decorator, Component, Node } from "cc";
import { MiniMap } from "../GamePlay/MiniMap";
import { DeltaTime_Monitor, EVENT_TYPE } from "../Cores/DefinesStudy";
import Timer from "../../core/Timer";
import EventManager from "../../core/EventManager";
const { ccclass, property } = _decorator;

@ccclass("MapControllerStudy")
export class MapControllerStudy extends Component {
  timerMain: Timer = new Timer();

  @property([MiniMap])
  arrMap: MiniMap[] = [];

  @property([MiniMap])
  arrBackground: MiniMap[] = [];

  private currentMapIndex: number = 0;

  Update(deltaTime: number) {
    this.arrBackground.forEach((map) => map.updatePosition(deltaTime));
    if (this.currentMapIndex < this.arrMap.length) {
      const currentMap = this.arrMap[this.currentMapIndex];

      currentMap.updatePosition(deltaTime);

      if (currentMap.isMapFinished()) {
        currentMap.node.active = false;
        this.currentMapIndex++;

        if (this.currentMapIndex < this.arrMap.length) {
          console.log(`Starting Map ${this.currentMapIndex}`);
        } else {
          console.log(`ALL MAPS FINISHED!`);
          EventManager.GetInstance().emit(EVENT_TYPE.GAME_WIN);
        }
      }
    }
  }
}
