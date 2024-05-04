import React from "react";
import { TabsProps } from "../../models/interfaces";

const Tabs: React.FC<TabsProps> = ({
  tabNames,
  focusedTabName,
  setTabNames,
  setFocusedTabName,
  setFocusedFileName,
  handleTabClick,
}) => {
  // console.log("Tabs RENDER -> tabNames: ", tabNames);
  function handleTabClose(
    e: React.MouseEvent<HTMLSpanElement, MouseEvent>,
    tabName: string,
    index: number
  ) {
    e.stopPropagation();
    let newFocusedTabName = tabNames[tabNames.length - 1];
    for (let i = 0; i < tabNames.length; i++) {
      if (tabNames[i] == tabName && i == index) {
        tabNames = tabNames.slice(0, i).concat(tabNames.slice(i + 1));
        break;
      }
      newFocusedTabName = tabNames[i];
    }
    setTabNames(tabNames);
    setFocusedTabName(newFocusedTabName);
    setFocusedFileName(newFocusedTabName);
  }
  return (
    <div id="tabs">
      {tabNames.length &&
        tabNames.map((tabName, index) => {
          return (
            <button
              className={`tab-button ${
                focusedTabName == tabName ? "focused" : ""
              }`}
              key={tabName}
              onClick={(e) => handleTabClick(e, tabName, index)}
            >
              <span>{tabName}</span>
              <span
                className="closeTab"
                onClick={(e) => handleTabClose(e, tabName, index)}
              >
                {" "}
                x{" "}
              </span>
            </button>
          );
        })}
    </div>
  );
};

export default Tabs;
