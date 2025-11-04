
import { _decorator, Component, Vec3, tween, UITransform, view, Node } from 'cc';
import EventManager from '../core/EventManager';
import { ActionPopupNoReward, Config, EventType } from '../Defines';
import { FedLeaderboard } from '../core/Federation';
import { TopItem } from '../Leaderboard/TopItem';
import TrackingManager, { TrackingAction } from '../core/TrackingManager';
const { ccclass, property } = _decorator;

@ccclass('PopupLeaderboard')
export class PopupLeaderboard extends Component {
    @property(Node)
    container: Node;

    @property(TopItem)
    top1: TopItem;
    @property(TopItem)
    top2: TopItem;
    @property(TopItem)
    top3: TopItem;
    @property(TopItem)
    myEntry: TopItem;

    @property(Node)
    restOfLB: Node;
    @property(Node)
    lostConnectionPopup: Node;

    onEnable() {
        this.fetchLB();

        this.container.setScale(new Vec3(0, 0, 1));
        tween(this.container).to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: 'elasticOut' }).start();

        this.node.getComponent(UITransform).contentSize = view.getVisibleSize();
    }

    fetchLB() {
        this.lostConnectionPopup.active = false;

        let leaderboard = new FedLeaderboard();
        leaderboard.MyEntry().then((me: string) => {
            const meToUse = JSON.parse(me);
            this.myEntry.init(meToUse.rank, meToUse.display_name, meToUse.score);
            return leaderboard.Get(0, 15).then((data: string) => {
                const dataToUse = JSON.parse(data);

                if (dataToUse[0]) {
                    this.top1.init(dataToUse[0].rank, dataToUse[0].display_name, dataToUse[0].score, dataToUse[0].char);
                }
                if (dataToUse[1]) {
                    this.top2.init(dataToUse[1].rank, dataToUse[1].display_name, dataToUse[1].score, dataToUse[1].char);
                }
                if (dataToUse[2]) {
                    this.top3.init(dataToUse[2].rank, dataToUse[2].display_name, dataToUse[2].score, dataToUse[2].char);
                }

                const top4To15 = dataToUse.slice(3, 14);
                top4To15.forEach((item: any, index: number) => {
                    const topItem: TopItem = this.restOfLB.children[1 + index].getComponent(TopItem)
                    if (meToUse.rank === item.rank) {
                        topItem.highlight(true);
                    } else {
                        topItem.highlight(false);
                    }
                    topItem.init(item.rank, item.display_name, item.score);
                });
            });
        }).catch((e) => {
            console.log(e)
            this.lostConnectionPopup.active = true;
        })
    }

    start() {
    }

    Show() {
        TrackingManager.SendEventTracking(TrackingAction.CLICK_ON_BUTTON, () => { }, `Leaderboard`);
        this.node.active = true;
    }

    Hide() {
        tween(this.container).to(0.5, { scale: new Vec3(0, 0, 1) }, { easing: 'elasticIn' }).call(() => {
            this.node.active = false;
        }).start();
    }
}
