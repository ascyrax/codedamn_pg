import React from "react";
import { TabsProps } from "../../models/interfaces";

const Tabs: React.FC<TabsProps> = ({
  tabNames,
  focusedTabName,
  handleTabClick,
}) => {
  return (
    <div id="tabs">
      {tabNames.map((el, _) => {
        return (
          <button
            className={`tab-button ${focusedTabName == el ? "focused" : ""}`}
            key={el}
            onClick={handleTabClick}
          >
            {el}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
