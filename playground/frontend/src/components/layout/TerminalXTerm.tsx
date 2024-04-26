import React, { useRef, useEffect } from "react";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "xterm-addon-fit";
import "@xterm/xterm/css/xterm.css";

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

  terminal.onData((data) => {
    console.log(data);
    terminal.write(data);
  });
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
