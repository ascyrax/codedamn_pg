// src/Explorer.tsx
import React, { useState } from "react";
import Tree, { RenderItemParams, TreeData, mutateTree } from "@atlaskit/tree";
import "@atlaskit/css-reset";
import NewButton from "../common/NewButton";
import * as interfaces from "../../models/interfaces";
import * as utils from "../../utils/utils";

const Explorer: React.FC<interfaces.ExplorerProps> = ({
  setFocusedTabName,
  setFocusedFileName,
  focusedFileName,
}) => {
  const [tree, setTree] = useState<TreeData>(utils.initialData);

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
    }
  };

  const renderItem = (renderItemParams: RenderItemParams) => {
    return (
      <div
        ref={renderItemParams.provided.innerRef}
        {...renderItemParams.provided.draggableProps}
        // {...renderItemParams.provided.dragHandleProps}
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
          {renderItemParams.item.id === "workspace" ? <NewButton /> : ""}
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
