import React, { useRef, useEffect } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";
// import { postCommandToNodepty } from "../../services/services";

const ws = new WebSocket("ws://localhost:3000");
const terminal = new Terminal({
  letterSpacing: 2,
  cursorBlink: true,
  cursorStyle: "bar",
  cursorWidth: 1,
  cursorInactiveStyle: "bar",
  fontFamily: '"Courier New", "Fira Code", "Roboto Mono", monospace',
  fontSize: 14,
});

ws.onerror = function (event) {
  console.error("WebSocket error observed by the client :)", event);
};

ws.onopen = function (event) {};

ws.onmessage = function (event) {
  console.log("ws receive -> : ", event.data);
  terminal.write(event.data);
};

ws.onclose = function (event) {
  console.log("WebSocket connection closed.", event);
};

const TerminalXTerm = React.memo(function TerminalXTerm() {
  const terminalRef = useRef(null);
  console.log("TerminalXTerm");
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
        // bufferCommand += "\r";
        processCommand(bufferCommand);
        bufferCommand = "";
        break;
      default:
        terminal.write(key);
        bufferCommand += key;
    }
  });

  function processCommand(bufferCommand: string) {
    console.log("processCommand");
    if (ws.readyState == WebSocket.OPEN) ws.send(bufferCommand);
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
