// src/Explorer.tsx
import React, { useState } from "react";
import Tree, {
  RenderItemParams,
  TreeData,
  TreeItem,
  mutateTree,
} from "@atlaskit/tree";
import "@atlaskit/css-reset";

export interface FileItemData {
  title: string;
  type: "file" | "folder";
}

export interface CustomTreeData extends TreeData {
  items: {
    [key: string]: {
      id: string;
      children: string[];
      data: FileItemData;
      isExpanded?: boolean;
      isChildrenLoading?: boolean;
      hasChildren?: boolean;
    };
  };
}

const initialData: CustomTreeData = {
  rootId: "root",
  items: {
    root: {
      id: "root",
      children: ["workspace", "outline"],
      data: { title: "Root", type: "folder" },
      isExpanded: true,
    },
    workspace: {
      id: "workspace",
      children: ["codedamn playground"],
      data: { title: "Workspace", type: "folder" },
      isExpanded: false,
    },
    outline: {
      id: "outline",
      children: [],
      data: { title: "Outline", type: "folder" },
      isExpanded: false,
    },
    "codedamn playground": {
      id: "codedamn playground",
      children: ["index.html", "style.css", "script.js"],
      data: { title: "codedamn playground", type: "folder" },
    },
    "index.html": {
      id: "index.html",
      children: [],
      data: { title: "index.html", type: "file" },
    },
    "style.css": {
      id: "style.css",
      children: [],
      data: { title: "style.css", type: "file" },
    },
    "script.js": {
      id: "script.js",
      children: [],
      data: { title: "script.js", type: "file" },
    },
  },
};

interface ExplorerProprs {
  setFocusedTabName: React.Dispatch<React.SetStateAction<string | undefined>>;
  setFocusedFileName: React.Dispatch<React.SetStateAction<string | undefined>>;
  focusedFileName: string | undefined;
}

const Explorer: React.FC<ExplorerProprs> = ({
  setFocusedTabName,
  setFocusedFileName,
  focusedFileName
}) => {
  const [tree, setTree] = useState<TreeData>(initialData);

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
        <span onClick={() => handleClick(renderItemParams)}>
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
      <span>Explorer</span>
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
