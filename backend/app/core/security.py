"""Security headers and payload protection middleware."""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse, Response
from backend.app.core.config import settings


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adds hardened security headers to every HTTP response."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), camera=(), geolocation=(), gyroscope=(), "
            "magnetometer=(), microphone=(), payment=(), usb=()"
        )
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "img-src 'self' data:; "
            "style-src 'self' 'unsafe-inline'; "
            "script-src 'self'; "
            "connect-src 'self' http://localhost:* http://127.0.0.1:*;"
        )
        response.headers["X-Demonstration-Mode"] = "CarePulse-Synthetic-Educational-Only"
        return response


class ContentLengthLimitMiddleware(BaseHTTPMiddleware):
    """Rejects incoming requests exceeding maximum allowed body size to mitigate DoS."""

    async def dispatch(self, request: Request, call_next) -> Response:
        content_length = request.headers.get("content-length")
        if content_length:
            try:
                length = int(content_length)
                if length > settings.MAX_REQUEST_BODY_BYTES:
                    return JSONResponse(
                        status_code=413,
                        content={
                            "detail": f"Payload too large. Maximum allowed size is {settings.MAX_REQUEST_BODY_BYTES} bytes.",
                            "error_code": "PAYLOAD_TOO_LARGE",
                        },
                    )
            except ValueError:
                return JSONResponse(
                    status_code=400,
                    content={
                        "detail": "Invalid Content-Length header.",
                        "error_code": "INVALID_CONTENT_LENGTH",
                    },
                )
        return await call_next(request)
