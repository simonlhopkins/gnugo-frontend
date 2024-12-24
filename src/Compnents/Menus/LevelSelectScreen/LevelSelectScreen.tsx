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
                onClick={() => {
                  setSelectedMap(item.id as number);
                }}
              ></LevelCard>
            </li>
          ))}
        </ul>
      </div>
      <button>
        <a href="/">Back</a>
      </button>
      <button>
        <a href={`/game?${selectedMap ? `mapId=${selectedMap}` : ""}`}>
          Accept
        </a>
      </button>
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
  }
  ul,
  ol {
    margin: 50px 0;
    display: flex;
    gap: 10px;
    white-space: nowrap;
    overflow-x: scroll;
    overflow-y: visible;
    list-style: none; /* Removes bullets or numbers */
    padding: 0; /* Removes padding */
  }
  li {
    overflow-y: visible;
    /* display: inline-block; */
  }
  ul li:last-child {
    /* Your styles for the last <li> */
    margin-right: 60px;
  }
  ul li:first-child {
    /* Your styles for the last <li> */
    margin-left: 60px;
  }
`;

export default LevelSelectScreen;
