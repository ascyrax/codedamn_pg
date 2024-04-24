import React, { useRef, useEffect } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css'; // Import xterm styles

function FrontendTerminal() {
    const termRef = useRef(null);
    const fitAddon = new FitAddon();

    useEffect(() => {
        if (termRef.current) {
            const terminal = new Terminal({
                cursorBlink: true,
                cursorStyle: 'block',
            });

            terminal.loadAddon(fitAddon);
            terminal.open(termRef.current);
            fitAddon.fit();

            terminal.writeln('Welcome to your Terminal!');

            // terminal.onData(data => handleInput(data, terminal));
        }
    }, []);

    // function handleInput(data, terminal) {
    //     switch (data) {
    //         case '\r': // Enter key
    //             terminal.writeln('');
    //             break;
    //         default: // Print all other characters
    //             terminal.write(data);
    //     }
    // }

    return <div ref={termRef} style={{ height: '100%', width: '100%' }} />;
}

export default FrontendTerminal;
