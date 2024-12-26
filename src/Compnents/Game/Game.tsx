import React, { useCallback, useEffect, useState } from "react";
import { useGameContext } from "./GameContext";
import GNUGoClient from "./GNUGoClient";
import Board from "./Board";
import { styled } from "styled-components";
import GameManager, { GameModel } from "./GameManager";
import Stats from "./Stats";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { useSearchParams } from "react-router";
import LevelsYAML from "../../assets/levels.yaml";

const Game = () => {
  const { addStone, undo, resetBoard, pass, gameModel, currentError } =
    useGameContext();
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [blackTerritory, setBlackTerritory] = useState<string[]>([]);
  const [whiteTerritory, setWhiteTerritory] = useState<string[]>([]);
  const mapUrlParam = searchParams.get("mapId");
  const mapID = mapUrlParam ? parseInt(mapUrlParam) : null;
  const onPass = () => {
    console.log(gameModel);
    if (gameModel && GameManager.isGameOver(gameModel)) {
      setLoading(true);
      GNUGoClient.getStatus(gameModel).then((res) => {
        setLoading(false);
        let message = `white score ${res.whiteTerritory.length}`;
        message += `\nblack score ${res.blackTerritory.length}`;
        message += `\nkomi: ${res.komi}`;
        console.log(res.blackTerritory);
        console.log(res.whiteTerritory);
        setBlackTerritory(res.blackTerritory);
        setWhiteTerritory(res.whiteTerritory);
        alert(message);
      });
    } else {
      pass();
    }
  };
  const playAIMove = (gameModel: GameModel) => {
    setLoading(true);
    GNUGoClient.getBestPosition(gameModel)
      .then((res) => {
        if (res == "PASS") {
          onPass();
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

  if (!gameModel) return <p>game model is null</p>;
  const backgroundURL = mapID ? getMapBackgroundUrl(mapID) : null;

  return (
    <StyledGame>
      <div className="topSection">
        <a href="/levelSelect">back</a>
        <div className="buttonParent">
          <button
            disabled={loading}
            onClick={() => {
              resetBoard();
            }}
          >
            reset board
          </button>
          <button
            disabled={loading}
            onClick={() => {
              onPass();
            }}
          >
            pass
          </button>
          <button
            disabled={loading}
            onClick={() => {
              setBlackTerritory([]);
              setWhiteTerritory([]);
              undo();
            }}
          >
            undo
          </button>
        </div>
        <button
          disabled={loading}
          title="using GNU GO"
          onClick={() => {
            playAIMove(gameModel);
          }}
        >
          play AI move for: {gameModel.turn == 1 ? "Black" : "White"}
        </button>
        <Stats gameModel={gameModel} />
      </div>

      <div
        className="boardWrapper"
        style={{
          backgroundImage: `url(${backgroundURL || "/halo_go_512x512.png"})`,
        }}
      >
        <TransformWrapper>
          <TransformComponent>
            <Board
              gameModel={gameModel}
              disabled={loading}
              blackTerritory={blackTerritory.map((item) =>
                GNUGoClient.letterNumberToRowCol(item, gameModel.size)
              )}
              whiteTerritory={whiteTerritory.map((item) =>
                GNUGoClient.letterNumberToRowCol(item, gameModel.size)
              )}
              onSquareClick={function (row: number, col: number): void {
                addStone(row, col);
              }}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </StyledGame>
  );
};
const StyledGame = styled.div`
  padding: 20px;
  box-sizing: border-box;
  /* overflow: hidden; */
  height: 100svh;
  width: 100vw;
  display: flex;
  align-items: center;

  gap: 10px;
  @media (max-width: 600px) {
    flex-direction: column;
  }
  .buttonParent {
    gap: 10px;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
  }
  .topSection {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: scroll;
    gap: 10px;
  }
  .boardWrapper {
    position: relative;
    width: 100%;
    height: 100%;
    flex: 1;
    justify-content: center;
    background-size: contain;

    .react-transform-wrapper,
    .react-transform-component {
      width: 100%;
      height: 100%;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      /* display: block; */
    }
  }
`;

function getMapBackgroundUrl(id: number): string | null {
  const levels = LevelsYAML as any[];
  const foundEntry = levels.find((item) => item.id == id);
  return foundEntry ? foundEntry.thumbnail : null;
}
export default Game;
