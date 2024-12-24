import React, { useState } from "react";
import styled from "styled-components";
import LevelsYAML from "../../../assets/levels.yaml";
import LevelCard from "./LevelCard";

const LevelSelectScreen = () => {
  const levels = LevelsYAML as any[];
  const [selectedMap, setSelectedMap] = useState<null | number>(null);
  return (
    <StyledWrapper>
      <h1>Select Map</h1>
      <div className="listContainer">
        <ul>
          {levels.map((item) => (
            <li key={item.id}>
              <LevelCard
                thumbnail={item.thumbnail}
                title={item.title}
                description={item.description}
                selected={selectedMap ? selectedMap == item.id : false}
                levelID={item.id}
                onClick={() => {
                  setSelectedMap(item.id as number);
                }}
              ></LevelCard>
            </li>
          ))}
        </ul>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  font-family: "handelgothic";
  /* width: 100%; */
  .listContainer {
    background: linear-gradient(to bottom, rgba(4, 24, 63, 0.8), transparent);
    border: solid #5bb8fc;
    border-width: 4px 0px;
  }
  h1 {
    margin-left: 50px;
    color: #5bb8fc;
  }
  ul,
  ol {
    margin: 50px 0;
    display: flex;

    align-items: center;
    gap: 10px;
    white-space: nowrap;
    overflow-x: scroll;
    overflow-y: visible;
    list-style: none; /* Removes bullets or numbers */
    padding: 0; /* Removes padding */
  }
  @media (max-width: 600px) {
    ul {
      flex-direction: column;
    }
  }
  li {
    overflow-y: visible;
    /* display: inline-block; */
  }
`;

export default LevelSelectScreen;
