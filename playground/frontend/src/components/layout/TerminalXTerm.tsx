import { useRef, useEffect } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";
// import { postCommandToNodepty } from "../../services/services";

const ws = new WebSocket("ws://localhost:3000");

ws.onerror = function (event) {
  console.error("WebSocket error observed by the client :)", event);
};

ws.onopen = function (event) {
  ws.send("hello from the client :)");
};

ws.onmessage = function (event) {
  console.log("message from the server: ", event.data);
};

ws.onclose = function (event) {
  console.log("WebSocket connection closed.", event);
};

function TerminalXTerm() {
  const terminalRef = useRef(null);

  const terminal = new Terminal({
    letterSpacing: 2,
    cursorBlink: true,
    cursorStyle: "bar",
    cursorWidth: 1,
    cursorInactiveStyle: "bar",
    fontFamily: '"Courier New", "Fira Code", "Roboto Mono", monospace',
    fontSize: 14,
  });

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
      terminal.write("Hello from xtermjs % ");
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

  async function processCommand(bufferCommand: string) {
    console.log(bufferCommand);
    if (ws.readyState == WebSocket.OPEN) ws.send(bufferCommand);
    // const data = await postCommandToNodepty(bufferCommand);
    // terminal.write(data.output);
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
}

export default TerminalXTerm;
