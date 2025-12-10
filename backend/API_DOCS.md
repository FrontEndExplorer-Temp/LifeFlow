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

### Create AI Key
```http
POST /admin/ai-keys
```

### Get AI Keys
```http
GET /admin/ai-keys
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

### Get User Profile
```http
GET /users/profile
```

### Update User Profile
```http
PUT /users/profile
```

### Get User Statistics
```http
GET /users/stats
```

### Get Dashboard Data
```http
GET /users/dashboard/:date
```
*   `date`: YYYY-MM-DD format

### OAuth (Google)
```http
GET /users/auth/google?platform=web|android
```

---

## Task Routes (Protected)

### Get All Tasks
```http
GET /tasks
```
**Query Parameters:**
*   `status`: Filter by status (e.g., 'Backlog', 'Today')

### Create Task
```http
POST /tasks
```
**Body:**
```json
{
  "title": "Task Title",
  "description": "Optional description",
  "priority": "Medium",
  "dueDate": "2024-12-31",
  "tags": ["work"],
  "subtasks": ["Subtask 1"]
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

## Timer Routes (Protected)

### Get Active Timer
```http
GET /timers/active
```

### Start Timer
```http
POST /timers/start
```
**Body:**
```json
{
  "description": "Focus Session",
  "tags": ["work"]
}
```

### Pause Timer
```http
POST /timers/pause
```

### Resume Timer
```http
POST /timers/resume
```

### Stop Timer
```http
POST /timers/stop
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
  "content": "Detailed content...",
  "tags": ["meeting"],
  "color": "#ffffff",
  "isPinned": false
}
```

### Update Note
```http
PUT /notes/:id
```

### Delete Note
```http
DELETE /notes/:id
```

---

## AI Routes (Protected)

### Generate Daily Plan
```http
POST /ai/daily-plan
```

### Get Task Suggestions
```http
POST /ai/task-suggestions
```

### Get Habit Insights
```http
POST /ai/habit-insights
```

### Task Breakdown
```http
POST /ai/breakdown
```
**Body:**
```json
{
  "taskId": "optional_id",
  "taskTitle": "Build a website"
}
```

### Finance Insights
```http
POST /ai/finance-insights
```

### Summarize Note
```http
POST /ai/summarize-note
```
**Body:**
```json
{
  "content": "Long note content..."
}
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

### Update Job
```http
PUT /jobs/:id
```

### Delete Job
```http
DELETE /jobs/:id
```

---

## Skill Routes (Protected)

### Get All Skills
```http
GET /skills
```

### Create Skill
```http
POST /skills
```

### Update Skill
```http
PUT /skills/:id
```

### Delete Skill
```http
DELETE /skills/:id
```

### Generate Roadmap (AI)
```http
POST /skills/:id/roadmap
```

---

## Finance Routes (Protected)

### Get Transactions
```http
GET /transactions
```

### Create Transaction
```http
POST /transactions
```

### Get Budgets
```http
GET /budgets
```

### Set Budget
```http
POST /budgets
```

---

## Habit Routes (Protected)

### Get Habits
```http
GET /habits
```

### Create Habit
```http
POST /habits
```

### Toggle Completion
```http
POST /habits/:id/toggle
```

---

## Sync Routes (Protected)

### Get Sync Status
```http
GET /sync/status
```

### Bulk Sync
```http
POST /sync/bulk
```

---

## Summary Routes (Protected)

### Get Daily Summary
```http
GET /summary/daily
```
