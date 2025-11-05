
import { _decorator, BoxCollider2D, Component, Contact2DType, IPhysics2DContact, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlayerInteraction')
export class PlayerInteraction extends Component {
    
    @property(BoxCollider2D)
    boxCollider: BoxCollider2D;

    protected start(): void {
        this.boxCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    onBeginContact(selfCollider: BoxCollider2D, otherCollider: BoxCollider2D, contact: IPhysics2DContact | null) {
        
    }

}

