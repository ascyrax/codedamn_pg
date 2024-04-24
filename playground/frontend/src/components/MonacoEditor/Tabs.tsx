import React from "react";

interface TabsProps {
  tabNames: string[];
  focusedTabName: string | undefined;
  handleTabClick: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
}

const Tabs: React.FC<TabsProps> = ({
  tabNames,
  focusedTabName,
  handleTabClick,
}) => {
  return (
    <div id="tabs">
      {tabNames.map((el, index) => {
        return (
          <button
            className={`tab-button ${focusedTabName==el?"focused":""}`}
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
