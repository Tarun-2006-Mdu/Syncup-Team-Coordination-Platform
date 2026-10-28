# SyncUp – Team Coordination Platform

SyncUp is a full-stack web application designed to simplify project management, task assignment, team coordination, workload monitoring, and stakeholder visibility. It provides role-based access for Project Coordinators, Team Members, and Stakeholders.

## Features

* **User Authentication:** Secure login using JWT authentication.
* **Role-Based Access Control:** Separate access for Project Coordinators, Team Members, and Stakeholders.
* **Project Management:** Create, update, view, and archive projects.
* **Task Management:** Create tasks and track their status, priority, and due dates.
* **Task Assignment:** Assign tasks to team members.
* **Progress Tracking:** Calculate project progress based on completed tasks.
* **Workload Monitoring:** View team workload and task assignments.
* **Stakeholder Dashboard:** Provide visibility into project information and progress.
* **Responsive Interface:** React-based user interface with light and dark themes.
* **API Documentation:** Swagger/OpenAPI integration for exploring and testing backend APIs.

## Technology Stack

### Frontend

* React.js
* JavaScript and JSX
* Redux Toolkit
* React Router
* Axios
* CSS

### Backend

* Java 17-compatible Spring Boot 3.2.5 application
* Spring Web
* Spring Security
* JSON Web Token (JWT)
* Spring Data JPA
* Hibernate
* Maven
* Swagger/OpenAPI

### Database

* MySQL

## Architecture

```text
User
 |
 v
React Frontend
 |
 | Axios / REST API
 v
Spring Boot Backend
 |
 +--> Spring Security and JWT
 |
 v
Controller Layer
 |
 v
Service Layer
 |
 v
Repository Layer
 |
 v
JPA / Hibernate
 |
 v
MySQL Database
```

## User Roles

| Role                | Responsibility                                                                  |
| ------------------- | ------------------------------------------------------------------------------- |
| PROJECT_COORDINATOR | Manage projects, tasks, assignments, and team workload according to permissions |
| TEAM_MEMBER         | View relevant project and task information and work with assigned tasks         |
| STAKEHOLDER         | View project information and progress                                           |

Actual access permissions are enforced by the backend.

## Project Structure

```text
Team Coordination Platform/
├── backend/
│   ├── src/
│   ├── pom.xml
│   └── mvnw
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── README.md
```

## Prerequisites

Install the following before running the application:

* Java Development Kit (JDK)
* Maven, or use the included Maven Wrapper
* Node.js and npm
* MySQL Server
* Git

## Getting Started

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd syncup-team-coordination-platform
```

Replace `<YOUR_GITHUB_REPOSITORY_URL>` with your actual repository URL.

### 2. Configure MySQL

Create a MySQL database for the application.

```sql
CREATE DATABASE syncup_db;
```

Update the backend database configuration to match your local MySQL username, password, and database name.

**Security note:** Never commit database passwords, JWT secrets, or other credentials to GitHub. Use environment variables or a local configuration file excluded by `.gitignore`.

### 3. Start the Backend

Open a terminal in the backend directory:

```bash
cd backend
```

Run the Spring Boot application using Maven:

```bash
mvn spring-boot:run
```

Alternatively, on Windows, use the included Maven Wrapper:

```cmd
mvnw.cmd spring-boot:run
```

The backend runs on port `8080` by default, unless configured otherwise.

### 4. Access API Documentation

When the backend is running and Swagger is configured, open:

http://localhost:8080/swagger-ui/index.html

### 5. Start the Frontend

Open a separate terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

If the frontend uses a different development command, follow the scripts defined in `frontend/package.json`.

Configure the frontend API base URL to point to your running backend.

## Troubleshooting

### Expired JWT or Authentication Errors

If the browser retains an expired JWT, API requests may fail until you log in again.

Open the application in your browser, press `F12`, select the **Console** tab, and execute:

```javascript
localStorage.removeItem("token");
localStorage.removeItem("user");
location.reload();
```

This removes the stored token and user information and reloads the page. Log in again to obtain a new token.

If your application uses different local storage keys, clear the corresponding keys instead.

**Note:** This is a troubleshooting step for the browser's local storage. It does not replace proper JWT expiration handling in the backend.

### Backend API Returns HTTP 500

Check the Spring Boot terminal logs for the actual exception. Confirm that MySQL is running, database settings are correct, and authentication tokens are valid.

### Frontend Cannot Reach the Backend

Verify that the backend is running on the configured API URL and that the Spring Security CORS configuration permits the frontend origin.

## Testing

The project includes automated backend and frontend tests. The recorded test results were:

* Backend: 30/30 tests passed.
* Frontend: 30/30 tests passed.
* Total: 60/60 tests passed.

Run the relevant test commands configured in the backend `pom.xml` and frontend `package.json` to verify the current code.

## Future Enhancements

* Forgot-password functionality
* Project deletion and additional lifecycle controls
* Real-time notifications
* Calendar integration
* Advanced reporting and analytics
* Enhanced team communication features

## Author

**Tarun Raj M**

B.Tech – Artificial Intelligence and Data Science
Sri Krishna College of Engineering and Technology

## License

This project is available for educational and portfolio purposes. Add a license file if you intend to grant others explicit permissions to reuse, modify, or distribute the code.
