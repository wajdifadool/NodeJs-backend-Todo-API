# 📝 Todo API Project

A full-featured collaborative Todo List API built with **Node.js**, **Express**, and **MongoDB**. Supports user authentication, todo management, collaboration features, and subtask tracking.

---

## 📝 Description

A full-featured **collaborative Todo List API** built with **Node.js**, **Express**, and **MongoDB**.  
This is a **simple project** in scope, but it covers **solid fundamentals of backend development**, including:

- RESTful API design
- User authentication using JWT
- Role-based access control (RBAC)
- Middleware composition and reusability
- Collaboration features between users
- Subtask management within todos
- Structured error handling and validation
- Modular file organization
- Testing with Jest & Supertest

Ideal for developers looking to understand **clean backend architecture** using the Node.js ecosystem.

---

## 📁 Table of Contents

- [🚀 Features](#-features)
- [📦 Tech Stack](#-tech-stack)
- [⚙️ Setup & Installation](#️-setup--installation)
- [🔐 Authentication](#-authentication)
- [📘 API Endpoints](#-api-endpoints)
- [✅ Testing](#-testing)
- [🧪 Test Coverage](#-test-coverage)
- [📄 License](#-license)

---

## 🚀 Features

- ✅ User registration and login with JWT
- ✅ Create / Read / Update / Delete todos
- ✅ Add/remove collaborators to shared todos
- ✅ Add/remove subtasks to any todo
- ✅ Role-based access control (Owner vs Collaborator)
- ✅ Clean and modular controller/middleware structure
- ✅ Fully tested with Jest + Supertest

---

## 📦 Tech Stack

| Tech       | Description                 |
| ---------- | --------------------------- |
| Node.js    | JavaScript runtime          |
| Express.js | Web framework               |
| MongoDB    | NoSQL database              |
| Mongoose   | ODM for MongoDB             |
| JWT        | Authentication tokens       |
| Jest       | Unit testing framework      |
| Supertest  | HTTP assertions for testing |

---

## ⚙️ Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/wajdifadool/NodeJs-backend-Todo-API
cd todo-api

# 2. Install dependencies
npm install

# 3. Create a .env file
cp .env.example .env
# Then update DB and JWT settings in .env

# 4. Run in development
npm run dev

# 5. Run tests
npm test
```

## 🔐 Authentication

All routes require a Bearer token in the Authorization header, except for:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`

Token is issued upon successful login and must be passed like:

```http
Authorization: Bearer <your_token>
```

## 📘 API Endpoints

### 🗂 Todos

| Method | Endpoint              | Access        | Description                           |
| ------ | --------------------- | ------------- | ------------------------------------- |
| POST   | /api/v1/todos         | Authenticated | Create a new todo                     |
| GET    | /api/v1/todos         | Authenticated | Get all todos (owner + collaborators) |
| GET    | /api/v1/todos/:todoId | Owner/Collab  | Get a single todo                     |
| PUT    | /api/v1/todos/:todoId | Owner only    | Update a todo                         |
| DELETE | /api/v1/todos/:todoId | Owner only    | Delete a todo                         |

---

### 👥 Collaborators

| Method | Endpoint                            | Access     | Description                       |
| ------ | ----------------------------------- | ---------- | --------------------------------- |
| POST   | /api/v1/todos/:todoId/collaborators | Owner only | Add a collaborator to a todo      |
| DELETE | /api/v1/todos/:todoId/collaborators | Owner only | Remove a collaborator from a todo |

---

### 🧩 Subtasks

| Method | Endpoint                       | Access             | Description      |
| ------ | ------------------------------ | ------------------ | ---------------- |
| POST   | /api/v1/todos/:todoId/subtasks | Owner/Collaborator | Add a subtask    |
| DELETE | /api/v1/todos/:todoId/subtasks | Owner/Collaborator | Delete a subtask |

## ✅ Testing

This project uses Jest + Supertest for full API coverage.

### Run all tests:

```bash
npm test
```

### Test Files

| File                  | Description                         |
| --------------------- | ----------------------------------- |
| success.test.js       | All positive scenario tests         |
| failure.test.js       | All error & permission denial tests |
| collaborators.test.js | Collaborator-specific scenarios     |

## 🙌 Acknowledgments

This project was built with best practices in mind:

- **RESTful principles**: Adhering to REST principles to ensure a scalable and maintainable API structure.
- **Separation of concerns**: Utilizing controllers and middleware to keep logic clean and well-organized.
- **DRY code style**: Following the "Don't Repeat Yourself" principle to reduce redundancy and improve maintainability.
- **Meaningful test coverage**: Ensuring that the project is well-tested with meaningful test cases to guarantee reliability.

## License

This project is licensed under the MIT License.
