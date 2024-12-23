import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { useGameContext } from "./GameContext";
import GameManager, { GameModel } from "./GameManager";
import clsx from "clsx";
import GNUGoClient from "./GNUGoClient";
import GoSquare from "./GoSquare";

interface Props {
  gameModel: GameModel;
  disabled: boolean;
  onSquareClick(row: number, col: number): void;
}
const Board = ({ gameModel, disabled, onSquareClick }: Props) => {
  const size = gameModel.size;

  const [mouseOverSquare, setMouseOverSquare] = useState<{
    row: number;
    col: number;
  } | null>(null);

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
            disabled={disabled}
            onClick={function (): void {
              onSquareClick(row, col);
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

  return (
    <StyledBoard
      $size={size}
      onMouseLeave={() => {
        setMouseOverSquare(null);
      }}
    >
      {getSquares(gameModel)}
    </StyledBoard>
  );
};
interface StyledBoardProps {
  $size: number;
}

const StyledBoard = styled.div<StyledBoardProps>`
  display: grid;
  flex: 1;
  justify-content: center;
  /* width: 900px; */
  max-width: 100%;
  background-image: url("/Blood_gulch.jpg");
  background-size: contain;
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
