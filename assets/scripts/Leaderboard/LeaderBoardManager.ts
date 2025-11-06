import {
  _decorator,
  Component,
  instantiate,
  Node,
  JsonAsset,
  Prefab,
  SpriteFrame,
} from "cc";
import { ItemBoard } from "./ItemBoard";
import EventManager from "../core/EventManager";
import { EVENT_TYPE } from "../Study/Cores/DefinesStudy";
import { PopupLeaderboard } from "../popup/PopupLeaderboard";
import { LeaderBoardPopup } from "../Study/Controller/LeaderBoardPopup";
const { ccclass, property } = _decorator;

interface PlayerData {
  playerName: string;
  score: number;
}

interface LeaderboardData {
  players: PlayerData[];
}

@ccclass("LeaderBoardManager")
export class LeaderBoardManager extends Component {
  @property(Node)
  container: Node = null;

  @property(Prefab)
  itemBoard: Prefab = null;

  @property(JsonAsset)
  leaderboardData: JsonAsset = null;

  @property(LeaderBoardPopup)
  popupLeaderboard: LeaderBoardPopup = null;

  @property([SpriteFrame])
  arrSpriteFrame: SpriteFrame[] = [];

  protected start(): void {
    EventManager.GetInstance().on(EVENT_TYPE.GAME_OVER, this.onShowPopup, this);
  }

  onShowPopup() {
    console.log("onShowPopup");
    this.popupLeaderboard.onShow();
    this.loadLeaderboardData();
  }

  loadLeaderboardData() {
    if (!this.leaderboardData) {
      console.error("Leaderboard data not assigned in inspector");
      return;
    }

    const savedData = this.loadFromLocalStorage();
    const data = savedData || (this.leaderboardData.json as LeaderboardData);

    this.sortDataByScore(data.players, (sortedPlayers) => {
      this.createItemBoards(sortedPlayers);
    });
  }

  sortDataByScore(
    players: PlayerData[],
    callback: (sortedPlayers: PlayerData[]) => void
  ) {
    if (!players || players.length === 0) {
      console.warn("No players data to sort");
      callback([]);
      return;
    }
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    callback(sortedPlayers);
  }

  createItemBoards(players: PlayerData[]) {
    if (!this.container || !this.itemBoard) {
      console.error("Container or itemBoard prefab is not assigned");
      return;
    }
    this.container.removeAllChildren();

    players.forEach((player) => {
      this.createItemBoard(player);
    });
  }

  createItemBoard(playerData: PlayerData) {
    const item = instantiate(this.itemBoard);
    const itemBoardComponent = item.getComponent(ItemBoard);

    if (itemBoardComponent) {
      const spriteFrame =
        this.arrSpriteFrame[this.caculatorRank(playerData.score) - 1];
      itemBoardComponent.init(
        playerData.playerName,
        playerData.score,
        spriteFrame
      );
    }

    item.setParent(this.container);
    item.active = true;

    console.log("Item created:", item);
  }

  addPlayerData(playerName: string, score: number, maxPlayers: number = 10) {
    if (!this.leaderboardData) {
      console.error("Leaderboard data not assigned");
      return;
    }
    // this.clearLeaderboardData();

    const data = this.leaderboardData.json as LeaderboardData;

    const existingPlayerIndex = data.players.findIndex(
      (player) => player.playerName === playerName
    );

    if (existingPlayerIndex !== -1) {
      const existingPlayer = data.players[existingPlayerIndex];

      if (score > existingPlayer.score) {
        existingPlayer.score = score;
        console.log(
          `Updated player: ${playerName} with new high score: ${score}`
        );
      } else {
        console.log(
          `Player ${playerName} already has a higher score: ${existingPlayer.score}`
        );
        return;
      }
    } else {
      const newPlayer: PlayerData = {
        playerName: playerName,
        score: score,
      };
      data.players.push(newPlayer);
      console.log(`Added new player: ${playerName} with score: ${score}`);
    }

    data.players.sort((a, b) => b.score - a.score);

    if (data.players.length > maxPlayers) {
      data.players = data.players.slice(0, maxPlayers);
    }

    this.saveLeaderboardData(data);
  }

  private saveLeaderboardData(data: LeaderboardData) {
    const jsonString = JSON.stringify(data);
    localStorage.setItem("leaderboardData", jsonString);

    console.log("Leaderboard data saved:", data);
  }

  private loadFromLocalStorage(): LeaderboardData | null {
    const savedData = localStorage.getItem("leaderboardData");
    if (savedData) {
      try {
        return JSON.parse(savedData) as LeaderboardData;
      } catch (error) {
        console.error("Error parsing saved leaderboard data:", error);
        return null;
      }
    }
    return null;
  }

  clearLeaderboardData() {
    localStorage.removeItem("leaderboardData");
    console.log("Leaderboard data cleared from localStorage");

    this.loadLeaderboardData();
  }

  private caculatorRank(score: number) {
    if (score > 8000) {
      return 1;
    } else if (score > 6000) {
      return 2;
    } else if (score > 4000) {
      return 3;
    } else {
      return 4;
    }
  }
}
