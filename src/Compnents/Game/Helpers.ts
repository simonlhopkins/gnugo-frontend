import GameManager, { GameModel } from "./GameManager";

export interface Move {
  color: -1 | 1;
  move: {
    row: number;
    col: number;
  };
}

class Helpers {
  public static GetMoveList(moveHistory: WGo.Position[]): Move[] {
    if (moveHistory.length < 2) {
      return [];
    }
    const moves = [] as Move[];
    for (let i = 1; i < moveHistory.length; i++) {
      const move = GameManager.findMove(moveHistory[i - 1], moveHistory[i]);
      if (move) {
        moves.push({
          color: move.color,
          move: GameManager.rowColFromIndex(move.index, moveHistory[0].size),
        });
      }
    }
    return moves;
  }
  public static lastPositionIsPass(gameModel: GameModel) {
    if (gameModel.stack.length < 2) {
      return false;
    }
    const lastTwoPositions = gameModel.stack.slice(
      -Math.min(gameModel.stack.length, 2)
    );
    return (
      GameManager.getDifferences(lastTwoPositions[0], lastTwoPositions[1])
        .length == 0
    );
  }
  public static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static isGameOver(gameModel: GameModel) {
    const last3Positions = gameModel.stack.slice(
      -Math.min(gameModel.stack.length, 3)
    );
    if (last3Positions.length < 3) {
      return false;
    }
    const last3Moves = Helpers.GetMoveList(last3Positions);
    return last3Moves.length == 0;
  }
}

export default Helpers;
