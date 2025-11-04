import { _decorator, Component, Node, AudioSource } from "cc";
import SingletonComponent from "./core/SingletonComponent";
const { ccclass, property } = _decorator;

@ccclass("SoundManager")
export class SoundManager extends SingletonComponent<SoundManager>() {
  @property(AudioSource)
  sounds: AudioSource[] = [];

  playSound(id: number) {
    this.sounds[id] && this.sounds[id].play();
  }

  pauseSound(id: number) {
    this.sounds[id] && this.sounds[id].pause();
  }

  stopSound(id: number) {
    this.sounds[id] && this.sounds[id].stop();
  }

  setVolume(id: number, volume: number) {
    this.sounds[id] && (this.sounds[id].volume = volume);
  }
}
