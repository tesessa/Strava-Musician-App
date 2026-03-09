---
name: python-integration-with-next-backend
overview: Add a clean, testable way for the Next.js backend handlers to invoke an existing Python script, aligned with the Koda backend architecture.
todos:
  - id: prep-python
    content: Normalize the Python script interface (CLI/JSON in/out) and place it under apps/backend/python/.
    status: pending
  - id: python-runner
    content: Implement a reusable pythonRunner utility in apps/backend/src/utils that executes the script with timeout and JSON parsing.
    status: pending
  - id: python-service
    content: Create or extend a backend service to wrap pythonRunner and expose typed methods for handlers.
    status: pending
  - id: handler-integration
    content: Wire the new service into a Next.js route handler, following the existing handlers/services pattern.
    status: pending
  - id: runtime-config
    content: Ensure Node runtime for relevant routes and configure env vars for Python path and script location.
    status: pending
  - id: tests-verification
    content: Add basic tests for pythonRunner and the service, and verify the new endpoint locally.
    status: pending
isProject: false
---

### Goal

Integrate your existing Python script into the `apps/backend` Next.js API so that a handler (via a service) can invoke it, without breaking the handlers → services → DAOs layering.

### High-level approach

- **Keep Python as a local helper** in the same dev environment (since you’re local-only right now) and invoke it from Node using `child_process`.
- **Hide the Python call behind a service-layer abstraction**, so handlers still only talk to services, and you can later swap the implementation to an HTTP microservice or queue worker if/when you deploy.
- Ensure we **only use the Node.js runtime** for any route that touches Python (no Edge), and add **timeouts + structured error handling** so a misbehaving script doesn’t hang requests.

### Implementation plan

- **1. Clarify and prepare the Python script**
  - Put your Python script in a clear backend-friendly location (for example `apps/backend/python/your_script.py`).
  - Make sure it exposes a simple command-line interface: read JSON or arguments from stdin/argv and print JSON to stdout (e.g. `python your_script.py '{"some":"input"}'`).
  - Document, in comments or a short README note, what inputs it expects and what JSON shape it outputs so the Node side can validate.
- **2. Add a Node-side Python runner utility**
  - In the backend, add a small utility module (for example `[apps/backend/src/utils/pythonRunner.ts](apps/backend/src/utils/pythonRunner.ts)`) that:
    - Uses `child_process.spawn` or `execFile` to invoke `python` with the script path and arguments.
    - Enforces a configurable timeout (e.g. via `Promise.race` or `AbortController`).
    - Collects `stdout` and `stderr`, parses `stdout` as JSON, and maps failures (non-zero exit code, parse errors, timeout) to typed error objects.
  - Make the script path and optional Python executable name configurable via env vars (e.g. `PYTHON_EXECUTABLE`, `PYTHON_SCRIPT_PATH`) so it’s easy to adjust later.
- **3. Create a dedicated service that uses Python**
  - Following the existing pattern (`UserService`, etc.), add a new service file for this feature, for example `[apps/backend/src/api/services/pythonIntegrationService.ts](apps/backend/src/api/services/pythonIntegrationService.ts)`.
  - In that service:
    - Define TypeScript types that describe the input to the Python script and the expected output.
    - Call the `pythonRunner` utility and translate its results into the domain model you want to expose to handlers.
    - Map Python-level errors into service-layer errors (e.g. distinguish between “bad input”, “internal Python failure”, “timeout”).
  - If the Python work is related to an existing domain (e.g. Sessions, Events), integrate it into the appropriate existing service instead of a generic one.
- **4. Expose the functionality from a handler via the existing pattern**
  - Identify or create the relevant handler file, similar to `[apps/backend/src/api/handlers/userHandlers.ts](apps/backend/src/api/handlers/userHandlers.ts)`.
  - In that handler:
    - Authenticate as usual with `authenticateToken` / `authenticateTokenToUserId` if needed.
    - Parse and validate the incoming request body (the data you’ll send to Python).
    - Call the new service method, await the result, and return `NextResponse.json` with a clear response shape.
    - Translate timeouts or Python failures into appropriate HTTP statuses (e.g. `408`/`504` or `500`) and error codes.
- **5. Ensure proper Next.js runtime and config**
  - For any route file under `apps/backend/app` that will call Python, ensure it’s marked to use the Node runtime (e.g. `export const runtime = "nodejs";` in the route file if needed by your Next.js setup).
  - Confirm that the backend dev script (`npm run dev -w apps/backend`) runs in an environment where `python` is available on the PATH.
  - Add the new env vars to your backend `.env` / config, and (optionally) document them in your project docs.
- **6. Add basic tests and local verification**
  - Write a unit test for the `pythonRunner` utility that:
    - Invokes a tiny test Python script (or a stub) and asserts correct JSON parsing and error handling.
  - Add a service-level test that mocks `pythonRunner` and verifies that your service correctly maps the Python result to your domain types.
  - Manually hit the new API endpoint in local dev (via curl or your frontend) to confirm that:
    - Valid inputs return the expected JSON from the Python script.
    - Script errors, timeouts, or invalid outputs result in well-formed HTTP error responses.
- **7. Optional future-proofing for deployment**
  - Document an alternative deployment-ready design where the Python logic is hosted as a separate microservice (e.g. FastAPI/Flask) and the Node service calls it over HTTP instead of `child_process`.
  - Keep your service interface (function names/signatures) stable so you can later swap the implementation from local process-exec to HTTP call without changing handlers.
