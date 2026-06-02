# Developer Agent Guidelines (AGENTS.md)

## 1. Architecture & Ports
* **Backend (Root)**: Spring Boot (Java 17, Maven). Runs on port `8008`.
  * Database: MySQL (`ai_interview`, password: `241105`)
  * Redis: `localhost:6379`, password: `241105`
* **Frontend (`/frontend`)**: React 19 + TypeScript + Vite. Runs on port `5173`. Proxies `/api` to `http://localhost:8008`.

## 2. Developer Commands
* **Backend (Root)**:
  * Start: `.\mvnw spring-boot:run`
  * Test: `.\mvnw test`
  * Package: `.\mvnw clean package`
* **Frontend (`/frontend`)**:
  * Dev: `npm run dev`
  * Build: `npm run build`
  * Lint: `npm run lint`

## 3. Core Technical Quirks & Conventions
* **Authentication**: Use Sa-Token (`StpUtil.getLoginIdAsLong()`). Do not pass `userId` as a query parameter or inside request bodies for authenticated endpoints.
* **Double-Layer Idempotence**:
  * Memory: Redis `setIfAbsent` lock on key `submit:idempotent:{userId}:{submitToken}` (10 min expiry).
  * Storage: MySQL unique constraint `uk_user_submit_token(user_id, submit_token)` as a hard fallback.
  * Frontend must supply a new `submitToken` on load and rotate it immediately after submission.
* **Redis ZSet Rate Limiter**:
  * Sliding window key: `rate_limit:submit:{userId}` (limit 5 requests/60s).
  * Score is current millisecond timestamp.
  * Member **must** be a unique UUID (`UUID.randomUUID().toString()`) to prevent concurrent score overwrites on matching milliseconds.
* **Precision Handling**: Always use `BigDecimal` for scores and correct rates. Compare using `.compareTo()` instead of standard comparison operators.
* **Security & Cheating Prevention**: The `/api/questions/{questionId}` details endpoint must NEVER return correct answers or analysis. Correct answers are returned only *after* submission via `/api/submits`.
* **Global Error Wrapping**: Custom or unhandled errors are unified to `BaseResponse` with code `50000` (Internal Error) or specific codes (`40100` for login, `40900` for duplicates) by `GlobalExceptionHandler`. Do not return raw exceptions/stack traces to the client.

## 4. Troubleshooting & Operational Gotchas
* **Stuck Backend Process**: If the port `8008` is occupied, kill the process:
  * PowerShell: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8008).OwningProcess -Force`
  * Bash: `kill -9 $(lsof -t -i:8008)`
* **Redis NOAUTH**: Local Redis requires authentication. Configure password `241105` in `application.yml`.
* **PowerShell Chinese Encoding**: Standard PowerShell output might show corrupted Chinese characters for API text. Trust real HTTP client responses (Postman/Apifox) rather than stdout print logs.
