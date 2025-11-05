
import { _decorator, CCBoolean, CCFloat, CCInteger, Component, Node, UITransform, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MiniMap')
export class MiniMap extends Component {
@property(Node)
  sprite1!: Node;

  @property(Node)
  sprite2!: Node;

  @property(CCFloat)
  speed: number = 1;

  @property(CCInteger)
  size = 1334;

  @property(CCBoolean)
  isLoop: boolean = false;

  mOriPos1!: Vec3;
  mOriPos2!: Vec3;

  private isFinished: boolean = false;

  start() {
    this.size *= this.sprite1 ? this.sprite1.scale.x : 1;
    this.sprite1 && (this.mOriPos1 = this.sprite1.position.clone());
    this.sprite2 && (this.mOriPos2 = this.sprite2.position.clone());
  }

  onEnable() {
    this.mOriPos1 && (this.sprite1.position = this.mOriPos1);
    this.mOriPos2 && (this.sprite2.position = this.mOriPos2);
    this.isFinished = false;
  }

  isMapFinished(): boolean {
    return this.isFinished;
  }

  updatePosition(scaleTime: number) {
    if (this.isFinished) return;

    let move = this.speed * scaleTime;

    if (this.sprite1) {
      let pos = this.sprite1.position.clone();
      pos.x = pos.x - move;
      this.sprite1.position = pos;
    }

    if (this.sprite2) {
      let pos = this.sprite2.position.clone();
      pos.x = pos.x - move;
      this.sprite2.position = pos;
    }

    let allSpritesFinished = true;
    let hasActiveSprite = false;

    if (this.sprite1) {
      hasActiveSprite = true;
      if (this.sprite1.position.x > -this.size) {
        allSpritesFinished = false;
      }
    }

    if (this.sprite2) {
      hasActiveSprite = true;
      if (this.sprite2.position.x > -this.size) {
        allSpritesFinished = false;
      }
    }

    if (allSpritesFinished && hasActiveSprite) {
      if (this.isLoop) {
        if (this.sprite1) {
          this.sprite1.position = this.mOriPos1;
        }
        if (this.sprite2) {
          this.sprite2.position = this.mOriPos2;
        }
      } else {
        this.isFinished = true;
      }
    }
  }

}


