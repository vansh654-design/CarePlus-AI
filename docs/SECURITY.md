# Security & Privacy Policy — CarePulse AI

## 1. Intended Purpose and Educational Scope

**CarePulse AI** is developed solely as an educational demonstration and hackathon submission for the **AI/ML in Healthcare** challenge.

It is designed to run locally in a demonstration environment. **It is NOT certified, authorized, or approved for use with real patient records or protected health information (PHI).**

---

## 2. Privacy & Data Handling Protections

The software enforces several built-in privacy safeguards:

1. **Exclusively Synthetic Records**: All patient identifiers (`DEMO-001` through `DEMO-014`), clinical values, admission timestamps, and notes are mathematically generated synthetic fixtures.
2. **Stateless Assessment API**: The `POST /api/v1/assessments` endpoint performs live model inference in memory and returns results immediately. Assessment request payloads are **never persisted to disk, stored in a database, or cached in browser localStorage**.
3. **No Sensitive Telemetry Logging**: Raw vital sign inputs and patient payloads are not logged to stdout, syslog, or disk log files.
4. **No External API Dependencies**: The application does not transmit data to external third-party AI APIs, cloud LLMs, or tracking services. All machine learning inference runs locally within the Python process.
5. **No Tracked Secrets**: The repository contains no API keys, private certificates, passwords, database credentials, or secret tokens.

---

## 3. Application Security Controls

### 3.1 Input Validation & Numerical Sanitization
- Strict Pydantic models enforce domain boundaries for all numerical inputs (e.g. Heart Rate: 30–260 bpm, SpO2: 50–100%).
- Non-finite numbers (`NaN`, `+Infinity`, `-Infinity`) and malformed strings are intercepted and rejected with HTTP 422 Unprocessable Entity.

### 3.2 DoS & Payload Limiting
- `ContentLengthLimitMiddleware` enforces a strict 256 KB maximum request body size, preventing memory exhaustion attacks via oversized payloads.

### 3.3 Security Headers
Every HTTP response emitted by the backend includes hardened security headers:
- `X-Content-Type-Options: nosniff` — Prevents MIME-type sniffing.
- `X-Frame-Options: DENY` — Prevents clickjacking attacks.
- `X-XSS-Protection: 1; mode=block` — Enables browser XSS filters.
- `Referrer-Policy: strict-origin-when-cross-origin` — Protects referrer leakage.
- `Content-Security-Policy: default-src 'self'; ...` — Restricts script and resource loading.
- `Permissions-Policy: ...` — Disables camera, microphone, geolocation, and payment APIs.

### 3.4 Safe Error Handling
- Application exception handlers intercept unhandled errors and return sanitized JSON responses (`INTERNAL_SERVER_ERROR`).
- Internal stack traces, local file system paths, environment variables, and module internals are never returned to clients.

---

## 4. Missing Production Safeguards (Pre-Production Disclaimer)

Because CarePulse AI is an educational demonstration without patient authentication, any hypothetical real-world clinical deployment would require substantial additional security and compliance infrastructure:

| Safeguard | Current Status | Required for Production Clinical Deployment |
| :--- | :--- | :--- |
| **Authentication & IAM** | Disabled for Demo | Multi-factor authentication (MFA), OAuth2 / OIDC, SSO |
| **Role-Based Access Control** | None (Single User Demo) | Granular RBAC (Physician, Nurse, Auditor, Admin) |
| **Audit Trails** | Ephemeral | Immutable, tamper-evident audit logging (HIPAA § 164.312(b)) |
| **Data Encryption at Rest** | N/A (Stateless) | AES-256 encrypted datastores and database volume encryption |
| **Data Encryption in Transit** | HTTP (Localhost) | TLS 1.3 encryption with strict HSTS and valid CA certificates |
| **EHR Standards** | Custom JSON | HL7 FHIR v4 integration and SMART-on-FHIR launch protocols |
| **Regulatory Clearance** | None | FDA 510(k) SaMD (Software as a Medical Device) or CE mark clearance |

**The application does NOT claim HIPAA compliance, GDPR compliance, or any official medical device certification.**

---

## 5. Dependency Management

- Python packages in `backend/requirements.txt` are explicitly pinned to stable versions with compatible dependencies.
- Frontend packages in `frontend/package.json` are tracked with an exact `package-lock.json` file.
- Routine dependency updates should be screened using automated vulnerability scanners (`npm audit`, `pip-audit`).

---

## 6. Reporting a Security Vulnerability

If you discover a security vulnerability in this project, please report it responsibly by opening a private GitHub security advisory or contacting the maintainers directly. Do not open public issues for sensitive vulnerabilities until a fix has been prepared.
