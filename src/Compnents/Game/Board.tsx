import { useState } from "react";
import styled from "styled-components";
import GameManager, { GameModel } from "./GameManager";
import clsx from "clsx";
import GoSquare from "./GoSquare";

interface Props {
  gameModel: GameModel;
  disabled: boolean;
  blackTerritory: { row: number; col: number }[];
  whiteTerritory: { row: number; col: number }[];
  onSquareClick(row: number, col: number): void;
}
const Board = ({
  gameModel,
  disabled,
  blackTerritory,
  whiteTerritory,
  onSquareClick,
}: Props) => {
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
        const isBlackTerritory = blackTerritory.some(
          (item) => item.row == row && item.col == col
        );
        const isWhiteTerritory = whiteTerritory.some(
          (item) => item.row == row && item.col == col
        );

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
              if (!isTouchDevice()) {
                setMouseOverSquare({ row, col });
              }
            }}
            mostRecentPlace={isMostReventPlace}
          >
            {char && (
              <div className="piece">{isBlackTerritory ? "!!!" : char}</div>
            )}
            {showShadowPiece && (
              <div className={clsx("piece", "ghost")}>
                {stoneCharFromNumber(gameModel.turn)}
              </div>
            )}
            {isBlackTerritory && <div className="terrirory black">B</div>}
            {isWhiteTerritory && <div className="terrirory white">W</div>}
          </GoSquare>
        );
      }
    }
    return squares;
  };
  return (
    <>
      <StyledBoard
        // style={{
        //   backgroundImage: `url(${backgroundURL || "/halo_go_512x512.png"})`,
        // }}
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
  /* width: 900px; */
  /* width: min(100vw, 100vh); */
  /* max-width: 100%; */
  min-width: 300px;
  height: 100%;
  max-height: 600px;
  @media (max-width: 600px) {
    width: 100%;
    max-width: 600px;
    height: auto;
  }
  aspect-ratio: 1;

  grid-template-rows: repeat(${(props) => props.$size}, 1fr);
  grid-template-columns: repeat(${(props) => props.$size}, 1fr);
  .terrirory {
    background-color: black;
    color: white;
    z-index: 1;
    border-radius: 999px;
    font-size: 1rem;
    width: 1rem;
    height: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    &.white {
      background-color: white;
      color: black;
    }
  }
  .square {
    container-type: size;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    &.recent {
      background-color: rebeccapurple;
    }
    &.disabled {
      pointer-events: none;
    }
    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .piece {
      position: absolute;
      font-size: 90cqw;
      pointer-events: none;
      z-index: 1;
      &:not(.ghost) {
        animation: fadeIn 0.5s ease-out;
      }
      &.ghost {
        opacity: 0.5;
      }
    }
  }
`;

function isTouchDevice() {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    navigator.maxTouchPoints > 0
  );
}

export default Board;
