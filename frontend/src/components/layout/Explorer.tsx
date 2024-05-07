// src/Explorer.tsx
import React, { useEffect, useState } from "react";
import Tree, { RenderItemParams, TreeData, mutateTree } from "@atlaskit/tree";
import "@atlaskit/css-reset";
import { ExplorerProps } from "../../models/interfaces";
import { initialData } from "../../utils/utils";
import { getFileData } from "../../services/services";

const Explorer: React.FC<ExplorerProps> = ({
  ws,
  focusedFileName,
  filesData,
  tree,
  setTree,
  setTabNames,
  setFocusedTabName,
  setFocusedFileName,
  getAndSetFileData,
}) => {
  // const [tree, setTree] = useState<TreeData>(initialData);

  // useEffect(() => {}, [tree]);
  console.log("RENDER EXPLORER -> ", tree);

  const handleExpand = (itemId: string | number) => {
    const newTree = mutateTree(tree, itemId, { isExpanded: true });
    setTree(newTree);
  };

  const handleCollapse = (itemId: string | number) => {
    const newTree = mutateTree(tree, itemId, { isExpanded: false });
    setTree(newTree);
  };

  const handleClick = (renderItemParams: RenderItemParams) => {
    let item = renderItemParams.item;
    if (item.data.type == "folder")
      renderItemParams.item.isExpanded
        ? renderItemParams.onCollapse(renderItemParams.item.id)
        : renderItemParams.onExpand(renderItemParams.item.id);
    else if (item.data.type == "file") {
      setFocusedTabName(item.data.title);
      setFocusedFileName(item.data.title);

      setTabNames((prevTabNames) => {
        // Check if the new Tab already exists in the array
        if (!prevTabNames.includes(item.data.title)) {
          // load file data
          getAndSetFileData(item.data.title);
          // If not, add the new tab to the array
          return [...prevTabNames, item.data.title];
        }
        // Otherwise, return the array unchanged
        return prevTabNames;
      });
    }
  };

  const renderItem = (renderItemParams: RenderItemParams) => {
    return (
      <div
        ref={renderItemParams.provided.innerRef}
        {...renderItemParams.provided.draggableProps}
        className={`${
          focusedFileName == renderItemParams.item.data.title ? "focused" : ""
        }`}
      >
        <span
          onClick={() => handleClick(renderItemParams)}
          id={renderItemParams.item.id === "workspace" ? "workspace" : ""}
        >
          {renderItemParams.item.data.type === "folder"
            ? "\u{1F4C1}"
            : "\u{1F4C4}"}{" "}
          {renderItemParams.item.data.title}
        </span>
      </div>
    );
  };

  return (
    <div id="explorer">
      <span id="title">Explorer</span>
      <Tree
        tree={tree}
        renderItem={renderItem}
        onExpand={handleExpand}
        onCollapse={handleCollapse}
        isNestingEnabled
      />
    </div>
  );
};

export default Explorer;
