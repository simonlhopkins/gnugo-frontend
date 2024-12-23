import React, { useState } from "react";
import { useGameContext } from "./GameContext";
import GNUGoClient from "./GNUGoClient";
import Board from "./Board";
import { styled } from "styled-components";

const Game = () => {
  const { addStone, undo, resetBoard, pass, gameModel, currentError } =
    useGameContext();
  const [loading, setLoading] = useState(false);

  if (gameModel == null) {
    return <p>gamemodel is null</p>;
  }
  const getErrorText = (errorNum: number) => {
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
        return `unrecognized error: ${currentError}`;
    }
  };
  const size = gameModel.size;
  return (
    <StyledGame>
      <button
        onClick={() => {
          resetBoard();
        }}
      >
        reset board
      </button>
      <button
        onClick={() => {
          pass();
        }}
      >
        pass
      </button>
      <button
        onClick={() => {
          undo();
        }}
      >
        undo
      </button>
      <button
        disabled={loading}
        onClick={() => {
          setLoading(true);
          GNUGoClient.getBestPosition(gameModel)
            .then((res) => {
              if (res == "PASS") {
                pass();
              } else if (res == "resign") {
                console.log("resign");
              } else {
                const rowCol = GNUGoClient.letterNumberToRowCol(res, size);
                addStone(rowCol.row, rowCol.col);
              }
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        play AI move
      </button>
      <button
        onClick={() => {
          setLoading(true);
          GNUGoClient.getStatus(gameModel)
            .then((res) => {
              console.log(res);
              console.log(gameModel.position.capCount);
              const { whiteScore, blackScore, komi } = res;
              console.log("white score: " + whiteScore);
              console.log("black score: " + blackScore);
              console.log("komi: " + komi);
              setLoading(false);
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        get status
      </button>
      <p>{currentError ? getErrorText(currentError) : "no error"}</p>
      <p>{gameModel.turn == 1 ? "black" : "white"}'s turn</p>
      <p>{JSON.stringify(gameModel.position.capCount)}</p>
      <Board
        gameModel={gameModel}
        disabled={loading}
        onSquareClick={function (row: number, col: number): void {
          addStone(row, col);
        }}
      />
    </StyledGame>
  );
};
const StyledGame = styled.div`
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  display: flex;
  align-items: center;
  flex-direction: column;
`;
export default Game;
