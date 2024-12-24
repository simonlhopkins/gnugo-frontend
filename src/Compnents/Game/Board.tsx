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
  const [mouseOverSquare, setMouseOverSquare] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const stoneCharFromNumber = (num: number) => {
    if (num == -1) {
      return "⚪";
    } else if (num == 1) {
      return "⚫";
    } else {
      return null;
    }
  };
  const getValueAtSquare = (gameModel: GameModel, row: number, col: number) => {
    return gameModel.position.schema[row * gameModel.size + col];
  };
  const getSquares = (gameModel: GameModel) => {
    const squares = [];
    const mostRecentPlace = GameManager.getMostRecentMove(gameModel);

    for (let i = 0; i < gameModel.size; i++) {
      for (let j = 0; j < gameModel.size; j++) {
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
        const char = stoneCharFromNumber(getValueAtSquare(gameModel, row, col));
        squares.push(
          <GoSquare
            key={`${row}, ${col}`}
            row={row}
            col={col}
            size={gameModel.size}
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
            {char && <div className="piece">{char}</div>}
            {showShadowPiece && (
              <div className={clsx("piece", "ghost")}>
                {stoneCharFromNumber(gameModel.turn)}
              </div>
            )}
          </GoSquare>
        );
      }
    }
    return squares;
  };

  return (
    <>
      <StyledBoard
        $size={gameModel.size}
        onMouseLeave={() => {
          setMouseOverSquare(null);
        }}
      >
        {getSquares(gameModel)}
      </StyledBoard>
    </>
  );
};
interface StyledBoardProps {
  $size: number;
}

const StyledBoard = styled.div<StyledBoardProps>`
  /* position: absolute; */
  display: grid;
  justify-content: center;
  /* width: 900px; */
  width: 100%;
  max-width: 700px;
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
    @media (max-width: 600px) {
      .piece {
        font-size: 2rem; /* Adjust the font size for smaller screens */
      }
    }
  }
`;

export default Board;
