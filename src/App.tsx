import { createGlobalStyle } from "styled-components";
import Board from "./Compnents/Game/Board";
import { GameContextProvider } from "./Compnents/Game/GameContext";
import chicagoFLF from "./assets/chicago/ChicagoFLF.ttf";
import geneva from "./assets/Geneva Font/Geneva Regular.ttf";

import Game from "./Compnents/Game/Game";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'chicagoFLF';
    src: url(${chicagoFLF}) format('truetype');
    font-style: normal;
  }
  @font-face {
    font-family: 'Geneva';
    src: url(${geneva}) format('truetype');
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
        <Game />
      </GameContextProvider>
    </>
  );
}

export default App;
