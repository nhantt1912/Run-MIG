import {
  _decorator,
  Component,
  Node,
  sys,
  Button,
  Label,
  Widget,
  view,
  SpriteFrame,
  Sprite,
  EditBox,
  sp,
  instantiate,
  Animation,
  Vec3,
  tween,
  v3,
} from "cc";
import {
  ActionSystem,
  ActionPopupNoReward,
  ActionResult,
  EventType,
  Config,
  GetSocialSharingLink,
  TEXT_CONTENTS_SOCIAL_SHARING,
} from "../Defines";
import EventManager from "../core/EventManager";
import Resource from "../core/Resource";
import TrackingManager, { TrackingAction } from "../core/TrackingManager";
import Timer from "../core/Timer";
import { AddLogText, getLanguage, getQueryString } from "../core/Utils";
import { Fade } from "../Fade";
import { FedLeaderboard } from "../core/Federation";
import { MAP_CHAR_SKINS } from "../MainController";
import { txtBadWords } from "../BadWords.ts";
import { Collectibles } from "../Collectibles";
import { TopItem } from "../Leaderboard/TopItem";
import { i18n } from "../../i18n/i18n";
import { ID } from "../../i18n/data/ID";
import { LANGUAGES } from "../ButtonLanguageOption";
const { ccclass, property } = _decorator;

enum STATE {
  NONE,
  GET_REWARD,
  GET_REWARD_SUCCESS,
  GET_REWARD_FAILED,
}

const SCORE_TEXT = "%d";

const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

@ccclass("Result")
export class Result extends Component {
  @property(Button)
  buttonCTA: Button;

  @property(Button)
  buttonLogo: Button;

  @property(Label)
  scoreLabel: Label;

  @property(Node)
  exitBtn: Node;

  @property(Node)
  retryBtn: Node;

  @property(Fade)
  fadeScreen: Fade = null;

  @property(Node)
  endscreen: Node = null;
  @property(Node)
  logo: Node;

  @property(Animation)
  playerAnimation: Animation;

  state: STATE;
  isSendingTracking: boolean;
  mTimerReward: Timer = new Timer();
  score = 0;

  private originalPos: Vec3;

  protected onLoad(): void {
    this.originalPos = this.playerAnimation.node.position.clone();
  }

  onEnable() {
    if ((<any>window).notifyGameComplete) {
      (<any>window).notifyGameComplete();
    }
    this.SetState(STATE.GET_REWARD);

    this.fadeScreen.out();
    // this.flag.spriteFrame = this.flagFrames[Config.profiles.map];
    // this.btnSubmit.interactable = true;
    //this.form.active = true;

    // this.formChars.forEach( ( char, index ) =>
    // {
    //     char.active = index === Config.profiles.character;
    // } )
    // this.nicknameEditbox.string = '';

    // this.char.setSkin( MAP_CHAR_SKINS[Config.profiles.character] );

    //this.form.active = false;
    this.endscreen.active = true;
    //this.encourage.active = true;

    /* if (Collectibles.Instance.isFull()) {
            this.low.active = false;
            this.high.active = true;
        } else {
            this.low.active = true;
            this.high.active = false;
        } */
    this.playerAnimation.node.setPosition(this.originalPos);
    const pos = this.playerAnimation.node.position;
    this.playerAnimation.play("running");
    this.scheduleOnce(() => {
      tween(this.playerAnimation.node)
        .to(2.25, {
          position: v3(480, pos.y, pos.y),
        })
        .call(() => {
          this.playerAnimation.play("jumping-2");
        })
        .start();
    }, 0.15);
  }

  // doneEncourage() {
  //   this.form.active = true;
  //   this.endscreen.active = false;
  //   this.encourage.active = false;
  // }

  start() {
    EventManager.GetInstance().on(
      EventType.SYSTEM,
      this.OnInterruptEvent,
      this
    );
    if ((<any>window).isOutfit7) {
      this.exitBtn.active = false;
      if (view.isRotate()) {
        this.retryBtn.getComponent(Widget).alignFlags =
          this.exitBtn.getComponent(Widget).alignFlags;
        this.retryBtn.getComponent(Widget).right = 0;
      }
    }

    // const language = getLanguage();
    // i18n.init(LANGUAGES[language]);

    let isHostGamePortrait = window.innerWidth < window.innerHeight;
    if ((<any>window).isOutfit7 && isHostGamePortrait) {
      // this.brandLogo.setScale(new Vec3(0.8, 0.8, 0.8));
      this.logo.getComponent(Widget).left = 100;
    }
  }

  CheckRudeWords(inputValue: string) {
    let words = txtBadWords;
    for (let i = 0; i < words.length; i++) {
      let str = words[i].trim();
      if (str.length) {
        try {
          let re = new RegExp(str);
          if (re.exec(inputValue)) {
            return true;
          }
        } catch (e) {
          return false;
        }
      }
    }

    return false;
  }

  // onEmailChanged() {
  //   const isError =
  //     this.userEmail.string === ""
  //       ? false
  //       : this.CheckRudeWords(this.userEmail.string) ||
  //         !expression.test(this.userEmail.string);
  //   this.invalidEmail = isError;
  // }

  // fetchLeaderboard() {
  //   this.lbLostConnectionPopup.active = false;

  //   let leaderboard = new FedLeaderboard();
  //   leaderboard
  //     .MyEntry()
  //     .then((me: string) => {
  //       const meToUse = JSON.parse(me);
  //       return leaderboard.Get(0, 50).then((data: string) => {
  //         const dataToUse = JSON.parse(data);

  //         dataToUse.forEach((item: any, index: number) => {
  //           const topItem: TopItem =
  //             this.lbContainer.children[1 + index].getComponent(TopItem);
  //           topItem.init(item.rank, item.display_name, item.score);
  //           if (meToUse.rank === item.rank) {
  //             topItem.highlight(true);
  //             topItem.setName(getLanguage() === "FR" ? "Moi" : "Me");
  //           } else {
  //             topItem.highlight(false);
  //           }
  //         });
  //       });
  //     })
  //     .catch((e) => {
  //       console.log(e);
  //       this.lbLostConnectionPopup.active = true;
  //     });
  // }

  // closeLeaderboard() {
  //   this.endscreen.active = true;
  //   this.leaderboard.active = false;
  // }

  // showLeaderboard() {
  //   TrackingManager.SendEventTracking(TrackingAction.LEADERBOARD_IMPRESSION);
  //   this.fetchLeaderboard();
  //   this.endscreen.active = false;
  //   this.leaderboard.active = true;
  // }

  // submitForm() {
  //   if (this.nicknameEditbox.string === "") return;
  //   this.lostConnectionPopup.active = false;
  //   this.btnSubmit.interactable = false;
  //   let leaderboard = new FedLeaderboard();

  //   leaderboard
  //     .SaveForm(leaderboard.userid, {
  //       userName: this.nicknameEditbox.string,
  //       userEmail: this.userEmail.string,
  //     })
  //     .then(() => {
  //       TrackingManager.SendEventTracking(
  //         TrackingAction.FORM_LEAD,
  //         () => {},
  //         `userName: ${this.nicknameEditbox.string}`
  //       );

  //       leaderboard
  //         .Post(Math.floor(this.score), this.nicknameEditbox.string, {
  //           char: Config.profiles.character,
  //         })
  //         .then(() => {
  //           this.form.active = false;
  //         });

  //       this.form.active = false;
  //       this.endscreen.active = true;
  //       this.encourage.active = false;
  //     })
  //     .catch(() => {
  //       this.lostConnectionPopup.active = true;
  //     });
  // }

  update(deltaTime: number) {
    return;
    switch (this.state) {
      case STATE.GET_REWARD:
        this.mTimerReward.Update(deltaTime);
        if (this.mTimerReward.IsDone()) {
          this.SetState(STATE.GET_REWARD_FAILED);
          // AddLogText("reward_delivered = " + (<any>window).reward_delivered);
        } else if (typeof (<any>window).reward_delivered != "undefined") {
          if ((<any>window).reward_delivered == 1) {
            this.SetState(STATE.GET_REWARD_SUCCESS);
          }
        }
        break;
    }
  }

  SetState(state: STATE) {
    let paramaters;

    this.state = state;
    switch (this.state) {
      case STATE.GET_REWARD:
        this.mTimerReward.SetDuration(4);
        break;

      case STATE.GET_REWARD_SUCCESS:
        paramaters = {
          action: ActionResult.GOT_REWARD,
          data: {},
        };
        EventManager.GetInstance().emit(EventType.RESULT, paramaters);
        break;

      case STATE.GET_REWARD_FAILED:
        paramaters = {
          action: ActionPopupNoReward.SHOW,
          data: {},
        };
        EventManager.GetInstance().emit(EventType.POPUP_NO_REWARD, paramaters);
        break;
    }
  }

  SetInformation(information: any) {}

  OpenProductLink() {
    try {
      let redirectLink =
        (window as any).redirect_url || Resource.GetParam("redirect_url");
      if (!(<any>window).omsPublish || (<any>window).REVIEW) {
        if (redirectLink == "redirect_url") {
          redirectLink = "https://google.com";
        }
        sys.openURL(redirectLink);
      } else {
        // if (!(<any>window).isOutfit7) {
        TrackingManager.SendEventTracking(TrackingAction.CLICK_THROUGHTS_START);
        TrackingManager.SendEventTracking(TrackingAction.CLICK_THROUGHTS);
        (<any>window).open(redirectLink, "_blank");
        // } else {
        //   TrackingManager.SendEventTracking(
        //     TrackingAction.CLICK_THROUGHTS_START,
        //     () => {
        //       TrackingManager.SendEventTracking(
        //         TrackingAction.CLICK_THROUGHTS,
        //         null,
        //         "N/A",
        //         redirectLink
        //       );
        //     }
        //   );
        // }
      }
    } catch (e) {}
  }

  OpenLogoLink() {
    try {
      let redirectLink = Resource.GetParam(
        `dfc_logo_${getLanguage().toLowerCase()}`
      );
      if (!(<any>window).omsPublish || (<any>window).REVIEW) {
        if (redirectLink == "redirect_url") {
          redirectLink = "https://google.com";
        }
        sys.openURL(redirectLink);
      } else {
        TrackingManager.SendEventTracking(
          TrackingAction.CLICK_THROUGHTS_START,
          null,
          "logo"
        );
        TrackingManager.SendEventTracking(
          TrackingAction.CLICK_THROUGHTS,
          null,
          "logo"
        );
        (<any>window).open(redirectLink, "_blank");
      }
    } catch (e) {}
  }

  OnCta() {
    /* if ( !( <any>window ).CC_DEBUG && !( <any>window ).REVIEW )
        {
            // this.buttonCTA.interactable = false;
        } */
    this.OpenProductLink();
  }

  OnLogo() {
    if (!(<any>window).CC_DEBUG && !(<any>window).REVIEW) {
      // this.buttonLogo.interactable = false;
    }
    this.OpenLogoLink();
  }

  OnRetry() {
    this.fadeScreen.in(() => {
      let paramaters = {
        action: ActionResult.RETRY,
        data: {},
      };
      EventManager.GetInstance().emit(EventType.RESULT, {
        action: ActionResult.RETRY,
        paramaters,
      });
    });
  }

  OnExit() {
    let paramaters = {
      action: ActionResult.EXIT,
      data: {},
    };
    EventManager.GetInstance().emit(EventType.RESULT, paramaters);
  }

  OnInterruptEvent(parameters: any) {
    if (!this.node.active) {
      return;
    }

    switch (parameters.action) {
      case ActionSystem.PAUSE:
        break;

      case ActionSystem.RESUME:
        this.buttonCTA.interactable = true;
        break;

      case ActionSystem.BACK:
        this.OnExit();
        break;
    }
  }

  setScore(score: number) {
    this.score = score;
    this.scoreLabel.string = SCORE_TEXT.replace(
      "%d",
      Math.floor(score).toString()
    );
  }

  ShareFacebook() {
    var gameUrl = GetSocialSharingLink();

    if (typeof gameUrl != "undefined" && gameUrl != null) {
      var quote;

      quote = TEXT_CONTENTS_SOCIAL_SHARING;

      var shareUrl =
        "https://www.facebook.com/sharer/sharer.php?display=popup&u=" +
        encodeURIComponent(gameUrl) +
        "&quote=" +
        encodeURIComponent(quote) +
        "&hashtag=" +
        encodeURIComponent("");

      TrackingManager.SendEventTracking(TrackingAction.FACEBOOK_CLICK_SHARE);

      const SHARE_OPTIONS =
        "toolbar=0,status=0,resizable=1,width=400,height=711";

      if ((<any>window).call_client) {
        (<any>window).call_client(null, null, shareUrl);
      } else if ((<any>window).redirect) {
        (<any>window).redirect(shareUrl);
      } else {
        (<any>window).open(shareUrl, "_blank");
      }
    }
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

  ShareTwitter() {
    var quote;

    quote = TEXT_CONTENTS_SOCIAL_SHARING;

    var shareUrl =
      "https://twitter.com/intent/tweet?text=" + encodeURIComponent(quote);

    TrackingManager.SendEventTracking(TrackingAction.FACEBOOK_CLICK_SHARE);

    const SHARE_OPTIONS = "toolbar=0,status=0,resizable=1,width=400,height=711";

    if ((<any>window).call_client) {
      (<any>window).call_client(null, null, shareUrl);
    } else if ((<any>window).redirect) {
      (<any>window).redirect(shareUrl);
    } else {
      (<any>window).open(shareUrl, "_blank");
    }
  }
}
