import { _decorator, Component, Node, sys, utils } from "cc";
import EventManager from "./core/EventManager";
import {
  ActionIngame,
  ActionSystem,
  ActionPopupExit,
  ActionPopupNoReward,
  ActionPopupTutorial,
  ActionResult,
  EventType,
  SoundId,
} from "./Defines";
import { SendTrackingAndExit } from "./core/Utils";
import TrackingManager, { TrackingAction } from "./core/TrackingManager";
import { Result } from "./views/Result";
import { Ingame, STATE } from "./views/Ingame";
import { PopupExit } from "./popup/PopupExit";
import { PopupNoReward } from "./popup/PopupNoReward";
import { SoundManager } from "./SoundManager";
import { PopupSuspend } from "./popup/PopupSuspend";
import { PopupTutorial } from "./popup/PopupTutorial";
const { ccclass, property } = _decorator;

@ccclass("GameManager")
export class GameManager extends Component {
  @property(Ingame)
  viewIngame: Ingame;

  @property(Result)
  viewResult: Result;

  @property(PopupExit)
  popupExit: PopupExit;

  @property(PopupTutorial)
  popupTutorial: PopupTutorial;

  @property(PopupNoReward)
  popupNoReward: PopupNoReward;

  @property(PopupSuspend)
  popupSuspend: PopupSuspend;

  @property(SoundManager)
  soundManager: SoundManager;

  start() {
    EventManager.GetInstance().on(EventType.INGAME, this.OnIngameEvent, this);
    EventManager.GetInstance().on(EventType.RESULT, this.OnResultEvent, this);
    EventManager.GetInstance().on(
      EventType.POPUP_TUTORIAL,
      this.OnPopupTutorialEvent,
      this
    );
    EventManager.GetInstance().on(
      EventType.POPUP_EXIT,
      this.OnPopupExitEvent,
      this
    );
    EventManager.GetInstance().on(
      EventType.POPUP_NO_REWARD,
      this.OnPopupNoReward,
      this
    );
    EventManager.GetInstance().on(
      EventType.POPUP_SUSPEND,
      this.OnPopupSuspend,
      this
    );

    this.viewIngame.node.active = true;
  }

  update(deltaTime: number) {
    if ((<any>window).gTotalTimeSpent > 0) {
      (<any>window).gTotalTimeSpent += deltaTime;
    }
  }

  OnIngameEvent(paramaters: any) {
    switch (paramaters.action) {
      case ActionIngame.TIMEOUT:
        this.viewIngame.node.active = false;
        this.viewResult.node.active = true;
        this.viewResult.setScore(paramaters.data.score);
        break;
      case ActionIngame.EXIT:
        this.viewIngame.Pause();
        this.popupExit.Show();
        break;

      case ActionIngame.BACK_PRESS:
        if ((this.viewIngame.state == STATE.TUTORIAL)) return;
        if (this.popupExit.IsShowing()) {
          this.popupExit.OnNo();
        } else if (this.popupSuspend.IsShowing()) {
          this.popupSuspend.OnResume();
        } else {
          this.viewIngame.OnExit();
        }
        break;
      case ActionIngame.SUSPEND:
        if ((this.viewIngame.state == STATE.TUTORIAL)) return;
        if (!this.popupExit.IsShowing()) {
          this.viewIngame.Pause();
          this.popupSuspend.Show();
        }
        break;
    }
  }

  OnResultEvent(paramaters: any) {
    switch (paramaters.action) {
      case ActionResult.RETRY:
        TrackingManager.SendEventTracking(TrackingAction.REPLAY);
        (<any>window).gIngameTimeSpent = 0;

        this.viewResult.node.active = false;
        this.viewIngame.node.active = true;
        break;

      case ActionResult.EXIT:
        SendTrackingAndExit();
        break;

      case ActionResult.GOT_REWARD:
        this.viewIngame.GotReward();
        break;
    }
  }

  OnPopupExitEvent(paramaters: any) {
    switch (paramaters.action) {
      case ActionPopupExit.YES:
        SendTrackingAndExit();
        break;

      case ActionPopupExit.NO:
        this.popupExit.Hide(() => {
          this.viewIngame.Resume();
        });
        break;
    }

    this.soundManager.playSound(SoundId.BUTTON);
  }

  OnPopupTutorialEvent(paramaters: any) {
    switch (paramaters.action) {
      case ActionPopupTutorial.SHOW:
        this.viewIngame.Pause();
        this.popupTutorial.Show();
        break;

      case ActionPopupTutorial.HIDE:
        this.popupTutorial.Hide(() => {
          this.viewIngame.Resume();
          this.viewIngame.StartGame();
        });
        break;
    }
  }

  OnPopupNoReward(paramaters: any) {
    switch (paramaters.action) {
      case ActionPopupNoReward.SHOW:
        if (!this.viewIngame.isGotReward && this.viewResult.node.active) {
          this.popupNoReward.Show();
        }
        break;

      case ActionPopupExit.NO:
        this.popupNoReward.Hide(() => {});
        this.soundManager.playSound(SoundId.BUTTON);
        break;
    }
  }

  OnPopupSuspend(paramaters: any) {
    this.popupSuspend.Hide(() => {
      this.viewIngame.Resume();
    });
    this.soundManager.playSound(SoundId.BUTTON);
  }
}
