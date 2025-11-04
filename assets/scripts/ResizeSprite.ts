import { CCBoolean, Component, Enum, Sprite, UITransform, _decorator } from "cc"

const { ccclass, property, executeInEditMode } = _decorator

const ResizeSpriteModes = Enum({
  WIDTH: 0,
  HEIGHT: 1,
  BOTH: 2,
})

@ccclass
@executeInEditMode
export default class ResizeSprite extends Component {
  @property({ type: ResizeSpriteModes }) private MatchMode: number = 0
  @property(CCBoolean) private UseUpdateMethod: boolean = false

  // private mInitWidth: number
  // private mInitHeight: number

  // onLoad() {
  //   this.getComponent(Sprite).sizeMode = Sprite.SizeMode.CUSTOM
  // }

  // init() {
  // }

  // onEnable() {
  //   this.resize()
  // }

  // update(dt: number) {
  //   if (this.UseUpdateMethod) {
  //     this.resize()
  //   }
  // }

  // private resize() {
  //   if (!this.getComponent(Sprite).spriteFrame) {
  //     return
  //   }

  //   this.mInitWidth = this.node.getComponent(UITransform).width
  //   this.mInitHeight = this.node.getComponent(UITransform).height

  //   const rect = this.getComponent(Sprite).spriteFrame
  //   let width = this.mInitWidth
  //   let height = this.mInitHeight

  //   switch (this.MatchMode) {
  //     case ResizeSpriteModes.WIDTH:
  //       width = this.mInitWidth
  //       height = width * (rect.height / rect.width)
  //       break
  //     case ResizeSpriteModes.HEIGHT:
  //       height = this.mInitHeight
  //       width = height * (rect.width / rect.height)
  //       break
  //     case ResizeSpriteModes.BOTH:
  //       break

  //   }

  //   this.node.getComponent(UITransform).width = width
  //   this.node.getComponent(UITransform).height = height
  // }
}
