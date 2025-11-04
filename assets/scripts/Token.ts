
import { _decorator, Component, Node, Label, Sprite, SpriteFrame, UITransform, Vec3, CCString, instantiate, Layout } from 'cc';
import { GetRewardAmount, GetRewardIcon, GetSpriteFrameFromUrl } from './core/Utils';
const { ccclass, executeInEditMode, property } = _decorator;

@ccclass('Token')
export class Token extends Component {

    @property(Layout)
    container: Layout;

    @property(Sprite)
    spriteIcon: Sprite;

    @property(Label)
    num1: Label;

    onEnable() {
        if (!(<any>window).isOutfit7) {
            this.SetText();
        }
    }

    SetText() {
        const amount = GetRewardAmount();
        const url = `https://cdn.gold.g4b.gameloft.com/${GetRewardIcon()}`

        GetSpriteFrameFromUrl(url)
            .then((spriteFrame: SpriteFrame) => {
                this.spriteIcon.spriteFrame = spriteFrame;
            })
            .catch(error => {

            })

        // const numb1_txt = Math.floor(amount / 10);
        const amountStr = amount.toString();

        // for (let i = 0; i < amountStr.length - 2; i++) {
        //     const newNum = instantiate(this.num1.node.parent);
        //     newNum.parent = this.num1.node.parent.parent;
        //     newNum.active = true;
        //     newNum.setSiblingIndex(this.num1.node.parent.getSiblingIndex() + 1);
        this.num1.getComponent(Label).string = amountStr;
        //     newNum.children[0].getComponent(Sprite).spriteFrame = this.numbers[Number(amountStr[i + 1])]
        // }
        // if (numb1_txt <= 0) {
        //     this.num1.node.parent.active = false;
        // } else {
        //     this.num1.node.parent.active = true;
        // }

        this.num1.string = Number(amountStr[0]).toString();
        this.container.updateLayout();
    }
}

