<!-- https://github.com/ascyrax/codedamn_pg/blob/main/playground/SPECS.md -->

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

- this is also used in Visual Studio Code which is my preferred editor currenlty
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
- highly customizable, with drag-and-drop support too

## Backend

Node.js:

- better consistency with JS on the fronend

Express.js:

- Its a minimal Node.js web application framework
- It handles routing, middleware, and interactions with databases.

WebSocket:

- Best candidate for communication between the xterm on the frontend & the node-pty on the backend, because of the way node-pty generates multiple asynchronous events.
- Code changes in the Code Editor on the frontend, needs to be saved smartly at proper intervals, & before refreshing the page or quitting the session.

## Database (DURING DEVELOPMENT ONLY)

MongoDB:

- It has a document-oriented model, hence good for unstructured data generated from
  code snippets.

## Containerization Technology

Docker:

- Docker is the de facto standard
- Each user session needs to be containerized, mainly for security and isolation.
- Later, kubernetes can be used to manage large no of docker containers, as scalability comes into picture with huge no of simultaneous user sessions.

# b. Decisions on Infrastructure

## Frontend Hosting

Netlify:

- Automatically builds & deploys the site (CI/CD), whenever I push any code change to the corresponding Git repository.
- Netlify offers excellent support for single-page applications, which are typical with React.

OR

AWS S3 and CloudFront:

- S3 (Simple Storage Service) will be used to store and serve the static files of the React application (HTML, CSS, JavaScript).

- CloudFront is Amazon's CDN service that will distribute these static files globally. This setup reduces latency, increases the speed of content delivery, and enhances user experience by serving content from locations nearest to the user.

## BACKEND HOSTING

1. Core Infrastructure Setup

## Amazon EKS (Elastic Kubernetes Service)

AWS provides a managed Kubernetes service, viz. we don't need to do any installation & maintenance for the K8s control plane (master nodes).

- purpose:
  Handle backend services & editor(monaco on the frontend) coding environments

- security & isolation:
  EKS is integrated with IAM & VPC

- High Availability:
  k8s clusters are automatically spread across multiple AZs (Availability Zones) to enhance fault tolerance.

  Moreover, K8s services are run on multiple pods spread across the worker nodes.

## Amazon EC2 Instances

- purpose:
  Serve as worker nodes for the EKS clusters.

- Instance Type:
  m2.micro, becz i will be working within the FREE TIER :)

2. Networking and Connectivity

## Amazon VPC (Virtual Private Cloud)

- Security & isolation:
  VPC defines subnets, route tables, and gateways. All the infrastructure is present inside a secure & isolated network.

- Configuration:
  Subnets across multiple AZs for high availability and fault tolerance.
  Security Groups and Network ACLs to tightly control inbound and outbound traffic.

## Amazon Route 53

- Purpose:
  Manage DNS and routing of domain traffic to the EKS cluster effectively.

  It resolves the domain name to the IP address of a load balancer, configured to handle incoming traffic for the application

- Benefits:
  Route traffic globally with high availability.
  Integrates with AWS health checks to route traffic away from failed instances or endpoints.

## AWS Load Balancer (ELB)

- Purpose:
  Distribute incoming traffic efficiently to the application's backend services running on Kubernetes pods.

## Ingress Processing in EKS

- Ingress Controller:
  Once the request reaches the Kubernetes cluster, it is first intercepted by an Ingress Controller. This controller, typically running as a set of pods within the cluster, uses rules defined in Kubernetes Ingress Resources to further route the traffic to the appropriate service.

- SSL/TLS Termination:
  If SSL/TLS is used (which is recommended for production), the termination can happen at the ALB or at the Ingress Controller, decrypting requests before sending them to backend services.

## Service Routing

- Kubernetes Services:
  The Ingress Controller forwards the request to a Kubernetes Service. This service acts as an abstract layer that provides a single IP address and DNS name by which pods can be accessed. It routes the request to one of the pods that it manages, based on load-balancing strategies such as round-robin.

3. Data Management

Hybrid approach using DynamoDB for higher latency stuff, and S3 for large datasets of project code.

## Amazon DynamoDB

- purpose:
  For real-time data that require low-latency access and high availability.

  Session Management: Store session states that are frequently read and written during user interactions.

  User Settings and Preferences: Quickly access and update user-specific settings and preferences.

  Metadata Storage: Store metadata for projects and files, which requires quick retrieval for editing and management interfaces.

## Amazon S3

- purpose:
  For storing large files, backups, and serving static content.

  Code Files and Projects: Store user projects and code files, which can be large and don’t require frequent writes.

  Archives and Backups: Keep backups of user data and project histories.

4. Security and Compliance

## AWS Identity and Access Management (IAM)

- Purpose: Manage user authentication and authorization for EKS and other AWS services.

- Configuration:
  Define roles and policies for secure access to AWS resources.
  Use IAM roles for service accounts in Kubernetes to allow cluster pods to access AWS resources securely.

5. Development and Deployment

## GitHub

I will be hosting my code on a public GitHub repository.

I won't be using a CI/CD pipeline.

## dockerHub / AWS ECR

I will be using the github repo to MANUALLY tag the image and create a container, and host it on
dockerhub or aws ecr(elastic container registry).
