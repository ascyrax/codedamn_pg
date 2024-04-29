batchUpdate was running on every call from setState.
reason: it was being recreated after each react element re-render, since it was present inside the react component.


missing await on an async function, causing everything to work agains the logic. i tried using logs, but everything was doing weird things.


could not do some things using http, since its stateless, so used websockets instead.
things like, xterm to dockerode interactive shell session