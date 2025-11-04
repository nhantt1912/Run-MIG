
import { _decorator, Animation, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BrandLogo')
export class BrandLogo extends Component {
    protected onLoad(): void {
        this.node.children.forEach((light, index) => {
            setTimeout(() => {
                light.getComponent(Animation).play();
            }, index * 30);
        })
    }
}