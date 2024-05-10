# Code Editor and Terminal Web Application

## Project Overview

This project provides a powerful web-based development environment with a code editor and terminal. It supports multiple files, a file explorer, resizable editor, terminal window(connected to a container's shell), a live preview and a persistent session management.

JWT has been used for Authentication & Authorization.

The frontend is built with React and TypeScript, using Monaco Editor for the code editor and xterm.js for the terminal emulation. Each user session is containerized using Docker and the terminal on the frontend is connected via websockets to this container's shell.

## Key Features

- **Monaco Editor Integration**: Provides a rich coding experience with support for multiple files.
- **Resizable Windows**: Users can resize the editor and terminal windows to suit their preferences.
- **Persistent Code Storage**: Code files are automatically saved on the backend as docker volumes, ensuring that no work is lost even after the browser is refreshed.
- **Terminal Emulation**: A terminal window powered by xterm.js allows users to compile code, run scripts, and interact with a shell directly from the browser.
- **Docker Containers**: Each user session is containerized, allowing for isolated and secure coding environments for multiple simultaneous users.
- **Preview Window**: Users can see the output of their HTML, CSS, and JavaScript code in real-time within a preview window.

## Technologies Used

- **Frontend**: React.js, TypeScript
- **Code Editor**: Monaco Editor
- **Terminal**: xterm.js
- **Backend**: Node.js, Express (for API handling and session management)
- **Authentication & Authorization**: JWT
- **Realtime Connection**: WebSockets (for realtime connection between xterm & corresponding docker container's shell)
- **Database**: MongoDB (for persisting user data), AWS S3 (User's source code files)
- **Containerization**: Docker (to isolate and manage user sessions)

## Getting Started

### Prerequisites

- Node.js
- Yarn
- Docker
- MongoDB

### Setting Up Your Local Environment

1. **Clone the repository**:

   ```bash
   git clone git@github.com:ascyrax/codedamn_pg.git
   cd codedamn_pg
   ```

2. **Install dependencies**:

   backend

   ```bash
   cd backend
   yarn install
   ```

   frontend

   ```bash
   cd ../frontend
   yarn install
   ```

3. **Start the MongoDB server** (ensure Docker is running if using a containerized instance):

   Before starting MongoDB, ensure that it is properly installed on your system. You can download and install MongoDB from the [official MongoDB website](https://www.mongodb.com/try/download/community).

   ### macOS

   For macOS users who installed MongoDB using Homebrew:

   ```bash
   brew services start mongodb-community
   ```

   ### Windows

   For Windows users, MongoDB can be started as a service if it was set up during installation. To start MongoDB using the Command Prompt:

   ```bash
   net start MongoDB
   ```

   If MongoDB was not installed as a service, you can start it manually with:

   ```bash
   mongod --dbpath "C:\\path\\to\\data\\db"
   ```

   Make sure to replace "C:\\path\\to\\data\\db" with the actual path to your data directory.

   ### Ubuntu Linux

   For Ubuntu users, if MongoDB was installed using the official MongoDB repository, it can be started with systemd:

   ```bash
   sudo systemctl start mongod
   ```

   To ensure MongoDB starts automatically on boot:

   ```bash
   sudo systemctl enable mongod
   ```

   ### docker

   ```bash
   sudo docker run --name mongodb -d -p 27017:27017 mongo:6.0
   ```

   ### Troubleshooting

   If MongoDB fails to start, check the MongoDB log files for any errors. The default location for log files is usually /var/log/mongodb on Linux and within your specified dbpath directory on Windows.

   ### More Information

   For more detailed installation and management instructions, refer to the [official MongoDB documentation](https://www.mongodb.com/docs/manual/installation/).

4. **Start the Docker daemon**

   ## Prerequisites

   Before starting Docker, ensure that it is properly installed on your system. You can download and install Docker from the [official Docker website](https://www.docker.com/products/docker-desktop).

   ## Starting Docker

   ### macOS

   For macOS users who installed Docker Desktop:

   1. Open the Docker Desktop application from your Applications folder.
   2. Docker will start automatically when the application runs. You can see the Docker icon in the menu bar, indicating that Docker is running.

   ### Windows

   For Windows users who installed Docker Desktop:

   1. Open Docker Desktop by clicking the Docker icon on your desktop or from the Start menu.
   2. Docker starts automatically with the application. The Docker icon in the system tray will show Docker's status.

   ### Linux

   For Linux users, Docker can be managed via the command line. Here's how to start Docker using the terminal:

   1. Open your terminal.
   2. Start Docker by running:

   ```bash
   sudo yum install docker
   sudo systemctl start docker
   ```

   #### To ensure Docker starts automatically at boot:

   ```bash
   sudo systemctl enable docker
   ```

   ### Troubleshooting

   If Docker fails to start, check the Docker log files for any errors. You can also restart Docker Desktop or your computer to resolve many common issues.

   ### More Information

   For more detailed installation and management instructions, or to troubleshoot issues, refer to the [official Docker documentation](https://docs.docker.com/).

5. **Configure .env file for the backend**

   Create a .env file of your own which contains these 3 variables:

   ```bash
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/codedamn
   SECRET_KEY="YOUR_SECRET_KEY"
   ```

6. **Run the backend server**:

   ```bash
   cd backend
   yarn dev
   ```

7. **Run the frontend application**:
   ```bash
   cd frontend
   yarn dev
   ```

### Testing the Application

1.  **Open the Application**: Navigate to `http://localhost:3000` in your web browser.

2.  **Login / Register**: Register if your are a new user. Login after registering.

3.  **Edit Files**: Use the Monaco editor interface to edit the existing files. All changes are saved automatically to the database.

4.  **Resize Windows**: Drag the borders of the code editor and terminal windows to resize them according to your preference.

5.  **Use the Terminal**: Interact with the terminal to execute commands. Each command's output will be displayed within the terminal window. Files can be added or removed through the terminal.
    Live changes will be visible all across the editor.

6.  **Refresh the Page**: Refresh the browser to test the persistence feature. Your code should be restored to the last saved state.

7.  **Preview Your Code**: For web technologies like HTML, CSS, and JavaScript, use the preview window to see your code rendered in real-time.

8.  FOR TESTING THE PREVIEW OF THE REACT APP PRESENT BY DEFAULT IN EACH NEW USER'S EDITOR FILES,
    ```bash
    cd react
    yarn install && yarn dev --host
    ```

   NOTE: YOU MUST DO yarn dev --host instead of just yarn dev. Reason is the usage of docker containers & how they expose their ports on the host.

   YOU MIGHT NEED TO REFRESH THE PREVIEW SECTION (ONLY) TO SEE THE LIVE REACT APP.

### Troubleshooting

- **Docker Containers Not Starting**: Ensure Docker is running and that you have the necessary permissions to start containers.
- **Database Issues**: Verify that MongoDB is running and accessible. Check the connection string in the backend configuration.
- **Editor or Terminal Not Loading**: Check the console for any errors. They may be related to dependency issues or misconfigurations in the setup.
