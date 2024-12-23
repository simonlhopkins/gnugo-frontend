import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useGameContext } from "./GameContext";
import GameManager, { GameModel } from "./GameManager";
import clsx from "clsx";
import GNUGoClient from "./GNUGoClient";
import GoSquare from "./GoSquare";

const Board = () => {
  const { addStone, undo, resetBoard, pass, gamemodel, currentError } =
    useGameContext();
  if (gamemodel == null) {
    return <p>gamemodel is null</p>;
  }
  const size = gamemodel.size;

  const [mouseOverSquare, setMouseOverSquare] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const getSymbol = (gameModel: GameModel, row: number, col: number) => {
    //top
    const boardArr = gameModel.position.schema;
    if (boardArr[row * size + col] == 1) {
      return <div className="piece">⚫</div>;
    } else if (boardArr[row * size + col] == -1) {
      return <div className="piece">⚪</div>;
    }
  };
  const getValueAtSquare = (gameModel: GameModel, row: number, col: number) => {
    return gameModel.position.schema[row * size + col];
  };
  const getSquares = (gameModel: GameModel) => {
    const squares = [];
    const mostRecentPlace = GameManager.getMostRecentMove(gameModel);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const row = i;
        const col = j;
        const isMostReventPlace = mostRecentPlace
          ? mostRecentPlace.index ==
            GameManager.indexFromRowCol(row, col, gameModel.size)
          : false;
        const showShadowPiece = mouseOverSquare
          ? getValueAtSquare(gameModel, row, col) == 0 &&
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
            {getSymbol(gameModel, i, j)}
            {showShadowPiece && (
              <div className={clsx("piece", "ghost")}>
                {gameModel.turn == -1 ? "⚪" : "⚫"}
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
    <StyledWrapper>
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
          GNUGoClient.getBestPosition(gamemodel)
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
          GNUGoClient.getStatus(gamemodel)
            .then((res) => {
              console.log(res);
              console.log(gamemodel.position.capCount);
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
      <p>{gamemodel.turn == 1 ? "black" : "white"}'s turn</p>
      <p>{JSON.stringify(gamemodel.position.capCount)}</p>
      <StyledBoard
        $size={size}
        onMouseLeave={() => {
          setMouseOverSquare(null);
        }}
      >
        {getSquares(gamemodel)}
      </StyledBoard>
    </StyledWrapper>
  );
};
interface StyledBoardProps {
  $size: number;
}
const StyledWrapper = styled.div`
  height: 100vh;
  width: 100%;
  overflow-y: hidden;
  display: flex;
  align-items: center;
  flex-direction: column;
`;
const StyledBoard = styled.div<StyledBoardProps>`
  display: grid;
  flex: 1;
  justify-content: center;
  /* width: 900px; */
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
