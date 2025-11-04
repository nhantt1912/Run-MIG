import { _decorator, Component, Node, SpriteFrame } from "cc";
import SingletonComponent from "./SingletonComponent";
const { ccclass, property } = _decorator;

@ccclass("FrameMgr")
export class FrameMgr extends SingletonComponent<FrameMgr>() {
  @property([SpriteFrame]) TRAFFIC_LIGHT: SpriteFrame[] = [];
}
