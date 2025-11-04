
import { _decorator, Component, Vec3, tween, UITransform, view, Node, Button } from 'cc';
import EventManager from '../core/EventManager';
import { ActionPopupExit, EventType } from '../Defines';
const { ccclass, property } = _decorator;

@ccclass('PopupSuspend')
export class PopupSuspend extends Component {
    @property(Node)
    container: Node;
    @property(Button)
    button: Button;

    onEnable()
    {
        this.button.interactable = true;
        this.container.setScale(new Vec3(0, 0, 1));
        tween(this.container).to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' }).start();

        this.node.getComponent(UITransform).contentSize = view.getVisibleSize();
    }

    start()
    {
    }

    Show()
    {
        this.node.active = true;
    }

    IsShowing(): boolean
    {
        return this.node.active;
    }

    Hide(callback: any)
    {
        tween(this.container).to(0.5, { scale: new Vec3(0, 0, 1) }, { easing: 'elasticIn' }).call(() =>
        {
            this.node.active = false;
            callback();
        }).start();
    }

    OnResume()
    {
        this.button.interactable = false;
        let paramaters = {
        }
        EventManager.GetInstance().emit(EventType.POPUP_SUSPEND, paramaters);
    }
}
