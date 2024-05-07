import React, { useRef, useEffect, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";
// import { getEditorData } from "../../services/services";
// import { debounce } from "lodash-es";
import {
  TerminalXTermProps,
  credentials,
  chokidarMsg,
} from "../../models/interfaces";
import { SERVER_WSDOMAIN, SERVER_PORT } from "../../utils/utils";

// function updateExplorer(msg: chokidarMsg) {}

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
  ws,
  terminalData,
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

  useEffect(() => {
    // console.log("useEffect TERMINALXTERM-> ", terminalData);
    // console.log("useEffect TERMINALXTERM-> ", terminal)
    terminal && terminalData && terminal.write(terminalData);
  }, [terminalData]);

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
        if (bufferCommand && bufferCommand.length > 0)
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

  // const fetchEditorData = async () => {
  //   try {
  //     const responseData = await getEditorData(credentials);
  //     if (responseData) {
  //       setFilesData(responseData);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching editor data:", error);
  //   }
  // };
  // const batchGetEditorData = debounce(fetchEditorData, 500);

  async function processCommand(bufferCommand: string) {
    if (ws && ws.readyState == WebSocket.OPEN) {
      let msg = JSON.stringify({
        type: "xterm",
        description: "user command input in xterm",
        sender: "xterm",
        command: bufferCommand,
      });
      ws.send(msg);
      // await batchGetEditorData();
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
