import { _decorator, Component, Label, Material, Color, Vec4 } from "cc";
const { ccclass, property, executeInEditMode, requireComponent } = _decorator;

@ccclass("GradientLabel")
@requireComponent(Label)
@executeInEditMode
export class GradientLabel extends Component {
  @property(Label)
  label: Label;

  @property(Color)
  gradientColor1: Color = new Color(255, 0, 0, 255);

  @property(Color)
  gradientColor2: Color = new Color(0, 0, 255, 255);

  @property(Number)
  gradientAngle: number = 0;

  @property({
    type: Number,
    range: [0, 1, 0.01],
    slide: true,
  })
  gradientMixRatio: number = 0.5;

  @property({
    type: Boolean,
    displayName: "Apply Changes to Material",
  })
  get applyChanges(): boolean {
    return false;
  }
  set applyChanges(value: boolean) {
    if (value) {
      this.updateGradient();
    }
  }

  @property({
    type: Boolean,
    displayName: "Reset/Re-import Component",
  })
  get resetComponent(): boolean {
    return false;
  }
  set resetComponent(value: boolean) {
    if (value) {
      this.reinitializeComponent();
    }
  }

  private _material: Material | null = null;

  onEnable() {
    this.initializeGradient();
  }

  private initializeGradient() {
    if (!this.label) {
      this.label = this.getComponent(Label);
    }

    if (!this.label) return;

    this._material = this.label.customMaterial;

    if (!this._material) return;

    this.updateGradient();
  }

  public updateGradient() {
    if (!this._material) {
      this.initializeGradient();
      if (!this._material) return;
    }

    try {
      const color1 = new Vec4(
        this.gradientColor1.r / 255,
        this.gradientColor1.g / 255,
        this.gradientColor1.b / 255,
        this.gradientColor1.a / 255
      );

      const color2 = new Vec4(
        this.gradientColor2.r / 255,
        this.gradientColor2.g / 255,
        this.gradientColor2.b / 255,
        this.gradientColor2.a / 255
      );

      this._material.setProperty("gradientColor1", color1);
      this._material.setProperty("gradientColor2", color2);
      this._material.setProperty("gradientAngle", this.gradientAngle);
      this._material.setProperty("gradientMixRatio", this.gradientMixRatio);
    } catch (error) {
      console.error("Error applying gradient:", error);
    }
  }

  public setGradientColors(color1: Color, color2: Color) {
    this.gradientColor1 = color1;
    this.gradientColor2 = color2;
    this.updateGradient();
  }

  public setGradientAngle(angle: number) {
    this.gradientAngle = angle % 360;
    this.updateGradient();
  }

  public setGradientMixRatio(ratio: number) {
    this.gradientMixRatio = Math.max(0, Math.min(1, ratio));
    this.updateGradient();
  }

  public rotateGradient(speed: number, deltaTime: number) {
    this.gradientAngle = (this.gradientAngle + speed * deltaTime) % 360;
    this.updateGradient();
  }

  public reinitializeComponent() {
    this._material = null;
    this.label = this.getComponent(Label);

    if (!this.label) return;

    this.initializeGradient();

    if (this._material) this.updateGradient();
  }
}
