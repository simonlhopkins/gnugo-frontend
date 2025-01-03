import React, { useRef } from "react";
import { GameModel } from "./GameManager";
import styled from "styled-components";

interface Props {
  gameModel: GameModel;
  peerID: null | string;
  connectionID: null | string;
}
const Stats = ({ gameModel, peerID, connectionID }: Props) => {
  const peerIDRef = useRef<HTMLSpanElement | null>(null);
  const handleCopy = () => {
    if (peerIDRef.current) {
      navigator.clipboard
        .writeText(peerIDRef.current.innerHTML)
        .then(() => {
          console.log("Text copied to clipboard!");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
        });
    }
  };
  return (
    <>
      <StyledTable>
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
          {peerID && (
            <tr>
              <td>your ID</td>
              <td
                onClick={() => {
                  handleCopy();
                }}
              >
                <span ref={peerIDRef}>{peerID}</span>
              </td>
            </tr>
          )}
          {connectionID && (
            <tr>
              <td>opponent ID</td>
              <td>{connectionID}</td>
            </tr>
          )}
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
    button {
      margin-left: 30px;
    }
    padding: 8px;
    text-align: left;
  }
`;

export default Stats;
