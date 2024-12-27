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
        {/* <thead>
          <tr>
            <th>Name</th>
            <th>Kills</th>
          </tr>
        </thead> */}
        <tbody>
          <tr>
            <td>White</td>
            <td>{gameModel.position.capCount.white}</td>
          </tr>
          <tr>
            <td>Black</td>
            <td>{gameModel.position.capCount.black}</td>
          </tr>
          <tr>
            <td>Turn</td>
            <td>{gameModel.turn == 1 ? "Black" : "White"}</td>
          </tr>
        </tbody>
      </StyledTable>
    </>
  );
};

const StyledTable = styled.table`
  border-collapse: collapse;
  background: linear-gradient(to bottom, rgba(8, 34, 84, 0.8), transparent);
  min-width: 300px;
  th,
  td {
    /* border: 1px solid #ddd; */
    padding: 8px;
    text-align: left;
  }
`;

export default Stats;
