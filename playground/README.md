# Code Editor and Terminal Web Application

## Project Overview

This project provides a powerful web-based development environment with a code editor and terminal. It supports multiple files, resizable editor and terminal windows, and persistent session management. The frontend is built with React and TypeScript, using Monaco Editor for the code editor and xterm.js for the terminal emulation.

## Key Features

- **Monaco Editor Integration**: Provides a rich coding experience with support for multiple files.
- **Resizable Windows**: Users can resize the editor and terminal windows to suit their preferences.
- **Persistent Code Storage**: Code files are automatically saved to a backend database, ensuring that no work is lost even after the browser is refreshed.
- **Terminal Emulation**: A terminal window powered by xterm.js allows users to compile code, run scripts, and interact with a shell directly from the browser.
- **Docker Containers**: Each user session is containerized, allowing for isolated and secure coding environments for multiple simultaneous users.
- **Preview Window**: Users can see the output of their HTML, CSS, and JavaScript code in real-time within a preview window.

## Technologies Used

- **Frontend**: React.js, TypeScript
- **Code Editor**: Monaco Editor
- **Terminal**: xterm.js (recommended for terminal emulation)
- **Backend**: Node.js, Express (for API handling and session management)
- **Database**: MongoDB (for persisting user code and session data)
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
    git clone https://github.com/your-repository-url.git
    cd your-repository-directory
    ```

2. **Install dependencies**:
    ```bash
    yarn install
    ```

3. **Start the MongoDB server** (ensure Docker is running if using a containerized instance):
    ```bash
    mongod
    ```

4. **Run the backend server**:
    ```bash
    cd backend
    yarn start
    ```

5. **Run the frontend application**:
    ```bash
    cd frontend
    yarn start
    ```

### Testing the Application

1. **Open the Application**: Navigate to `http://localhost:3000` in your web browser.

2. **Create and Edit Files**: Use the Monaco editor interface to create new files or open existing ones. All changes are saved automatically to the database.

3. **Resize Windows**: Drag the borders of the code editor and terminal windows to resize them according to your preference.

4. **Use the Terminal**: Interact with the terminal to execute commands. Each command's output will be displayed within the terminal window.

5. **Refresh the Page**: Refresh the browser to test the persistence feature. Your code should be restored to the last saved state.

6. **Preview Your Code**: For web technologies like HTML, CSS, and JavaScript, use the preview window to see your code rendered in real-time.

### Troubleshooting

- **Docker Containers Not Starting**: Ensure Docker is running and that you have the necessary permissions to start containers.
- **Database Issues**: Verify that MongoDB is running and accessible. Check the connection string in the backend configuration.
- **Editor or Terminal Not Loading**: Check the console for any errors. They may be related to dependency issues or misconfigurations in the setup.

## Contributing

We welcome contributions from the community. If you wish to contribute to the project, please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
