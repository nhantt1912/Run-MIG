
import { _decorator, Color, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TopItem')
export class TopItem extends Component {
    @property(Label)
    public rank: Label = null;

    @property(Label)
    public userName: Label = null;

    @property(Label)
    public score: Label = null;

    @property(SpriteFrame)
    public avtFrames: SpriteFrame[] = [];

    @property(Sprite)
    public avt: Sprite;

    private originColor = null;

    protected onLoad(): void {
    }
    init(rank: number, name: string, score: number, avt: number = -1) {
        this.node.active = true;
        this.setRank(rank);
        this.setName(name);
        this.setScore(score);
        if (this.avt && avt >= 0) {
            this.setAvt(avt);
        }

        switch (rank) {
            case 1:
                this.originColor = new Color(174, 223, 249);
                this.getComponent(Sprite).color = this.originColor;
                break;
            case 2:
                this.originColor = new Color(203, 235, 252);
                this.getComponent(Sprite).color = this.originColor;
                break;
            case 3:
                this.originColor = new Color(224, 244, 255);
                this.getComponent(Sprite).color = this.originColor;
                break;
            default:
                this.originColor = new Color(255, 255, 255);
                this.getComponent(Sprite).color = this.originColor;
                break;
        }

    }

    highlight(enable: boolean) {
        this.rank.color = enable ? Color.WHITE : new Color(0, 0, 0);
        this.userName.color = enable ? Color.WHITE : new Color(0, 0, 0);
        this.score.color = enable ? Color.WHITE : new Color(0, 0, 0);
        this.getComponent(Sprite).color = enable ? new Color(10, 31, 64) : this.originColor;
    }

    setAvt(avt: number) {
        this.avt.spriteFrame = this.avtFrames[avt];
    }

    setRank(rank: number | string) {
        if (this.rank) {
            this.rank.string = rank.toString();;
        }
    }

    setScore(score: number | string) {
        this.score.string = score.toString();;
    }

    setName(name: string) {
        const nameToUse = name.length > 5 ? name.slice(0, 5) + '...' : name;
        this.userName.string = nameToUse;
    }
}