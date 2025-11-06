import {
  _decorator,
  Component,
  Label,
  Node,
  sp,
  Sprite,
  SpriteFrame,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("ItemBoard")
export class ItemBoard extends Component {
  @property(Sprite)
  rankIcon: Sprite = null;

  @property(Label)
  playerName: Label = null;

  @property(Label)
  score: Label = null;

  init(name: string, score: number, rankIcon: SpriteFrame = null) {
    this.playerName.string = name;
    this.score.string = score.toString();
    if (rankIcon && this.rankIcon) {
      this.rankIcon.spriteFrame = rankIcon;
    }
  }
}
