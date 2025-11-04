
import { _decorator, Component, Node, SpriteFrame, Sprite } from 'cc';
import { i18n, i18n_LANGUAGES } from './i18n';
import { getLanguage } from '../scripts/core/Utils';
const { ccclass, property } = _decorator;

@ccclass('LocalizedSprite')
export class LocalizedSprite extends Component {
    @property(SpriteFrame)
    public spriteFrames: SpriteFrame[] = [];

    onLoad() {
        this.getComponent(Sprite).spriteFrame = this.spriteFrames[i18n.language];

        i18n.onLanguageChanged(this._onLanguageChanged, this)
    }

    private _onLanguageChanged() {
        this.getComponent(Sprite).spriteFrame = this.spriteFrames[i18n.language];
    }
}
