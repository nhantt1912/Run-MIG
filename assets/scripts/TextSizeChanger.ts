import { _decorator, Component, Label, Node } from "cc";
import { getLanguage } from "./core/Utils";
const { ccclass, property } = _decorator;

@ccclass("TextSizeChanger")
export class TextSizeChanger extends Component {
  @property(String)
  language: string = "EN";
  @property(Number)
  textSize: number = 20;
  @property(Number)
  lineHeight: number = 100;

  protected start(): void {
    const language = getLanguage();
    if (this.language == language) {
      this.node.getComponent(Label).fontSize = this.textSize;
      this.node.getComponent(Label).lineHeight = this.lineHeight;
    }
  }
}
