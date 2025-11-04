
import { _decorator, Component, Node } from 'cc';
import { i18n, i18n_LANGUAGES } from '../i18n/i18n';
import { EnumToCCEnum } from './Defines';
const { ccclass, property } = _decorator;

export enum LANGUAGES {
    EN,
    AR,
};

@ccclass('ButtonLanguageOption')
export class ButtonLanguageOption extends Component {
    @property({ type: EnumToCCEnum(LANGUAGES) })
    public langOption: number = LANGUAGES.EN;

    @property(Node)
    highlight: Node;

    protected start(): void {
        i18n.onLanguageChanged(this._onLanguageChanged, this);
    }

    protected onLoad(): void {
        this.uptateLange();
    }

    protected onEnable(): void {
        this.uptateLange();
    }

    private _onLanguageChanged() {
        this.uptateLange();
    }

    uptateLange() {
        this.highlight.active = i18n.language === this.langOption;
    }
}
