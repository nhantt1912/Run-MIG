import {
  _decorator,
  Component,
  Node,
  CCFloat,
  CCInteger,
  Vec3,
  CCBoolean,
} from "cc";
import { Config, DeltaTime, GameDefine } from "./Defines";
const { ccclass, property } = _decorator;

@ccclass("MapLayer")
export class MapLayer extends Component {
  @property(Node)
  sprite1!: Node;

  @property(Node)
  sprite2!: Node;

  @property(CCFloat)
  speed: number = 1;

  @property(CCInteger)
  size = 1334;

  @property(CCBoolean)
  loop: boolean = true;

  @property(CCBoolean)
  auto: boolean = false;

  @property(Node)
  oneTimesObject?: Node;

  @property(Number)
  timerCanUpdate: number = 0;

  mOriPos1!: Vec3;
  mOriPos2!: Vec3;

  start() {
    this.size *= this.sprite1 ? this.sprite1.scale.x : 1;
    this.sprite1 && (this.mOriPos1 = this.sprite1.position.clone());
    this.sprite2 && (this.mOriPos2 = this.sprite2.position.clone());
  }

  onEnable() {
    this.mOriPos1 && (this.sprite1.position = this.mOriPos1);
    this.mOriPos2 && (this.sprite2.position = this.mOriPos2);
    this.oneTimesObject && (this.oneTimesObject.active = true);
  }

  updatePosition(scaleTime: number, currentTime: number) {
    const time = Config.gameDuration - currentTime;
    if (this.timerCanUpdate > time) return;
    let move = this.speed * scaleTime;
    if (this.name === "Objects") {
      console.log("aslkgjsalkgj");
    }
    if (this.sprite1) {
      let pos = this.sprite1.position.clone();
      pos.x =
        (pos.x <= -this.size && this.loop
          ? this.sprite2.position.x + this.size
          : pos.x) - move;
      this.sprite1.position = pos;
    }

    if (this.sprite2) {
      let pos = this.sprite2.position.clone();
      pos.x =
        (pos.x <= -this.size && this.loop
          ? this.sprite1.position.x + this.size
          : pos.x) - move;
      this.sprite2.position = pos;
    }
  }

  update(dt: number) {
    if (this.auto) {
      this.updatePosition(Math.min(dt / DeltaTime, 2));
    }
  }
}
