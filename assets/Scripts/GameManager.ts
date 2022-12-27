import {
  _decorator,
  Component,
  Node,
  Prefab,
  CCInteger,
  instantiate,
  Vec3,
  Label,
} from "cc";
import { PlayerController } from "./PlayerController";
const { ccclass, property } = _decorator;

enum BlockType {
  BT_NONE,
  BT_STONE,
}

enum GameState {
  GS_INIT,
  GS_PLAYING,
  GS_END,
}

@ccclass("GameManager")
export class GameManager extends Component {
  private _curState: GameState = GameState.GS_INIT;
  private _road: number[] = [];

  @property({ type: PlayerController })
  public playerCtrl: PlayerController | null = null;
  @property({ type: Prefab })
  public cubePrfb: Prefab | null = null;
  @property({ type: CCInteger })
  public roadLength: Number = 50;
  @property({ type: Node })
  public startMenu: Node | null = null;
  @property({ type: Label })
  public stepsLabel: Label | null = null;

  start() {
    this.curState = GameState.GS_INIT;
    this.playerCtrl?.node.on("JumpEnd", this.onPlayerJumpEnd, this);
  }

  init() {
    if (this.startMenu) {
      this.startMenu.active = true;
    }

    this.generateRoad();
    if (this.playerCtrl) {
      this.playerCtrl.setInputActive(false);
      this.playerCtrl.node.setPosition(Vec3.ZERO);
      this.playerCtrl.reset();
    }
  }

  set curState(value: GameState) {
    switch (value) {
      case GameState.GS_INIT:
        this.init();
        break;
      case GameState.GS_PLAYING:
        if (this.startMenu.active) this.startMenu.active = false;
        if (this.stepsLabel) this.stepsLabel.string = "0";

        setTimeout(() => {
          if (this.playerCtrl) this.playerCtrl.setInputActive(true);
        }, 0.1);
        break;
      case GameState.GS_END:
        this.init();
        break;
    }

    this._curState = value;
  }

  onStartButtonClicked() {
    this.curState = GameState.GS_PLAYING;
  }

  onPlayerJumpEnd(moveIndex: number) {
    this.stepsLabel.string = "" + moveIndex;
    this.checkResult(moveIndex);
  }

  checkResult(moveIndex: number) {
    if (moveIndex <= this.roadLength) {
      if (this._road[moveIndex] === BlockType.BT_NONE) {
        this.curState = GameState.GS_END;
      }
    } else {
      this.curState = GameState.GS_INIT;
    }
  }

  generateRoad() {
    this.node.removeAllChildren();

    this._road = [];

    //startPos
    this._road.push(BlockType.BT_STONE);

    for (let i = 1; i < this.roadLength; i++) {
      if (this._road[i - 1] === BlockType.BT_NONE) {
        this._road.push(BlockType.BT_STONE);
      } else {
        this._road.push(Math.floor(Math.random() * 2));
      }
    }

    for (let j = 0; j < this._road.length; j++) {
      let block: Node | null = this.spawnBlockByType(this._road[j]);
      if (block) {
        this.node.addChild(block);
        block.setPosition(j, -1.5, 0);
      }
    }
  }

  spawnBlockByType(type: BlockType) {
    if (!this.cubePrfb) return null;

    let block: Node | null = null;
    switch (type) {
      case BlockType.BT_STONE:
        block = instantiate(this.cubePrfb);
        break;
    }

    return block;
  }

  // update(deltaTime: number) {}
}
