import { _decorator, Component, Node, AudioSource } from "cc";
import { ActionSystem, EventType } from "../Defines";
import {
  DispatchEvent,
  HideLoadingIcon,
  PauseHostGameMusic,
  RegisterVisibilityChange,
  SendTrackingAndExit,
} from "../core/Utils";
import TrackingManager, { TrackingAction, TrackingFormat } from "../core/TrackingManager";
import EventManager from "../core/EventManager";
import Resource from "../core/Resource";
import { Fade } from "../Fade";

const { ccclass, property } = _decorator;

@ccclass("Interstitial")
export class Interstitial extends Component {
  @property(Node)
  loading: Node = null!;

  @property(AudioSource)
  buttonSFX: AudioSource = null!;

  @property(Node)
  exitBtn: Node = null!;

  @property(Node)
  btnLang: Node = null!;

  @property(Fade)
  fadeScreen: Fade = null!;

  private _isFading: boolean = false;

  protected onEnable(): void {
    // ✅ Chỉ chạy nếu node còn hợp lệ
    if (!this.node || !this.node.isValid) return;

    // Đảm bảo fadeScreen tồn tại
    if (!this.fadeScreen) {
      this.fadeScreen = this.node.getComponentInChildren(Fade);
    }

    if (this.fadeScreen && typeof this.fadeScreen.out === "function") {
      try {
        this.fadeScreen.out();
      } catch (e) {
        console.warn("⚠️ [Interstitial] Lỗi khi gọi fadeScreen.out():", e);
      }
    } else {
      console.warn("⚠️ [Interstitial] fadeScreen chưa gán hoặc chưa có hàm out()");
    }
  }

  onLoad() {
    PauseHostGameMusic();
    HideLoadingIcon();

    if ((<any>window).isOutfit7) {
      RegisterVisibilityChange();
      if (this.exitBtn && this.exitBtn.isValid) this.exitBtn.active = false;
    }

    let pixelUrl = Resource.GetParam("impression_url");
    if (pixelUrl && pixelUrl.startsWith("http") && !(<any>window).isOutfit7) {
      pixelUrl = pixelUrl.replace("{[timestamp]}", "[timestamp]");
      pixelUrl = pixelUrl.replace("[timestamp]", Date.now());
      TrackingManager.SetPixelTracking(TrackingAction.IMPRESSIONS, pixelUrl);
    }

    TrackingManager.SendEventTracking([
      TrackingAction.AD_LOADED,
      TrackingAction.IMPRESSIONS,
    ]);

    if (
      [
        TrackingFormat.BLS,
        TrackingFormat.VHERO,
        TrackingFormat.VSCORE,
        TrackingFormat.VIDEO_FORM,
        TrackingFormat.VINT,
        TrackingFormat.FAKE_CALL,
        TrackingFormat.FAKE_CALL_VIDEO,
        TrackingFormat.MINT_MIG,
        TrackingFormat.VSTORY,
        TrackingFormat.HYBRID,
        TrackingFormat.FORM_INTERACTIONS,
      ].includes(TrackingManager.format)
    ) {
      (<any>window).gTotalTimeSpent = 0.01;
    }
  }

  start() {
    EventManager.GetInstance().on(EventType.SYSTEM, this.OnInterruptEvent, this);
    TrackingManager.SendEventTracking(TrackingAction.AD_VIEWABLE);

    DispatchEvent("document_ready");

    if (TrackingManager.IsIVPointcut()) {
      this.Switch2Loading();
    } else {
      if (!this.fadeScreen) {
        this.fadeScreen = this.node.getComponentInChildren(Fade);
      }
      this.fadeScreen?.out?.();
    }
  }

  Play() {
    if (this.btnLang && this.btnLang.isValid) this.btnLang.active = false;
    if (this.buttonSFX && !this.buttonSFX.playing) {
      this.buttonSFX.volume = 1;
      this.buttonSFX.play();
    }
    this.Switch2Loading();
  }

  OnExit() {
    SendTrackingAndExit();
  }

  OnInterruptEvent(parameters: any) {
    if (!this.node || !this.node.active) return;

    switch (parameters.action) {
      case ActionSystem.BACK:
        this.OnExit();
        break;
    }
  }

  Switch2Loading(needFade = false) {
    if (this._isFading) return;
    this._isFading = true;

    const doSwitch = () => {
      if (this.loading && this.loading.isValid) this.loading.active = true;
      TrackingManager.SendEventTracking(TrackingAction.ENGAGEMENTS);
      (<any>window).gTotalTimeSpent = 0.01;
      (<any>window).gIngameTimeSpent = 0.01;
      if (this.node && this.node.isValid) this.node.active = false;
      this._isFading = false;
    };

    if (needFade) {
      if (!this.fadeScreen) this.fadeScreen = this.node.getComponentInChildren(Fade);

      if (this.fadeScreen && typeof this.fadeScreen.in === "function") {
        this.fadeScreen.in(() => doSwitch());
      } else {
        console.warn("⚠️ [Interstitial] fadeScreen bị null khi gọi Switch2Loading(true)");
        doSwitch();
      }
    } else {
      doSwitch();
    }
  }
}
