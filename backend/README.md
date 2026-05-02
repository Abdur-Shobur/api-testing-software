# API Test Runner — Express.js + TypeScript

A REST API backend that lets you define, save, and run API test cases with detailed assertion results.

---

## Quick Start

```bash
npm install
npm run dev        # development (hot-reload)
npm run build && npm start   # production
```

Server starts at **http://localhost:4000** (override with `PORT=` env var).  
Test data is saved to `./data/collections.json` (override with `DATA_DIR=`).

---

## Concepts

| Term | Description |
|---|---|
| **Collection** | A named group of test cases (like a Postman collection / test suite) |
| **Test Case** | A single API call with a request definition + expected response |
| **Run** | Execute one test or a whole collection and compare actual vs expected |

---

## API Reference

### Health

```
GET /health
```

---

### Collections

| Method | Path | Description |
|---|---|---|
| GET | `/collections` | List all collections |
| POST | `/collections` | Create a collection |
| GET | `/collections/:id` | Get one collection (with all test cases) |
| PATCH | `/collections/:id` | Update name/description |
| DELETE | `/collections/:id` | Delete collection + all its tests |

#### Create Collection

```json
POST /collections
{
  "name": "User Service Tests",
  "description": "All tests for the user microservice"
}
```

---

### Test Cases

| Method | Path | Description |
|---|---|---|
| GET | `/collections/:cId/tests` | List test cases in collection |
| POST | `/collections/:cId/tests` | Add a test case |
| GET | `/collections/:cId/tests/:tId` | Get one test case |
| PATCH | `/collections/:cId/tests/:tId` | Update a test case |
| DELETE | `/collections/:cId/tests/:tId` | Delete a test case |

#### Create Test Case — Full Example

```json
POST /collections/:collectionId/tests
{
  "name": "Get user by ID — happy path",
  "description": "Should return a 200 with user object",

  "request": {
    "method": "GET",
    "url": "https://jsonplaceholder.typicode.com/users/1",
    "headers": [
      { "key": "Accept", "value": "application/json", "enabled": true }
    ],
    "queryParams": [],
    "timeoutMs": 8000
  },

  "expectedResponse": {
    "status": 200,
    "headers": [
      { "key": "Content-Type", "value": "application/json", "enabled": true }
    ],
    "body": {
      "mode": "contains",
      "content": "{\"id\": 1, \"name\": \"Leanne Graham\"}"
    }
  }
}
```

#### Body Match Modes

| Mode | Behaviour |
|---|---|
| `exact` | Actual body must deep-equal expected |
| `contains` | Actual body must contain all keys/values from expected (deep) |
| `schema` | Actual body must have same keys and value **types** as expected |
| `ignore` | Body is not checked |

---

### Running Tests

#### Run a single test case

```
POST /run/:collectionId/:testId
```

Optional body to override request fields at runtime:
```json
{
  "request": {
    "url": "https://staging.example.com/users/1"
  }
}
```

#### Run an entire collection

```
POST /run/:collectionId
```

---

## Response Shapes

### Single Test Result

```json
{
  "data": {
    "testCaseId": "abc-123",
    "testCaseName": "Get user — happy path",
    "status": "pass",           // "pass" | "fail" | "error"
    "durationMs": 213,
    "request": { "method": "GET", "url": "..." },
    "actual": {
      "status": 200,
      "headers": { "content-type": "application/json; charset=utf-8" },
      "body": { "id": 1, "name": "Leanne Graham", ... }
    },
    "assertions": [
      {
        "field": "status",
        "status": "pass",
        "expected": 200,
        "actual": 200,
        "message": "Status 200 matches expected 200"
      },
      {
        "field": "body.id",
        "status": "pass",
        "expected": 1,
        "actual": 1,
        "message": "Value matches"
      }
    ]
  }
}
```

### Collection Run Summary

```json
{
  "data": {
    "collectionId": "...",
    "collectionName": "User Service Tests",
    "runAt": "2026-05-02T10:00:00.000Z",
    "totalTests": 5,
    "passed": 4,
    "failed": 1,
    "errored": 0,
    "durationMs": 1423,
    "results": [ ...TestCaseResult[] ]
  }
}
```

---

## Project Structure

```
src/
├── index.ts          # Entry point
├── app.ts            # Express app + middleware
├── types/
│   └── index.ts      # All TypeScript interfaces
├── store/
│   └── index.ts      # File-based JSON persistence
├── runner/
│   └── index.ts      # HTTP execution + assertion engine
└── routes/
    ├── collections.ts # Collection + TestCase CRUD
    └── run.ts         # Run endpoints
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Server port |
| `DATA_DIR` | `./data` | Directory for JSON storage |
