import { createGlobalStyle } from "styled-components";
import Board from "./Compnents/Game/Board";
import { GameContextProvider } from "./Compnents/Game/GameContext";
import chicagoFLF from "./assets/chicago/ChicagoFLF.ttf";
import geneva from "./assets/Geneva Font/Geneva Regular.ttf";
import handelgothic from "./assets/handelgothic-bt/HandelGothic Regular.ttf";

import Game from "./Compnents/Game/Game";
import { BrowserRouter, Route, Routes } from "react-router";
import MainMenu from "./Compnents/Menus/MainMenu";
import LevelSelectScreen from "./Compnents/Menus/LevelSelectScreen/LevelSelectScreen";

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
  @font-face {
  font-family: "handelgothic";
  src: url(${handelgothic}) format("truetype");
}
  body {
    font-family: 'chicagoFLF';
  }
`;
function App() {
  return (
    <>
      <GlobalStyle />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainMenu />} />
          <Route path="/levelSelect" element={<LevelSelectScreen />} />
          <Route
            path="game"
            element={
              <GameContextProvider>
                <Game />
              </GameContextProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
