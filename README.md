# G-Score Backend API

A Node.js/TypeScript backend application for managing and analyzing Vietnamese high school exam scores (THPT). This API provides endpoints for importing CSV data, retrieving student information, and generating statistical reports.

## 🚀 Features

- **CSV Data Import**: Bulk import student exam scores from CSV files
- **Student Lookup**: Find students by registration number
- **Group Analysis**: Get top 10 students by subject groups (A/B)
- **Score Distribution**: Analyze score ranges for specific subjects
- **Database Migrations**: Structured database schema management
- **Data Seeding**: Sample data for testing and development

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18+ recommended)
- **PostgreSQL** (v12+ recommended)
- **npm** or **yarn** package manager

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/notDuyLam/G-Score-backend
cd G-Score-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (Development)
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=score_app

# Production Database (for deployment)
DATABASE_URL=postgresql://username:password@host:port/database
FRONTEND_URL=http://localhost:5173
```

### 4. Database Setup

Create the PostgreSQL database:

```sql
CREATE DATABASE score_app;
```

Run migrations to create tables:

```bash
npm run migrate
```

### 5. Seed Sample Data (Optional)

```bash
# Seed with sample data
npm run seed
```

## 🏃‍♂️ Running the Application

### Development Mode

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Build

```bash
# Build TypeScript
npm run build

# Start production server
npm start
```

## 📡 API Endpoints

### Base URL: `http://localhost:3000/api`

| Method | Endpoint           | Description                         |
| ------ | ------------------ | ----------------------------------- |
| `GET`  | `/`                | Health check                        |
| `GET`  | `/:regNumber`      | Find student by registration number |
| `GET`  | `/group/:group`    | Get top 10 students by group (A/B)  |
| `GET`  | `/counts/:subject` | Get score distribution for subject  |

### Example Requests

#### 1. Find Student by Registration Number

```bash
GET /api/01000001
```

#### 2. Get Top 10 Group A Students

```bash
GET /api/group/A
```

#### 3. Get Score Distribution for Math

```bash
GET /api/counts/toan
```

## 🗂️ Project Structure

```
src/
├── config/
│   ├── config.js          # Database configuration
│   └── db.ts              # Sequelize connection
├── controllers/
│   └── student.controllers.ts  # API logic
├── models/
│   └── student.model.ts   # Student data model
├── routes/
│   └── student.routes.ts  # API routes
├── migrations/
│   └── *.js              # Database migrations
├── seeders/
│   └── *.js              # Data seeders
└── assets/
    └── diem_thi_thpt_2024.csv  # Sample CSV data
```

## 🗄️ Database Schema

### Student Table

| Column         | Type   | Description                               |
| -------------- | ------ | ----------------------------------------- |
| `sbd`          | STRING | Student registration number (Primary Key) |
| `toan`         | FLOAT  | Math score                                |
| `ngu_van`      | FLOAT  | Literature score                          |
| `ngoai_ngu`    | FLOAT  | Foreign language score                    |
| `vat_li`       | FLOAT  | Physics score                             |
| `hoa_hoc`      | FLOAT  | Chemistry score                           |
| `sinh_hoc`     | FLOAT  | Biology score                             |
| `lich_su`      | FLOAT  | History score                             |
| `dia_li`       | FLOAT  | Geography score                           |
| `gdcd`         | FLOAT  | Civic education score                     |
| `ma_ngoai_ngu` | STRING | Foreign language code                     |

## 📊 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build TypeScript to JavaScript
npm start              # Start production server

# Database
npm run migrate        # Run database migrations
npm run migrate:undo   # Undo last migration
npm run seed          # Run all seeders
npm run seed:undo     # Undo last seeder

# Utilities
npm test              # Run tests (if configured)
```

## 🌐 Deployment

### Deploy to Render

1. **Create PostgreSQL Database**

   - Go to [Render Dashboard](https://dashboard.render.com)
   - Create new PostgreSQL service
   - Copy the External Database URL

2. **Create Web Service**

   - Connect your GitHub repository
   - Configure build settings:
     ```
     Build Command: npm install && npm run build
     Start Command: npm start
     ```

3. **Environment Variables**

   ```
   NODE_ENV=production
   DATABASE_URL=<your-postgresql-url>
   FRONTEND_URL=<your-frontend-url>
   ```

4. **Deploy**
   - Push to your main branch
   - Render will automatically build and deploy

## 📁 CSV Data Format

The application expects CSV files with the following columns:

```csv
sbd,toan,ngu_van,ngoai_ngu,vat_li,hoa_hoc,sinh_hoc,lich_su,dia_li,gdcd,ma_ngoai_ngu
01000001,8.4,6.75,8.0,6.0,5.25,5.0,,,,"N1"
01000002,8.6,8.5,7.2,,,,,7.25,6.0,8.0,"N1"
```

### Logs

Check application logs for detailed error information:

```bash
# Development
npm run dev

# Production
npm start
```
