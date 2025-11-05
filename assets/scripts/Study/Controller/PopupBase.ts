
export interface IPopupBase {

    show(): void;

    hide(): void;

    init(data?: any): void;

    onDestroy(): void;
}
