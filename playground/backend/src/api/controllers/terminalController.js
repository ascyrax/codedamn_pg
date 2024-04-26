import * as os from "os";
import * as pty from "node-pty";

// nodepty
var shell = os.platform() === "win32" ? "powershell.exe" : "zsh";

var ptyProcess = pty.spawn(shell, [], {
  name: "codedamn",
  cols: 100,
  rows: 40,
  // cwd: "./",
  env: process.env,
});

export function runCommand(req, res) {
  let command = req.body.body;
  console.log(command);

  let ptyResponse = "";
  ptyProcess.onData((data) => {
    ptyResponse += data;
  });

  ptyProcess.write(command);
  setTimeout(() => {
    console.log(ptyResponse);
    res.send(ptyResponse);
  }, 1000);
}
