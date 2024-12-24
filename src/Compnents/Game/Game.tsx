import React, { useEffect, useState } from "react";
import { useGameContext } from "./GameContext";
import GNUGoClient from "./GNUGoClient";
import Board from "./Board";
import { styled } from "styled-components";
import { GameModel } from "./GameManager";
import Stats from "./Stats";

const Game = () => {
  const { addStone, undo, resetBoard, pass, gameModel, currentError } =
    useGameContext();
  const [loading, setLoading] = useState(false);

  const playAIMove = (gameModel: GameModel) => {
    setLoading(true);
    GNUGoClient.getBestPosition(gameModel)
      .then((res) => {
        if (res == "PASS") {
          pass();
        } else if (res == "resign") {
          console.log("resign");
        } else {
          const rowCol = GNUGoClient.letterNumberToRowCol(res, gameModel.size);
          addStone(rowCol.row, rowCol.col);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };
  useEffect(() => {
    if (gameModel) {
    }
    const handleKeyPress = (event: any) => {
      if (event.key === "/") {
        if (!loading && gameModel) {
          console.log("playing ai move");
          playAIMove(gameModel);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [gameModel]);
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
  if (!gameModel) return <p>game model is null</p>;
  return (
    <StyledGame>
      <a href="/levelSelect">back</a>
      <div className="buttonParent">
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
            playAIMove(gameModel);
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
      </div>

      <p>{currentError ? getErrorText(currentError) : "no error"}</p>
      <Stats gameModel={gameModel} />
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
  padding: 20px;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 10px;

  .buttonParent {
    gap: 10px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
`;
export default Game;
