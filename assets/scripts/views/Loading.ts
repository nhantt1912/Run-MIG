import {
  _decorator,
  Component,
  Node,
  director,
  assetManager,
  SceneAsset,
  AudioSource,
  AssetManager,
} from "cc";
import { FedProfile } from "../core/Federation";
import TrackingManager, { TrackingAction } from "../core/TrackingManager";
import { SendTrackingAndExit } from "../core/Utils";
import EventManager from "../core/EventManager";
import { Config, EventType, ActionSystem, GAME_ORIENTATION } from "../Defines";
import { Fade } from "../Fade";

const { ccclass, property } = _decorator;

@ccclass("Loading")
export class Loading extends Component {
  @property(Node) loadingInfo: Node = null!;
  @property(Node) lostConnection: Node = null!;
  @property(Node) buttonClose: Node = null!;
  @property(AudioSource) buttonSFX: AudioSource = null!;
  @property(Fade) fadeScreen: Fade = null!;
  @property(Node) loadingEN: Node = null!;
  @property(Node) loadingAR: Node = null!;

  isLoadFailed: boolean = false;
  loadedScene: SceneAsset;
  timeoutHandle: number;

  protected onEnable(): void {
    // ✅ Đảm bảo fadeScreen tồn tại trước khi gọi .out()
    if (!this.fadeScreen) {
      this.fadeScreen = this.node.getComponentInChildren(Fade);
    }

    if (this.fadeScreen && typeof this.fadeScreen.out === "function") {
      try {
        this.fadeScreen.out();
      } catch (e) {
        console.warn("⚠️ [Loading] Lỗi khi gọi fadeScreen.out():", e);
      }
    } else {
      console.warn("⚠️ [Loading] fadeScreen chưa được gán hoặc không có hàm out()");
    }
  }

  start() {
    this.loadingInfo.active = true;
    this.lostConnection.active = false;
    this.buttonClose.active = false;

    EventManager.GetInstance().on(EventType.SYSTEM, this.OnInterruptEvent, this);

    assetManager.main.loadScene(
      "Ingame",
      this.OnProgressing.bind(this),
      this.OnSceneLaunched.bind(this)
    );

    assetManager.downloader.on("error", (error: any) => {
      this.isLoadFailed = true;
      console.warn("[Loading] Downloader error:", error);
    });

    if ((<any>window).gLoadingTimeSpent == 0) {
      (<any>window).gLoadingTimeSpent = (<any>window).gTotalTimeSpent;
    }

    this.StartTimeout();
  }

  update(deltaTime: number) {
    if (!this.lostConnection.active) {
      (<any>window).gLoadingTimeSpent += deltaTime;
    }
  }

  OnSceneLaunched(error: Error, scene: SceneAsset) {
    if (!error && !this.isLoadFailed) {
      TrackingManager.SendEventTracking(TrackingAction.ENDGAMENTS_LOADING_COMPLETE);
      const fedProfile = new FedProfile();

      fedProfile
        .Load()
        .then((profile: any) => {
          clearTimeout(this.timeoutHandle);
          Config.profiles = JSON.parse(profile);
          Config.profiles.finishTutorial = false;
          Config.profiles.finishTutorial2 = false;

          const isPortrait = window.innerWidth < window.innerHeight;
          Config.profiles.gameOrientation = isPortrait
            ? GAME_ORIENTATION.PORTRAIT
            : GAME_ORIENTATION.LANDSCAPE;

          if (!this.lostConnection.active) {
            if (!this.fadeScreen) {
              this.fadeScreen = this.node.getComponentInChildren(Fade);
            }

            if (this.fadeScreen && typeof this.fadeScreen.in === "function") {
              this.fadeScreen.in(() => director.runSceneImmediate(scene));
            } else {
              console.warn("⚠️ [Loading] fadeScreen bị null khi gọi in()");
              director.runSceneImmediate(scene);
            }
          }

          this.loadedScene = scene;
        })
        .catch(() => {});
    } else {
      clearTimeout(this.timeoutHandle);
      this.OnFail();
    }
  }

  OnProgressing(finished: number, total: number, item: AssetManager.RequestItem) {
    // có thể thêm progress bar ở đây
  }

  OnRetry() {
    this.buttonSFX.volume = 1;
    this.buttonSFX.play();
    this.loadingInfo.active = true;
    this.lostConnection.active = false;

    if (this.loadedScene) {
      setTimeout(() => director.runSceneImmediate(this.loadedScene), 1000);
      return;
    }

    if (this.isLoadFailed) {
      this.isLoadFailed = false;
      assetManager.downloader._queue = [];
      assetManager.downloader._downloading.clear();
      assetManager._files.clear();

      assetManager.main.loadScene(
        "Ingame",
        this.OnProgressing.bind(this),
        this.OnSceneLaunched.bind(this)
      );
    }

    this.StartTimeout();
  }

  OnExit() {
    SendTrackingAndExit();
  }

  OnFail() {
    this.loadingInfo && (this.loadingInfo.active = false);
    this.lostConnection && (this.lostConnection.active = true);
  }

  StartTimeout() {
    this.timeoutHandle = setTimeout(() => {
      this.OnFail();
    }, 30000);
  }

  OnInterruptEvent(parameters: any) {
    if (!this.node.active) return;

    switch (parameters.action) {
      case ActionSystem.BACK:
        this.OnExit();
        break;
    }
  }
}
