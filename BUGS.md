batchUpdate was running on every call from setState.
reason: it was being recreated after each react element re-render, since it was present inside the react component.


missing await on an async function, causing everything to work agains the logic. i tried using logs, but everything was doing weird things.


could not do some things using http, since its stateless, so used websockets instead.
things like, xterm to dockerode interactive shell session

had to use React.memo on the TerminalXTerm component cz the parent component ie the monacoEditor was being rendered multiple times, causing this to render multiple times too. here multiple = 3.
hence, when i wanted to type 'ls' in the xterm, it showd 'lllsss' xd.


tried using a single websocketserver for handling connections to multiple client. didnt work initially.
i was adding a new connections event callback function to the websocketserver each time a new client connected.


bind mounts was replacing the 3 files (index.html style.css script.js) from the container's /home/codedamn because of the mountpoint empty directory ~/codedamn/volumes/volumeId