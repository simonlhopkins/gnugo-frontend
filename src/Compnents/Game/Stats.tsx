import React from "react";
import { GameModel } from "./GameManager";
import styled from "styled-components";

interface Props {
  gameModel: GameModel;
}
const Stats = ({ gameModel }: Props) => {
  return (
    <>
      <StyledTable>
        <tbody>
          <tr>
            <td>White Captured Stones</td>
            <td>{gameModel.position.capCount.white}</td>
          </tr>
          <tr>
            <td>Black Captured Stones</td>
            <td>{gameModel.position.capCount.black}</td>
          </tr>
          <tr>
            <td>turn</td>
            <td>{gameModel.turn == 1 ? "black" : "white"}</td>
          </tr>
        </tbody>
      </StyledTable>
    </>
  );
};

const StyledTable = styled.table`
  border-collapse: collapse;
  th,
  td {
    border: 1px solid #ddd;
    padding: 8px;
    text-align: left;
  }
`;

export default Stats;
