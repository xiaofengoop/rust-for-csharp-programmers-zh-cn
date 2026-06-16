<a id="crate-level-error-types-and-result-aliases"></a>

# crate 级错误类型与 Result 别名

> **你将学到什么：** 生产级 Rust 中常见的错误处理模式：用 `thiserror` 为每个 crate 定义错误 enum，创建 `Result<T>` 类型别名，以及什么时候选择 `thiserror`（库）或 `anyhow`（应用）。
>
> **难度：** 🟡 中级

生产级 Rust 有一个非常重要的模式：为每个 crate 定义自己的错误 enum，并定义一个 `Result` 类型别名来减少样板代码。

### 这个模式

```rust
// src/error.rs
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),

    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),

    #[error("Validation error: {message}")]
    Validation { message: String },

    #[error("Not found: {entity} with id {id}")]
    NotFound { entity: String, id: String },
}

/// crate 范围的 Result 别名：所有函数都返回这个类型
pub type Result<T> = std::result::Result<T, AppError>;
```

### 在整个 crate 中使用

```rust
use crate::error::{AppError, Result};

// 假设数据库连接池已经可用，例如：
// async fn get_user(pool: &PgPool, id: Uuid) -> Result<User>
// 这里用 `pool` 作为简写来展示模式。
pub async fn get_user(id: Uuid) -> Result<User> {
    let user = sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
        .fetch_optional(&pool)
        .await?;  // sqlx::Error 通过 #[from] 转成 AppError::Database

    user.ok_or_else(|| AppError::NotFound {
        entity: "User".into(),
        id: id.to_string(),
    })
}

pub async fn create_user(req: CreateUserRequest) -> Result<User> {
    if req.name.trim().is_empty() {
        return Err(AppError::Validation {
            message: "Name cannot be empty".into(),
        });
    }
    // ...
}
```

### C# 对比

```csharp
// C# 中大致对应的模式
public class AppException : Exception
{
    public string ErrorCode { get; }
    public AppException(string code, string message) : base(message)
    {
        ErrorCode = code;
    }
}

// 但在 C# 中，调用方不知道会遇到哪些异常！
// 在 Rust 中，错误类型会出现在函数签名里。
```

### 为什么这很重要

- **`thiserror`** 会自动生成 `Display` 和 `Error` 实现。
- **`#[from]`** 让 `?` 运算符能够自动转换库错误。
- `Result<T>` 别名让每个函数签名保持简洁：`fn foo() -> Result<Bar>`。
- **不同于 C# 异常**，调用方可以从类型中看到所有可能的错误变体。


### thiserror 与 anyhow：什么时候用哪个

Rust 错误处理里最常见的是这两个 crate。选择哪个，是你首先要做的决定：

| | `thiserror` | `anyhow` |
|---|---|---|
| **用途** | 为**库**定义结构化错误类型 | 为**应用**快速处理错误 |
| **输出** | 你控制的自定义 enum | 不透明的 `anyhow::Error` 包装器 |
| **调用方看到** | 类型中列出所有错误变体 | 只看到 `anyhow::Error`，是不透明的 |
| **最适合** | Library crate、API、任何会被其他代码调用的代码 | Binary、脚本、原型、CLI 工具 |
| **向下转型** | 直接对变体 `match` | `error.downcast_ref::<MyError>()` |

```rust
// thiserror：用于库（调用方需要匹配错误变体）
use thiserror::Error;

#[derive(Error, Debug)]
pub enum StorageError {
    #[error("File not found: {path}")]
    NotFound { path: String },

    #[error("Permission denied: {0}")]
    PermissionDenied(String),

    #[error(transparent)]
    Io(#[from] std::io::Error),
}

pub fn read_config(path: &str) -> Result<String, StorageError> {
    std::fs::read_to_string(path).map_err(|e| match e.kind() {
        std::io::ErrorKind::NotFound => StorageError::NotFound { path: path.into() },
        std::io::ErrorKind::PermissionDenied => StorageError::PermissionDenied(path.into()),
        _ => StorageError::Io(e),
    })
}
```

```rust
// anyhow：用于应用（只传播错误，不定义类型）
use anyhow::{Context, Result};

fn main() -> Result<()> {
    let config = std::fs::read_to_string("config.toml")
        .context("Failed to read config file")?;

    let port: u16 = config.parse()
        .context("Failed to parse port number")?;

    println!("Listening on port {port}");
    Ok(())
}
// anyhow::Result<T> = Result<T, anyhow::Error>
// .context() 会给任何错误追加面向人的上下文
```

```csharp
// C# 对比：
// thiserror ≈ 定义带具体属性的自定义异常类
// anyhow ≈ 捕获 Exception 并加消息包装：
//   throw new InvalidOperationException("Failed to read config", ex);
```

**准则：** 如果你的代码是**库**（其他代码会调用它），使用 `thiserror`。如果你的代码是**应用**（最终 binary），使用 `anyhow`。许多项目会两者都用：在 library crate 的公开 API 中用 `thiserror`，在 `main()` binary 中用 `anyhow`。

<a id="error-recovery-patterns"></a>

### 错误恢复模式

C# 开发者习惯使用 `try/catch` 块从特定异常中恢复。Rust 使用 `Result` 上的组合器完成同类事情：

```rust
use std::fs;

// 模式 1：用 fallback 值恢复
let config = fs::read_to_string("config.toml")
    .unwrap_or_else(|_| String::from("port = 8080"));  // 文件不存在时使用默认值

// 模式 2：从特定错误恢复，传播其他错误
fn read_or_create(path: &str) -> Result<String, std::io::Error> {
    match fs::read_to_string(path) {
        Ok(content) => Ok(content),
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            let default = String::from("# new file");
            fs::write(path, &default)?;
            Ok(default)
        }
        Err(e) => Err(e),  // 传播权限错误等其他错误
    }
}

// 模式 3：传播前添加上下文
use anyhow::Context;

fn load_config() -> anyhow::Result<Config> {
    let text = fs::read_to_string("config.toml")
        .context("Failed to read config.toml")?;
    let config: Config = toml::from_str(&text)
        .context("Failed to parse config.toml")?;
    Ok(config)
}

// 模式 4：把错误映射到你的领域类型
fn parse_port(s: &str) -> Result<u16, AppError> {
    s.parse::<u16>()
        .map_err(|_| AppError::Validation {
            message: format!("Invalid port: {s}"),
        })
}
```

```csharp
// C# 等价写法：
try { config = File.ReadAllText("config.toml"); }
catch (FileNotFoundException) { config = "port = 8080"; }  // 模式 1

try { /* ... */ }
catch (FileNotFoundException) { /* create file */ }        // 模式 2
catch { throw; }                                            // 重新抛出其他错误
```

**什么时候恢复，什么时候传播：**

- 当错误有合理默认值或重试策略时，**恢复**。
- 当应该由**调用方**决定如何处理时，用 `?` **传播**。
- 在模块边界处**添加上下文**（`.context()`），形成错误轨迹。

---

## 练习

<details>
<summary><strong>🏋️ 练习：设计 crate 错误类型</strong>（点击展开）</summary>

你正在构建一个用户注册服务。使用 `thiserror` 设计错误类型：

1. 定义 `RegistrationError`，包含这些变体：`DuplicateEmail(String)`、`WeakPassword(String)`、`DatabaseError(#[from] sqlx::Error)`、`RateLimited { retry_after_secs: u64 }`。
2. 创建 `type Result<T> = std::result::Result<T, RegistrationError>;` 别名。
3. 编写 `register_user(email: &str, password: &str) -> Result<()>`，展示 `?` 传播和显式错误构造。

<details>
<summary>🔑 参考答案</summary>

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum RegistrationError {
    #[error("Email already registered: {0}")]
    DuplicateEmail(String),

    #[error("Password too weak: {0}")]
    WeakPassword(String),

    #[error("Database error")]
    Database(#[from] sqlx::Error),

    #[error("Rate limited — retry after {retry_after_secs}s")]
    RateLimited { retry_after_secs: u64 },
}

pub type Result<T> = std::result::Result<T, RegistrationError>;

pub fn register_user(email: &str, password: &str) -> Result<()> {
    if password.len() < 8 {
        return Err(RegistrationError::WeakPassword(
            "must be at least 8 characters".into(),
        ));
    }

    // 这里的 ? 会自动把 sqlx::Error 转成 RegistrationError::Database
    // db.check_email_unique(email).await?;

    // 这是领域逻辑中的显式错误构造
    if email.contains("+spam") {
        return Err(RegistrationError::DuplicateEmail(email.to_string()));
    }

    Ok(())
}
```

**关键模式：** `#[from]` 让 `?` 可以处理库错误；领域逻辑使用显式 `Err(...)`。`Result` 别名让每个签名都保持简洁。

</details>
</details>

***
