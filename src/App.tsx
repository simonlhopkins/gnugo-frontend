import { createGlobalStyle } from "styled-components";
import Board from "./Compnents/Game/Board";
import { GameContextProvider } from "./Compnents/Game/GameContext";
import chicagoFLF from "./assets/chicago/ChicagoFLF.ttf";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'chicagoFLF';
    src: url(${chicagoFLF}) format('truetype');
    font-style: normal;
  }
  body {
    font-family: 'chicagoFLF';
  }
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <GameContextProvider>
        <Board />
      </GameContextProvider>
    </>
  );
}

export default App;
