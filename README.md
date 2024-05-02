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
   cd frontend
   yarn install
   ```

3. **Start the MongoDB server** (ensure Docker is running if using a containerized instance):
   for macOS,

   ```bash
   brew services start mongodb-community
   ```

   for others,

   ```bash
   mongod
   ```

4. **Start the Docker daemon**
   for macOS,
   check Docker.app

5. **Configure a .env file**
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

1. **Open the Application**: Navigate to `http://localhost:3000` in your web browser.

2. **Login / Register**: Register if your are a new user. Login after registering.

3. **Edit Files**: Use the Monaco editor interface to edit the existing files. All changes are saved automatically to the database.

4. **Resize Windows**: Drag the borders of the code editor and terminal windows to resize them according to your preference.

5. **Use the Terminal**: Interact with the terminal to execute commands. Each command's output will be displayed within the terminal window. Files can be added or removed through the terminal.
   Live changes will be visible all across the editor.

6. **Refresh the Page**: Refresh the browser to test the persistence feature. Your code should be restored to the last saved state.

7. **Preview Your Code**: For web technologies like HTML, CSS, and JavaScript, use the preview window to see your code rendered in real-time.

### Troubleshooting

- **Docker Containers Not Starting**: Ensure Docker is running and that you have the necessary permissions to start containers.
- **Database Issues**: Verify that MongoDB is running and accessible. Check the connection string in the backend configuration.
- **Editor or Terminal Not Loading**: Check the console for any errors. They may be related to dependency issues or misconfigurations in the setup.
