# Express.js MVC Application

A complete Express.js application with MVC architecture, repository pattern, service layer, and Sequelize ORM with SQLite database. Includes automatic migration generation and file upload capabilities.

## Project Structure

```
├── .env                   # Environment variables
├── .gitignore            # Git ignore file
├── package.json          # Project dependencies and scripts
├── src/                  # Source code
│   ├── app.js            # Main application file
│   ├── config/           # Configuration files
│   │   └── database.js   # Database configuration
│   ├── controllers/      # Controllers (handle HTTP requests)
│   │   ├── base.controller.js
│   │   ├── index.js
│   │   └── user.controller.js
│   ├── middlewares/      # Middleware functions
│   │   ├── index.js
│   │   └── validate.middleware.js
│   ├── models/           # Sequelize models
│   │   ├── index.js
│   │   └── user.model.js
│   ├── repositories/     # Repository pattern implementation
│   │   ├── base.repository.js
│   │   ├── index.js
│   │   └── user.repository.js
│   ├── routes/           # Express routes
│   │   ├── index.js
│   │   └── user.routes.js
│   ├── services/         # Business logic services
│   │   ├── base.service.js
│   │   ├── index.js
│   │   └── user.service.js
│   └── utils/            # Utility functions
│       └── error-handler.js
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Create a `.env` file based on the `.env.example` file
4. Start the development server

```bash
npm run dev
```

## API Endpoints

### Users

- `GET /api/users` - Get all users
- `GET /api/users/active` - Get active users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

## Architecture

### MVC Pattern

- **Models**: Sequelize models representing database tables
- **Views**: Not applicable (API only)
- **Controllers**: Handle HTTP requests and responses

### Repository Pattern

Repositories abstract the data access layer, making it easier to switch between different data sources if needed.

### Service Layer

Services contain business logic and act as an intermediary between controllers and repositories.

## Database

This project uses SQLite with Sequelize ORM. The database file is created automatically when you start the application.

## Automatic Migrations

This project includes an automatic migration system that allows you to generate migrations by simply modifying your model files.

### How to Use

1. Make changes to your model file (e.g., add a new field, change a field type, etc.)
2. Run the migration generator for that specific model:

```powershell
# Using PowerShell script (recommended)
.\migrate-model.ps1 -ModelName user

# Or using npm scripts directly
npm run generate:migration -- user
npm run migrate
```

3. The system will automatically:
   - Compare your model with the current database schema
   - Generate the appropriate migration file
   - Apply the migration to update the database

### Available Commands

- `npm run generate:migration -- <model-name>` - Generate a migration for a specific model
- `npm run migrate` - Run all pending migrations
- `npm run migrate:undo` - Undo the most recent migration
- `npm run migrate:undo:all` - Undo all migrations

## File Upload System

This project includes a comprehensive file upload system that supports:

- Single file uploads
- Multiple file uploads
- Multi-field file uploads
- Type-specific handling (images, documents, videos, audio)

### API Endpoints

- `POST /api/files/upload/single` - Upload a single file
- `POST /api/files/upload/multiple` - Upload multiple files
- `POST /api/files/upload/fields` - Upload files to multiple fields
- `POST /api/files/upload/image` - Upload a single image
- `POST /api/files/upload/images` - Upload multiple images
- `POST /api/files/upload/document` - Upload a single document
- `POST /api/files/upload/documents` - Upload multiple documents
- `DELETE /api/files/delete` - Delete a file

## License

MIT
