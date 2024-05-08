import React, { useRef, useEffect, useState } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";
import { TerminalXTermProps } from "../../models/interfaces";

const TerminalXTerm = React.memo(function TerminalXTerm({
  ws,
  terminalData,
}: TerminalXTermProps) {
  let [terminal, setTerminal] = useState<Terminal>(initTerminal());
  const terminalRef = useRef(null);
  let bufferCommand = "";

  // console.log("RENDER TERMINALXTERM", { terminalData });

  function initTerminal() {
    const terminal = new Terminal({
      letterSpacing: 2,
      cursorBlink: true,
      cursorStyle: "bar",
      cursorWidth: 1,
      cursorInactiveStyle: "bar",
      fontFamily: '"Courier New", "Fira Code", "Roboto Mono", monospace',
      fontSize: 14,
    });

    return terminal;
  }

  useEffect(() => {
    // console.log("USEEFFECT WS", terminal);
    if (ws) {
      // terminal && terminal.dispose();
      terminal = initTerminal();
      terminal && renderTerminal();
      terminal && fitTerminalToParentDiv();
      terminal &&
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
      terminal && setTerminal(terminal);
    }
    return () => {
      terminal && terminal.dispose();
    };
  }, [ws]);

  useEffect(() => {
    // console.log({ terminal }, { terminalData });
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

  function processCommand(bufferCommand: string) {
    // console.log("bufferCommand: ", bufferCommand);
    // console.log(ws);
    // console.log(ws?.readyState);
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
