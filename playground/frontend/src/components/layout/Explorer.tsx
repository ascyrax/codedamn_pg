// src/Explorer.tsx
import React, { Children, useEffect, useState } from "react";
import Tree, { RenderItemParams, TreeData, mutateTree } from "@atlaskit/tree";
import "@atlaskit/css-reset";
import NewButton from "../common/NewButton";
import { ExplorerProps } from "../../models/interfaces";
import { initialData } from "../../utils/utils";

const Explorer: React.FC<ExplorerProps> = ({
  setFocusedTabName,
  setFocusedFileName,
  focusedFileName,
  filesData,
}) => {
  const [tree, setTree] = useState<TreeData>(initialData);

  useEffect(() => {
    let children: string[] = [];
    let obj: any = {};
    if (filesData) {
      for (const [fileName, _] of Object.entries(filesData)) {
        obj[fileName] = {
          id: fileName,
          Children: [],
          data: { title: fileName, type: "file" },
        };
        children.push(fileName);
      }

      setTree((prevTree) => {
        return {
          ...prevTree,
          items: {
            ...prevTree.items,
            ...obj,
            playground: {
              ...prevTree.items.playground,
              children: children,
            },
          },
        };
      });
    }
  }, [filesData]);

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
