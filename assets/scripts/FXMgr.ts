import {
  _decorator,
  Animation,
  Component,
  instantiate,
  Node,
  Prefab,
  tween,
  v3,
  Vec3,
} from "cc";
import SingletonComponent from "./core/SingletonComponent";
import { Item } from "./Item";
const { ccclass, property } = _decorator;

export enum EFFECTS {
  PLUS50,
  MINUS100,
}

@ccclass("FXMgr")
export class FXMgr extends SingletonComponent<FXMgr>() {
  @property(Node) effects: Node[] = [];
  @property(Node) player: Node;
  @property(Node) coinContainer: Node;
  @property(Prefab)
  prefabScore: Prefab;
  @property(Prefab)
  prefabCollectItem: Prefab;

  playFX(fx: EFFECTS) {
    const newFX = instantiate(this.effects[fx]);
    newFX.parent = this.node;
    newFX.setWorldPosition(this.player.worldPosition.clone().add3f(0, 30, 0));
    newFX.active = true;
  }

  spawnScore(score: number, pos: Vec3) {
    const prefabScore = instantiate(this.prefabScore);
    prefabScore.parent = this.node;

    // prefabScore.getComponent(Score).init(score, pos);
  }

  collectCoin(coin: Node) {
    const prefabItem = instantiate(this.prefabCollectItem);
    prefabItem.parent = this.node;
    prefabItem.setWorldPosition(coin.worldPosition);
    prefabItem.getComponent(Animation).play();
    prefabItem.on(Animation.EventType.FINISHED, () => {
      prefabItem.destroy();
    });
  }
}
