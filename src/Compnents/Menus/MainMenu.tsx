import React from "react";
import styled from "styled-components";

const MainMenu = () => {
  return (
    <Wrapper>
      <ul>
        <li>
          <a href="/levelSelect">Play</a>
        </li>
        <li>
          <a href="">Credits</a>
        </li>
        <li>
          <a href="">Quit</a>
        </li>
      </ul>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  font-family: "handelgothic";
  text-transform: uppercase;
  display: flex;
  flex-direction: column;
  align-items: center;
  ul,
  ol {
    list-style: none; /* Removes bullets or numbers */
    padding: 0; /* Removes padding */
    margin: 0; /* Removes margin */
    text-align: center;
    font-size: 3rem;
  }
`;

export default MainMenu;
