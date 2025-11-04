import {
  _decorator,
  Component,
  Node,
  systemEvent,
  SystemEventType,
  Touch,
  EventTouch,
  Vec2,
  Label,
  sp,
  view,
  Widget,
  Animation,
  ProgressBar,
  Vec3,
  find,
  game,
  Game,
  v3,
  math,
  BoxCollider2D,
  Contact2DType,
  IPhysics2DContact,
} from "cc";
import {
  EventType,
  ActionIngame,
  Config,
  ActionSystem,
  ObjectType,
  Score,
  TutorialStep,
  SoundId,
  BUFF,
  DeltaTime,
  GameDefine,
  MainCharacterAnim,
  ActionPopupTutorial,
  Layer,
} from "../Defines";
import Timer from "../core/Timer";
import EventManager from "../core/EventManager";
import TrackingManager, { TrackingAction } from "../core/TrackingManager";
import { FedProfile } from "../core/Federation";
import { MainController } from "../MainController";
import { MapController } from "../MapController";
import { SoundManager } from "../SoundManager";
import {
  SendTrackingAndExit,
  getLanguage,
  getQueryString,
} from "../core/Utils";
import { AddLogText } from "../core/Utils";
import { Fade } from "../Fade";
import { FrameChanger } from "../FrameChanger";
import { i18n } from "../../i18n/i18n";
import { LANGUAGES } from "../ButtonLanguageOption";
import SingletonComponent from "../core/SingletonComponent";
import { PopupTutorial } from "../popup/PopupTutorial";
import { Form } from "../form/Form";
import { EFFECTS, FXMgr } from "../FXMgr";
const { ccclass, property } = _decorator;

export enum STATE {
  NONE,
  CHARACTER_SELECT,
  MAP_SELECT,
  TUTORIAL,
  PLAY,
  PAUSE,
  RESUME,
  TIMEOUT,
  FORM,
}

const mapNames = [
  "UK",
  "US",
  "France",
  "UAE",
  "Colombia",
  "Brazil",
  "Mexico",
  "Argentina",
];

@ccclass("Ingame")
export class Ingame extends SingletonComponent<Ingame>() {
  @property(Node)
  buttonExit: Node;

  @property(Label)
  labelTimer: Label;

  @property(Label)
  labelScore: Label;

  @property(MainController)
  mainCharacter: MainController;

  @property(MapController)
  mapController: MapController;

  @property(SoundManager)
  soundManager: SoundManager;

  @property(Animation)
  timeOut: Animation;

  @property(Node)
  brandLogo: Node;

  @property(MainController)
  mainController: MainController = null;

  state: STATE;
  beforePauseState: STATE;
  timerMain: Timer = new Timer();
  warningCount: number = 0;

  fedProfile: FedProfile = new FedProfile();

  isGameStarted: boolean = false;
  isFirstLaunch: boolean = true;
  isGotReward: boolean = false;

  mScore: number = 0;
  mTouchStartPos!: Vec2;
  mSpeed = 1;
  private deltaTime = 0;

  @property(Node)
  gameplayContainer: Node = null;
  @property(Node)
  form: Node;

  @property(Fade)
  fadeScreen: Fade = null;
  @property(ProgressBar)
  public frenzyBar: ProgressBar;
  @property(Animation)
  public frenzyTxtAnim: Animation;
  @property(ProgressBar)
  public turboBoost: ProgressBar;

  @property(PopupTutorial)
  popupTutorial: PopupTutorial;

  @property(Animation)
  mainAnimation: Animation;
  @property(Animation)
  animationSpeedUp: Animation;

  private frenzyEnergy = 0;
  private scaleCharacter = 0;
  private isFrenzy = false;
  private _turboBoost = false;
  private _canUseBoost = false;
  private _chargeTurbo = false;

  private previousSpeed: number;

  private playerCollide: BoxCollider2D;

  private timerBonusSpeed = new Timer();
  private bonusSpeed: number;

  private timerSlowDown = new Timer();
  private slowDown: number;

  private animationSpeed: number;

  private IsInvincibility: boolean;

  protected onEnable(): void {
    this.fadeScreen.out();
    this.frenzyEnergy = 0;
    this.frenzyBar.progress = 0;
    this.turboBoost.progress = 0;
    this.bonusSpeed = 1;
    this.slowDown = 1;
    this.animationSpeed = 1;
    this.timerBonusSpeed.SetDuration(0);
    this.isFrenzy = false;
    this._turboBoost = false;
    this._canUseBoost = false;
    this.IsInvincibility = false;
    this.mainCharacter.setPlayerInvicible(false);

    //this.mapSelectContainer.active = true;
    if (this.isFirstLaunch) {
      this.form.active = false; // Tắt form để vào thẳng game
    }
    this.gameplayContainer.active = true;
    this.enableGameScene();
    //this.mapSelectContainer.active = true;
    //this.SetState( STATE.MAP_SELECT );
    this.soundManager.playSound(SoundId.BGM);
    if ((<any>window).isOutfit7) {
      this.buttonExit.active = false;
    }
    // this.soundManager.playSound(SoundId.INTRO);
  }

  enableGameScene() {
    // this.buttonExit.active = false;
    this.timeOut.node.active = false;
    if ((<any>window).isOutfit7) {
      this.timerMain.SetDuration(Config.gameDuration_outfit7);
    } else {
      this.timerMain.SetDuration(Config.gameDuration);
    }
    this.UpdateTimer(this.timerMain.GetTime());
    this.mScore = 0;
    this.UpdateScore();

    //this.fadeScreen.out( () =>
    //{
    this.warningCount = Config.warningDuration;
    this.mSpeed = GameDefine.GAME_SPEED;
    this.previousSpeed = this.mSpeed;

    if (this.isFirstLaunch) {
      let profiles = Config.profiles;
      // Skip tutorial, vào thẳng game
      // if (!profiles.finishTutorial) {
      //   this.SetState(STATE.TUTORIAL);
      // } else {
        this.StartGame();
        this.SetState(STATE.PLAY);
      // }
    } else {
      this.isGameStarted = true;
      this.SetState(STATE.PLAY);
    }
    this.soundManager.stopSound(SoundId.END);
    //} );
  }

  start() {
    systemEvent.on(SystemEventType.TOUCH_START, this.OnTouchStart, this);
    systemEvent.on(SystemEventType.TOUCH_MOVE, this.OnTouchMove, this);
    systemEvent.on(SystemEventType.TOUCH_END, this.OnTouchEnd, this);

    EventManager.GetInstance().on(
      EventType.SYSTEM,
      this.OnInterruptEvent,
      this
    );
    EventManager.GetInstance().on(EventType.COLLECT, this.OnCollect, this);
    EventManager.GetInstance().on(
      EventType.TUTORIAL_HINT,
      this.OnTutorialHint,
      this
    );

    let isHostGamePortrait = window.innerWidth < window.innerHeight;
    if ((<any>window).isOutfit7 && isHostGamePortrait) {
      // this.brandLogo.setScale(new Vec3(0.8, 0.8, 0.8));
      this.brandLogo.getComponent(Widget).left = 100;
    }

    // const language = getLanguage();
    // i18n.init(LANGUAGES[language]);

    this.playerCollide = this.mainCharacter.node.getComponent(BoxCollider2D);
    if (this.playerCollide) {
      this.playerCollide.on(
        Contact2DType.BEGIN_CONTACT,
        this.onBeginContact,
        this
      );
      this.playerCollide.on(Contact2DType.END_CONTACT, this.onEndContact, this);
    }
  }

  update(dt: number) {
    this.deltaTime += dt;
    if (this.deltaTime > DeltaTime) {
      const times = Math.floor(this.deltaTime / DeltaTime);
      this.deltaTime -= times * DeltaTime;

      for (let i = 0; i < times; i++) {
        this.fixedUpdate(DeltaTime);
      }
    }
  }
  fixedUpdate(deltaTime: number) {
    let timeScale = Math.min((this.mSpeed * deltaTime) / DeltaTime, 2);

    switch (this.state) {
      case STATE.TUTORIAL:
        break;

      case STATE.PLAY:
        if (!this.form.getComponent(Form).IsFinishedForm()) return;

        // if (this.mSpeed < 3) {
        //   this.mSpeed += deltaTime * 0.005;
        // }
        this.timerMain.Update(deltaTime);
        this.UpdateTimer(this.timerMain.GetTime());
        // this.mScore += 100 * deltaTime * timeScale;
        this.UpdateScore();

        this.mapController.updatePosition(
          timeScale * this.bonusSpeed * this.slowDown,
          this.timerMain.GetTime()
        );
        this.mainCharacter.updatePosition(
          timeScale * this.bonusSpeed * this.slowDown
        );

        this.timerSlowDown.Update(deltaTime);
        if (this.timerSlowDown.JustFinished()) {
          this.slowDown = 1;
          this.mainAnimation.getState("running").speed = this.animationSpeed;
          this.animationSpeedUp.getState("running").speed = this.animationSpeed;
        }

        this.timerBonusSpeed.Update(deltaTime);
        if (this.timerBonusSpeed.JustFinished()) {
          this.bonusSpeed = 1;
          this.IsInvincibility = false;
          this.mainCharacter.setPlayerInvicible(false);
          this.mainAnimation.getState("running").speed = this.animationSpeed;
          this.animationSpeedUp.getState("running").speed = this.animationSpeed;
          this.mainCharacter.onSpeedUp(false);
        }

        this.useTurbo(timeScale);
        if (this.timerMain.IsDone()) {
          // this.soundManager.playSound(SoundId.TIME_UP);
          this.EndGame();
        } else if (this.timerMain.GetTime() <= this.warningCount) {
          if (this.warningCount > 0) {
            this.warningCount = -1;
            this.soundManager.playSound(SoundId.TIMER);
          }
        }
        break;

      case STATE.PAUSE:
        break;

      case STATE.RESUME:
        break;

      case STATE.TIMEOUT:
        break;
    }
    (<any>window).gIngameTimeSpent += deltaTime;
  }

  SetState(state: STATE) {
    let paramaters;
    const previousState = this.state;

    this.state = state;
    switch (this.state) {
      case STATE.CHARACTER_SELECT:
        if (!(<any>window).isOutfit7) {
          // this.buttonExit.active = true;
        }
        break;
      case STATE.MAP_SELECT:
        if (!(<any>window).isOutfit7) {
          // this.buttonExit.active = true;
        }
        break;
      case STATE.TUTORIAL:
        if (!(<any>window).isOutfit7) {
          this.buttonExit.active = false;
        }

        let _paramaters = {
          action: ActionPopupTutorial.SHOW,
          data: {},
        };
        EventManager.GetInstance().emit(EventType.POPUP_TUTORIAL, _paramaters);
        break;

      case STATE.PLAY:
        if (!(<any>window).isOutfit7) {
          // this.buttonExit.active = true;
        }
        this.mainCharacter.node.active = true;
        this.mainAnimation.getState("running").speed = 1;
        this.animationSpeedUp.getState("running").speed = 1;
        // this.mainCharacter.setTimeScale(0.42 * 2.5);
        // this.mapController.disableTutorial();
        break;

      case STATE.PAUSE:
        this.soundManager.pauseSound(SoundId.BGM);
        this.beforePauseState = previousState;
        this.mainAnimation.pause();
        this.animationSpeedUp.pause();
        break;

      case STATE.RESUME:
        this.soundManager.playSound(SoundId.BGM);
        this.SetState(this.beforePauseState);
        let paramaters = {
          action: ActionIngame.CONTINUE,
          data: {},
        };
        EventManager.GetInstance().emit(EventType.INGAME, paramaters);
        this.mainAnimation.resume();
        this.animationSpeedUp.resume();
        break;

      case STATE.TIMEOUT:
        game.off(Game.EVENT_SHOW);
        this.mainCharacter.skeleton.timeScale = 0;
        this.timeOut.node.active = true;
        this.timeOut.play();
        this.mainAnimation.pause();
        this.animationSpeedUp.pause();
        setTimeout(() => {
          this.fadeScreen.in(() => {
            paramaters = {
              action: ActionIngame.TIMEOUT,
              data: {
                score: this.mScore,
              },
            };
            EventManager.GetInstance().emit(EventType.INGAME, paramaters);
          });
        }, 1000);

        this.soundManager.stopSound(SoundId.BGM);
        // this.soundManager.pauseSound(SoundId.SFX_CAR_IDLE);
        this.soundManager.playSound(SoundId.END);
        break;
    }
  }

  Pause() {
    if (this.state == STATE.PLAY) {
      this.SetState(STATE.PAUSE);
    }
  }

  Resume() {
    ("asglkjashglkash");
    if (this.state == STATE.PAUSE) {
      this.SetState(STATE.RESUME);
    }
  }

  StartGame() {
    this.isGameStarted = true;
    if (this.isFirstLaunch) {
      console.log("a jsdha jkshdja hdkjashdjkh");
      TrackingManager.SendEventTracking(TrackingAction.CONFIRMED_ENGAGEMENTS);
    }

    let profiles = Config.profiles;
    if (!profiles.finishTutorial) {
      profiles.finishTutorial = true;
      this.fedProfile.Save(profiles);
    }

    this.SetState(STATE.PLAY);
    // this.soundManager.setVolume(SoundId.INTRO, 1);
    // this.soundManager.stopSound(SoundId.INTRO);
    // this.soundManager.playSound(SoundId.BGM);
  }

  EndGame() {
    if (!this.isGotReward) {
      try {
        (<any>window).saveReward();
        if (this.isFirstLaunch) {
          (<any>window).gIngameTimeSpent = (<any>window).gTotalTimeSpent;
        }
      } catch (e) {
        // AddLogText("saveReward error: " + e);
      }
    }

    this.isFirstLaunch = false;
    TrackingManager.SetScoreParam(Math.floor(this.mScore));
    TrackingManager.SendEventTracking(TrackingAction.COMPLETE_ENGAGEMENTS);

    this.SetState(STATE.TIMEOUT);
  }

  GotReward() {
    this.isGotReward = true;
  }

  UpdateTimer(time: number) {
    this.labelTimer.string = "" + Math.round(time);
  }

  UpdateScore() {
    this.labelScore.string = Math.floor(this.mScore).toString();
  }

  OnExit() {
    if (this.state !== STATE.PLAY) return;

    if (this.isFirstLaunch) {
      let paramaters = {
        action: ActionIngame.EXIT,
        data: {},
      };
      EventManager.GetInstance().emit(EventType.INGAME, paramaters);
    } else {
      SendTrackingAndExit();
    }
  }

  OnInterruptEvent(parameters: any) {
    if (!this.node.active) {
      return;
    }

    switch (parameters.action) {
      case ActionSystem.PAUSE:
        if (this.state != STATE.TIMEOUT) {
          this.mainCharacter.skeleton.timeScale = 0;

          let paramaters = {
            action: ActionIngame.SUSPEND,
            data: {},
          };
          EventManager.GetInstance().emit(EventType.INGAME, paramaters);
        }
        break;

      case ActionSystem.RESUME:
        break;

      case ActionSystem.BACK:
        {
          let paramaters = {
            action: ActionIngame.BACK_PRESS,
            data: {},
          };
          EventManager.GetInstance().emit(EventType.INGAME, paramaters);
        }
        break;
    }
  }

  OnCollect(parameters: any) {
    switch (parameters.itemType) {
      case ObjectType.ITEM:
        this.mScore += 500;
        // this.mainCharacter.UpdateSize(0.0005);
        // this.chargeTurbo();
        this.soundManager.playSound(SoundId.SFX_COLLECT_ITEM);
        if (parameters.special === BUFF.NONE) {
          // this.mScore += (this.mainController.checkBuff(BUFF.X2) ? 2 : 1) * Score.ITEM * 2;
          // this.chargeFrenzy();
        } else {
          // this.mScore += (this.mainController.checkBuff(BUFF.X2) ? 2 : 1) * Score.SPECIAL;

          switch (parameters.special) {
            case BUFF.X2: {
              this.mainController.addBuff(BUFF.X2, 1);
              this.mainController.activeBuff(BUFF.X2);
              break;
            }
            case BUFF.FREEZE: {
              this.mainController.addBuff(BUFF.FREEZE, 1);
              this.mainController.activeBuff(BUFF.FREEZE);
              break;
            }
            case BUFF.BOOST: {
              this.mainController.addBuff(BUFF.BOOST, 1);
              this.mainController.activeBuff(BUFF.BOOST);
              break;
            }
            case BUFF.SUPER_JUMP: {
              this.mainController.addBuff(BUFF.SUPER_JUMP, 1);
              this.mainController.activeBuff(BUFF.SUPER_JUMP);
              break;
            }
            case BUFF.BUFF5: {
              this.mainController.addBuff(BUFF.BUFF5, 1);
              this.mainController.activeBuff(BUFF.BUFF5);
              break;
            }
            case BUFF.BUFF6: {
              this.mainController.addBuff(BUFF.BUFF6, 1);
              this.mainController.activeBuff(BUFF.BUFF6);
              break;
            }
            case BUFF.INVINCIBILITY: {
              /* this.isFrenzy = true;
                            this.frenzyEnergy = 0;
                            this.mainController.addBuff( BUFF.INVINCIBILITY, 1 );
                            this.mainController.activeBuff( BUFF.INVINCIBILITY );
                            this.soundManager.playSound( SoundId.SFX_FRENZY ); */
              // this.frenzyTxtAnim.play();
              this.IsInvincibility = true;
              this.mainCharacter.setPlayerInvicible();
              this.bonusSpeed = GameDefine.BONUS_SPEED;
              this.mainCharacter.onSpeedUp();
              this.mainAnimation.getState("running").speed =
                this.animationSpeed * this.bonusSpeed;
              this.animationSpeedUp.getState("running").speed =
                this.animationSpeed * this.bonusSpeed;

              this.timerBonusSpeed.SetDuration(3);
              break;
            }
            case BUFF.SWITCHSKIN: {
              this.soundManager.playSound(SoundId.ITEM);
              if (this.state === STATE.TUTORIAL) return;
              if (this.mainCharacter.skin === 8) return;
              this.soundManager.playSound(SoundId.SFX_TRANSFORM);
              this.mainController.addBuff(BUFF.SWITCHSKIN, 1);
              this.mainController.activeBuff(BUFF.SWITCHSKIN);
              break;
            }
            default: {
              break;
            }
          }
        }
        break;

      case ObjectType.COIN:
        // this.mScore += Score.ITEM;
        this.mScore += 50;
        // this.soundManager.playSound(SoundId.COIN);
        // this.chargeFrenzy();
        break;

      case ObjectType.OBSTACLE:
        // this.mScore += Score.OBSTACLE;
        if (!this.IsInvincibility) {
          this.mScore -= 100;
          this.slowDown = GameDefine.SLOW_DOWN;
          this.mainAnimation.getState("running").speed =
            this.animationSpeed * this.slowDown;
          this.animationSpeedUp.getState("running").speed =
            this.animationSpeed * this.slowDown;
          this.timerSlowDown.SetDuration(2);
          FXMgr.Instance.playFX(EFFECTS.MINUS100);
          this.soundManager.playSound(SoundId.SFX_HIT_OBSTACLE);
        }
        break;
    }
    this.mScore = Math.max(0, this.mScore);
  }

  /* chargeFrenzy() {
        if (!this.mainController.checkBuff(BUFF.INVINCIBILITY)) {
            if (this.isFrenzy) {
                this.isFrenzy = false;
                this.frenzyEnergy = 0;
            };
            this.frenzyEnergy++;
            this.frenzyBar.progress = this.frenzyEnergy / GameDefine.FRENZY_ENERGY_MAX;
            if (!this.isFrenzy && this.frenzyEnergy >= GameDefine.FRENZY_ENERGY_MAX) {
                this.isFrenzy = true;
                this.frenzyEnergy = 0;
                this.mainController.addBuff(BUFF.INVINCIBILITY, 1);
                this.mainController.activeBuff(BUFF.INVINCIBILITY);
                this.soundManager.playSound(SoundId.SFX_FRENZY);
                this.frenzyTxtAnim.play();
            }
        }
    } */

  chargeTurbo() {
    if (!this._chargeTurbo) {
      this.turboBoost.progress += 0.23;
    } else {
      this.turboBoost.progress = 0;
    }
    if (this.turboBoost.progress >= 1) {
      this._turboBoost = true;
    }
  }

  useTurbo(timeScale: any) {
    if (this._canUseBoost) {
      this._chargeTurbo = true;
      this.mapController.updatePosition(
        timeScale * 1.3,
        this.timerMain.GetTime()
      );
      this.mainCharacter.gravity = 0;
      this.mainCharacter.mVelocity = 0;
      this.mainController.skeleton.setAnimation(
        0,
        this.mainCharacter.skin === 8
          ? MainCharacterAnim.DASH2
          : MainCharacterAnim.DASH,
        false
      );
      this.mainController.addBuff(BUFF.INVINCIBILITY, 1);
      this.mainController.activeBuff(BUFF.INVINCIBILITY);

      setTimeout(() => {
        this._canUseBoost = false;
        this._chargeTurbo = false;
        this.mainCharacter.gravity = 0.55;
        this.mapController.updatePosition(timeScale, this.timerMain.GetTime());
        this.mainController.cancelBuff(BUFF.INVINCIBILITY);
      }, 300);
    }
  }

  OnTutorialHint(parameters: any) {
    return;
    if (parameters.show) {
      this.mSpeed = 0;
      this.mapController.nextTutorial();
    } else {
      let hint = this.mapController.getTutorialStep();
      switch (hint) {
        case TutorialStep.JUMP_OBSTACLE:
          if (parameters.input && parameters.input != "up") return;

          this.mainCharacter.jumpUp() &&
            this.soundManager.playSound(SoundId.JUMP_UP);
          this.mapController.hideTutorial();
          // this.buttonExit.active = true;
          this.StartGame();
          this.mSpeed = GameDefine.MIN_CAR_SPEED;
          break;
      }
    }
    this.mainCharacter.setTimeScale(this.mSpeed * 2.5);
  }

  OnTouchStart(touch: Touch, event: EventTouch) {
    let location = touch.getUILocation();
    this.mTouchStartPos = location.clone();
    this.mainCharacter.jumpUp() && this.soundManager.playSound(SoundId.JUMP_UP);
  }

  OnTouchMove(touch: Touch, event: EventTouch) {}

  OnTouchEnd(touch: Touch, event: EventTouch) {
    let end = touch.getUILocation();
    if (this.mTouchStartPos == null) {
      return;
    }

    const start = this.mTouchStartPos;
    this.mTouchStartPos = null;

    const vector = end.clone().subtract(start);

    const verticalSwipe = Math.abs(vector.y) > Math.abs(vector.x);

    if (!verticalSwipe) return;
    if (vector.length() > 50) {
      // if (vector.y < 0) {
      //   this.mainCharacter.jumpDown() &&
      //     this.soundManager.playSound(SoundId.JUMP_DOWN);
      // } else {
      //   this.mainCharacter.jumpUp() &&
      //     this.soundManager.playSound(SoundId.JUMP_UP);
      // }
    }
  }

  swipeRight() {
    if (this._turboBoost) {
      this._canUseBoost = true;
      this._turboBoost = false;
      this.turboBoost.progress = 0;
      this.turboBoost.node.getComponent(Animation).play("useTurbo");
      this.soundManager.playSound(SoundId.SFX_FRENZY);
    }
  }

  private onBeginContact(
    selfCollider: BoxCollider2D,
    otherCollider: BoxCollider2D,
    contact: IPhysics2DContact | null
  ) {}

  private onEndContact(
    selfCollider: BoxCollider2D,
    otherCollider: BoxCollider2D,
    contact: IPhysics2DContact | null
  ) {}
}
