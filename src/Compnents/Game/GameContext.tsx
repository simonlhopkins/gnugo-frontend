import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import GameManager, { GameModel } from "./GameManager";
import useLocalStorage from "use-local-storage";
import GNUGoClient from "./GNUGoClient";

interface GameContextType {
  gameModel: GameModel | null;
  currentError: number | null;
  addStone(x: number, y: number, color?: -1 | 1): void;
  undo(): void;
  resetBoard(): void;
  pass(): void;
}
const GameContext = createContext<GameContextType | null>(null);

export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameState must be used within a GameStateProvider");
  }
  return context;
};

interface GameContextProviderProps {
  children: ReactNode;
}
const size = 11;
export const GameContextProvider: React.FC<GameContextProviderProps> = ({
  children,
}) => {
  const [gameModel, setGameModel] = useLocalStorage<GameModel | null>(
    "gamestate",
    null
  );
  const [currentError, setCurrentError] = useState<number | null>(null);
  //   const gameRef = useRef<WGo.Game | null>(null);
  const gameManager = useMemo(() => new GameManager(size), []);
  useEffect(() => {
    if (gameModel) {
      console.log("loading model");
      gameManager.loadModel(gameModel);
    }
    setGameModel(gameManager.getModel());
  }, []);
  useEffect(() => {
    // Handler for when the tab/window gains focus
    const handleFocus = () => {
      console.log("Tab is focused");
      //if you have multiple tabs open, the gamestate, which is just a local storage object, may have been modified, so the internal state of Gamemanager is now out of sync, luckily gamemanager can pick right back up when we load the model
      if (gameModel) {
        gameManager.loadModel(gameModel);
      }
      setGameModel(gameManager.getModel());
    };

    // Add event listeners to the window object
    window.addEventListener("focus", handleFocus);

    // Clean up the event listeners when the component unmounts
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [gameModel]);

  const addStone = async (x: number, y: number) => {
    const play = gameManager.play(x, y);
    if (!Array.isArray(play)) {
      setCurrentError(play);
      return;
    }
    setCurrentError(null);
    setGameModel(gameManager.getModel());
  };
  const undo = () => {
    console.log("undo");
    gameManager.popPosition();
    setGameModel(gameManager.getModel());
  };

  const resetBoard = () => {
    console.log("reset");
    gameManager.resetBoard();
    setGameModel(gameManager.getModel());
  };

  const pass = () => {
    if (gameModel && GameManager.isGameOver(gameModel)) {
      GNUGoClient.getStatus(gameModel).then((res) => {
        let message = `white score ${res.whiteScore}`;
        message += `\nblack score ${res.blackScore}`;
        message += `\nkomi: ${res.komi}`;
        alert(message);
      });
    } else {
      gameManager.pass();
      setGameModel(gameManager.getModel());
    }
  };

  return (
    <GameContext.Provider
      value={{
        gameModel,
        currentError,
        addStone,
        undo,
        resetBoard,
        pass,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
