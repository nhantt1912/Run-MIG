import {
  _decorator,
  Component,
  Node,
  sp,
  CCInteger,
  UITransformComponent,
  view,
  Animation,
  UITransform,
  Vec3,
} from "cc";
import EventManager from "./core/EventManager";
import {
  ItemState,
  EventType,
  ItemAnim,
  ScoreAnim,
  ActionIngame,
  BUFF,
  EnumToCCEnum,
} from "./Defines";
import { EFFECTS, FXMgr } from "./FXMgr";
const { ccclass, property } = _decorator;

@ccclass("Item")
export class Item extends Component {
  @property(sp.Skeleton)
  skeleton?: sp.Skeleton;

  @property(Node)
  sprite?: Node;

  @property(CCInteger)
  type: number = 0;

  @property(sp.Skeleton)
  score: sp.Skeleton;

  @property({ type: EnumToCCEnum(BUFF) })
  public specialType: number = BUFF.NONE;

  mState!: ItemState;
  mWidthH!: number;
  mViewWidth!: number;

  isX2 = false;
  collected = false;

  private originPos: Vec3;

  protected onLoad(): void {
    this.originPos = this.node.worldPosition.clone();
  }

  start() {
    EventManager.GetInstance().on(EventType.INGAME, this.OnIngameEvent, this);
    if (this.skeleton) {
      this.mWidthH =
        this.skeleton.getComponent(UITransformComponent).contentSize.width *
        0.5;
    } else {
      this.mWidthH = this.sprite.getComponent(UITransform).width * 0.5;
    }
    this.mViewWidth = view.getVisibleSize().width;
  }

  protected onEnable(): void {
    this.switchState(ItemState.IDLE);
  }

  // update() {
  //   let x = this.node.worldPosition.x;
  //   if (x + this.mWidthH < 0 || x - this.mWidthH > this.mViewWidth) {
  //     if (this.skeleton) {
  //       if (this.skeleton.node.active) {
  //         this.skeleton.node.active = false;
  //         this.score.node.active = false;
  //         this.switchState(ItemState.IDLE);
  //       }
  //     } else {
  //       this.score.node.active = false;
  //       this.switchState(ItemState.IDLE);
  //     }
  //   } else if (this.skeleton && !this.skeleton.node.active) {
  //     this.skeleton.node.active = true;
  //     this.score.node.active = true;
  //   } else if (this.sprite) {
  //     this.score.node.active = true;
  //   }
  // }

  private switchState(state: ItemState) {
    if (state == this.mState) return;

    switch (state) {
      case ItemState.IDLE: {
        this.node.setWorldPosition(this.originPos);
        this.node.setScale(Vec3.ONE);
        if (this.skeleton) {
          this.skeleton?.setAnimation(0, ItemAnim.IDLE, true);
        } else {
          this.sprite.active = true;
        }
        this.isX2 = false;
        // this.score.setAnimation(0, ScoreAnim.IDLE, false);
        this.node.getComponent(Animation)?.play();
        break;
      }
      case ItemState.COLLECT: {
        let param = {
          itemType: this.type,
          special: this.specialType,
        };
        // EventManager.GetInstance().emit(EventType.COLLECT, param);
        EventManager.GetInstance().emit(EventType.UPDATE_SCORE, 100);

        if (this.skeleton) {
          this.skeleton.setAnimation(0, ItemAnim.COLLECT, false);
          this.skeleton.setCompleteListener(() => {
            this.skeleton.node.active = false;
          });
          this.score.setAnimation(0, ScoreAnim.ITEM, false);
        } else {
          this.sprite.active = false;
        }
        let scoreAnim = ScoreAnim.ITEM;
        if (this.specialType > 0) {
          if (this.isX2) {
            scoreAnim = ScoreAnim.SPECIAL_ITEM_X2;
          } else {
            scoreAnim = ScoreAnim.SPECIAL_ITEM;
          }
        } else {
          if (this.isX2) {
            scoreAnim = ScoreAnim.ITEM_X2;
          } else {
            scoreAnim = ScoreAnim.ITEM;
          }
        }
        if (this.type === 0 && this.specialType === 0) {
          scoreAnim = ScoreAnim.ITEM_X2;
        }
        // this.score.setAnimation(0, scoreAnim, false);

        break;
      }
      default:
        break;
    }
    this.mState = state;
  }

  public onCollect(isX2 = false) {
    this.collected = true;
    this.isX2 = isX2;
    this.switchState(ItemState.COLLECT);
    // FXMgr.Instance.playFX(EFFECTS.PLUS50);
    // FXMgr.Instance.collectCoin(this.node);
    // this.node.getComponent(Animation)?.play("collect-item");
  }

  OnIngameEvent(parameters: any) {
    if (!this.node.active) {
      return;
    }

    switch (parameters.action) {
      case ActionIngame.EXIT:
        this.skeleton && (this.skeleton.timeScale = 0);
        this.score.timeScale = 0;
        break;

      case ActionIngame.CONTINUE:
        this.skeleton && (this.skeleton.timeScale = 1);
        this.score.timeScale = 1;
        break;
    }
  }
}
