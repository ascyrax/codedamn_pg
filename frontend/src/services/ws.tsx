// import { TreeData } from "@atlaskit/tree";
// import { credentials } from "../models/interfaces";
// import { SERVER_WSDOMAIN, SERVER_PORT } from "../utils/utils";

// export async function createWebSocket(
//   ws: WebSocket | null,
//   credentials: credentials,
//   tree: TreeData,
//   setTerminalData: (value: string) => void,
//   setTree: (tree: TreeData) => void
//   // token: string | null
// ) {
//   ws = new WebSocket(
//     `${SERVER_WSDOMAIN}:${SERVER_PORT}?username=${credentials.username}`
//   );

//   ws.onopen = function () {
//     // if (token) ws.send(JSON.stringify({ type: "token", token }));
//   };

//   ws.onerror = function (event) {
//     console.error("WebSocket error observed by the client :)", event);
//   };

//   ws.onmessage = function (event) {
//     // console.log("ws receive -> : ", event);
//     const msg = JSON.parse(event.data);
//     // console.log("ws receive -> ", msg);
//     if (msg.type == "stdout" || msg.type == "stderr") setTerminalData(msg.data);
//     else if (msg.type == "explorer") {
//       updateTree(msg.explorerData);
//     }
//   };

//   function updateTree(newTree: TreeData) {
//     console.log(tree, newTree);
//     for (let [key, val] of Object.entries(newTree.items)) {
//       if (key == "playground/da") console.log(key, val);
//       if (
//         val.isExpanded &&
//         tree.items &&
//         tree.items[key] &&
//         tree.items[key].isExpanded
//       ) {
//         if (key) val.isExpanded = tree.items[key].isExpanded;
//       }
//     }
//     setTree(newTree);
//   }

//   ws.onclose = function (event) {
//     console.log("WebSocket connection closed.", event);
//   };

//   return ws;
// }
