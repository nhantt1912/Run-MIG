
import { _decorator, Color, Component, Label, Node, tween, UITransform, Vec2, Vec3 } from 'cc';
import { i18n } from '../i18n/i18n';
const { ccclass, property } = _decorator;

@ccclass('CountryName')
export class CountryName extends Component {
    protected update(dt: number): void {
        if (this.getComponent(UITransform).width > 70) {
            if (!this.node.children[0].active) {
                this.getComponent(Label).color = new Color(125, 77, 241);
                this.node.children[0].active = true;
            }

            this.node.setPosition(new Vec3(this.node.position.x - 25 * dt, 90, this.node.position.z));

            if (this.node.position.x < -this.getComponent(UITransform).width / 2 - 10) {
                this.node.setPosition(new Vec3(this.getComponent(UITransform).width / 2, 90, this.node.position.z));
            }
        } else {
            if (this.node.children[0].active) {
                this.getComponent(Label).color = new Color(0, 0, 0);
                this.node.children[0].active = false;
            }
            this.node.setPosition(Vec3.ZERO);
        }
    }
}
