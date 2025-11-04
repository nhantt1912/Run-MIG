
import { _decorator, Component, Label, Node } from 'cc';
import { i18n_LANGUAGES, i18n } from '../i18n/i18n';
const { ccclass, property } = _decorator;

@ccclass('ButtonLanguage')
export class ButtonLanguage extends Component {
    @property(Node)
    langDropbox: Node;

    triggerLangDropbox() {
        this.langDropbox.active = !this.langDropbox.active;
    }

    onLangChange(e: any, lang: string) {
        i18n.init(i18n_LANGUAGES[lang]);
    }
}