import { Component, Label } from "cc";

export abstract class PanelBase extends Component {

    protected updateText(label: Label, text: string): void {
        if (label) {
            label.string = text;
        }
    }

    protected updateTextByNodeName(nodeName: string, text: string): void {
        const node = this.node.getChildByName(nodeName);
        if (node) {
            const label = node.getComponent(Label);
            if (label) {
                label.string = text;
            }
        }
    }

}