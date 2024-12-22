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

interface GameContextType {
  gameState: GameModel | null;
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
const size = 9;
export const GameContextProvider: React.FC<GameContextProviderProps> = ({
  children,
}) => {
  const [gameState, setGameState] = useLocalStorage<GameModel | null>(
    "gamestate",
    null
  );
  const [currentError, setCurrentError] = useState<number | null>(null);
  //   const gameRef = useRef<WGo.Game | null>(null);
  const gameManager = useMemo(() => new GameManager(size), []);
  useEffect(() => {
    if (gameState) {
      gameManager.loadModel(gameState);
    }
    setGameState(gameManager.getModel());
  }, []);
  useEffect(() => {
    // Handler for when the tab/window gains focus
    const handleFocus = () => {
      console.log("Tab is focused");
      //if you have multiple tabs open, the gamestate, which is just a local storage object, may have been modified, so the internal state of Gamemanager is now out of sync, luckily gamemanager can pick right back up when we load the model
      if (gameState) {
        gameManager.loadModel(gameState);
      }
      setGameState(gameManager.getModel());
    };

    // Add event listeners to the window object
    window.addEventListener("focus", handleFocus);

    // Clean up the event listeners when the component unmounts
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [gameState]);

  const addStone = async (x: number, y: number) => {
    const play = gameManager.play(x, y);
    if (!Array.isArray(play)) {
      setCurrentError(play);
      return;
    }
    setGameState(gameManager.getModel());
  };
  const undo = () => {
    console.log("undo");
    gameManager.popPosition();
    setGameState(gameManager.getModel());
  };

  const resetBoard = () => {
    console.log("reset");
    gameManager.resetBoard();
    setGameState(gameManager.getModel());
  };

  const pass = () => {
    gameManager.pass();
    setGameState(gameManager.getModel());
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
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
