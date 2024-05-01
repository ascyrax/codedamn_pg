import React, { useRef, useEffect } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";
import { getEditorData } from "../../services/services";
import { debounce } from "lodash-es";
import { TerminalXTermProps } from "../../models/interfaces";

let ws: WebSocket;

export async function createWebSocket() {
  ws = new WebSocket("ws://localhost:3000");

  ws.onopen = function () {
    console.log("ws connection open");
  };

  ws.onerror = function (event) {
    console.error("WebSocket error observed by the client :)", event);
  };

  ws.onmessage = function (event) {
    console.log("ws receive -> : ", event.data);
    terminal.write(event.data);
  };

  ws.onclose = function (event) {
    console.log("WebSocket connection closed.", event);
  };
}

const terminal = new Terminal({
  letterSpacing: 2,
  cursorBlink: true,
  cursorStyle: "bar",
  cursorWidth: 1,
  cursorInactiveStyle: "bar",
  fontFamily: '"Courier New", "Fira Code", "Roboto Mono", monospace',
  fontSize: 14,
});

const TerminalXTerm = React.memo(function TerminalXTerm({
  setFilesData,
}: TerminalXTermProps) {
  const terminalRef = useRef(null);
  let bufferCommand = "";

  useEffect(() => {
    renderTerminal();
    fitTerminalToParentDiv();

    return () => {
      terminal.dispose();
    };
  }, []);

  function renderTerminal() {
    if (terminalRef.current) {
      terminal.open(terminalRef.current);
    }
  }

  function fitTerminalToParentDiv() {
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    fitAddon.fit();
  }

  terminal.onKey(({ key, domEvent }) => {
    domEvent = domEvent;
    switch (key) {
      case "\x7F":
        terminal.write("\b \b");
        if (bufferCommand.length > 0)
          bufferCommand = bufferCommand.slice(0, -1);
        break;
      case "\r":
        terminal.writeln("\r");
        processCommand(bufferCommand);
        bufferCommand = "";
        break;
      default:
        terminal.write(key);
        bufferCommand += key;
    }
  });

  const fetchEditorData = async () => {
    try {
      const responseData = await getEditorData();
      if (responseData) {
        setFilesData(responseData);
      }
    } catch (error) {
      console.error("Error fetching editor data:", error);
    }
  };
  const batchGetEditorData = debounce(fetchEditorData, 500);

  async function processCommand(bufferCommand: string) {
    if (ws.readyState == WebSocket.OPEN) {
      ws.send(bufferCommand);
      await batchGetEditorData();
    }
  }

  return (
    <>
      <div
        ref={terminalRef}
        id="xterm"
        style={{ height: "100%", width: "100%" }}
      ></div>
    </>
  );
});

export default TerminalXTerm;
