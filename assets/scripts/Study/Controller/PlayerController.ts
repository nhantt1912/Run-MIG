import {
  _decorator,
  BoxCollider2D,
  Component,
  Contact2DType,
  IPhysics2DContact,
  Node,
  Animation,
  Vec3,
  Label,
} from "cc";
import {
  EVENT_TYPE,
  PLAYER_STATE,
  PLAYER_STATE_NAME,
} from "../Cores/DefinesStudy";
import EventManager from "../../core/EventManager";
import { EventType, Layer } from "../../Defines";
import { Item } from "../../Item";
import { Obstacle } from "../../Obstacle";
const { ccclass, property } = _decorator;

@ccclass("PlayerController")
export class PlayerController extends Component {
  @property(Animation)
  animationComponent: Animation = null;

  @property(BoxCollider2D)
  boxCollider: BoxCollider2D = null;

  @property(String)
  playerName: string = "";

  countJump: number = 0;

  private currentState: PLAYER_STATE = PLAYER_STATE.NONE;

  private velocityY: number = 0;
  private gravity: number = -1;
  private jumpForce: number = 10;
  private isGrounded: boolean = true;
  private groundY: number = 0;

  mCurrentPos!: Vec3;

  start() {
    this.groundY = this.node.getPosition().y;

    EventManager.GetInstance().on(EVENT_TYPE.SWIPE_UP, this.onSwipeUp, this);
    this.changeState(PLAYER_STATE.RUN);

    this.mCurrentPos = this.node.position.clone();

    this.boxCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    this.boxCollider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
  }

  Update(deltaTime: number) {
    if (
      this.currentState === PLAYER_STATE.JUMP_UP ||
      this.currentState === PLAYER_STATE.JUMP_DOWN
    ) {
      this.applyPhysics(deltaTime);
    }
  }

  onDestroy() {
    EventManager.GetInstance().off(EVENT_TYPE.SWIPE_UP, this.onSwipeUp, this);
    this.boxCollider.off(
      Contact2DType.BEGIN_CONTACT,
      this.onBeginContact,
      this
    );
    this.boxCollider.off(Contact2DType.END_CONTACT, this.onEndContact, this);
  }

  onGameOver() {
    this.changeState(PLAYER_STATE.IDLE);
  }

  onSwipeUp() {
    this.gravity = -0.2;
    this.changeState(PLAYER_STATE.JUMP_UP);
  }

  changeState(newState: PLAYER_STATE) {
    this.currentState = newState;
    this.onChangeState(newState);
  }

  onBeginContact(
    selfCollider: BoxCollider2D,
    otherCollider: BoxCollider2D,
    contact: IPhysics2DContact | null
  ) {
    switch (otherCollider.node.layer) {
      case Layer.ITEM:
        otherCollider.node.getComponent(Item).onCollect();
        break;
      case Layer.OBSTACLE:
        if (this.currentState == PLAYER_STATE.RUN) {
          otherCollider.node.getComponent(Obstacle).onHit();
        }
        break;
      case Layer.PLATFORM:
        console.log("onBeginContact");
        let self = selfCollider.worldAABB;
        let other = otherCollider.worldAABB;
        const height = self.yMax - self.yMin + 130;
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
          this.changeState(PLAYER_STATE.RUN);
          this.isGrounded = true;
        }
        break;
    }
  }

  onEndContact(
    selfCollider: BoxCollider2D,
    otherCollider: BoxCollider2D,
    contact: IPhysics2DContact | null
  ) {
    if (
      otherCollider.node.layer == Layer.PLATFORM &&
      this.currentState == PLAYER_STATE.RUN
    ) {
      this.changeState(PLAYER_STATE.JUMP_DOWN);
    }
  }

  private applyPhysics(deltaTime: number) {
    let scaleTime = deltaTime;

    this.velocityY += this.gravity * scaleTime;

    const currentPos = this.node.getPosition();
    currentPos.y += this.velocityY;

    if (currentPos.y <= this.groundY) {
      currentPos.y = this.groundY;
      this.velocityY = 0;
      this.isGrounded = true;
      this.changeState(PLAYER_STATE.RUN);
    } else {
      this.isGrounded = false;
      if (this.velocityY > 0 && this.currentState !== PLAYER_STATE.JUMP_UP) {
        this.changeState(PLAYER_STATE.JUMP_UP);
      } else if (
        this.velocityY <= 0 &&
        this.currentState !== PLAYER_STATE.JUMP_DOWN
      ) {
        this.changeState(PLAYER_STATE.JUMP_DOWN);
      }
    }

    this.node.setPosition(currentPos);
  }

  onChangeState(newState: PLAYER_STATE) {
    switch (newState) {
      case PLAYER_STATE.IDLE:
        this.playAnimation(PLAYER_STATE_NAME.IDLE);
        break;
      case PLAYER_STATE.RUN:
        this.onRun();
        this.playAnimation(PLAYER_STATE_NAME.RUN);
        break;
      case PLAYER_STATE.JUMP_UP:
        this.onJumpUp();
        break;
      case PLAYER_STATE.JUMP_DOWN:
        this.onJumpDown();
        this.playAnimation(PLAYER_STATE_NAME.JUMP_DOWN);
        break;
    }
  }

  private playAnimation(animName: string) {
    if (this.animationComponent) {
      this.animationComponent.play(animName);
    }
  }

  private onRun() {}

  private onJumpUp() {
    if (this.isGrounded) {
      this.countJump++;
      this.playAnimation(PLAYER_STATE_NAME.JUMP_UP);
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
    } else if (this.countJump >= 1) {
      this.countJump = 0;
      this.playAnimation(PLAYER_STATE_NAME.EXTRA_JUMP);
      this.velocityY = this.jumpForce;
      this.isGrounded = false;
    }
  }

  private onJumpDown() {}
}
