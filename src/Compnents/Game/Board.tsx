import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useGameContext } from "./GameContext";
import GameManager, { GameModel } from "./GameManager";
import clsx from "clsx";
import GNUGoClient from "./GNUGoClient";
import GoSquare from "./GoSquare";

const Board = () => {
  const { addStone, undo, resetBoard, pass, gameState, currentError } =
    useGameContext();
  if (gameState == null) {
    return <p>gamestate is null</p>;
  }
  const size = gameState.size;

  const [mouseOverSquare, setMouseOverSquare] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const getSymbol = (gameState: GameModel, row: number, col: number) => {
    //top
    const boardArr = gameState.position.schema;
    if (boardArr[row * size + col] == 1) {
      return <div className="piece">⚫</div>;
    } else if (boardArr[row * size + col] == -1) {
      return <div className="piece">⚪</div>;
    }
  };
  const getValueAtSquare = (gameState: GameModel, row: number, col: number) => {
    return gameState.position.schema[row * size + col];
  };
  const getSquares = (gameState: GameModel) => {
    const squares = [];
    const mostRecentPlace = GameManager.getMostRecentMove(gameState);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const row = i;
        const col = j;
        const isMostReventPlace = mostRecentPlace
          ? mostRecentPlace.index ==
            GameManager.indexFromRowCol(row, col, gameState.size)
          : false;
        const showShadowPiece = mouseOverSquare
          ? getValueAtSquare(gameState, row, col) == 0 &&
            mouseOverSquare.row == row &&
            mouseOverSquare.col == col
          : false;
        squares.push(
          <GoSquare
            key={`${row}, ${col}`}
            row={row}
            col={col}
            size={size}
            showShadowPiece={showShadowPiece}
            disabled={loading}
            onClick={function (): void {
              addStone(row, col);
            }}
            onMouseOver={() => {
              setMouseOverSquare({ row, col });
            }}
            mostRecentPlace={isMostReventPlace}
          >
            {getSymbol(gameState, i, j)}
            {showShadowPiece && (
              <div className={clsx("piece", "ghost")}>
                {gameState.turn == -1 ? "⚪" : "⚫"}
              </div>
            )}
          </GoSquare>
        );
      }
    }
    return squares;
  };

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

  return (
    <div>
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
          GNUGoClient.getBestPosition(gameState)
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
          GNUGoClient.getStatus(gameState)
            .then((res) => {
              console.log(res);
              console.log(gameState.position.capCount);
              const { white, black, komi } = res;
              const whiteScore =
                white.length +
                gameState.position.capCount.white +
                parseFloat(komi);
              const blackScore =
                black.length + gameState.position.capCount.black;
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
      <p>{gameState.turn == 1 ? "black" : "white"}'s turn</p>
      <StyledBoard
        $size={size}
        onMouseLeave={() => {
          setMouseOverSquare(null);
        }}
      >
        {getSquares(gameState)}
      </StyledBoard>
    </div>
  );
};
interface StyledBoardProps {
  $size: number;
}
const StyledBoard = styled.div<StyledBoardProps>`
  display: grid;
  width: 900px;
  max-width: 100%;
  background-image: url("/Prisoner.jpg");
  aspect-ratio: 1;
  grid-template-rows: repeat(${(props) => props.$size}, 1fr);
  grid-template-columns: repeat(${(props) => props.$size}, 1fr);
  .square {
    max-width: 100px;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    /* overflow: hidden; */
    &.recent {
      background-color: rebeccapurple;
    }
    &.disabled {
      pointer-events: none;
    }
    .piece {
      position: absolute;
      font-size: 3rem;
      pointer-events: none;
      z-index: 1;
      &.ghost {
        opacity: 0.5;
      }
    }
  }
`;

export default Board;
