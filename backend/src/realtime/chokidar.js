import * as chokidar from "chokidar";
import path from "path";
import fs from "fs";

const getDirectoryStructure = (dirPath, parentId = "playground") => {
  let structure = {};
  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (let item of items) {
      const itemId = path.join(parentId, item.name);
      if (item.isDirectory()) {
        structure[itemId] = {
          id: itemId,
          children: [],
          hasChildren: true,
          parent: parentId,
          isExpanded: false,
          isChildrenLoading: false,
          data: {
            title: item.name,
            type: "folder",
          },
        };
        const childStructure = getDirectoryStructure(
          path.join(dirPath, item.name),
          itemId
        );
        let arrChildren = [];
        for (let [key, val] of Object.entries(childStructure)) {
          if (val.parent == itemId) arrChildren.push(key);
        }
        // console.log("ARRCHILDREN:", arrChildren);
        structure[itemId].children = [...arrChildren];
        structure = { ...structure, ...childStructure };
      } else {
        structure[itemId] = {
          id: itemId,
          children: [],
          hasChildren: false,
          parent: parentId,
          data: {
            title: item.name,
            type: "file",
          },
        };
      }
    }
  } catch (err) {
    console.error("error setting up chokidar: ", err);
  }

  return structure;
};

function updateExplorer(ws, volumePath) {
  let directoryStructure = getDirectoryStructure(volumePath);

  let pg_children = [];
  for (let [key, val] of Object.entries(directoryStructure)) {
    if (val.parent == "playground") pg_children.push(key);
  }

  directoryStructure = {
    ...directoryStructure,
    root: {
      id: "root",
      children: ["workspace", "outline"],
      data: { title: "Root", type: "folder" },
      isExpanded: true,
    },
    workspace: {
      id: "workspace",
      children: ["playground"],
      data: { title: "Workspace", type: "folder" },
      isExpanded: true,
    },
    outline: {
      id: "outline",
      children: [],
      data: { title: "Outline", type: "folder" },
      isExpanded: false,
    },
    playground: {
      id: "playground",
      children: [...pg_children],
      data: { title: "playground", type: "folder" },
      isExpanded: true,
    },
  };

  const treeData = formatForAtlaskitTree(directoryStructure);

  // console.log(treeData);
  // console.dir(treeData, { depth: null, colors: true });

  let msg = JSON.stringify({
    type: "explorer",
    description: "file explorer (atlaskit/tree) data",
    sender: "backend",
    explorerData: treeData,
    volumePath,
  });

  ws.send(msg);
}

const formatForAtlaskitTree = (directoryStructure) => {
  return {
    rootId: "root",
    items: directoryStructure,
  };
};

export function initWatcher(ws, volumeName) {
  // console.log("initWatcher -> ", { volumeName });
  let volumePath = `/var/tmp/codedamn/volumes/${volumeName}`;
  let watcher = chokidar.watch(`${volumePath}`, {
    ignored: /^\./,
    persistent: true,
  });

  updateExplorer(ws, volumePath);

  watcher.on("add", (filePath) => {
    // console.log(`File ${filePath} has been added`);
    // if (fileOrigins.get(filePath) === "frontend") {
    //   // Change was made by frontend, reset the flag and do not notify frontend
    //   fileOrigins.set(filePath, null);
    // } else {
    //   // Change was made by backend or external process, notify frontend
    //   socket.send(
    //     JSON.stringify({
    //       type: "fileChange",
    //       filePath: filePath,
    //       contents: fs.readFileSync(filePath).toString(),
    //     })
    //   );
    // }
    const relativePath = path.relative(volumePath, filePath);
    const fileName = path.basename(filePath);
    const dirName = path.dirname(filePath);
    let msg = JSON.stringify({
      type: "add",
      description: "file added",
      sender: "chokidar",
      filePath,
      dirPath: "",
      volumePath,
    });
    ws.send(msg);
    updateExplorer(ws, volumePath);
  });

  watcher.on("addDir", (dirPath) => {
    // console.log(`Directory ${dirPath} has been added`);
    let msg = JSON.stringify({
      type: "addDir",
      description: "directory added",
      sender: "chokidar",
      filePath: "",
      dirPath,
      volumePath,
    });
    ws.send(msg);
    updateExplorer(ws, volumePath);
  });

  watcher.on("change", (filePath) => {
    // console.log(`File ${filePath} has been changed`);
    let msg = JSON.stringify({
      type: "change",
      description: "file change",
      sender: "chokidar",
      filePath,
      dirPath: "",
      volumePath,
    });
    ws.send(msg);
    updateExplorer(ws, volumePath);
  });

  watcher.on("unlink", (filePath) => {
    // console.log(`File ${filePath} has been removed`);
    let msg = JSON.stringify({
      type: "unlink",
      description: "file removed",
      sender: "chokidar",
      filePath,
      dirPath: "",
      volumePath,
    });
    ws.send(msg);
    updateExplorer(ws, volumePath);
  });

  watcher.on("unlinkDir", (dirPath) => {
    // console.log(`Directory ${dirPath} has been removed`);
    let msg = JSON.stringify({
      type: "unlinkDir",
      description: "directory removed",
      sender: "chokidar",
      filePath: "",
      dirPath,
      volumePath,
    });
    ws.send(msg);
    updateExplorer(ws, volumePath);
  });

  watcher.on("ready", () => {
    // console.log("Initial scan complete. Ready for changes");
  });

  watcher.on("error", (error) => {
    // console.log(`Watcher error: ${error}`);
  });

  watcher.on("all", (event, path) => {
    // console.log(`Event type: ${event}, Path: ${path}`);
  });

  watcher.on("close", function () {
    // console.log(`chokidar for ${volumeName} is tired now. closing. bye.`);
  });

  return watcher;
}
