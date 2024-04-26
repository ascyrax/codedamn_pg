# a. Technologies that I've decided upon

## Basic Frontend

React.js: (this was mandatory)

- great ecosystem
- ample documentations and strong community support too
- personal preference too, since I have a strong background in Reactjs, whereas, I have no experience with Next.js

TypeScript: (this was mandatory too)

- better code quality & easier development than vanilla JS, because of static typing
- it pairs well with react too

## Code Editor:

Monaco Editor: (this was mandatory too)

- this is also used in Visual Studio Code which is my preferred editor personally
- features like syntax highlighting, code completion, multiple files support etc.

## Terminal preview:

Xterm.js: (recommended)

- easy integration with WebSocket servers (we need to use websockets for communicating with a real backend terminal ie a pseudoterminal)

## Resizable Layouts:

React-rnd:

- its popular
- provides resizable functionality
- pairs well with react & typescript both

## File Explorer Feature:

Atlaskit/tree:

- only few libraries pair up nicely with React+Typescript, I guess. Since, I failed to use some libraries prior to using this
- highly customizable, with drag
  -and
  -drop support too

## Backend

Node.js:

- better consistency with JS on the fronend

Express.js:

- Its a minimal Node.js web application framework
- It handles routing, middleware, and interactions with databases.

WebSocket:

- Best candidate for communication between the xterm on the frontend & the node-pty on the backend, because of the way node
  -pty generates multiple asynchronous events.
- Code changes in the Code Editor on the frontend, needs to be saved smartly at proper intervals, & before refreshing the page or quitting the session.

## Database

MongoDB:

- It has a document-oriented model, hence good for json-like documents generated from
  code snippets.
- It has very good horizontal scalability. hence, data sharding can be used to handle large data loads.

## Containerization Technology

Docker:

- Docker is the de facto standard
- Each user session needs to be containerized, mainly for security and isolation.
- Later, kubernetes can be used to manage large no of docker containers, as scalability comes into picture with huge no of simultaneous user sessions.

# b. Decisions on Infrastructure

## Development Environment

Local Environment: Developers will use Docker containers locally to mimic the production environment closely, reducing the "it works on my machine" problem.
Version Control: Git along with GitHub for source control management, which also integrates well with various CI/CD pipelines.

## Deployment and Operations

Vercel/Netlify: For hosting the Next.js application, leveraging their global CDN and serverless functions for dynamic content and API routes.
CI/CD: GitHub Actions or Vercel’s built
-in CI/CD for automating builds, tests, and deployment processes. This ensures that updates are smoothly rolled out.

Monitoring and Logging: Integration of tools like Sentry for real
-time error tracking and LogRocket for session replay debugging to maintain high availability and quick troubleshooting.
Security Measures

Authentication: Implement OAuth for user authentication with options to log in via GitHub, Google, etc.

Isolation in Docker: Each coding terminal session runs in an isolated Docker container, preventing users from affecting others' sessions and safeguarding the host system.
HTTPS: Ensure all data in transit is encrypted using TLS by default.

## Scalability

Load Balancers: Use of load balancers to distribute client requests efficiently across multiple instances, improving responsiveness and availability during high load.
Docker Swarm/Kubernetes: Depending on scale, use orchestration tools to manage and scale the Docker containers across multiple servers.
