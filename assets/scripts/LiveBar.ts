
import { _decorator, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass( 'LiveBar' )
export class LiveBar extends Component
{

    @property( [Node] )
    HeartDeactive: Node[] = [];

    onEnable ()
    {
        for ( let i = 0; i < this.HeartDeactive.length; i++ )
        {
            this.HeartDeactive[i].children[0].active = true;
        }
    }

    RemoveHeart (Lives: any)
    {
        this.HeartDeactive[Lives].children[0].active = false;
    }
}
