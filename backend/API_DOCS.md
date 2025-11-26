# Backend API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Admin Routes (Protected/Admin Only)

### Get All Users
```http
GET /admin/users
```

### Delete User
```http
DELETE /admin/users/:id
```

---

## User Routes

### Register User
```http
POST /users
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "gender": "male" 
}
```
*Note: `gender` must be either "male" or "female".*

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "gender": "male",
  "token": "jwt_token"
}
```

### Login User
```http
POST /users/login
```

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "token": "jwt_token"
}
```

### Verify Email
```http
POST /users/verify-email
```

**Body:**
```json
{
  "token": "verification_token"
}
```

### Forgot Password
```http
POST /users/forgot-password
```

**Body:**
```json
{
  "email": "john@example.com"
}
```

### Reset Password
```http
POST /users/reset-password
```

**Body:**
```json
{
  "token": "reset_token",
  "password": "new_password123"
}
```

---

## Timer Routes (Protected)

### Get Active Timer
```http
GET /timers/active
```

**Response:**
```json
{
  "_id": "timer_id",
  "user": "user_id",
  "description": "Focus Session",
  "startTime": "2024-01-01T10:00:00Z",
  "status": "running",
  "tags": ["work"]
}
```

### Start Timer
```http
POST /timers/start
```

**Body:**
```json
{
  "description": "Focus Session",
  "tags": ["work", "project"]
}
```

### Pause Timer
```http
PUT /timers/pause
```

### Resume Timer
```http
PUT /timers/resume
```

### Stop Timer
```http
PUT /timers/stop
```

---

## Task Routes (Protected)

### Get All Tasks
```http
GET /tasks
```

**Query Parameters:**
- `status` (optional): Filter by status (Todo, In Progress, Done)

### Create Task
```http
POST /tasks
```

**Body:**
```json
{
  "title": "Complete project",
  "description": "Finish the documentation",
  "status": "Todo",
  "priority": "High",
  "dueDate": "2024-01-15",
  "subtasks": ["Write README", "Add examples"]
}
```

### Update Task
```http
PUT /tasks/:id
```

### Delete Task
```http
DELETE /tasks/:id
```

---

## Job Routes (Protected)

### Get All Jobs
```http
GET /jobs
```

### Create Job
```http
POST /jobs
```

**Body:**
```json
{
  "company": "Tech Corp",
  "role": "Software Engineer",
  "status": "Applied",
  "location": "Remote",
  "salary": "100000",
  "link": "https://example.com/job",
  "dateApplied": "2024-01-01",
  "notes": "Applied through LinkedIn"
}
```

---

## Note Routes (Protected)

### Get All Notes
```http
GET /notes
```

### Create Note
```http
POST /notes
```

**Body:**
```json
{
  "title": "Meeting Notes",
  "content": "Discussed project timeline",
  "tags": ["meeting", "project"],
  "isPinned": false,
  "color": "#FFE5B4"
}
```

---

## Finance Routes (Protected)

### Get Transactions
```http
GET /transactions
```

**Query Parameters:**
- `startDate` (optional): Filter from date
- `endDate` (optional): Filter to date
- `type` (optional): Income or Expense
- `category` (optional): Filter by category

### Create Transaction
```http
POST /transactions
```

**Body:**
```json
{
  "type": "Expense",
  "category": "Food",
  "amount": 50.00,
  "date": "2024-01-01",
  "description": "Lunch",
  "paymentMethod": "Credit Card"
}
```

### Get Monthly Stats
```http
GET /transactions/monthly-stats?month=2024-01
```

### Get Budgets
```http
GET /budgets
```

### Set Budget
```http
POST /budgets
```

**Body:**
```json
{
  "category": "Food",
  "monthlyLimit": 500,
  "month": "2024-01"
}
```

---

## Habit Routes (Protected)

### Get All Habits
```http
GET /habits
```

### Create Habit
```http
POST /habits
```

**Body:**
```json
{
  "name": "Morning Exercise",
  "frequency": "daily",
  "color": "#4CAF50"
}
```

### Toggle Habit Completion
```http
POST /habits/:id/toggle
```

**Body:**
```json
{
  "date": "2024-01-01"
}
```

---

## AI Routes (Protected)

### Generate Daily Plan
```http
POST /ai/daily-plan
```

**Response:**
```json
{
  "plan": "AI-generated daily plan text...",
  "generatedAt": "2024-01-01T10:00:00Z"
}
```

### Get Task Suggestions
```http
POST /ai/task-suggestions
```

### Get Habit Insights
```http
POST /ai/habit-insights
```

---

## Sync Routes (Protected)

### Get Sync Status
```http
GET /sync/status?lastSync=2024-01-01T00:00:00Z
```

**Response:**
```json
{
  "lastSync": "2024-01-01T00:00:00Z",
  "serverTime": "2024-01-02T10:00:00Z",
  "pendingChanges": {
    "tasks": 5,
    "notes": 2,
    "habits": 1,
    "transactions": 3,
    "total": 11
  }
}
```

### Bulk Sync
```http
POST /sync/bulk
```

**Body:**
```json
{
  "lastSync": "2024-01-01T00:00:00Z"
}
```

**Response:**
```json
{
  "syncTime": "2024-01-02T10:00:00Z",
  "data": {
    "tasks": [...],
    "notes": [...],
    "habits": [...],
    "transactions": [...]
  },
  "counts": {
    "tasks": 5,
    "notes": 2,
    "habits": 1,
    "transactions": 3
  }
}
```

---

## Summary Routes (Protected)

### Get Daily Stats
```http
GET /summary/daily
```

**Response:**
```json
{
  "totalWorkSeconds": 28800,
  "totalBreakSeconds": 3600,
  "productivityScore": 85,
  "completedTasks": 5
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Not authorized, no token"
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Server error message"
}
```
