import { Howl } from "howler";
//even tho it is duplicate state to have this playing on client and on the AI, it is good since with no AI, you can play without the server, plus it holds onto things like stones captured and such
//ok actually I don't think it is good maybe, like I should just be pushing positions and updating capture counts based on wjatever the server returns as the updated game state, then we can just cache the most recent positions
//I should make an interface for a go engine so I can swap it out if I wanted to
//yea the duplicate state low key sucks I should change it
//I DO need to keep track of things like turn in the game manager tho since it doesn't look like GNUgo does this.
class GameManager {
  private gameInstance: WGo.Game;
  private size: number;

  //audio
  doubleKillSound = new Howl({ src: "/sounds/doubleKill.mp3" });
  tripleKillSound = new Howl({ src: "/sounds/tripleKill.mp3" });
  killingSpreeSound = new Howl({ src: "/sounds/killing-spree.mp3" });
  killtacularSound = new Howl({ src: "/sounds/killtactular.mp3" });
  vineboomSound = new Howl({ src: "/sounds/vine-boom.mp3" });
  constructor(size: number) {
    this.size = size;
    this.gameInstance = new WGo.Game(size);
  }
  public static rowColFromIndex(index: number, size: number) {
    return {
      row: Math.floor(index / size),
      col: index % size,
    };
  }
  public static indexFromRowCol(
    row: number,
    col: number,
    size: number
  ): number {
    return row * size + col;
  }
  static getMostRecentMove(gameModel: GameModel) {
    const lastTwoMoves = gameModel.stack.slice(
      -Math.min(gameModel.stack.length, 2)
    );
    if (lastTwoMoves.length != 2) {
      return null;
    } else {
      return GameManager.findMove(lastTwoMoves[0], lastTwoMoves[1]);
    }
  }
  static getDifferences(
    prevPosition: WGo.Position,
    currentPosition: WGo.Position
  ) {
    const previousState = prevPosition.schema;
    const currentState = currentPosition.schema;

    if (previousState.length !== currentState.length) {
      throw new Error("Board states must have the same length");
    }

    // Find the differences
    const differences = [];
    for (let i = 0; i < previousState.length; i++) {
      //don't show captures, only show 0 to something
      if (previousState[i] == 0 && previousState[i] !== currentState[i]) {
        differences.push({
          index: i,
          color: currentState[i] as -1 | 1,
        });
      }
    }
    return differences;
  }
  static findMove(prevPosition: WGo.Position, currentPosition: WGo.Position) {
    const differences = GameManager.getDifferences(
      prevPosition,
      currentPosition
    );
    //there should not be more than one case of a 0 going to a -1|1 in a single position change
    if (differences.length != 1) {
      return null;
    }
    return differences[0];
  }
  private static GetKillStreak(gameModel: GameModel, color: WGo.B | WGo.W) {
    const lastCaptures = gameModel.stack
      .filter((pos) => pos.color == color)
      .map((pos) => pos.capCount[color == 1 ? "black" : "white"])
      .reverse();
    let killStreak = 0;
    for (let i = 1; i < lastCaptures.length; i++) {
      if (lastCaptures[i - 1] > lastCaptures[i]) {
        killStreak++;
      } else {
        break;
      }
    }
    return killStreak;
  }

  static GameModelFromPosition(position: WGo.Position): GameModel {
    const initPos = new WGo.Position();
    Object.assign(initPos, position);
    return {
      size: position.size,
      stack: [initPos],
      position: initPos,
      turn: initPos.color,
    };
  }

  static GetErrorText = (errorNum: number) => {
    switch (errorNum) {
      case 1:
        return "given coordinates are not on board.";
      case 2:
        return "on given coordinates already is a stone.";
      case 3:
        return "suicide (currently they are forbbiden).";
      case 4:
        return "repeated position.";
      default:
        return `unrecognized error: ${errorNum}`;
    }
  };

  static CreateBlankWGoPosition(size: number): WGo.Position {
    const newPos = new WGo.Position(size);
    newPos.capCount = { black: 0, white: 0 };
    newPos.color = 1;
    return newPos;
  }
  private getValidMoves() {
    const validMoves = this.getPosition()
      .schema.map((_, i) => {
        const rowCol = GameManager.rowColFromIndex(i, this.size);
        return this.isValid(rowCol.row, rowCol.col) ? rowCol : false;
      })
      .filter((item) => item != false);
    return validMoves;
  }
  private playSoundAfterCapture(
    stonesCaptured: {
      x: number;
      y: number;
    }[],
    killStreak: number
  ) {
    if (killStreak > 1) {
      if (killStreak == 2) {
        this.killingSpreeSound.play();
      } else {
        this.killtacularSound.play();
      }
      return;
    }
    if (stonesCaptured.length == 1) {
      this.vineboomSound.play();
    } else if (stonesCaptured.length == 2) {
      this.doubleKillSound.play();
    } else if (stonesCaptured.length == 3) {
      this.tripleKillSound.play();
    } else {
      this.killtacularSound.play();
    }
  }

  play(row: number, col: number, color?: -1 | 1) {
    const turn = this.getModel().turn;
    const result = this.gameInstance.play(row, col, color);
    if (Array.isArray(result)) {
      if (result.length > 0) {
        this.playSoundAfterCapture(
          result,
          GameManager.GetKillStreak(this.getModel(), turn)
        );
      }
    }
    return result;
  }
  getPosition() {
    return this.gameInstance.getPosition();
  }
  isValid(row: number, col: number) {
    return this.gameInstance.isValid(row, col);
  }
  popPosition(): void {
    if (this.gameInstance.stack.length > 1) {
      this.gameInstance.popPosition();
    }
  }
  pushPosition(pos: WGo.Position) {
    this.gameInstance.pushPosition(pos);
  }

  pass() {
    this.gameInstance.pass();
  }
  resetBoard() {
    // this.gameInstance.pushPosition(
    //   GameManager.CreateBlankWGoPosition(this.size)
    // );
    // console.log(this.getModel().position);
    this.gameInstance.firstPosition();
  }

  loadModel(newModel: GameModel) {
    if (newModel.position.size != this.size) {
      console.log(
        "trying to load a model that is not the current size, not loading it..."
      );
    } else {
      this.gameInstance.stack = newModel.stack.map((item) => {
        const pos = new WGo.Position();
        Object.assign(pos, item);
        return pos;
      });
      this.gameInstance.turn = newModel.turn;
    }
  }
  //this is used pretty much only for UI, what should go here is stuff we want to retain for rendering, this is also what is saved in local storage, so we need to deserialize it.
  //we need to serialize the WGo position because we can then use it to load a new model. gameinstance is a WGo instance
  getModel(): GameModel {
    return {
      stack: this.gameInstance.stack,
      position: this.gameInstance.getPosition(),
      turn: this.gameInstance.turn,
      size: this.size,
    };
  }
}

export interface GameModel {
  stack: WGo.Position[];
  position: WGo.Position;
  turn: -1 | 1;
  size: number;
}
export default GameManager;
