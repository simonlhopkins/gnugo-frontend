import GameManager, { GameModel } from "./GameManager";

console.log(import.meta.env.MODE);
const gnugoHost =
  import.meta.env.MODE == "development"
    ? "http://localhost:3000"
    : "https://gnugo.cluberic.com";
class GNUGoClient {
  private static async GNUGoServerCall(
    url: string,
    body: Record<string, unknown>
  ) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log(result);

      return result;
    } catch (error) {
      console.error("Failed api call " + url, error);
    }
  }

  private static moveListFromPosition(position: WGo.Position, size: number) {
    return position.schema
      .map((color, i) => {
        const rowCol = GameManager.rowColFromIndex(i, size);
        if (color == 1) {
          return `play black ${GNUGoClient.rowColToLetterNumber(
            rowCol.row,
            rowCol.col,
            size
          )}`;
        } else if (color == -1) {
          return `play white ${GNUGoClient.rowColToLetterNumber(
            rowCol.row,
            rowCol.col,
            size
          )}`;
        } else {
          return null;
        }
      })
      .filter((item) => item != null);
  }
  static async getBestPosition(gameModel: GameModel) {
    //get the last 3 game states, or however many there ate

    const recentHistory = gameModel.stack.slice(
      -Math.min(gameModel.stack.length, 3)
    );
    const moves = [];
    for (let i = 1; i < recentHistory.length; i++) {
      const move = GameManager.findMove(recentHistory[i - 1], recentHistory[i]);
      if (move) {
        moves.push({
          color: move.color,
          move: GameManager.rowColFromIndex(move.index, gameModel.size),
        });
      }
    }
    console.log("game mode turn " + gameModel.turn);
    const response = await GNUGoClient.GNUGoServerCall(
      `${gnugoHost}/getBestPosition`,
      {
        initialStateMoveList: GNUGoClient.moveListFromPosition(
          recentHistory[0],
          gameModel.size
        ),
        recentMoveList: moves.map(
          (item) =>
            `play ${
              item.color == 1 ? "black" : "white"
            } ${GNUGoClient.rowColToLetterNumber(
              item.move.row,
              item.move.col,
              gameModel.size
            )}`
        ),
        size: gameModel.size,
        color: gameModel.turn == 1 ? "b" : "w",
        level: 1,
      }
    );
    return response.data as string;
  }
  static async getStatus(gameModel: GameModel) {
    const moveList = GNUGoClient.moveListFromPosition(
      gameModel.position,
      gameModel.size
    );
    const response = await GNUGoClient.GNUGoServerCall(`${gnugoHost}/status`, {
      moveList,
    });
    console.log(response);
    return response.data as {
      komi: string;
      white: string[];
      black: string[];
    };
  }

  static letterNumberToRowCol(
    input: string,
    size: number
  ): { row: number; col: number } {
    if (!/^[A-Z]\d+$/.test(input)) {
      throw new Error(
        "Invalid input format. Expected format: Letter followed by a number, e.g., A9."
      );
    }

    const letter = input.charAt(0).toUpperCase();
    const number = parseInt(input.slice(1), 10);
    const letters = "ABCDEFGHJKLMNOPQRST".split("");
    const col = letters.indexOf(letter);
    const row = size - number; // Assuming 1-based index for the number

    return { row, col };
  }
  static rowColToLetterNumber(row: number, col: number, size: number): string {
    // Ensure the row and col are within bounds
    if (row < 0 || row >= size || col < 0 || col >= size) {
      throw new Error("Invalid row or column index.");
    }

    const letters = "ABCDEFGHJKLMNOPQRST".split("");
    // Convert the column index to a letter (A = 0, B = 1, etc.)
    const letter = letters[col];

    // Convert the row index back to a number (1-based index)
    const number = size - row;

    return `${letter}${number}`;
  }
}

export default GNUGoClient;
