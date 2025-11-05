import {
  _decorator,
  Component,
  Node,
  Collider2D,
  CCFloat,
  Contact2DType,
  IPhysics2DContact,
  Vec3,
  sp,
  tween,
  math,
  UITransform,
  Color,
  Animation,
  ProgressBar,
  UIOpacity,
  BoxCollider2D,
  Sprite,
  v3,
  ERaycast2DType,
  PhysicsSystem2D,
  PhysicsRayResult,
  ParticleSystem2D,
} from "cc";
import {
  MainCharacterState,
  Layer,
  MainCharacterAnim,
  EventType,
  ActionIngame,
  playerBuffs,
  BUFF,
  BUFFS_KEYS,
  DeltaTime,
  Config,
  SoundId,
} from "./Defines";
import { Item } from "./Item";
import { Obstacle } from "./Obstacle";
import EventManager from "./core/EventManager";
import * as R from "ramda";
import { Buff } from "./Buff";
import { Collectibles } from "./Collectibles";
import { LiveBar } from "./LiveBar";
import { SoundManager } from "./SoundManager";
const { ccclass, property } = _decorator;

export const MAP_CHAR_SKINS = [
  "char3",
  "char",
  "char4",
  "char6",
  "char5",
  "char2",
];
@ccclass("MainController")
export class MainController extends Component {
  @property(CCFloat)
  jumpPower = 20;

  @property(CCFloat)
  gravity = 10;

  @property(sp.Skeleton)
  public skeleton!: sp.Skeleton;

  @property(Node)
  public superjumpFX: Node;
  @property(Node)
  public x2FX: Node;
  @property(Node)
  public clockFX: Node;
  @property(Animation)
  public invincibleFX: Animation;

  @property(Buff)
  public superjumpUI: Buff;
  @property(Buff)
  public x2UI: Buff;
  @property(Buff)
  public clockUI: Buff;
  @property(Buff)
  public invincibleUI: Buff;
  @property(ProgressBar)
  public frenzyBar: ProgressBar;
  @property(LiveBar)
  public LiveBar: LiveBar;
  @property(SoundManager)
  public soundManager: SoundManager;

  @property(Animation)
  animationSpeedUp: Animation;
  @property(Node)
  animationWind: Node;

  @property(Node)
  shadow: Node;

  @property(Node)
  raycast: Node;

  mVelocity!: number;
  mState!: MainCharacterState;
  mCurrentPos!: Vec3;
  mOriginalPos!: Vec3;
  private buffs = { ...playerBuffs };
  private isBlinking = false;
  Lives: any = 3;
  private blockAnim: boolean;
  skin: any = 0;

  private mainAnimation: Animation;

  private shadowOriginalPos: Vec3;
  private isInvicible: boolean;

  protected onLoad(): void {
    this.mainAnimation = this.node.getComponent(Animation);
  }

  start() {
    this.mOriginalPos = this.node.position.clone();
    this.mCurrentPos = this.mOriginalPos.clone();
    EventManager.GetInstance().on(EventType.INGAME, this.OnIngameEvent, this);

    this.shadowOriginalPos = this.shadow.worldPosition.clone();

    this.raycast
      .getComponent(Collider2D)
      .on(Contact2DType.BEGIN_CONTACT, this.onRaycastBeginContact, this);
    this.raycast
      .getComponent(Collider2D)
      .on(Contact2DType.END_CONTACT, this.onRaycastEndContact, this);
  }

  onEnable() {
    this.getComponent(Collider2D).on(
      Contact2DType.BEGIN_CONTACT,
      this.onBeginContact,
      this
    );
    this.getComponent(Collider2D).on(
      Contact2DType.END_CONTACT,
      this.onEndContact,
      this
    );
    this.mVelocity = 0;
    this.Lives = 3;
    this.switchState(MainCharacterState.RUN);
    this.mainAnimation.getState("running").speed = 0;
    this.animationSpeedUp.getState("running").speed = 0;
    if (this.mOriginalPos) {
      this.mCurrentPos = this.mOriginalPos.clone();
      this.node.position = this.mOriginalPos;
    }
    this.buffs = { ...playerBuffs };
    this.cancelBuff(BUFF.FREEZE);
    this.cancelBuff(BUFF.INVINCIBILITY);
    this.cancelBuff(BUFF.SUPER_JUMP);
    this.cancelBuff(BUFF.X2);
    this.cancelBuff(BUFF.SWITCHSKIN);
    this.skin = 0;
    this.blockAnim = false;

    this.onSpeedUp(false);
    // this.skeleton.setSkin(MAP_CHAR_SKINS[Config.profiles.character]);
  }

  onDisable() {
    this.getComponent(Collider2D).off(
      Contact2DType.BEGIN_CONTACT,
      this.onBeginContact,
      this
    );
    this.getComponent(Collider2D).off(
      Contact2DType.END_CONTACT,
      this.onEndContact,
      this
    );
    this.skin = 0;
  }

  updatePosition(scaleTime: number) {
    const scaleTimeToUse = scaleTime * 1.5;
    this.updateBuff((scaleTime * DeltaTime * 144) / 60);

    this.shadow.setWorldPosition(this.shadowOriginalPos);
    const dist = Vec3.distance(
      this.node.worldPosition,
      this.shadow.worldPosition
    );
    const scaleX = Math.min(0.5 + 100 / dist, 1);
    this.shadow.setScale(v3(scaleX, this.shadow.scale.y, this.shadow.scale.y));

    // const _dir = this.node.worldPosition
    //   .clone()
    //   .subtract(this.shadow.worldPosition);
    // const _dist = Vec3.distance(
    //   this.node.worldPosition,
    //   this.shadow.worldPosition
    // );
    // this.performRaycast(this.node.worldPosition, _dir, _dist);

    switch (this.mState) {
      case MainCharacterState.RUN: {
        break;
      }

      case MainCharacterState.JUMP_UP: {
        this.node.position = this.mCurrentPos;

        if (this.mVelocity > 0) {
          this.mCurrentPos.y += this.mVelocity * scaleTimeToUse * scaleTimeToUse;
          this.mVelocity -= this.gravity * scaleTimeToUse * scaleTimeToUse;
        }
        if (this.mVelocity <= 0) {
          this.switchState(MainCharacterState.JUMP_DOWN);
        }
        break;
      }

      case MainCharacterState.JUMP_DOWN: {
        this.node.position = this.mCurrentPos;
        if (this.isOnGround()) {
          this.mCurrentPos = this.node.position.clone();
          this.switchState(MainCharacterState.RUN);
        } else {
          const maxVelocity = Math.max(-9, this.mVelocity);
          this.mCurrentPos.y = Math.max(
            this.mCurrentPos.y + maxVelocity,
            this.mOriginalPos.y
          );
          this.mVelocity -=
            (this.gravity * scaleTimeToUse * scaleTimeToUse) /
            (this.checkBuff(BUFF.X2) ? 1 : 2);
        }
        break;
      }

      default:
        break;
    }
  }

  UpdateSize(param: any) {}

  switchState(state: MainCharacterState) {
    switch (state) {
      case MainCharacterState.RUN: {
        // this.soundManager.playSound(SoundId.SFX_CAR_IDLE);
        this.mainAnimation.play("running");
        this.animationSpeedUp.play("running");
        this.animationWind.active = true;
        if (this.checkBuff(BUFF.INVINCIBILITY)) {
          /* if ( this.skeleton.animation != MainCharacterAnim.FRENZY )
                        {
                            this.skeleton.setAnimation( 0, MainCharacterAnim.FRENZY, true );
                        } */
        }
        {
          if (this.skeleton.animation != MainCharacterAnim.RUN) {
            this.skeleton.setAnimation(
              0,
              this.skin === 8 ? MainCharacterAnim.RUN2 : MainCharacterAnim.RUN,
              true
            );
          }
        }
        break;
      }

      case MainCharacterState.JUMP_UP: {
        this.mainAnimation.play("jumping");
        this.animationSpeedUp.play("jumping");
        this.animationWind.active = false;
        if (!this.checkBuff(BUFF.INVINCIBILITY)) {
          this.skeleton.setAnimation(
            0,
            this.skin === 8 ? MainCharacterAnim.JUMP : MainCharacterAnim.JUMP,
            false
          );
        }
        this.node.angle = 0;
        this.mVelocity =
          this.jumpPower * (this.checkBuff(BUFF.SUPER_JUMP) ? 1.3 : 1);
        break;
      }

      case MainCharacterState.JUMP_DOWN: {
        // this.skeleton.setAnimation(0, MainCharacterAnim.JUMP_DOWN, false);
        // this.mainAnimation.play("falling");
        this.mVelocity = 0;
        break;
      }

      default:
        break;
    }
    this.mState = state;
  }

  private isOnGround() {
    return this.mCurrentPos.y == this.mOriginalPos.y;
  }

  public jumpUp(): boolean {
    if (this.mState == MainCharacterState.RUN) {
      this.switchState(MainCharacterState.JUMP_UP);
      return true;
    }
    return false;
  }

  public jumpDown(): boolean {
    // if (this.mState == MainCharacterState.JUMP_UP || this.mState == MainCharacterState.JUMP_DOWN) {
    //     this.switchState(MainCharacterState.JUMP_DOWN);
    //     this.mVelocity = -10;
    //     return true
    // }

    if (this.mState == MainCharacterState.RUN) {
      this.switchState(MainCharacterState.JUMP_DOWN);
      this.mVelocity = -10;
      return true;
    }
    return false;
  }

  public setTimeScale(scale: number) {
    this.skeleton.timeScale = scale * 1.2;
  }

  private onBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    if (otherCollider.node.layer == Layer.ITEM) {
      otherCollider.node.getComponent(Item).onCollect(false);
    } else if (otherCollider.node.layer == Layer.OBSTACLE) {
      if (this.isInvicible) {
        otherCollider.node.getComponent(Obstacle).onKnockOut();
      } else {
        // this.Lives--;
        // this.LiveBar.RemoveHeart(this.Lives);
        otherCollider.node.getComponent(Obstacle).onHit();
        this.blink();
      }
    } else if (otherCollider.node.parent.layer == Layer.PLATFORM) {
      if (this.mState == MainCharacterState.JUMP_DOWN) {
        let self = selfCollider.worldAABB;
        let other = otherCollider.worldAABB;
        const height = self.yMax - self.yMin + 110;
        if (
          self.xMax >= other.xMin &&
          self.xMin <= other.xMax &&
          self.yMin >= other.yMin
        ) {
          this.node.setWorldPosition(
            new Vec3(
              this.node.worldPosition.x,
              other.yMax + height / 2,
              this.node.worldPosition.z
            )
          );
          this.mCurrentPos = new Vec3(
            this.mCurrentPos.x,
            this.node.position.y,
            this.mCurrentPos.z
          );
          this.switchState(MainCharacterState.RUN);
        }
      }
    }
  }

  private onEndContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    if (
      otherCollider.node.layer == Layer.PLATFORM &&
      this.mState == MainCharacterState.RUN
    ) {
      if (selfCollider.node.position.y > otherCollider.node.parent.position.y) {
        this.switchState(MainCharacterState.JUMP_DOWN);
      }
    }
  }

  private onRaycastBeginContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    if (otherCollider.node.parent.layer == Layer.PLATFORM) {
      this.shadow.active = false;
    }
  }

  private onRaycastEndContact(
    selfCollider: Collider2D,
    otherCollider: Collider2D,
    contact: IPhysics2DContact | null
  ) {
    if (otherCollider.node.layer == Layer.PLATFORM) {
      this.shadow.active = true;
    }
  }

  private blink() {
    tween(this.skeleton)
      .to(0.1, { color: new math.Color(255, 255, 255, 0) })
      .to(0.1, { color: new math.Color(255, 255, 255, 255) })
      .union()
      .repeat(2)
      .start();

    tween(this.superjumpFX.getComponent(sp.Skeleton))
      .to(0.1, { color: new math.Color(255, 255, 255, 0) })
      .to(0.1, { color: new math.Color(255, 255, 255, 255) })
      .union()
      .repeat(2)
      .start();
  }

  performRaycast(origin: Vec3, direction: Vec3, distance: number) {
    // Calculate the endpoint of the ray
    const endPoint = new Vec3(
      origin.x + direction.x * distance,
      origin.y + direction.y * distance
    );

    // Perform the raycast
    const results = PhysicsSystem2D.instance.raycast(
      origin,
      endPoint,
      ERaycast2DType.Any
    );

    console.log(results);

    // if (results.length > 0) {
    //   console.log("Ray hit objects:");
    //   results.forEach((result) => {
    //     const collider = result.collider as BoxCollider2D;
    //     console.log("collider:", collider.node.name);
    //   });
    // } else {
    //   console.log("No objects hit by the ray.");
    // }
  }

  setPlayerInvicible(active: boolean = true) {
    this.isInvicible = active;
  }

  OnIngameEvent(parameters: any) {
    if (!this.node.active) {
      return;
    }

    switch (parameters.action) {
      case ActionIngame.EXIT:
        this.skeleton.timeScale = 0;
        break;

      case ActionIngame.CONTINUE:
        this.skeleton.timeScale = 1;
        break;
    }
  }

  onSpeedUp(active: boolean = true) {
    this.animationWind.active = true;
    this.animationSpeedUp.node.active = active;
  }

  updateBuff(dt: number) {
    R.pipe(R.keys, (keys) => {
      R.forEach((key: string) => {
        const keyToUse = BUFFS_KEYS[key];
        if (keyToUse === 0) return;
        const newRemaining =
          this.buffs[keyToUse].time != -1
            ? this.buffs[keyToUse].remaining - dt
            : this.buffs[keyToUse].remaining;
        if (newRemaining <= 0) {
          if (keyToUse === BUFF.X2) {
            this.x2UI.node.active = false;
            this.x2FX.active = false;
          } else if (keyToUse === BUFF.FREEZE) {
            this.clockUI.node.active = false;
            this.clockFX.active = false;
          } else if (keyToUse === BUFF.INVINCIBILITY) {
            this.invincibleUI.node.active = false;
            this.invincibleFX.stop();
            this.isBlinking = false;
            this.invincibleFX.node.getComponent(sp.Skeleton).color =
              Color.WHITE;
          } else if (keyToUse === BUFF.SWITCHSKIN) {
            if (this.mState == MainCharacterState.RUN) {
              if (
                this.skeleton.animation != MainCharacterAnim.RUN2 &&
                this.skeleton.animation != MainCharacterAnim.RUN
              ) {
                this.skeleton.setAnimation(
                  0,
                  this.skin === 8
                    ? MainCharacterAnim.RUN2
                    : MainCharacterAnim.RUN,
                  true
                );
              }
            }
          } else if (keyToUse === BUFF.SUPER_JUMP) {
            this.superjumpUI.node.active = false;
            this.superjumpFX.active = false;
          }
        } else {
          if (keyToUse === BUFF.X2) {
            this.x2UI.setTime(newRemaining);
          } else if (keyToUse === BUFF.FREEZE) {
            this.clockUI.setTime(newRemaining);
          } else if (keyToUse === BUFF.INVINCIBILITY) {
            //if ( newRemaining < 2 )
            //{
            //if ( !this.isBlinking )
            //{
            //console.log( ';aslkgjhaslgksha' )
            //this.isBlinking = true;
            //this.invincibleFX.play();
            //}
            //}
            this.invincibleUI.setTime(newRemaining);
            this.frenzyBar.progress = newRemaining / this.buffs[keyToUse].time;
          } else if (keyToUse === BUFF.SUPER_JUMP) {
            this.superjumpUI.setTime(newRemaining);
          } else if (keyToUse === BUFF.SWITCHSKIN) {
            if (this.mState == MainCharacterState.RUN) {
              if (!this.blockAnim) {
                if (this.skeleton.animation != MainCharacterAnim.TRANSFORM) {
                  this.skeleton.setAnimation(
                    0,
                    MainCharacterAnim.TRANSFORM,
                    false
                  );
                }
              }
            } else if (this.mState == MainCharacterState.JUMP_UP) {
              if (this.skeleton.animation != MainCharacterAnim.TRANSFORM) {
                this.skeleton.setAnimation(
                  0,
                  MainCharacterAnim.TRANSFORM,
                  false
                );
                this.blockAnim = true;
              }
            }
          }
        }
        this.buffs[keyToUse] = {
          amount: this.buffs[keyToUse].amount,
          remaining: newRemaining > 0 ? newRemaining : 0,
          time: this.buffs[keyToUse].time,
        };
      })(keys);
    })(BUFFS_KEYS);
  }

  public checkBuff(buffName: number) {
    if (buffName === BUFF.INVINCIBILITY) {
      if (this.buffs[buffName].time < 0) {
        return this.buffs[buffName].amount > 0;
      }
      return this.buffs[buffName].remaining > 0;
    } else if (buffName === BUFF.SWITCHSKIN) {
      if (this.buffs[buffName].time < 0) {
        return this.buffs[buffName].amount > 0;
      }
      return this.buffs[buffName].remaining > 0;
    }
    return false;
    // if (this.buffs[buffName].time < 0) {
    //     return this.buffs[buffName].amount > 0;
    // }
    // return this.buffs[buffName].remaining > 0;
  }

  public addBuff(buffName: number, amount: number) {
    this.buffs[buffName].amount = this.buffs[buffName].amount + amount;
  }

  public activeBuff(buffName: number) {
    if (this.buffs[buffName].amount <= 0) return;
    this.addBuff(buffName, -1);

    const newRemaining =
      this.buffs[buffName].time != -1 ? this.buffs[buffName].time : 1;
    this.buffs[buffName].remaining = newRemaining;

    switch (buffName) {
      case BUFF.FREEZE:
        //Collectibles.Instance.active( 0 );
        break;
      case BUFF.BOOST:
        //Collectibles.Instance.active( 1 );
        break;
      case BUFF.SUPER_JUMP:
        //Collectibles.Instance.active( 2 );
        break;
      case BUFF.X2:
        //Collectibles.Instance.active( 3 );
        break;
      case BUFF.BUFF5:
        //Collectibles.Instance.active( 4 );
        break;
      case BUFF.BUFF6:
        //Collectibles.Instance.active( 5 );
        break;
      case BUFF.INVINCIBILITY:
        // this.skeleton.setAnimation(0, MainCharacterAnim.FRENZY, true);
        // this.invincibleFX.stop();
        // this.isBlinking = false;
        // this.invincibleFX.node.getComponent(sp.Skeleton).color = Color.WHITE;
        break;
      case BUFF.SWITCHSKIN:
        this.skin = 8;
        break;
    }
  }

  public cancelBuff(buffName: number) {
    this.buffs[buffName].remaining = 0;

    if (buffName === BUFF.X2) {
    } else if (buffName === BUFF.FREEZE) {
    } else if (buffName === BUFF.INVINCIBILITY) {
      this.invincibleFX.stop();
      this.invincibleFX.node.getComponent(sp.Skeleton).color = Color.WHITE;
    } else if (buffName === BUFF.SUPER_JUMP) {
    }
  }
}
