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
  a {
    color: #356189;
  }
  a:hover {
    text-shadow: 0 0 5px #4074a1, /* Inner glow */ 0 0 10px #4074a1,
      /* Medium glow */ 0 0 20px #4074a1, /* Outer glow */ 0 0 30px #4074a1; /* Larger outer glow */
    color: white;
  }
`;

export default MainMenu;
