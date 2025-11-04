import { _decorator, Component, Node, UITransformComponent } from "cc";
import { MapLayer } from "./MapLayer";

const { ccclass, property } = _decorator;

@ccclass("MapController")
export class MapController extends Component {
  @property(MapLayer)
  sky!: MapLayer;

  @property(MapLayer)
  buildingsBG!: MapLayer;

  @property(MapLayer)
  buildings!: MapLayer;

  @property(MapLayer)
  ground!: MapLayer;

  @property(MapLayer)
  mountain!: MapLayer;

  @property(MapLayer)
  fence!: MapLayer;

  @property(MapLayer)
  platfroms!: MapLayer;

  @property(MapLayer)
  objects!: MapLayer;

  @property(MapLayer)
  tutorial!: MapLayer;

  @property(MapLayer)
  map1: MapLayer;
  @property(MapLayer)
  map2: MapLayer;
  @property(MapLayer)
  map3: MapLayer;
  @property(MapLayer)
  map4: MapLayer;

  @property(Node)
  fade!: Node;

  @property(Node)
  tutorialHints: Node[] = [];

  mTutorialStep = -1;

  updatePosition(scaleTime: number, currentTime: number) {
    this.sky.updatePosition(scaleTime, currentTime);
    this.buildingsBG.updatePosition(scaleTime, currentTime);
    this.buildings.updatePosition(scaleTime, currentTime);
    this.ground.updatePosition(scaleTime, currentTime);
    // this.mountain.updatePosition(scaleTime);
    // this.fence.updatePosition(scaleTime);
    // this.platfroms.updatePosition(scaleTime, currentTime);
    // this.objects.updatePosition(scaleTime, currentTime);

    this.map1?.updatePosition(scaleTime, currentTime);
    this.map2?.updatePosition(scaleTime, currentTime);
    this.map3?.updatePosition(scaleTime, currentTime);
    this.map4?.updatePosition(scaleTime, currentTime);
  }

  enableTutorial() {
    this.tutorial.node.active = true;
  }

  disableTutorial() {
    this.tutorial.node.active = false;
  }

  nextTutorial() {
    this.fade.active = true;
    if (this.mTutorialStep < this.tutorialHints.length - 1) {
      this.mTutorialStep += 1;
      this.tutorialHints[this.mTutorialStep].active = true;
    }
  }

  hideTutorial() {
    this.fade.active = false;
    if (this.mTutorialStep >= 0) {
      this.tutorialHints[this.mTutorialStep].active = false;
    }
  }

  getTutorialStep(): number {
    return this.mTutorialStep;
  }

  tutorialIsShowing() {
    return this.tutorialHints.some((v, i) => v.active == true);
  }
}
