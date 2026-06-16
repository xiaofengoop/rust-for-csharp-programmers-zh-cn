# 9. 错误处理

<a id="exceptions-vs-resultt-e"></a>

## 异常与 `Result<T, E>`

> **你将学到什么：** 为什么 Rust 用 `Result<T, E>` 和 `Option<T>` 取代异常，如何用 `?` 运算符简洁地传播错误，以及显式错误处理如何消除 C# `try`/`catch` 代码中常见的隐藏控制流。
>
> **难度：** 🟡 中级
>
> **另见：** [crate 级错误类型](ch09-1-crate-level-error-types-and-result-alias.md) 介绍使用 `thiserror` 和 `anyhow` 的生产级错误模式，[C# 开发者常用 crate](ch15-1-essential-crates-for-c-developers.md) 介绍错误处理 crate 生态。

### C# 基于异常的错误处理

```csharp
// C#：基于异常的错误处理
public class UserService
{
    public User GetUser(int userId)
    {
        if (userId <= 0)
        {
            throw new ArgumentException("User ID must be positive");
        }
        
        var user = database.FindUser(userId);
        if (user == null)
        {
            throw new UserNotFoundException($"User {userId} not found");
        }
        
        return user;
    }
    
    public async Task<string> GetUserEmailAsync(int userId)
    {
        try
        {
            var user = GetUser(userId);
            return user.Email ?? throw new InvalidOperationException("User has no email");
        }
        catch (UserNotFoundException ex)
        {
            logger.Warning("User not found: {UserId}", userId);
            return "noreply@company.com";
        }
        catch (Exception ex)
        {
            logger.Error(ex, "Unexpected error getting user email");
            throw; // 重新抛出
        }
    }
}
```

### Rust 基于 Result 的错误处理

```rust
use std::fmt;

#[derive(Debug)]
pub enum UserError {
    InvalidId(i32),
    NotFound(i32),
    NoEmail,
    DatabaseError(String),
}

impl fmt::Display for UserError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            UserError::InvalidId(id) => write!(f, "Invalid user ID: {}", id),
            UserError::NotFound(id) => write!(f, "User {} not found", id),
            UserError::NoEmail => write!(f, "User has no email address"),
            UserError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
        }
    }
}

impl std::error::Error for UserError {}

#[derive(Debug, Clone)]
pub struct User {
    pub name: String,
    pub email: Option<String>,
}

pub struct UserService {
    users: Vec<User>,  // 模拟数据库
}

impl UserService {
    fn database_find_user(&self, user_id: i32) -> Option<User> {
        self.users.get(user_id as usize).cloned()
    }

    pub fn get_user(&self, user_id: i32) -> Result<User, UserError> {
        if user_id <= 0 {
            return Err(UserError::InvalidId(user_id));
        }
        
        // 模拟数据库查询
        self.database_find_user(user_id)
            .ok_or(UserError::NotFound(user_id))
    }
    
    pub fn get_user_email(&self, user_id: i32) -> Result<String, UserError> {
        let user = self.get_user(user_id)?; // ? 运算符会传播错误
        
        user.email
            .ok_or(UserError::NoEmail)
    }
    
    pub fn get_user_email_or_default(&self, user_id: i32) -> String {
        match self.get_user_email(user_id) {
            Ok(email) => email,
            Err(UserError::NotFound(_)) => {
                log::warn!("User not found: {}", user_id);
                "noreply@company.com".to_string()
            }
            Err(err) => {
                log::error!("Error getting user email: {}", err);
                "error@company.com".to_string()
            }
        }
    }
}
```

```mermaid
graph TD
    subgraph "C# 异常模型"
        CS_CALL["方法调用"]
        CS_SUCCESS["成功路径"]
        CS_EXCEPTION["throw Exception"]
        CS_STACK["Stack unwinding<br/>（运行时开销）"]
        CS_CATCH["try/catch 块"]
        CS_HIDDEN["[错误] 隐藏控制流<br/>[错误] 性能成本<br/>[错误] 容易忽略"]
        
        CS_CALL --> CS_SUCCESS
        CS_CALL --> CS_EXCEPTION
        CS_EXCEPTION --> CS_STACK
        CS_STACK --> CS_CATCH
        CS_EXCEPTION --> CS_HIDDEN
    end
    
    subgraph "Rust Result 模型"
        RUST_CALL["函数调用"]
        RUST_OK["Ok(value)"]
        RUST_ERR["Err(error)"]
        RUST_MATCH["match result"]
        RUST_QUESTION["? 运算符<br/>（提前返回）"]
        RUST_EXPLICIT["[OK] 显式错误处理<br/>[OK] 零运行时开销<br/>[OK] 错误不能被忽略"]
        
        RUST_CALL --> RUST_OK
        RUST_CALL --> RUST_ERR
        RUST_OK --> RUST_MATCH
        RUST_ERR --> RUST_MATCH
        RUST_ERR --> RUST_QUESTION
        RUST_MATCH --> RUST_EXPLICIT
        RUST_QUESTION --> RUST_EXPLICIT
    end
    
    style CS_HIDDEN fill:#ffcdd2,color:#000
    style RUST_EXPLICIT fill:#c8e6c9,color:#000
    style CS_STACK fill:#fff3e0,color:#000
    style RUST_QUESTION fill:#c8e6c9,color:#000
```

***

<a id="the--operator-propagating-errors-concisely"></a>

### `?` 运算符：简洁地传播错误

```csharp
// C#：异常传播（隐式）
public async Task<string> ProcessFileAsync(string path)
{
    var content = await File.ReadAllTextAsync(path);  // 出错时抛异常
    var processed = ProcessContent(content);          // 出错时抛异常
    return processed;
}
```

```rust
// Rust：使用 ? 传播错误
fn process_file(path: &str) -> Result<String, ConfigError> {
    let content = read_config(path)?;  // 如果是 Err，? 会传播错误
    let processed = process_content(&content)?;  // 如果是 Err，? 会传播错误
    Ok(processed)  // 将成功值包进 Ok
}

fn process_content(content: &str) -> Result<String, ConfigError> {
    if content.is_empty() {
        Err(ConfigError::InvalidFormat)
    } else {
        Ok(content.to_uppercase())
    }
}
```

### 用 `Option<T>` 表示可空值

```csharp
// C#：可空引用类型
public string? FindUserName(int userId)
{
    var user = database.FindUser(userId);
    return user?.Name;  // 找不到用户时返回 null
}

public void ProcessUser(int userId)
{
    string? name = FindUserName(userId);
    if (name != null)
    {
        Console.WriteLine($"User: {name}");
    }
    else
    {
        Console.WriteLine("User not found");
    }
}
```

```rust
// Rust：用 Option<T> 表示可选值
fn find_user_name(user_id: u32) -> Option<String> {
    // 模拟数据库查询
    if user_id == 1 {
        Some("Alice".to_string())
    } else {
        None
    }
}

fn process_user(user_id: u32) {
    match find_user_name(user_id) {
        Some(name) => println!("User: {}", name),
        None => println!("User not found"),
    }
    
    // 或使用 if let（模式匹配的简写）
    if let Some(name) = find_user_name(user_id) {
        println!("User: {}", name);
    } else {
        println!("User not found");
    }
}
```

### 组合 Option 和 Result

```rust
fn safe_divide(a: f64, b: f64) -> Option<f64> {
    if b != 0.0 {
        Some(a / b)
    } else {
        None
    }
}

fn parse_and_divide(a_str: &str, b_str: &str) -> Result<Option<f64>, ParseFloatError> {
    let a: f64 = a_str.parse()?;  // 无效时返回解析错误
    let b: f64 = b_str.parse()?;  // 无效时返回解析错误
    Ok(safe_divide(a, b))         // 返回 Ok(Some(result)) 或 Ok(None)
}

use std::num::ParseFloatError;

fn main() {
    match parse_and_divide("10.0", "2.0") {
        Ok(Some(result)) => println!("Result: {}", result),
        Ok(None) => println!("Division by zero"),
        Err(error) => println!("Parse error: {}", error),
    }
}
```

***


<details>
<summary><strong>🏋️ 练习：构建 crate 级错误类型</strong>（点击展开）</summary>

**挑战：** 为一个文件处理应用创建 `AppError` enum，它可能因为 I/O 错误、JSON 解析错误和验证错误而失败。实现 `From` 转换，以便自动使用 `?` 传播。

```rust
// 起始代码
use std::io;

// TODO: 定义 AppError，包含这些变体：
//   Io(io::Error), Json(serde_json::Error), Validation(String)
// TODO: 实现 Display 和 Error trait
// TODO: 实现 From<io::Error> 和 From<serde_json::Error>
// TODO: 定义类型别名：type Result<T> = std::result::Result<T, AppError>;

fn load_config(path: &str) -> Result<Config> {
    let content = std::fs::read_to_string(path)?;  // io::Error → AppError
    let config: Config = serde_json::from_str(&content)?;  // serde error → AppError
    if config.name.is_empty() {
        return Err(AppError::Validation("name cannot be empty".into()));
    }
    Ok(config)
}
```

<details>
<summary>🔑 参考答案</summary>

```rust
use std::io;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("I/O error: {0}")]
    Io(#[from] io::Error),

    #[error("JSON error: {0}")]
    Json(#[from] serde_json::Error),

    #[error("Validation: {0}")]
    Validation(String),
}

pub type Result<T> = std::result::Result<T, AppError>;

#[derive(serde::Deserialize)]
struct Config {
    name: String,
    port: u16,
}

fn load_config(path: &str) -> Result<Config> {
    let content = std::fs::read_to_string(path)?;
    let config: Config = serde_json::from_str(&content)?;
    if config.name.is_empty() {
        return Err(AppError::Validation("name cannot be empty".into()));
    }
    Ok(config)
}
```

**关键要点：**

- `thiserror` 会根据属性生成 `Display` 和 `Error` 实现。
- `#[from]` 会生成 `From<T>` 实现，让 `?` 能自动转换错误。
- `Result<T>` 别名能消除整个 crate 中的样板代码。
- 不同于 C# 异常，错误类型会出现在每个函数签名里。

</details>
</details># 9. 错误处理
