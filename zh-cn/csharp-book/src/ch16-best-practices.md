<a id="best-practices-for-c-developers"></a>
## 面向 C# 开发者的最佳实践

> **你将学到什么：** 五个关键心智转变（GC → 所有权、异常 → `Result`、继承 → 组合）、惯用的项目组织方式、错误处理策略、测试模式，以及 C# 开发者在 Rust 中最常犯的错误。
>
> **难度：** 🟡 中级

### 1. **心智转变**

- **从 GC 转向所有权**：思考谁拥有数据，以及数据何时被释放。
- **从异常转向 Result**：让错误处理显式、可见。
- **从继承转向组合**：用 trait 组合行为。
- **从 null 转向 Option**：在类型系统中显式表达“值可能不存在”。

### 2. **代码组织**

```rust
// 像组织 C# solution 一样组织项目
src/
├── main.rs          // 相当于 Program.cs
├── lib.rs           // 库入口点
├── models/          // 类似 C# 中的 Models/ 文件夹
│   ├── mod.rs
│   ├── user.rs
│   └── product.rs
├── services/        // 类似 Services/ 文件夹
│   ├── mod.rs
│   ├── user_service.rs
│   └── product_service.rs
├── controllers/     // 类似 Controllers/（用于 Web 应用）
├── repositories/    // 类似 Repositories/
└── utils/           // 类似 Utilities/
```

### 3. **错误处理策略**

```rust
// 为应用创建通用 Result 类型
pub type AppResult<T> = Result<T, AppError>;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
    
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    
    #[error("Validation error: {message}")]
    Validation { message: String },
    
    #[error("Business logic error: {message}")]
    Business { message: String },
}

// 在整个应用中使用
pub async fn create_user(data: CreateUserRequest) -> AppResult<User> {
    validate_user_data(&data)?;  // 返回 AppError::Validation
    let user = repository.create_user(data).await?;  // 返回 AppError::Database
    Ok(user)
}
```

### 4. **测试模式**

```rust
// 像 C# 单元测试一样组织测试
#[cfg(test)]
mod tests {
    use super::*;
    use rstest::*;  // 用于参数化测试，类似 C# [Theory]
    
    #[test]
    fn test_basic_functionality() {
        // Arrange
        let input = "test data";
        
        // Act
        let result = process_data(input);
        
        // Assert
        assert_eq!(result, "expected output");
    }
    
    #[rstest]
    #[case(1, 2, 3)]
    #[case(5, 5, 10)]
    #[case(0, 0, 0)]
    fn test_addition(#[case] a: i32, #[case] b: i32, #[case] expected: i32) {
        assert_eq!(add(a, b), expected);
    }
    
    #[tokio::test]  // 用于 async 测试
    async fn test_async_functionality() {
        let result = async_function().await;
        assert!(result.is_ok());
    }
}
```

### 5. **要避免的常见错误**

```rust
// [错误] 不要试图实现继承
// 不要这样想：
// struct Manager : Employee  // Rust 中不存在这种写法

// [正确] 使用 trait 做组合
trait Employee {
    fn get_salary(&self) -> u32;
}

trait Manager: Employee {
    fn get_team_size(&self) -> usize;
}

// [错误] 不要到处使用 unwrap()（这就像无视异常）
let value = might_fail().unwrap();  // 可能 panic！

// [正确] 妥善处理错误
let value = match might_fail() {
    Ok(v) => v,
    Err(e) => {
        log::error!("Operation failed: {}", e);
        return Err(e.into());
    }
};

// [错误] 不要什么都 clone（就像不必要地复制对象）
let data = expensive_data.clone();  // 昂贵！

// [正确] 尽可能使用借用
let data = &expensive_data;  // 只是一个引用

// [错误] 不要到处使用 RefCell（就像把一切都变成可变）
struct Data {
    value: RefCell<i32>,  // 内部可变性，应谨慎使用
}

// [正确] 优先使用拥有的数据或借用的数据
struct Data {
    value: i32,  // 简单清楚
}
```

本指南帮助 C# 开发者完整理解已有知识如何映射到 Rust，同时指出两种语言在思路上的相似点与根本差异。关键是要理解：Rust 的约束（例如所有权）是为了防止 C# 中可能出现的整类 bug，代价是一开始会多一些概念负担。

---

### 6. **避免过度 `clone()`** 🟡

C# 开发者由于有 GC 托管，往往不太在意对象复制的成本。而在 Rust 中，每次调用 `.clone()` 都是一次显式的内存分配，需要慎用。大多数 clone 都可以通过借用消除。

```rust
// [错误] C# 习惯：为了传递字符串而 clone
fn greet(name: String) {
    println!("Hello, {name}");
}

let user_name = String::from("Alice");
greet(user_name.clone());  // 不必要的分配
greet(user_name.clone());  // 又分配一次

// [正确] 改用借用：零分配
fn greet(name: &str) {
    println!("Hello, {name}");
}

let user_name = String::from("Alice");
greet(&user_name);  // 借用
greet(&user_name);  // 再次借用，没有成本
```

**适合使用 clone 的情况：**

- 把数据移动进线程或 `'static` 闭包（`Arc::clone` 很便宜，只会增加引用计数）。
- 缓存：你确实需要一份独立副本。
- 原型阶段：先让代码跑起来，之后再去掉不必要的 clone。

**决策清单：**

1. 能否传 `&T` 或 `&str`？→ 那就这样做。
2. 被调用方是否需要所有权？→ 直接移动，而不是 clone。
3. 是否要跨线程共享？→ 使用 `Arc<T>`（clone 只是增加引用计数）。
4. 以上都不适用？→ `clone()` 是合理的。

---

### 7. **避免在生产代码中使用 `unwrap()`** 🟡

在 C# 中忽略异常的开发者，到了 Rust 往往会到处写 `.unwrap()`。两者一样危险。

```rust
// [错误] “我之后再修”的陷阱
let config = std::fs::read_to_string("config.toml").unwrap();
let port: u16 = config_value.parse().unwrap();
let conn = db_pool.get().await.unwrap();

// [正确] 在应用代码中用 ? 传播错误
let config = std::fs::read_to_string("config.toml")?;
let port: u16 = config_value.parse()?;
let conn = db_pool.get().await?;

// [正确] 只有当失败真的代表 bug 时，才使用 expect()
let home = std::env::var("HOME")
    .expect("HOME environment variable must be set");  // 记录不变量
```

**经验法则：**

| 方法 | 何时使用 |
|--------|------------|
| `?` | 应用/库代码：向调用方传播错误。 |
| `expect("reason")` | 启动期断言，或必须成立的不变量。 |
| `unwrap()` | 仅用于测试，或在 `is_some()`/`is_ok()` 检查之后。 |
| `unwrap_or(default)` | 有合理默认值时。 |
| `unwrap_or_else(|| ...)` | 默认值计算代价较高时。 |

---

### 8. **与借用检查器对抗，以及如何停止对抗** 🟡

每个 C# 开发者都会经历一个阶段：借用检查器拒绝了看起来合理的代码。修复方式通常是结构调整，而不是绕过规则。

```rust
// [错误] 迭代时修改集合（C# foreach + modify 模式）
let mut items = vec![1, 2, 3, 4, 5];
for item in &items {
    if *item > 3 {
        items.push(*item * 2);  // 错误：不能把 items 同时借为可变
    }
}

// [正确] 先收集变化，再修改
let extras: Vec<i32> = items.iter()
    .filter(|&&x| x > 3)
    .map(|&x| x * 2)
    .collect();
items.extend(extras);
```

```rust
// [错误] 返回局部变量的引用（C# 中 GC 会让引用看起来更自由）
fn get_greeting() -> &str {
    let s = String::from("hello");
    &s  // 错误：s 会在函数结束时被 drop
}

// [正确] 返回拥有的数据
fn get_greeting() -> String {
    String::from("hello")  // 调用方拥有它
}
```

**解决借用检查器冲突的常见模式：**

| C# 习惯 | Rust 解决方式 |
|----------|--------------|
| 在 struct 中存引用 | 使用拥有的数据，或添加生命周期参数。 |
| 随意修改共享状态 | 使用 `Arc<Mutex<T>>`，或重构以避免共享。 |
| 返回局部变量的引用 | 返回拥有的值。 |
| 迭代时修改集合 | 先收集变化，再应用。 |
| 多个可变引用 | 把 struct 拆成彼此独立的部分。 |

---

### 9. **压平赋值金字塔** 🟢

C# 开发者常写出一串 `if (x != null) { if (x.Value > 0) { ... } }`。Rust 的 `match`、`if let` 和 `?` 可以把这类结构压平。

```rust
// [错误] 来自 C# 的嵌套 null 检查风格
fn process(input: Option<String>) -> Option<usize> {
    match input {
        Some(s) => {
            if !s.is_empty() {
                match s.parse::<usize>() {
                    Ok(n) => {
                        if n > 0 {
                            Some(n * 2)
                        } else {
                            None
                        }
                    }
                    Err(_) => None,
                }
            } else {
                None
            }
        }
        None => None,
    }
}

// [正确] 用组合子压平
fn process(input: Option<String>) -> Option<usize> {
    input
        .filter(|s| !s.is_empty())
        .and_then(|s| s.parse::<usize>().ok())
        .filter(|&n| n > 0)
        .map(|n| n * 2)
}
```

**每个 C# 开发者都应该掌握的关键组合子：**

| 组合子 | 作用 | C# 对应概念 |
|-----------|-------------|---------------|
| `map` | 转换内部值 | `Select` / null 条件访问 `?.` |
| `and_then` | 串联返回 `Option`/`Result` 的操作 | `SelectMany` / `?.Method()` |
| `filter` | 只有谓词通过才保留值 | `Where` |
| `unwrap_or` | 提供默认值 | `?? defaultValue` |
| `ok()` | 把 `Result` 转成 `Option`（丢弃错误） | — |
| `transpose` | 把 `Option<Result>` 翻转成 `Result<Option>` | — |
