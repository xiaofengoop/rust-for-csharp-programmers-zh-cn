<a id="essential-crates-for-c-developers"></a>
# C# 开发者常用 crate

## C# 开发者必备 Rust 工具库

> **你将学到什么：** 常见 .NET 库在 Rust 中对应的 crate：serde（JSON.NET）、reqwest（HttpClient）、tokio（Task/async）、sqlx（Entity Framework），以及 serde 属性系统与 `System.Text.Json` 的深入对比。
>
> **难度：** 🟡 中级

### 核心功能对应关系

```rust
// C# 开发者常用的 Cargo.toml 依赖
[dependencies]
# 序列化（类似 Newtonsoft.Json 或 System.Text.Json）
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# HTTP 客户端（类似 HttpClient）
reqwest = { version = "0.11", features = ["json"] }

# 异步运行时（类似 Task.Run、async/await）
tokio = { version = "1.0", features = ["full"] }

# 错误处理（类似自定义异常）
thiserror = "1.0"
anyhow = "1.0"

# 日志（类似 ILogger、Serilog）
log = "0.4"
env_logger = "0.10"

# 日期/时间（类似 DateTime）
chrono = { version = "0.4", features = ["serde"] }

# UUID（类似 System.Guid）
uuid = { version = "1.0", features = ["v4", "serde"] }

# 集合（类似 List<T>、Dictionary<K,V>）
# 标准库已经内置；高级集合可用：
indexmap = "2.0"  # 有序 HashMap

# 配置（类似 IConfiguration）
config = "0.13"

# 数据库（类似 Entity Framework）
sqlx = { version = "0.7", features = ["runtime-tokio-rustls", "postgres", "uuid", "chrono"] }

# 测试（类似 xUnit、NUnit）
# 标准库已经内置；更多功能可用：
rstest = "0.18"  # 参数化测试

# Mock（类似 Moq）
mockall = "0.11"

# 并行处理（类似 Parallel.ForEach）
rayon = "1.7"
```

### 示例用法模式

```rust
use serde::{Deserialize, Serialize};
use reqwest;
use tokio;
use thiserror::Error;
use chrono::{DateTime, Utc};
use uuid::Uuid;

// 数据模型（类似带属性的 C# POCO）
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    #[serde(with = "chrono::serde::ts_seconds")]
    pub created_at: DateTime<Utc>,
}

// 自定义错误类型（类似自定义异常）
#[derive(Error, Debug)]
pub enum ApiError {
    #[error("HTTP request failed: {0}")]
    Http(#[from] reqwest::Error),
    
    #[error("Serialization failed: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("User not found: {id}")]
    UserNotFound { id: Uuid },
    
    #[error("Validation failed: {message}")]
    Validation { message: String },
}

// Service 类的等价实现
pub struct UserService {
    client: reqwest::Client,
    base_url: String,
}

impl UserService {
    pub fn new(base_url: String) -> Self {
        let client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .expect("Failed to create HTTP client");
            
        UserService { client, base_url }
    }
    
    // Async 方法（类似 C# async Task<User>）
    pub async fn get_user(&self, id: Uuid) -> Result<User, ApiError> {
        let url = format!("{}/users/{}", self.base_url, id);
        
        let response = self.client
            .get(&url)
            .send()
            .await?;
        
        if response.status() == 404 {
            return Err(ApiError::UserNotFound { id });
        }
        
        let user = response.json::<User>().await?;
        Ok(user)
    }
    
    // 创建用户（类似 C# async Task<User>）
    pub async fn create_user(&self, name: String, email: String) -> Result<User, ApiError> {
        if name.trim().is_empty() {
            return Err(ApiError::Validation {
                message: "Name cannot be empty".to_string(),
            });
        }
        
        let new_user = User {
            id: Uuid::new_v4(),
            name,
            email,
            created_at: Utc::now(),
        };
        
        let response = self.client
            .post(&format!("{}/users", self.base_url))
            .json(&new_user)
            .send()
            .await?;
        
        let created_user = response.json::<User>().await?;
        Ok(created_user)
    }
}

// 用法示例（对标 C# Main 方法）
#[tokio::main]
async fn main() -> Result<(), ApiError> {
    // 初始化日志（类似配置 ILogger）
    env_logger::init();
    
    let service = UserService::new("https://api.example.com".to_string());
    
    // 创建用户
    let user = service.create_user(
        "John Doe".to_string(),
        "john@example.com".to_string(),
    ).await?;
    
    println!("Created user: {:?}", user);
    
    // 获取用户
    let retrieved_user = service.get_user(user.id).await?;
    println!("Retrieved user: {:?}", retrieved_user);
    
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]  // 类似 C# [Test] 或 [Fact]
    async fn test_user_creation() {
        let service = UserService::new("http://localhost:8080".to_string());
        
        let result = service.create_user(
            "Test User".to_string(),
            "test@example.com".to_string(),
        ).await;
        
        assert!(result.is_ok());
        let user = result.unwrap();
        assert_eq!(user.name, "Test User");
        assert_eq!(user.email, "test@example.com");
    }
    
    #[test]
    fn test_validation() {
        // 同步测试
        let error = ApiError::Validation {
            message: "Invalid input".to_string(),
        };
        
        assert_eq!(error.to_string(), "Validation failed: Invalid input");
    }
}
```

***


<!-- ch15.1a: Serde Deep Dive for C# Developers -->
## Serde 深入解析：面向 C# 开发者的 JSON 序列化

C# 开发者大量依赖 `System.Text.Json` 或 `Newtonsoft.Json`。在 Rust 中，**serde** 是处理序列化与反序列化的标准方案。掌握它的属性（attribute）系统，就能处理大部分数据处理需求。

### 基本 derive：起点

```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct User {
    name: String,
    age: u32,
    email: String,
}

let user = User { name: "Alice".into(), age: 30, email: "alice@co.com".into() };
let json = serde_json::to_string_pretty(&user)?;
let parsed: User = serde_json::from_str(&json)?;
```

```csharp
// C# 等价写法
public class User
{
    public string Name { get; set; }
    public int Age { get; set; }
    public string Email { get; set; }
}
var json = JsonSerializer.Serialize(user, new JsonSerializerOptions { WriteIndented = true });
var parsed = JsonSerializer.Deserialize<User>(json);
```

### 字段级属性（类似 `[JsonProperty]`）

```rust
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
struct ApiResponse {
    // 重命名 JSON 输出中的字段（类似 [JsonPropertyName("user_id")]）
    #[serde(rename = "user_id")]
    id: u64,

    // 序列化与反序列化使用不同名称
    #[serde(rename(serialize = "userName", deserialize = "user_name"))]
    name: String,

    // 完全跳过此字段（类似 [JsonIgnore]）
    #[serde(skip)]
    internal_cache: Option<String>,

    // 仅序列化时跳过
    #[serde(skip_serializing)]
    password_hash: String,

    // JSON 缺失时使用默认值（类似默认构造函数值）
    #[serde(default)]
    is_active: bool,

    // 自定义默认值
    #[serde(default = "default_role")]
    role: String,

    // 把嵌套结构体展开到父对象中（类似 [JsonExtensionData]）
    #[serde(flatten)]
    metadata: Metadata,

    // 值为 None 时跳过（省略 null 字段）
    #[serde(skip_serializing_if = "Option::is_none")]
    nickname: Option<String>,
}

fn default_role() -> String { "viewer".into() }

#[derive(Serialize, Deserialize, Debug)]
struct Metadata {
    created_at: String,
    version: u32,
}
```

```csharp
// C# 等价属性
public class ApiResponse
{
    [JsonPropertyName("user_id")]
    public ulong Id { get; set; }

    [JsonIgnore]
    public string? InternalCache { get; set; }

    [JsonExtensionData]
    public Dictionary<string, JsonElement>? Metadata { get; set; }
}
```

### Enum 表示法（与 C# 的关键差异）

Rust serde 支持 **4 种不同的 JSON enum 表示法**。这在 C# 中没有直接对应物，因为 C# enum 通常只是整数或字符串。

```rust
use serde::{Deserialize, Serialize};

// 1. 外部标签（默认）：最常见
#[derive(Serialize, Deserialize)]
enum Message {
    Text(String),
    Image { url: String, width: u32 },
    Ping,
}
// Text variant:  {"Text": "hello"}
// Image variant: {"Image": {"url": "...", "width": 100}}
// Ping variant:  "Ping"

// 2. 内部标签：类似其他语言中的 discriminated union
#[derive(Serialize, Deserialize)]
#[serde(tag = "type")]
enum Event {
    Created { id: u64, name: String },
    Deleted { id: u64 },
    Updated { id: u64, fields: Vec<String> },
}
// {"type": "Created", "id": 1, "name": "Alice"}
// {"type": "Deleted", "id": 1}

// 3. 相邻标签：tag 和 content 分别放在不同字段
#[derive(Serialize, Deserialize)]
#[serde(tag = "t", content = "c")]
enum ApiResult {
    Success(UserData),
    Error(String),
}
// {"t": "Success", "c": {"name": "Alice"}}
// {"t": "Error", "c": "not found"}

// 4. 无标签：serde 会按顺序尝试每个变体
#[derive(Serialize, Deserialize)]
#[serde(untagged)]
enum FlexibleValue {
    Integer(i64),
    Float(f64),
    Text(String),
    Bool(bool),
}
// 42, 3.14, "hello", true：serde 自动检测变体
```

### 自定义序列化（类似 `JsonConverter`）

```rust
use serde::{Deserialize, Deserializer, Serialize, Serializer};

// 为特定字段自定义序列化
#[derive(Serialize, Deserialize)]
struct Config {
    #[serde(serialize_with = "serialize_duration", deserialize_with = "deserialize_duration")]
    timeout: std::time::Duration,
}

fn serialize_duration<S: Serializer>(dur: &std::time::Duration, s: S) -> Result<S::Ok, S::Error> {
    s.serialize_u64(dur.as_millis() as u64)
}

fn deserialize_duration<'de, D: Deserializer<'de>>(d: D) -> Result<std::time::Duration, D::Error> {
    let ms = u64::deserialize(d)?;
    Ok(std::time::Duration::from_millis(ms))
}
// JSON: {"timeout": 5000}  ↔  Config { timeout: Duration::from_millis(5000) }
```

### 容器级属性

```rust
#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]  // 所有字段在 JSON 中变成 camelCase
struct UserProfile {
    first_name: String,      // → "firstName"
    last_name: String,       // → "lastName"
    email_address: String,   // → "emailAddress"
}

#[derive(Serialize, Deserialize)]
#[serde(deny_unknown_fields)]  // 拒绝带额外字段的 JSON（严格解析）
struct StrictConfig {
    port: u16,
    host: String,
}
// serde_json::from_str::<StrictConfig>(r#"{"port":8080,"host":"localhost","extra":true}"#)
// → Error: unknown field `extra`
```

### Serde 属性速查

| 属性 | 层级 | C# 对应概念 | 用途 |
|-----------|-------|---------------|---------|
| `#[serde(rename = "...")]` | 字段 | `[JsonPropertyName]` | 重命名 JSON 字段 |
| `#[serde(skip)]` | 字段 | `[JsonIgnore]` | 完全省略 |
| `#[serde(default)]` | 字段 | 默认值 | 缺失时使用 `Default::default()` |
| `#[serde(flatten)]` | 字段 | `[JsonExtensionData]` | 把嵌套结构合并到父对象 |
| `#[serde(skip_serializing_if = "...")]` | 字段 | `JsonIgnoreCondition` | 条件跳过 |
| `#[serde(rename_all = "camelCase")]` | 容器 | `JsonSerializerOptions.PropertyNamingPolicy` | 命名约定 |
| `#[serde(deny_unknown_fields)]` | 容器 | 无 | 严格反序列化 |
| `#[serde(tag = "type")]` | Enum | Discriminator pattern | 内部标签 |
| `#[serde(untagged)]` | Enum | 无 | 按顺序尝试变体 |
| `#[serde(with = "...")]` | 字段 | `[JsonConverter]` | 自定义 ser/de |

### 不只 JSON：serde 适用于多种格式

```rust
// 同一个 derive 可用于所有格式，只需更换 crate
let user = User { name: "Alice".into(), age: 30, email: "a@b.com".into() };

let json  = serde_json::to_string(&user)?;        // JSON
let toml  = toml::to_string(&user)?;               // TOML（配置文件）
let yaml  = serde_yaml::to_string(&user)?;          // YAML
let cbor  = serde_cbor::to_vec(&user)?;             // CBOR（二进制、紧凑）
let msgpk = rmp_serde::to_vec(&user)?;              // MessagePack（二进制）

// 一个 #[derive(Serialize, Deserialize)]，免费支持所有格式
```
