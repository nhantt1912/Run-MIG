
import { _decorator, Camera, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    @property(Camera)
    mainCamera: Camera;
    @property(Camera)
    gameCamera: Camera

    protected start(): void {
        this.gameCamera.orthoHeight = this.mainCamera.orthoHeight;
    }
}
