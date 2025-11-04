import {
  _decorator,
  Component,
  EditBox,
  Label,
  Node,
  Sprite,
  UITransform,
  v2,
  v3,
  Vec3,
} from "cc";
import { CheckBox } from "./CheckBox";
import { Fade } from "../Fade";
import { txtBadWords } from "../BadWords";
import { FedLeaderboard } from "../core/Federation";
import TrackingManager, { TrackingAction } from "../core/TrackingManager";
import { Config, GAME_ORIENTATION } from "../Defines";
const { ccclass, property } = _decorator;

const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

@ccclass("Form")
export class Form extends Component {
  @property(Node)
  formLandscape: Node;
  @property(Node)
  formPortrait: Node;

  @property(Node)
  btnSubmit: Node;

  @property(Node)
  editboxContainer: Node;

  @property(EditBox)
  editboxMail: EditBox;
  @property(EditBox)
  editboxName: EditBox;
  @property(EditBox)
  editboxCountry: EditBox;
  @property(EditBox)
  editboxCompany: EditBox;

  @property(Node)
  txtErrorName: Node;
  @property(Node)
  txtErrorMail: Node;
  @property(Node)
  txtErrorCountry: Node;
  @property(Node)
  txtErrorCompany: Node;

  @property(Node)
  checkboxes: Node;

  @property(Node)
  popupLostConnection: Node;

  @property(Node)
  popupBlockPortrait: Node;
  @property(Node)
  popupReload: Node;

  @property(Fade)
  fadeScreen: Fade;

  private txtEmail: string = "";
  private txtName: string = "";
  private txtCountry: string = "";
  private txtCompany: string = "";

  private isFinishedForm: boolean = true; // Skip form, cho phép chơi ngay
  private isSubmitting: boolean = false;

  private userProfile: any;

  protected start(): void {
    this.txtEmail = this.editboxMail.textLabel.string;
    this.txtErrorName.active = false;
    this.txtErrorMail.active = false;
    this.txtErrorCountry.active = false;
    this.txtErrorCompany.active = false;
    this.editboxContainer.children.forEach((box) => {
      this.initEditBox(box);
    });

    this.userProfile = Config.profiles;
  }

  protected onEnable(): void {
    this.btnSubmit.active = true;
    this.popupLostConnection.active = false;
    this.popupBlockPortrait.active = false;
  }

  protected update(dt: number): void {
    const isPortrait = (window as any).innerHeight > (window as any).innerWidth;
    this.popupBlockPortrait.active = isPortrait;

    if (!isPortrait) {
      this.popupReload.active =
        this.userProfile.gameOrientation == GAME_ORIENTATION.PORTRAIT;
    }

    this.btnSubmit.getComponent(Sprite).grayscale = !(
      this.isReadAndAccept() &&
      this.isFulfillForm() &&
      this.validateName() &&
      this.validateEmail() &&
      this.validateCountry() &&
      this.validateCompany()
    );
  }

  initEditBox(box: Node) {
    const editbox = box.getComponent(EditBox);
    editbox.placeholderLabel.node.getComponent(UITransform).anchorPoint = v2(
      0.5,
      0.5
    );
    editbox.placeholderLabel.node.setPosition(v3(0, 5, 0));

    editbox.textLabel.node.getComponent(UITransform).width = 840;
    editbox.textLabel.node.getComponent(UITransform).height = 100;
    editbox.textLabel.node.position.add(v3(0, 9, 0));

    editbox.textLabel.horizontalAlign = Label.HorizontalAlign.LEFT;
    editbox.textLabel.verticalAlign = Label.VerticalAlign.CENTER;
    editbox.placeholderLabel.horizontalAlign = Label.HorizontalAlign.CENTER;
    editbox.placeholderLabel.verticalAlign = Label.VerticalAlign.CENTER;

    editbox.textLabel.lineHeight = 80;
    editbox.placeholderLabel.lineHeight = 80;

    editbox.textLabel.overflow = Label.Overflow.CLAMP;
    editbox.placeholderLabel.overflow = Label.Overflow.NONE;
  }

  isFulfillForm() {
    return (
      this.editboxContainer.children.filter(
        (eb) => eb.getComponent(EditBox).textLabel.string != ""
      ).length == this.editboxContainer.children.length
    );
  }

  isReadAndAccept() {
    return (
      this.checkboxes.children.filter((cb) =>
        cb.getComponent(CheckBox).IsChecked()
      ).length == this.checkboxes.children.length
    );
  }

  noIncludingBadWords() {}

  onNameChanged(text: string, editbox: EditBox) {
    this.txtName = text;
    this.txtErrorName.active = text == "" ? false : !this.validateName();
  }

  onEmailChanged(text: string, editbox: EditBox) {
    this.txtEmail = text;
    this.txtErrorMail.active = text == "" ? false : !this.validateEmail();
  }

  onCountryChanged(text: string, editbox: EditBox) {
    this.txtCountry = text;
    this.txtErrorCountry.active = text == "" ? false : !this.validateCountry();
  }

  onCompanyChanged(text: string, editbox: EditBox) {
    this.txtCompany = text;
    this.txtErrorCompany.active = text == "" ? false : !this.validateCompany();
  }

  CheckRudeWords(inputValue: string) {
    let words = txtBadWords;
    inputValue = inputValue.toLowerCase();
    for (let i = 0; i < words.length; i++) {
      let str = words[i].trim();
      if (str.length) {
        try {
          let re = new RegExp(str);
          if (re.exec(inputValue)) {
            return true;
          }
        } catch (e) {
          return false;
        }
      }
    }

    return false;
  }

  validateName() {
    const isValid = !this.CheckRudeWords(this.txtName);
    return isValid;
  }

  validateEmail() {
    const isValid =
      !this.CheckRudeWords(this.txtEmail) && expression.test(this.txtEmail);
    return isValid;
  }

  validateCountry() {
    const isValid = !this.CheckRudeWords(this.txtCountry);
    return isValid;
  }

  validateCompany() {
    const isValid = !this.CheckRudeWords(this.txtCompany);
    return isValid;
  }

  onSubmit() {
    if (this.isSubmitting) return;
    if (!this.isReadAndAccept()) return;
    if (!this.validateName()) return;
    if (!this.validateEmail()) return;
    if (!this.validateCountry()) return;
    if (!this.validateCompany()) return;
    if (!this.isFulfillForm()) return;

    this.isSubmitting = true;
    this.btnSubmit.active = false;

    this.sendData();
  }

  sendData() {
    this.popupLostConnection.active = false;
    let leaderboard = new FedLeaderboard();

    leaderboard
      .SaveForm(leaderboard.userid, {
        userName: this.txtName,
        userEmail: this.txtEmail,
        userCountry: this.txtCountry,
        userCompany: this.txtCompany,
      })
      .then(() => {
        TrackingManager.SendEventTracking(
          TrackingAction.FORM_LEAD,
          () => {},
          `userName: ${this.txtName}`
        );

        this.fadeScreen.in(() => {
          this.node.active = false;
          this.fadeScreen.out(() => {
            this.isFinishedForm = true;
          });
        });
      })
      .catch(() => {
        this.popupLostConnection.active = true;
      });
  }

  onSkipForm() {
    if (this.isSubmitting) return;

    this.isSubmitting = true;

    this.fadeScreen.in(() => {
      this.node.active = false;
      this.fadeScreen.out(() => {
        this.isFinishedForm = true;
      });
    });
  }

  onRetrySubmitForm() {
    this.isSubmitting = false;
    this.btnSubmit.active = true;
    this.popupLostConnection.active = false;
  }

  onReload() {
    (window as any).location.reload();
  }

  onButtonCheckPolicy() {
    (window as any).open(
      "https://forbrands.assets.gameloft.com/assets/documents/Privacy%2BPolicy_B2B%2B_08.09.2020.pdf",
      "_blank"
    );
  }

  onButtonCheckContestRules() {
    window.open(
      "https://mkt-web.gameloft.com/static/fc459f656f460f7dceeea51cbfa79aa8.pdf",
      "_blank"
    );
  }

  IsFinishedForm() {
    return this.isFinishedForm;
  }
}
