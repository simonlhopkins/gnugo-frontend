import React from "react";
import styled from "styled-components";

const Credits = () => {
  return (
    <StyledWrapper>
      <a href="/">main menu</a>
      <h1>Tools Used</h1>
      <ul>
        <li>
          <details>
            <summary>WGo</summary>
            <blockquote cite="https://wgo.waltheri.net/">
              <p>
                WGo.js is javascript library for purposes of go game. The basic
                idea of this library is to help to create go web application
                easily without laborious programming of game's logic or board
                graphic interface.
              </p>
            </blockquote>
            <p>
              WGo gave me a class that stored the state of a go board. All of
              the logic for capturing stones, ko, and valid placement is done
              using WGo. It also stores an entire history of the game which was
              useful for undo
            </p>
            <a href="https://wgo.waltheri.net/">https://wgo.waltheri.net/</a>
          </details>
        </li>
        <li>
          <details>
            <summary>GNU Go</summary>
            <blockquote cite="https://www.gnu.org/software/gnugo/">
              <p>
                GNU Go is a free program that plays the game of Go. GNU Go has
                played thousands of games on the NNGS Go server. GNU Go is now
                also playing regularly on the Legend Go Server in Taiwan, on the
                WING server in Japan, and many volunteers run GNU Go clients on
                KGS. GNU Go has established itself as the leading non-commercial
                go program in the recent tournaments that it has taken part in.
              </p>
            </blockquote>
            <p>
              All of the AI is done using GNU Go. The documentation was last
              undated in 2009. I send the board state from WGo to a server where
              I can spawn an instance of GNU Go, populate the board, and then
              ask it what the best move is.
            </p>
            <a href="https://www.gnu.org/software/gnugo/">
              https://www.gnu.org/software/gnugo/
            </a>
          </details>
        </li>
        <li>
          <details>
            <summary>simon</summary>
            <p>the biggest tool of them all</p>
          </details>
        </li>
      </ul>
      <h1>Cool tricks I used</h1>
      <details>
        <summary>Dealing with Ko</summary>
        <p>
          Since I am treating the GNU Go server as stateless, there was a
          problem with sending just the current state, and asking for the best
          move. If I send the current state without any history, GNU Go could
          potentially play an illegal repeated position. In order to circumvent
          this, I send the board state 3 turns ago and the last 3 plays. This
          way I give GNU Go just enough info so it won't play illegal moves.
        </p>
      </details>
      <details>
        <summary>Plagiarism</summary>
        <p>I simply am using art/sound effects made by the Halo art team.</p>
      </details>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  min-height: 100vh;
  box-sizing: border-box;
  padding: 10px;
`;

export default Credits;
