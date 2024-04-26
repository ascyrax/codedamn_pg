import { ptyPocess } from "../../server.js";

export function runCommand(req, res) {
  let command = req.body.body;
  console.log("command: ", command);
  ptyPocess.write(command);
  ptyPocess.onData((data) => {
    console.log("command result: ", data);
    res.send(data);
  });
}
