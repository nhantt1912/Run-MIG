import { Enum } from "cc";

export enum GAME_ORIENTATION {
  LANDSCAPE = 0,
  PORTRAIT,
}

export class Profiles {
  finishTutorial: boolean = true;
  finishTutorial2: boolean = false;
  character: number = 1;
  map: number = 1;
  userId: string = "";
  walloftextindex: number = 0;
  gameOrientation: number = 0;
}

export class Config {
  static REST_API_SERVER = "https://oms.gameloft.com";
  static profiles: Profiles = new Profiles();

  static gameDuration = 60;
  static gameDuration_outfit7 = 60;
  static warningDuration = 5;
  static isSupportTwoScreenSize: boolean = false;
}

export enum EventType {
  INGAME = "ingame",
  RESULT = "result",
  POPUP_TUTORIAL = "popup_tutorial",
  POPUP_EXIT = "popup_exit",
  POPUP_SUSPEND = "popup_suspend",
  POPUP_NO_REWARD = "popup_no_reward",
  SYSTEM = "system",
  COLLECT = "collect",
  TUTORIAL_HINT = "tutorial_hint",
  MAP_CHANGE = "MAP_CHANGE",
  COLLECT_ITEM = "COLLECT_ITEM",
  ON_SCORE_CHANGE = "ON_SCORE_CHANGE",
  ON_HEART_CHANGE = "ON_HEART_CHANGE",
  ON_HIT = "ON_HIT",
  END_CONTACT = "END_CONTACT",
}

export enum ActionIngame {
  TIMEOUT,
  EXIT,
  CONTINUE,
  SUSPEND,
  BACK_PRESS,
  PAUSE,
}

export enum ActionResult {
  RETRY,
  EXIT,
  GOT_REWARD,
}

export enum ActionPopupExit {
  YES,
  NO,
}

export enum ActionPopupTutorial {
  SHOW,
  HIDE,
}

export enum ActionPopupNoReward {
  SHOW,
  HIDE,
}

export enum ActionSystem {
  PAUSE,
  RESUME,
  BACK,
}

export enum MainCharacterState {
  JUMP_UP,
  JUMP_DOWN,
  RUN,
  TURBO,
  HOLD,
  TRANSFORM,
}

export enum ItemState {
  IDLE,
  COLLECT,
}

export enum Score {
  ITEM = 10,
  OBSTACLE = -10,
  SPECIAL = 500,
}

export enum Layer {
  ITEM = 1,
  OBSTACLE = 2,
  PLATFORM = 4,
  DECOR = 8,
  TUTORIAL= 16,
}

export enum ObjectType {
  ITEM,
  COIN,
  OBSTACLE,
  PLATFORM,
}

export enum MainCharacterAnim {
  RUN = "Run",
  JUMP_UP = "jump up1",
  FRENZY = "Frenzy",
  DASH = "slide1",
  RUN2 = "Run",
  JUMP_UP2 = "jump up2",
  DASH2 = "slide2",
  TRANSFORM = "transform",
  JUMP = "Jump",
}

export enum ItemAnim {
  IDLE = "item_idle",
  COLLECT = "item_eat",
}

export enum ScoreAnim {
  ITEM = "+10",
  ITEM_X2 = "+20",
  SPECIAL_ITEM = "+500",
  SPECIAL_ITEM_X2 = "+1000",
  OBSTACLE = "-10",
  IDLE = "idle",
}

export enum TutorialStep {
  JUMP_OBSTACLE,
  JUMP_DOWN,
  JUMP_COLLECT,
  SWIPE_SLIDE,
}

export enum SoundId {
  BGM,
  END,
  COIN,
  ITEM,
  CONE,
  JUMP_UP,
  JUMP_DOWN,
  TIMER,
  TIME_UP,
  BUTTON,
  SFX_FREEZE,
  SFX_X2,
  SFX_SUPER_JUMP,
  SFX_INVINCIBLE,
  INTRO,
  SFX_FRENZY,
  SFX_TRANSFORM,
  SFX_CAR_IDLE,
  SFX_COLLECT_ITEM,
  SFX_CROSS_RED_LIGHT,
  SFX_HIT_OBSTACLE,
}

export enum BUFF {
  NONE,
  FREEZE,
  BOOST,
  SUPER_JUMP,
  X2,
  BUFF5,
  BUFF6,
  INVINCIBILITY,
  SWITCHSKIN,
}

export const BUFFS_KEYS = {
  NONE: 0,
  FREEZE: 1,
  BOOST: 2,
  SUPER_JUMP: 3,
  X2: 4,
  INVINCIBILITY: 7,
  SWITCHSKIN: 8,
};

export const playerBuffs = {
  [BUFF.FREEZE]: {
    amount: 0,
    remaining: 0,
    time: 5,
  },
  [BUFF.INVINCIBILITY]: {
    amount: 0,
    remaining: 0,
    time: 5,
  },
  [BUFF.SUPER_JUMP]: {
    amount: 0,
    remaining: 0,
    time: 5,
  },
  [BUFF.X2]: {
    amount: 0,
    remaining: 0,
    time: 5,
  },
  [BUFF.BUFF5]: {
    amount: 0,
    remaining: 0,
    time: 5,
  },
  [BUFF.BUFF6]: {
    amount: 0,
    remaining: 0,
    time: 5,
  },
  [BUFF.BOOST]: {
    amount: 0,
    remaining: 0,
    time: 5,
  },
  [BUFF.SWITCHSKIN]: {
    amount: 0,
    remaining: 0,
    time: 0.5,
  },
};

export const DeltaTime = 1 / 144;
export const EnumToCCEnum = (enumObj: any) => {
  const keys = Object.keys(enumObj);
  const obj = {};
  const startKeyIndex = keys.length / 2;
  for (let i = 0; i < startKeyIndex; i++) {
    obj[keys[startKeyIndex + i]] = Number(keys[i]);
  }
  return Enum(obj);
};

export const GetSocialSharingLink = () => {
  return "https://www.google.com";
};

export const TEXT_CONTENTS_SOCIAL_SHARING = "";

export const GameDefine = {
  FRENZY_ENERGY_MAX: 20,
  MAX_CAR_SPEED: 2,
  MIN_CAR_SPEED: 0.4,
  SPEED_STEP: 0.5,
  SLOW_DOWN_STEP: 0.8,
  SLOW_DOWN_STEP_ON_BRAKE: 2,
  GAME_SPEED: 0.5,
  BONUS_SPEED: 1.4,
  SLOW_DOWN: 0.65,
};
