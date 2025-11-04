import {
  _decorator,
  Component,
  Node,
  view,
  Vec3,
  UITransform,
  macro,
  director,
  screen,
} from "cc";
import EventManager from "./core/EventManager";
import {
  ActionIngame,
  ActionSystem,
  Config,
  EventType,
  GAME_ORIENTATION,
} from "./Defines";
import FingerprintJS from "@fingerprintjs/fingerprintjs/dist/fp.cjs.js";
import Resource from "./core/Resource";
import { getLanguage } from "./core/Utils";

const { ccclass, property } = _decorator;

// var elem = document.documentElement;
// function openFullscreen() {
//   if (elem.requestFullscreen) {
//     elem
//       .requestFullscreen()
//       .then(() => {})
//       .catch(() => {});
//   } else if (elem.webkitRequestFullscreen) {
//     /* Safari */
//     elem
//       .webkitRequestFullscreen()
//       .then(() => {})
//       .catch(() => {});
//   } else if (elem.msRequestFullscreen) {
//     /* IE11 */
//     elem
//       .msRequestFullscreen()
//       .then(() => {})
//       .catch(() => {});
//   }
// }

(window as any).language = "EN";
(<any>window).startTime = new Date().getTime();
if ((<any>window).omsPhase) {
  if ((<any>window).omsPhase === "dev") {
    (<any>window).creative_id = 10000;
    (<any>window).campaign_id = 10000;
  }

  if ((<any>window).omsPhase === "qa") {
    (<any>window).creative_id = 20000;
    (<any>window).campaign_id = 20000;
  }

  if ((<any>window).omsPhase === "gold") {
    (<any>window).creative_id = 30000;
    (<any>window).campaign_id = 30000;
  }
}

@ccclass("GameInit")
export class GameInit extends Component {
  @property(Node)
  portrait: Node;

  @property(Node)
  landscape: Node;

  onLoad() {
    // if ((<any>window).isOutfit7) {
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => {
        (<any>window).anonymous = result.visitorId;
        this.Alignment();
        this.Init();
      });
    // } else {
    //   this.Init();
    //   this.Alignment();
    // }
  }

  start() {
    if (!(<any>window).isOutfit7) {
      const campaign_id =
        (window as any).campaign_id || Resource.GetParam("campaign_id");
      const creative_id =
        (window as any).creative_id || Resource.GetParam("creative_id");
      const app_name = (window as any).game_fullname;
      const os = (window as any).os;
      const pixel = `https://pixel.adsafeprotected.com/jload?anId=931686&pubId=${app_name}&pubOrder=${campaign_id}&chanId=${os}&pubCreative=${creative_id}&placementId=RIM&campId=2025S1`;

      let img1 = new Image();
      img1.src = pixel;
      img1.style.width = "0px";
      img1.style.height = "0px";
      document.body.appendChild(img1);

      let ias_url = Resource.GetParam("ias_url");
      if (ias_url) {
        ias_url = ias_url.replace("{[timestamp]}", "[timestamp]");
        ias_url = ias_url.replace("[timestamp]", Date.now().toString());
        let img2 = document.createElement("script");
        img2.src = ias_url;
        img2.style.width = "0px";
        img2.style.height = "0px";
        document.body.appendChild(img2);
      }
    }
  }

  Init() {
    (<any>window).gTotalTimeSpent = 0;
    (<any>window).gIngameTimeSpent = 0;
    (<any>window).gLoadingTimeSpent = 0;

    this.FunctionDefines();
  }

  Alignment() {
    let viewDesign = view.getDesignResolutionSize();
    let isMigGamePortrait = false;
    let viewVisible = view.getVisibleSize();
    let isHostGamePortrait = window.innerWidth < window.innerHeight;

    if (!view.isRotate()) {
      if (isMigGamePortrait) {
        view.setOrientation(macro.ORIENTATION_PORTRAIT);
        // if ((<any>window).isOutfit7)
        // {
        //     view.setRotateAngle(90);
        // }
        // else
        // {
        view.setRotateAngle(-90);
        // }
        if (!isHostGamePortrait) {
          this.portrait.active = false;
          this.landscape.active = true;
        } else {
          this.portrait.active = true;
          this.landscape.active = false;
          this.portrait.getComponent(UITransform).setContentSize(viewVisible);
        }
      } else {
        view.setOrientation(macro.ORIENTATION_LANDSCAPE);
        view.setRotateAngle(90);
        this.portrait.active = false;
        this.landscape.active = true;
        this.landscape.getComponent(UITransform).setContentSize(viewVisible);
      }
    } else {
      if (isMigGamePortrait) {
        view.setOrientation(macro.ORIENTATION_PORTRAIT);
        if (!(<any>window).isOutfit7) {
          view.setRotateAngle(-90);
        } else {
          if (!isHostGamePortrait) {
            view.setRotateAngle(90);
          } else {
            view.setRotateAngle(-90);
          }
        }

        if (!isHostGamePortrait) {
          this.portrait.active = false;
          this.landscape.active = true;
          this.landscape.getComponent(UITransform).setContentSize(viewVisible);
        } else {
          this.portrait.active = true;
          this.landscape.active = false;
          this.portrait.getComponent(UITransform).setContentSize(viewVisible);
        }
        // let ratio = window.innerHeight / window.innerWidth;
        // if (Config.isSupportTwoScreenSize)
        // {
        //     this.landscape.active = true;
        //     this.landscape.eulerAngles = new Vec3(0, 0, -90);
        //     this.landscape.getComponent(UITransform).setContentSize(viewVisible.height, viewVisible.height * ratio);
        // }
        // else
        // {
        //     this.portrait.active = true;
        //     this.portrait.getComponent(UITransform).setContentSize(viewVisible.height * ratio, viewVisible.height);
        // }
      } else {
        view.setOrientation(macro.ORIENTATION_LANDSCAPE);
        // if ((<any>window).isOutfit7) {
        //     view.setRotateAngle(90);
        // }
        // else {
        view.setRotateAngle(-90);
        // }

        let ratio = window.innerWidth / window.innerHeight;
        if (Config.isSupportTwoScreenSize) {
          this.portrait.active = true;
          this.portrait
            .getComponent(UITransform)
            .setContentSize(viewVisible.width * ratio, viewVisible.width);
        } else {
          this.landscape.active = true;
          this.landscape
            .getComponent(UITransform)
            .setContentSize(viewVisible.width, viewVisible.width * ratio);
        }
      }
    }
  }

  FunctionDefines() {
    let mainWindow = <any>window;
    mainWindow.onGamePause = function () {
      let parameters = {
        action: ActionSystem.PAUSE,
        data: {},
      };

      director.pause();
      EventManager.GetInstance().emit(EventType.SYSTEM, parameters);
    };

    mainWindow.onGameResume = function () {
      let parameters = {
        action: ActionSystem.RESUME,
        data: {},
      };

      director.resume();
      EventManager.GetInstance().emit(EventType.SYSTEM, parameters);
    };

    mainWindow.onBackPressed = function () {
      let parameters = {
        action: ActionSystem.BACK,
        data: {},
      };

      EventManager.GetInstance().emit(EventType.SYSTEM, parameters);
    };

    let GLADS_CONTROLLER_EVENT_BUTTON_B = 16;
    mainWindow.onControllerEvent = function (button: any, value: any) {
      // only support B button from controller for now
      if (button === GLADS_CONTROLLER_EVENT_BUTTON_B) {
        if (value === 0) {
          let parameters = {
            action: ActionSystem.BACK,
            data: {},
          };
          EventManager.GetInstance().emit(EventType.SYSTEM, parameters);
        }
      }
    };
  }
}
