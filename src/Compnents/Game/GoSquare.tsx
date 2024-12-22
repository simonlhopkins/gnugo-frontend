import clsx from "clsx";
import React, { ReactNode } from "react";
import styled from "styled-components";
import GameManager from "./GameManager";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  row: number;
  col: number;
  size: number;
  showShadowPiece: boolean;
  mostRecentPlace: boolean;
  disabled: boolean;
  children: ReactNode;
}
const GoSquare = ({
  row,
  col,
  size,
  showShadowPiece,
  mostRecentPlace,
  disabled,
  children,
  ...rest
}: Props) => {
  const getLineChildren = (row: number, col: number) => {
    const lineChildren = [];
    //horizotal
    const horizontalClassList = ["horizontal"];

    if (col == 0) {
      horizontalClassList.push("right");
    } else if (col == size - 1) {
      horizontalClassList.push("left");
    }
    const verticalClassList = ["vertical"];

    if (row == 0) {
      verticalClassList.push("bottom");
    } else if (row == size - 1) {
      verticalClassList.push("top");
    }
    lineChildren.push(
      <StyledLine key="hor" className={horizontalClassList.join(" ")} />
    );
    lineChildren.push(
      <StyledLine key="vert" className={verticalClassList.join(" ")} />
    );

    return lineChildren;
  };
  return (
    <StyledSquare
      {...rest}
      className={clsx(
        "square",
        mostRecentPlace && "recent",
        disabled && "disabled"
      )}
    >
      {getLineChildren(row, col)}
      {children}
    </StyledSquare>
  );
};

const StyledSquare = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  /* overflow: hidden; */
  &.recent {
    background-color: rebeccapurple;
  }
  &.disabled {
    pointer-events: none;
  }
  .piece {
    position: absolute;
    font-size: 3rem;
    pointer-events: none;
    z-index: 1;
    &.ghost {
      opacity: 0.5;
    }
  }
`;

const StyledLine = styled.div`
  position: absolute;
  /* z-index: -1; */
  background-color: white;
  pointer-events: none;
  &.horizontal {
    width: 100%;
    height: 5%;
  }
  &.left {
    left: 0px;
    width: 50%;
  }
  &.right {
    width: 50%;
    left: 50%;
  }

  &.vertical {
    width: 5%;
    height: 100%;
  }
  &.top {
    height: 50%;
    top: 0px;
  }
  &.bottom {
    height: 50%;
    top: 50%;
  }
`;

export default GoSquare;
