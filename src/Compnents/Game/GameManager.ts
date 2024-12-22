import GNUGoClient from "./GNUGoClient";
//even tho it is duplicate state to have this playing on client and on the AI, it is good since with no AI, you can play without the server, plus it holds onto things like stones captured and such
//ok actually I don't think it is good maybe, like I should just be pushing positions and updating capture counts based on wjatever the server returns as the updated game state, then we can just cache the most recent positions
//I should make an interface for a go engine so I can swap it out if I wanted to
//yea the duplicate state low key sucks I should change it
//I DO need to keep track of things like turn in the game manager tho since it doesn't look like GNUgo does this.
class GameManager {
  private gameInstance: WGo.Game;
  private size: number;

  //audio
  doubleKillSound = new Audio("/sounds/doubleKill.mp3");
  vineboomSound = new Audio("/sounds/vine-boom.mp3");
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
      return this.findMove(lastTwoMoves[0], lastTwoMoves[1]);
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
          color: currentState[i],
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
  playAIMove() {
    console.log("playing the best move for " + this.gameInstance.turn);
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

  play(row: number, col: number) {
    const result = this.gameInstance.play(row, col);
    if (Array.isArray(result)) {
      //is an array;
      const stonesCaptured = result as number[];
      if (stonesCaptured.length == 1) {
        this.vineboomSound.play();
      } else if (stonesCaptured.length == 2) {
        this.doubleKillSound.play();
      }
    }
    console.log("playing move");
    return result;
  }
  getPosition() {
    return this.gameInstance.getPosition();
  }
  isValid(row: number, col: number) {
    return this.gameInstance.isValid(row, col);
  }
  popPosition(): void {
    console.log(this.gameInstance.stack.length);
    if (this.gameInstance.stack.length > 1) {
      this.gameInstance.popPosition();
    }
  }
  pass() {
    const lastTwoPositions = this.gameInstance.stack.slice(
      -Math.min(this.gameInstance.stack.length, 2)
    );
    const gameOver =
      lastTwoPositions.length == 2 &&
      GameManager.getDifferences(lastTwoPositions[0], lastTwoPositions[1])
        .length == 0;
    if (!gameOver) {
      this.gameInstance.pass();
    } else {
      console.log("game over!");
    }
  }
  resetBoard() {
    this.gameInstance.firstPosition();
  }

  loadModel(newModel: GameModel) {
    this.gameInstance.stack = newModel.stack.map((item) => {
      const pos = new WGo.Position();
      Object.assign(pos, item);
      return pos;
    });
    this.gameInstance.turn = newModel.turn;
    //ai
    // GNUGoClient.setGNUGoBoard(this.getModel());
  }
  //this is used pretty much only for UI, what should go here is stuff we want to retain for rendering, this is also what is saved in local storage, so we need to deserialize it.
  //we need to serialize the WGo position because we can then use it to load a new model.
  getModel(): GameModel {
    return {
      stack: this.gameInstance.stack,
      position: this.gameInstance.getPosition(),
      turn: this.gameInstance.turn,
      size: this.size,
    } as GameModel;
  }
}

export interface GameModel {
  stack: WGo.Position[];
  position: WGo.Position;
  turn: -1 | 1;
  size: number;
}
export default GameManager;
