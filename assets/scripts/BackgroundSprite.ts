
import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import { Config } from './Defines';
const { ccclass, property } = _decorator;


@ccclass('BackgroundSprite')
export class BackgroundSprite extends Component {
    @property(SpriteFrame)
    frames: SpriteFrame[] = [];

    // protected onEnable(): void {
    //     try {
    //         const isNight = new Date().getHours() >= 18;
    //         this.getComponent(Sprite).spriteFrame = this.frames[Config.profiles.map * 2 + (isNight ? 1 : 0)];
    //     } catch (e) {
    //         console.log(this.node.name)
    //     }

    // }
}