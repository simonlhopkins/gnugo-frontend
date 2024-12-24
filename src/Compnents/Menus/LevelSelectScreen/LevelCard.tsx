import clsx from "clsx";
import React from "react";
import styled from "styled-components";

interface Props {
  thumbnail: string;
  title: string;
  description: string;
  selected: boolean;
  levelID: number;
  onClick(): void;
}
const LevelCard = ({
  thumbnail,
  title,
  description,
  selected,
  levelID,
  onClick,
}: Props) => {
  return (
    <StyledWrapper
      role="region"
      className={clsx(selected && "selected")}
      onClick={onClick}
    >
      <img src={thumbnail} alt="" />
      <h2>{title}</h2>
      <p>{description}</p>
      {selected && (
        <a
          style={{ marginTop: "auto", fontSize: "2rem" }}
          href={`/game?mapId=${levelID}`}
        >
          Accept
        </a>
      )}
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 400px;
  height: 500px;
  color: #5bb8fc;
  background-color: rgba(1, 6, 29, 0.8);
  border-radius: 20px;
  padding: 20px;
  box-sizing: border-box;
  border: 4px solid transparent;
  &.selected {
    border-color: #5bb8fc;
    background-color: rgba(4, 19, 53, 0.8);
  }
  img {
    width: 100%;
    aspect-ratio: 1.6;
    object-fit: cover;
  }
`;
export default LevelCard;
