import React, { useCallback, useEffect, useState } from "react";
import { useGameContext } from "./GameContext";
import GNUGoClient from "./GNUGoClient";
import Board from "./Board";
import { styled } from "styled-components";
import GameManager, { GameModel } from "./GameManager";
import Stats from "./Stats";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Navigate, useSearchParams } from "react-router";
import LevelsYAML from "../../assets/levels.yaml";
import { useWebRTCClient } from "./WebRTCHooks";
import Helpers, { Move } from "./Helpers";

const Game = () => {
  const { addStone, undo, resetBoard, pass, gameModel } = useGameContext();
  const [loading, setLoading] = useState(false);
  const [playerColor, setPlayerColor] = useState<WGo.B | WGo.W | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [blackTerritory, setBlackTerritory] = useState<string[]>([]);
  const [whiteTerritory, setWhiteTerritory] = useState<string[]>([]);

  const { connection, connectToOther, peerID } = useWebRTCClient({
    onAddStone: (row, col) => {
      addStone(row, col);
    },
    onPass: function (): void {
      onPass();
    },
    onConnection: function (): void {
      // resetBoard();
    },
    onColorAssign: function (color: WGo.B | WGo.W): void {
      setPlayerColor(color);
    },
    onDisconnection: function (): void {
      setPlayerColor(null);
    },
    onSyncBoard: async function (moveList: Move[], endWithPass: boolean) {
      onResetBoard();

      setLoading(true);
      for (const move of moveList) {
        const { row, col } = move.move;
        console.log(move.color);
        addStone(row, col, move.color);
        await Helpers.sleep(100);
      }

      if (endWithPass) {
        pass();
      }
      setLoading(false);
    },
  });

  const mapID = Number(searchParams.get("mapId")) || null;
  const level = Number(searchParams.get("level")) || 1;
  const onPass = () => {
    if (gameModel && !Helpers.isGameOver(gameModel)) {
      pass();
    } else {
      console.log("not passing... game already over");
    }
  };
  const onResetBoard = () => {
    resetBoard();
    setBlackTerritory([]);
    setWhiteTerritory([]);
    setPlayerColor(null);
  };
  const playAIMove = (gameModel: GameModel) => {
    setLoading(true);
    setBlackTerritory([]);
    setWhiteTerritory([]);
    GNUGoClient.GetBestPosition(gameModel, level)
      .then((res) => {
        if (res == "PASS") {
          onPass();
        } else if (res == "resign") {
          console.log("resign");
        } else {
          const { row, col } = GNUGoClient.letterNumberToRowCol(
            res,
            gameModel.size
          );
          addStone(row, col);
          if (connection) {
            connection.send({
              message: "addStone",
              payload: {
                row,
                col,
              },
            });
          }
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
  const isGameOver = Helpers.isGameOver(gameModel);
  const disableBecauseNotTurn =
    !isGameOver && (playerColor ? playerColor != gameModel.turn : false);
  const disabled = loading || disableBecauseNotTurn;
  return (
    <StyledGame>
      {mapID == null && <Navigate to={"/levelSelect"} />}
      <div className="topSection">
        <a href="/levelSelect">change level</a>
        <a href="/">main menu</a>
        <div className="buttonParent">
          <button
            disabled={disabled || connection != null}
            onClick={() => {
              setBlackTerritory([]);
              setWhiteTerritory([]);
              onResetBoard();
            }}
          >
            reset board
          </button>
          <button
            disabled={disabled}
            onClick={() => {
              setBlackTerritory([]);
              setWhiteTerritory([]);
              onPass();
              if (connection) {
                console.log("sending pass");
                connection.send({
                  message: "pass",
                });
              }
            }}
          >
            pass
          </button>
          <button
            disabled={disabled || connection != null}
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
          disabled={disabled}
          title="using GNU GO"
          onClick={() => {
            playAIMove(gameModel);
          }}
        >
          play AI move for: {gameModel.turn == 1 ? "Black" : "White"}
        </button>
        {isGameOver && (
          <div>
            <button
              onClick={() => {
                onResetBoard();
                if (connection) {
                  connection.send({
                    message: "syncBoard",
                    payload: {
                      moveList: [],
                      pass: false,
                    },
                  });
                }
              }}
              disabled={disabled}
            >
              new game
            </button>
            <button
              disabled={disabled}
              onClick={() => {
                setLoading(true);

                GNUGoClient.getStatus(gameModel)
                  .then((res) => {
                    let message = `white score ${res.whiteTerritory.length}`;
                    message += `\nblack score ${res.blackTerritory.length}`;
                    message += `\nkomi: ${res.komi}`;
                    console.log(res.blackTerritory);
                    console.log(res.whiteTerritory);
                    setBlackTerritory(res.blackTerritory);
                    setWhiteTerritory(res.whiteTerritory);
                    alert(message);
                  })
                  .finally(() => {
                    setLoading(false);
                  });
              }}
            >
              calculate score
            </button>
          </div>
        )}
        <Stats
          gameModel={gameModel}
          peerID={peerID}
          connectionID={connection ? connection.peer : null}
        />
        {peerID && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem(
                "otherID"
              ) as HTMLInputElement;

              if (input) {
                connectToOther(input.value).then(async (conn) => {
                  const moveList = Helpers.GetMoveList(gameModel.stack);
                  console.log("last position is pass...");
                  console.log(Helpers.lastPositionIsPass(gameModel));

                  conn.send({
                    message: "syncBoard",
                    payload: {
                      moveList,
                      pass: Helpers.lastPositionIsPass(gameModel),
                    },
                  });
                });

                input.value = ""; // Clear the input
              }
            }}
          >
            <label htmlFor="otherID"></label>
            <input
              id="otherID"
              type="text"
              placeholder="enter an opponent id"
            ></input>
            <button type="submit">invite</button>
          </form>
        )}
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
              disabled={disabled || isGameOver}
              blackTerritory={blackTerritory.map((item) =>
                GNUGoClient.letterNumberToRowCol(item, gameModel.size)
              )}
              whiteTerritory={whiteTerritory.map((item) =>
                GNUGoClient.letterNumberToRowCol(item, gameModel.size)
              )}
              onSquareClick={function (row: number, col: number): void {
                if (!disabled) {
                  if (connection) {
                    //if playing with someone,
                    if (playerColor == null) {
                      connection.send({
                        message: "colorAssign",
                        payload: {
                          color: gameModel.turn * -1,
                        },
                      });
                      setPlayerColor(gameModel.turn);
                    }
                    connection.send({
                      message: "addStone",
                      payload: {
                        row,
                        col,
                      },
                    });
                  }
                  addStone(row, col);
                }
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
  /* flex-wrap: wrap; */
  align-items: center;

  gap: 10px;
  @media (max-width: 600px) {
    flex-direction: column;
    /* flex-wrap: nowrap; */
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
    min-width: 350px;
    max-height: 100%;
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
