import React, { useRef, useEffect } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";
import axios from "axios";
import { postCommandToNodepty } from "../../services/services";

function TerminalXTerm() {
  const terminalRef = useRef(null);

  const terminal = new Terminal({
    // letterSpacing: 0,
    cursorBlink: true,
    cursorStyle: "bar",
    cursorWidth: 1,
    cursorInactiveStyle: "bar",
    fontFamily: "Lato",
    // fontSize: 15,
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
    switch (key) {
      case "\x7F":
        terminal.write("\b \b");
        if (bufferCommand.length > 0)
          bufferCommand = bufferCommand.slice(0, -1);
        break;
      case "\r":
        terminal.writeln("");
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
    const data = await postCommandToNodepty(bufferCommand);
    console.log(data);
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
