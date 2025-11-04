
import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
import EventManager from './core/EventManager';
import { EventType } from './Defines';
const { ccclass, property } = _decorator;

@ccclass('LocalizeMusic')
export class LocalizeMusic extends Component {
    // @property(AudioClip)
    // bgm: AudioClip[] = [];

    // protected onLoad(): void {
    //     EventManager.GetInstance().on(EventType.MAP_CHANGE, this.onMapChanged, this);
    // }

    // onMapChanged(paramaters: any) {
    //     const { map } = paramaters;
    //     this.getComponent(AudioSource).clip = this.bgm[map];
    // }
}
