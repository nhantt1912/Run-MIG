
import { _decorator, Component, Node } from 'cc';
import { MiniMap } from '../GamePlay/MiniMap';
import { DeltaTime_Monitor } from '../Cores/DefinesStudy';
import Timer from '../../core/Timer';
const { ccclass, property } = _decorator;

@ccclass('MapControllerStudy')
export class MapControllerStudy extends Component {

    timerMain: Timer = new Timer();

    @property([MiniMap])
    arrMap: MiniMap[] = [];

    @property([MiniMap])
    arrBackground: MiniMap[] = [];

    private currentMapIndex: number = 0;

    update(timeScale: number) {
        this.arrBackground.forEach((map) => map.updatePosition(timeScale));
        if (this.currentMapIndex < this.arrMap.length) {
            const currentMap = this.arrMap[this.currentMapIndex];

            currentMap.updatePosition(timeScale);

            if (currentMap.isMapFinished()) {
                currentMap.node.active = false;
                this.currentMapIndex++;

                if (this.currentMapIndex < this.arrMap.length) {
                    console.log(`Starting Map ${this.currentMapIndex}`);
                } else {
                    console.log(`ALL MAPS FINISHED!`);
                }
            }
        }
    }
}


