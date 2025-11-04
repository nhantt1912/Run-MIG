
import { _decorator, Component, Node, UITransformComponent, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Platform')
export class Platform extends Component {
    @property(Node)
    sprite!: Node;

    mWidthH!: number;
    mViewWidth!: number;

    start() {
        this.mWidthH = this.sprite.getComponent(UITransformComponent).contentSize.width * 0.5;
        this.mViewWidth = view.getVisibleSize().width;
    }

    update() {
        let x = this.sprite.worldPosition.x;
        if (x + this.mWidthH < 0 || x - this.mWidthH > this.mViewWidth) {
            if (this.sprite.active) {
                this.sprite.active = false;
            }
        }
        else if (!this.sprite.active) {
            this.sprite.active = true;
        }
    }
}
