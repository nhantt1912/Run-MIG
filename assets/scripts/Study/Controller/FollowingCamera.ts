
import { _decorator, Component, Node, CCFloat, Vec3, math, UITransform, Camera, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FollowingCamera')
export class FollowingCamera extends Component {
    @property(Node)
    target: Node = null;

    @property(Node)
    bg: Node = null;

    @property(CCFloat)
    safeZoneHeight = 200;

    @property(CCFloat)
    followSpeed = 0.1;

    @property(CCFloat)
    topLimitOffset = 0;

    @property(CCFloat)
    bottomLimitOffset = 0;

    private targetOriginalY: number = 0;
    private cameraOriginalY: number = 0;
    private bgHeight: number = 0;
    private topLimit: number = 0;
    private bottomLimit: number = 0;
    private cameraHeight: number = 0;

    start() {
        if (this.target) {
            this.targetOriginalY = this.target.position.y;
        }

        this.cameraOriginalY = this.node.position.y;

        // Get camera height
        const camera = this.node.getComponent(Camera);
        if (camera) {
            this.cameraHeight = camera.orthoHeight * 2;
        }

        // Calculate background limits
        if (this.bg) {
            const uiTransform = this.bg.getComponent(UITransform);
            if (uiTransform) {
                this.bgHeight = uiTransform.height * this.bg.scale.y;

                // Calculate camera movement limits based on background size and camera viewport
                // The camera center should not move beyond where the camera edges would show outside the background
                const halfCameraHeight = this.cameraHeight / 2;
                this.topLimit = (this.bgHeight / 2) - halfCameraHeight - this.topLimitOffset;
                this.bottomLimit = -(this.bgHeight / 2) + halfCameraHeight + this.bottomLimitOffset;

                console.log(`Camera limits - Top: ${this.topLimit}, Bottom: ${this.bottomLimit}, BG Height: ${this.bgHeight}, Camera Height: ${this.cameraHeight}`);
            }
        }
    }

    update(deltaTime: number) {
        if (!this.target) {
            return;
        }

        // Calculate how high the player has jumped from original position
        const playerHeight = this.target.position.y - this.targetOriginalY;

        let targetY: number;

        // Check if player is outside safe zone
        if (playerHeight > this.safeZoneHeight) {
            // Camera should move up to follow player
            targetY = this.cameraOriginalY + (playerHeight - this.safeZoneHeight);
        } else {
            // Return to original position when player is in safe zone
            targetY = this.cameraOriginalY;
        }

        // Clamp camera position within background limits
        if (this.bg) {
            targetY = math.clamp(targetY, this.bottomLimit, this.topLimit);
        }

        // Smoothly interpolate to target position
        const currentY = this.node.position.y;
        const newY = math.lerp(currentY, targetY, this.followSpeed);

        this.node.setPosition(
            this.node.position.x,
            newY,
            this.node.position.z
        );
    }
}
