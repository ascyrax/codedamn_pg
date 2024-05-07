import { TreeData } from "@atlaskit/tree";
import { credentials } from "../models/interfaces";
import { SERVER_WSDOMAIN, SERVER_PORT } from "../utils/utils";

export async function createWebSocket(
  ws: WebSocket | null,
  credentials: credentials,
  setTerminalData: (value: string) => void,
  setTree:(tree:TreeData)=>void
) {
  ws = new WebSocket(
    `${SERVER_WSDOMAIN}:${SERVER_PORT}?username=${credentials.username}`
  );
  ws.onopen = function () {};

  ws.onerror = function (event) {
    console.error("WebSocket error observed by the client :)", event);
  };

  ws.onmessage = function (event) {
    console.log("ws receive -> : ", event.data);
    const msg = JSON.parse(event.data);
    console.log("msg -> ", msg);
    if (msg.type == "stdout" || msg.type == "stderr") setTerminalData(msg.data);
    else if (msg.type == "explorer") {
      setTree(msg.explorerData);
    }
  };

  ws.onclose = function (event) {
    console.log("WebSocket connection closed.", event);
  };

  return ws;
}
