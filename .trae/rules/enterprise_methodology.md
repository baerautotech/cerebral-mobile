---
description: Enterprise methodology standards for production-grade development across all languages
globs: **/*.py, **/*.ts, **/*.tsx, **/*.java, **/*.go, backend-python/**, microservices/**
alwaysApply: true
---

# 🏢 ENTERPRISE METHODOLOGY STANDARDS

**Universal standards for production-grade code across all programming languages**

---

## 🚨 MANDATORY PRINCIPLES (ZERO TOLERANCE)

These principles apply to **ALL** code written for Cerebral Platform:

- **Single Responsibility Principle (SRP)**: Every class, function, and module has exactly ONE clear purpose
  - Maximum 10 methods per class
  - Maximum 50 lines per function
  - Maximum 3 responsibilities per class

- **Dependency Injection**: All dependencies MUST be injected, never hard-coded
  - Use framework-specific patterns (FastAPI `Depends`, Spring `@Autowired`, etc.)
  - No direct instantiation of external services

- **Performance Monitoring**: All business logic MUST include performance monitoring
  - Target: <200ms for 95th percentile
  - Use decorators/middleware for automatic tracking
  - Record service name, operation, duration, and status

- **Circuit Breaker Pattern**: All external service calls MUST be protected
  - Failure threshold: 5 failures in 60 seconds
  - Timeout: 30 seconds before HALF_OPEN attempt
  - Success threshold: 3 consecutive successes to close

- **Enterprise Observability**: Comprehensive logging, monitoring, and tracing required
  - Structured logging with context (tenant_id, user_id, request_id)
  - JSON output for ELK stack integration
  - Real-time alerts for failures

---

## 🐍 PYTHON/FASTAPI IMPLEMENTATION

### Dependency Injection Requirements

```python
# ✅ REQUIRED: Use FastAPI Depends() for dependency injection
from fastapi import Depends, FastAPI
from typing import Annotated

async def get_database() -> Database:
    """Dependency provider"""
    return await Database.connect()

class UserService(BaseEnterpriseService):
    def __init__(
        self,
        db: Annotated[Database, Depends(get_database)],
        logger: StructuredLogger = Depends(get_logger)
    ):
        self.db = db
        self.logger = logger
        self.monitor = PerformanceMonitor()

# ❌ FORBIDDEN: Hard-coded instantiation
class UserService:
    def __init__(self):
        self.db = DatabaseConnection()  # VIOLATION: No dependency injection
        self.logger = logging.getLogger(__name__)  # VIOLATION: Direct instantiation
```

### Performance Monitoring

```python
# ✅ REQUIRED: Use @performance_monitor decorator or context manager
@performance_monitor(service_name="user_service", operation="create_user")
async def create_user(self, user_data: dict) -> User:
    """Create user with automatic performance tracking"""
    async with self.monitor.track("user_creation", {"tenant_id": self.tenant_id}):
        return await self._create_impl(user_data)

# ✅ REQUIRED: Manual tracking for complex operations
async def process_batch(self, items: list):
    """Process items with context tracking"""
    with self.monitor.track("batch_processing", {"item_count": len(items)}):
        for item in items:
            await self._process_item(item)

# ❌ FORBIDDEN: Business logic without monitoring
async def create_user(self, user_data: dict) -> User:
    return await self._create_impl(user_data)  # VIOLATION: No monitoring
```

### Circuit Breaker Protection

```python
# ✅ REQUIRED: Protect all external service calls
async def call_external_api(self, data: dict) -> dict:
    """Call external service with circuit breaker protection"""
    return await self.circuit_breaker.call(
        external_api.process,
        data,
        operation_name="external_api_process"
    )

# ✅ REQUIRED: Handle circuit breaker states
async def get_user_enrichment(self, user_id: str) -> dict:
    """Get enrichment data with fallback"""
    try:
        return await self.circuit_breaker.call(enrichment_service.get, user_id)
    except CircuitBreakerOpenError:
        self.logger.warning("Circuit breaker open for enrichment service")
        return {}  # Fallback response

# ❌ FORBIDDEN: Unprotected external calls
async def call_external_api(self, data: dict) -> dict:
    return await external_api.process(data)  # VIOLATION: No circuit breaker
```

### Base Service Pattern

```python
# ✅ REQUIRED: All services extend BaseEnterpriseService
class UserService(BaseEnterpriseService[User]):
    """User management service following enterprise standards"""

    async def create(self, user: User) -> User:
        """Create user with full enterprise compliance"""
        async with self.monitor.track("user_create"):
            return await self.circuit_breaker.call(self._create_impl, user)

    async def _create_impl(self, user: User) -> User:
        """Implementation logic (protected by circuit breaker)"""
        try:
            result = await self.db.users.create(user)
            self.logger.info("user_created", extra={"user_id": result.id})
            return result
        except Exception as e:
            self.logger.error("user_creation_failed", extra={"error": str(e)})
            raise UserCreationError(str(e))

# ❌ FORBIDDEN: Services without base pattern
class UserService:
    def __init__(self):
        pass  # VIOLATION: No base service inheritance
```

### Memory Efficiency

```python
# ✅ REQUIRED: Use __slots__ for high-volume models
class UserModel(BaseModel):
    """Memory-efficient user model"""
    __slots__ = ('id', 'tenant_id', 'email', 'name', 'created_at', 'updated_at')

    id: str
    tenant_id: str
    email: str
    name: str
    created_at: datetime
    updated_at: datetime

# ❌ FORBIDDEN: High-volume models without __slots__
class UserModel(BaseModel):
    id: str
    tenant_id: str
    email: str
    name: str
    created_at: datetime
    updated_at: datetime
    # VIOLATION: No __slots__ for high-volume objects
```

---

## 🔷 TYPESCRIPT/NODE.JS IMPLEMENTATION

### Dependency Injection Requirements

```typescript
// ✅ REQUIRED: Use dependency injection framework
import { injectable, inject } from 'tsyringe';

@injectable()
export class UserService extends BaseEnterpriseService<User> {
    constructor(
        @inject('Database') private db: Database,
        @inject('Logger') private logger: StructuredLogger,
        @inject('Monitor') private monitor: PerformanceMonitor
    ) {
        super();
    }
}

// ❌ FORBIDDEN: Hard-coded instantiation
export class UserService extends BaseEnterpriseService<User> {
    private db = new Database();  // VIOLATION: Direct instantiation
    private logger = new Logger();  // VIOLATION: Hard-coded
}
```

### Performance Monitoring

```typescript
// ✅ REQUIRED: Decorate all business methods
@PerformanceMonitor('user-service')
async createUser(userData: UserData): Promise<User> {
    return await this.monitor.track('user_creation', async () => {
        return await this._createImpl(userData);
    });
}

// ❌ FORBIDDEN: Business logic without monitoring
async createUser(userData: UserData): Promise<User> {
    return await this._createImpl(userData);  // VIOLATION: No monitoring
}
```

### Circuit Breaker Protection

```typescript
// ✅ REQUIRED: Protect external calls
async callExternalApi(data: unknown): Promise<unknown> {
    return await this.circuitBreaker.call(
        () => externalApi.process(data),
        { operationName: 'external_api_process' }
    );
}

// ❌ FORBIDDEN: Unprotected calls
async callExternalApi(data: unknown): Promise<unknown> {
    return await externalApi.process(data);  // VIOLATION: No circuit breaker
}
```

---

## ☕ JAVA/SPRING IMPLEMENTATION

### Dependency Injection Requirements

```java
// ✅ REQUIRED: Use Spring dependency injection
@Service
public class UserService extends BaseEnterpriseService<User> {
    @Autowired
    private Database database;

    @Autowired
    private StructuredLogger logger;

    @Autowired
    private PerformanceMonitor monitor;
}

// ❌ FORBIDDEN: Hard-coded instantiation
@Service
public class UserService extends BaseEnterpriseService<User> {
    private Database database = new Database();  // VIOLATION
    private StructuredLogger logger = new StructuredLogger();  // VIOLATION
}
```

### Performance Monitoring & Circuit Breaker

```java
// ✅ REQUIRED: Annotations for monitoring and resilience
@Service
public class UserService extends BaseEnterpriseService<User> {

    @PerformanceMonitored("user-service")
    @CircuitBreaker(name = "user-service", fallbackMethod = "createUserFallback")
    @Retry(delay = 100, maxAttempts = 3)
    public User createUser(User user) {
        return this.database.save(user);
    }

    public User createUserFallback(User user, Exception e) {
        logger.error("User creation failed, using fallback", e);
        return new User();  // Fallback response
    }
}

// ❌ FORBIDDEN: Missing resilience patterns
@Service
public class UserService {
    public User createUser(User user) {
        return this.database.save(user);  // VIOLATION: No monitoring or circuit breaker
    }
}
```

---

## 📋 TESTING REQUIREMENTS

### Mandatory Test Coverage

- **Unit Tests**: 90%+ coverage of business logic
- **Integration Tests**: All external dependencies tested
- **Performance Tests**: Response time validation
- **Circuit Breaker Tests**: Failure scenario testing

```python
# ✅ REQUIRED: Complete test coverage
class TestUserService:
    @pytest.mark.asyncio
    async def test_create_success_with_monitoring(self):
        """Test successful user creation with monitoring"""
        service = UserService()
        user = User(name="John", email="john@example.com")

        result = await service.create(user)

        assert result.id is not None
        assert result.name == "John"
        # Verify monitoring was called
        assert service.monitor.calls > 0

    @pytest.mark.asyncio
    async def test_create_circuit_breaker_activation(self):
        """Test circuit breaker activation on failures"""
        service = UserService()

        # Trigger circuit breaker
        for _ in range(5):
            with pytest.raises(Exception):
                await service.create(invalid_user)

        # Circuit breaker should be open
        with pytest.raises(CircuitBreakerOpenError):
            await service.create(valid_user)

    @pytest.mark.asyncio
    async def test_create_performance_requirements(self):
        """Test response time requirements"""
        service = UserService()
        user = User(name="John", email="john@example.com")

        start = time.time()
        await service.create(user)
        duration = time.time() - start

        assert duration < 0.200  # <200ms requirement

# ❌ FORBIDDEN: Incomplete test coverage
def test_create():
    service = UserService()
    result = service.create(user)
    assert result is not None  # VIOLATION: Missing scenarios
```

---

## 🏗️ CODE STRUCTURE REQUIREMENTS

### Mandatory Directory Structure

```
service-name/
├── core/
│   ├── dependencies.py         # Dependency injection setup
│   ├── config.py              # Configuration management
│   └── monitoring.py          # Performance monitoring
├── models/
│   ├── domain/               # Business domain models
│   ├── schemas.py            # API request/response schemas
│   └── errors.py             # Service-specific errors
├── services/
│   ├── base_service.py       # Base service pattern
│   └── user_service.py       # Domain services
├── api/
│   └── endpoints.py          # API route handlers
├── middleware/
│   ├── enterprise.py         # Enterprise middleware
│   ├── auth.py              # Authentication middleware
│   └── logging.py           # Structured logging middleware
├── tests/
│   ├── test_services.py     # Service unit tests
│   ├── test_integration.py  # Integration tests
│   └── test_performance.py  # Performance tests
├── main.py                  # Application entry point
├── requirements.txt         # Dependencies
└── pyproject.toml          # Project metadata
```

---

## ✅ QUALITY GATES (AUTOMATED)

### Pre-Commit Validation Checklist

These checks run automatically on every commit via `.enterprise/scripts/`:

- [ ] SRP compliance validated (`.enterprise/scripts/srp_validator.py`)
- [ ] Dependencies properly injected (`.enterprise/scripts/dependency_validator.py`)
- [ ] Performance monitoring implemented (`.enterprise/scripts/performance_validator.py`)
- [ ] Circuit breakers configured (`.enterprise/scripts/circuit_breaker_validator.py`)
- [ ] Memory efficiency patterns applied (`.enterprise/scripts/memory_validator.py`)
- [ ] Test coverage ≥90%
- [ ] No hard-coded secrets or credentials
- [ ] Documentation updated

### Deployment Blockers (AUTOMATIC)

These violations **automatically block** deployment:

- ❌ Hard-coded dependencies (no injection)
- ❌ Missing performance monitoring
- ❌ Unprotected external calls
- ❌ Memory inefficient patterns
- ❌ Missing test coverage (<90%)
- ❌ Unhandled exceptions in production code
- ❌ Hard-coded secrets or credentials
- ❌ Missing authentication/authorization

---

## 📊 COMPLIANCE SCORING

### Requirements

- **Minimum Score**: 85% for deployment approval
- **Target Score**: 95% for production excellence
- **Failure Action**: Automatic deployment blocking

### Severity Levels

- **HIGH**: SRP violations, hard-coded dependencies, missing circuit breakers, security issues
- **MEDIUM**: Performance monitoring missing, function length violations, missing tests
- **LOW**: Documentation gaps, minor optimization opportunities

---

## 🔐 ENTERPRISE GUARDRAILS

### Virtual Environment Standards

```bash
# ✅ REQUIRED: Single .venv at project root ONLY
source .venv/bin/activate && cd backend-python

# ❌ FORBIDDEN: Multiple virtual environments
cd backend-python && source .venv/bin/activate

# ❌ FORBIDDEN: Old .cerebraflow patterns
source .cerebraflow/mcp/venv/bin/activate
```

### Zero Tolerance Violations

These violations have **ZERO tolerance** - no exceptions:

- ❌ SQL injection vulnerabilities
- ❌ Hard-coded secrets or credentials
- ❌ Unhandled exceptions in production code
- ❌ Missing authentication/authorization
- ❌ Data exposure without encryption
- ❌ Unvalidated user input
- ❌ Missing CORS/CSRF protection

---

## 🎯 PERFORMANCE TARGETS (MANDATORY)

| Metric | Target | 95th Percentile |
|--------|--------|-----------------|
| Response Time | <100ms | <200ms |
| Memory Usage | <256MB | <512MB |
| Error Rate | <0.01% | <0.1% |
| Throughput | >5000 req/s | >1000 req/s |
| Cache Hit Rate | >80% | >70% |

---

## 📚 RELATED STANDARDS

- See [development/00_MASTER_DOCUMENTATION_STANDARDS.mdc](mdc:.cursor/rules/development/00_MASTER_DOCUMENTATION_STANDARDS.mdc) for documentation organization
- See [dev_workflow.md](.trae/rules/dev_workflow.md) for task management workflow
- See [self_improve.md](.trae/rules/self_improve.md) for continuous improvement process
- See [.enterprise/README.md](mdc:../.enterprise/README.md) for automation scripts
- See [.enterprise/scripts/](mdc:../.enterprise/scripts/) for validation tools

---

**All code MUST follow these enterprise methodology standards. This is mandatory for production deployment. No exceptions.**
