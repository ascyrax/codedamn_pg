import React from "react";
import * as interfaces from "../../models/interfaces";

const Tabs: React.FC<interfaces.TabsProps> = ({
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
            // disabled={focusedTabName == el}
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
