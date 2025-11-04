
import { _decorator, Component, Node } from 'cc';
import { Config } from './Defines';
import { FedProfile } from './core/Federation';
const { ccclass, property } = _decorator;

@ccclass('WallOfText')
export class WallOfText extends Component {
    @property(Node)
    public container: Node = null;

    onEnable() {
        Config.profiles.walloftextindex = Config.profiles.walloftextindex === undefined ? 0 : Config.profiles.walloftextindex;
        this.container.children.forEach((obj, index) => {
            if (index === Config.profiles.walloftextindex) {
                obj.active = true;
            } else {
                obj.active = false;
            }
        })

        Config.profiles.walloftextindex++;
        if (Config.profiles.walloftextindex >= this.container.children.length) { Config.profiles.walloftextindex = 0; }
        let fedProfile = new FedProfile();
        fedProfile.Save(Config.profiles);
    }
}
