
import { _decorator, Component, Node, CCFloat, tween, color, Color, UIOpacity, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Fade')
export class Fade extends Component {
    @property(UIOpacity)
    overlay: UIOpacity;

    @property(CCFloat)
    timeIn: number = 1;

    @property(CCFloat)
    timeOut: number = 1;

    private playing = false;

    get Playing() {
        return this.playing;
    }

    in(callback: Function = undefined) {
        this.overlay.opacity = 0;
        this.overlay.node.setScale(new Vec3(1, 1, 1));
        tween(this.overlay).to(
            this.timeIn,
            {
                opacity: 255
            },
            {
                onStart: () => {
                },
                onComplete: () => {
                    this.overlay.opacity = 0;
                    callback && callback();
                }
            }
        ).start();
    }

    out(callback: Function = undefined) {
        this.overlay.opacity = 255;
        this.overlay.node.setScale(new Vec3(1, 1, 1));
        tween(this.overlay).to(
            this.timeOut,
            {
                opacity: 0
            },
            {
                onStart: () => {
                },
                onComplete: () => {
                    callback && callback();
                    this.overlay.node.setScale(new Vec3(0, 0, 0));
                }
            }
        ).start();
    }

    black() {
        this.overlay.opacity = 255;
    }
}
