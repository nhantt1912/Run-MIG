
import { _decorator, Component, Node } from 'cc';
import SingletonComponent from './core/SingletonComponent';
const { ccclass, property } = _decorator;

@ccclass('Collectibles')
export class Collectibles extends SingletonComponent<Collectibles>() {
    protected onEnable(): void {
        this.reset();
    }

    active(index: number) {
        this.node.children[index].children[0].active = true;
    }

    reset() {
        this.node.children.forEach((item) => {
            item.children[0].active = false;
        })
    }

    isFull() {
        let isFull = true;
        this.node.children.forEach((item) => {
            if (isFull) {
                isFull = item.children[0].active;
            }
        })

        return isFull;
    }
}