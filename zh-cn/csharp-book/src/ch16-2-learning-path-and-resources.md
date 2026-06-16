<a id="learning-path-and-next-steps"></a>
## 学习路径与后续步骤

> **你将学到什么：** 结构化学习路线图（第 1-2 周、第 1-3+ 个月）、推荐书籍和资源、C# 开发者的常见陷阱（所有权困惑、与借用检查器对抗），以及 `tracing` 与 `ILogger` 的结构化可观测性对比。
>
> **难度：** 🟢 初级

### 立即开始（第 1-2 周）

1. **设置环境**
   - 通过 [rustup.rs](https://rustup.rs/) 安装 Rust。
   - 在 VS Code 中配置 rust-analyzer 扩展。
   - 创建第一个 `cargo new hello_world` 项目。

2. **掌握基础**
   - 用简单练习熟悉所有权。
   - 编写使用不同参数类型的函数（`&str`、`String`、`&mut`）。
   - 实现基础 struct 和方法。

3. **练习错误处理**
   - 把 C# 的 try-catch 代码转换为基于 `Result` 的模式。
   - 练习 `?` 运算符和 `match` 语句。
   - 实现自定义错误类型。

### 中级目标（第 1-2 个月）

1. **集合与迭代器**
   - 掌握 `Vec<T>`、`HashMap<K,V>` 和 `HashSet<T>`。
   - 学习迭代器方法：`map`、`filter`、`collect`、`fold`。
   - 对比练习 `for` 循环与迭代器链。

2. **trait 与泛型**
   - 实现常见 trait：`Debug`、`Clone`、`PartialEq`。
   - 编写泛型函数和泛型 struct。
   - 理解 trait bound 和 `where` 子句。

3. **项目结构**
   - 把代码组织到模块中。
   - 理解 `pub` 可见性。
   - 使用来自 crates.io 的外部 crate。

### 进阶主题（第 3 个月及之后）

1. **并发**
   - 学习 `Send` 和 `Sync` trait。
   - 使用 `std::thread` 做基础并行。
   - 探索 `tokio` async 编程。

2. **内存管理**
   - 理解用于共享所有权的 `Rc<T>` 和 `Arc<T>`。
   - 学习何时用 `Box<T>` 做堆分配。
   - 掌握复杂场景中的生命周期。

3. **真实项目**
   - 用 `clap` 构建 CLI 工具。
   - 用 `axum` 或 `warp` 创建 Web API。
   - 编写库并发布到 crates.io。

### 推荐学习资源

#### 书籍

- **《The Rust Programming Language》**（免费在线）- 官方书。
- **《Rust by Example》**（免费在线）- 动手示例。
- **《Programming Rust》** by Jim Blandy - 更深入的技术讲解。

#### 在线资源

- [Rust Playground](https://play.rust-lang.org/) - 在浏览器中试运行代码。
- [Rustlings](https://github.com/rust-lang/rustlings) - 交互式练习。
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/) - 实用示例。

#### 练习项目

1. **命令行计算器** - 练习 enum 和模式匹配。
2. **文件整理器** - 使用文件系统 API 和错误处理。
3. **JSON 处理器** - 学习 serde 和数据转换。
4. **HTTP 服务器** - 理解 async 编程与网络。
5. **数据库库** - 掌握 trait、泛型和错误处理。

<a id="common-pitfalls-for-c-developers"></a>
### C# 开发者的常见陷阱

#### 所有权困惑

```rust
// 不要这样：试图使用已经移动的值
fn wrong_way() {
    let s = String::from("hello");
    takes_ownership(s);
    // println!("{}", s); // 错误：s 已经被移动
}

// 应该这样：需要时使用引用或 clone
fn right_way() {
    let s = String::from("hello");
    borrows_string(&s);
    println!("{}", s); // OK：s 仍由这里拥有
}

fn takes_ownership(s: String) { /* s 在这里被移动 */ }
fn borrows_string(s: &str) { /* s 在这里被借用 */ }
```

#### 与借用检查器对抗

```rust
// 不要这样：多个可变引用
fn wrong_borrowing() {
    let mut v = vec![1, 2, 3];
    let r1 = &mut v;
    // let r2 = &mut v; // 错误：不能同时多次可变借用
}

// 应该这样：限制可变借用的作用域
fn right_borrowing() {
    let mut v = vec![1, 2, 3];
    {
        let r1 = &mut v;
        r1.push(4);
    } // r1 在这里离开作用域
    
    let r2 = &mut v; // OK：不存在其他可变借用
    r2.push(5);
}
```

#### 期待 null 值

```rust
// 不要这样：期待类似 null 的行为
fn no_null_in_rust() {
    // let s: String = null; // Rust 中没有 null！
}

// 应该这样：显式使用 Option<T>
fn use_option_instead() {
    let maybe_string: Option<String> = None;
    
    match maybe_string {
        Some(s) => println!("Got string: {}", s),
        None => println!("No string available"),
    }
}
```

### 最后建议

1. **拥抱编译器**：Rust 的编译器错误信息是帮手，不是敌人。
2. **从小处开始**：先写简单程序，再逐步增加复杂度。
3. **阅读别人的代码**：研究 GitHub 上流行 crate 的源码。
4. **主动求助**：Rust 社区友好且乐于帮忙。
5. **持续练习**：Rust 的概念会随着练习变得自然。

请记住：学习 Rust 需要一定投入，但回报是内存安全、优异性能和无畏并发能力。一开始显得受限的所有权系统，最终会变成编写正确、高效程序的强大工具。

---

**恭喜！** 你现在已经拥有从 C# 过渡到 Rust 的扎实基础。先从简单项目开始，给学习过程一点耐心，再逐步进入更复杂的应用。Rust 带来的安全性和性能收益，值得这段初期投入。


<!-- ch16.2a: Structured Observability with tracing -->
## 结构化可观测性：`tracing` 与 ILogger、Serilog 对比

C# 开发者通常通过 `ILogger`、**Serilog** 或 **NLog** 实现**结构化日志**，也就是在日志消息中附加类型化的 key-value 字段。Rust 的 `log` crate 提供基础分级日志，但 **`tracing`** 才是生产环境结构化可观测性的标准选择，它支持 span（作用域上下文）、异步感知和分布式追踪。

### 为什么选择 `tracing` 而不是 `log`

| 功能 | `log` crate | `tracing` crate | C# 对应概念 |
|---------|------------|-----------------|----------------|
| 分级消息 | ✅ `info!()`、`error!()` | ✅ `info!()`、`error!()` | `ILogger.LogInformation()` |
| 结构化字段 | ❌ 只能字符串插值 | ✅ 类型化 key-value 字段 | Serilog `Log.Information("{User}", user)` |
| span（作用域上下文） | ❌ | ✅ `#[instrument]`、`span!()` | `ILogger.BeginScope()` |
| 异步感知 | ❌ 跨 `.await` 会丢上下文 | ✅ span 会跨 `.await` 保留上下文 | `Activity` / `DiagnosticSource` |
| 分布式追踪 | ❌ | ✅ OpenTelemetry 集成 | `System.Diagnostics.Activity` |
| 多种输出格式 | 基础 | JSON、pretty、compact、OTLP | Serilog sink |

### 入门配置

```toml
# Cargo.toml
[dependencies]
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["env-filter", "json"] }
```

### 基础用法：结构化日志

```csharp
// C# Serilog
Log.Information("Processing order {OrderId} for {Customer}, total {Total:C}",
    orderId, customer.Name, order.Total);
// 输出：Processing order 12345 for Alice, total $99.95
// JSON:  {"OrderId": 12345, "Customer": "Alice", "Total": 99.95, ...}
```

```rust
use tracing::{info, warn, error, debug, instrument};

// 结构化字段：类型化，而不是字符串插值
info!(order_id = 12345, customer = "Alice", total = 99.95,
      "Processing order");
// 输出：INFO Processing order order_id=12345 customer="Alice" total=99.95
// JSON:  {"order_id": 12345, "customer": "Alice", "total": 99.95, ...}

// 动态值
let order_id = 12345;
info!(order_id, "Order received");  // 字段名使用变量名简写

// 条件字段
if let Some(promo) = promo_code {
    info!(order_id, promo_code = %promo, "Promo applied");
    //                        ^ % 表示使用 Display 格式
    //                        ? 表示使用 Debug 格式
}
```

### span：异步代码中的关键能力

span 是带字段的作用域上下文，它可以跨函数调用和 `.await` 点保留字段。你可以把它理解为异步安全版的 `ILogger.BeginScope()`。

```csharp
// C# — Activity / BeginScope
using var activity = new Activity("ProcessOrder").Start();
activity.SetTag("order_id", orderId);

using (_logger.BeginScope(new Dictionary<string, object> { ["OrderId"] = orderId }))
{
    _logger.LogInformation("Starting processing");
    await ProcessPaymentAsync();
    _logger.LogInformation("Payment complete");  // OrderId 仍在作用域中
}
```

```rust
use tracing::{info, instrument, Instrument};

// #[instrument] 会自动创建一个 span，并把函数参数作为字段
#[instrument(skip(db), fields(customer_name))]
async fn process_order(order_id: u64, db: &Database) -> Result<(), AppError> {
    let order = db.get_order(order_id).await?;
    
    // 动态向当前 span 记录额外字段
    tracing::Span::current().record("customer_name", &order.customer_name.as_str());
    
    info!("Starting processing");
    process_payment(&order).await?;        // span 上下文会跨 .await 保留！
    info!(items = order.items.len(), "Payment complete");
    Ok(())
}
// 这个函数里的每条日志都会自动包含：
//   order_id=12345 customer_name="Alice"
// 即使在嵌套 async 调用中也是如此！

// 手动创建 span（类似 BeginScope）
async fn batch_process(orders: Vec<u64>, db: &Database) {
    for order_id in orders {
        let span = tracing::info_span!("process_order", order_id);
        
        // .instrument(span) 会把 span 附加到 future 上
        process_order(order_id, db)
            .instrument(span)
            .await
            .unwrap_or_else(|e| error!("Failed: {e}"));
    }
}
```

### Subscriber 配置（类似 Serilog sink）

```rust
use tracing_subscriber::{fmt, EnvFilter, layer::SubscriberExt, util::SubscriberInitExt};

fn init_tracing() {
    // 开发环境：人类可读、带颜色输出
    tracing_subscriber::registry()
        .with(EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "my_app=debug,tower_http=info".into()))
        .with(fmt::layer().pretty())  // 带颜色、缩进 span
        .init();
}

fn init_tracing_production() {
    // 生产环境：JSON 输出，便于日志聚合（类似 Serilog JSON sink）
    tracing_subscriber::registry()
        .with(EnvFilter::new("my_app=info"))
        .with(fmt::layer().json())  // 结构化 JSON
        .init();
    // 输出：{"timestamp":"...","level":"INFO","fields":{"order_id":123},...}
}
```

```bash
# 通过环境变量控制日志级别（类似 Serilog MinimumLevel）
RUST_LOG=my_app=debug,hyper=warn cargo run
RUST_LOG=trace cargo run  # 输出全部日志
```

### Serilog → tracing 迁移速查表

| Serilog / ILogger | tracing | 说明 |
|-------------------|---------|-------|
| `Log.Information("{Key}", val)` | `info!(key = val, "message")` | 字段是类型化的，不是插值字符串。 |
| `Log.ForContext("Key", val)` | `span.record("key", val)` | 向当前 span 添加字段。 |
| `using BeginScope(...)` | `#[instrument]` 或 `info_span!()` | 使用 `#[instrument]` 可自动创建。 |
| `.WriteTo.Console()` | `fmt::layer()` | 人类可读输出。 |
| `.WriteTo.Seq()` / `.File()` | `fmt::layer().json()` + 文件重定向 | 或使用 `tracing-appender`。 |
| `.Enrich.WithProperty()` | `span!(Level::INFO, "name", key = val)` | Span 字段。 |
| `LogEventLevel.Debug` | `tracing::Level::DEBUG` | 相同概念。 |
| `{@Object}` 解构 | `field = ?value`（Debug）或 `%value`（Display） | `?` = Debug，`%` = Display。 |

### OpenTelemetry 集成

```toml
# 用于分布式追踪（类似 System.Diagnostics + OTLP exporter）
[dependencies]
tracing-opentelemetry = "0.22"
opentelemetry = "0.21"
opentelemetry-otlp = "0.14"
```

```rust
// 在控制台输出旁边加入 OpenTelemetry layer
use tracing_opentelemetry::OpenTelemetryLayer;

fn init_otel() {
    let tracer = opentelemetry_otlp::new_pipeline()
        .tracing()
        .with_exporter(opentelemetry_otlp::new_exporter().tonic())
        .install_batch(opentelemetry_sdk::runtime::Tokio)
        .expect("Failed to create OTLP tracer");

    tracing_subscriber::registry()
        .with(OpenTelemetryLayer::new(tracer))  // 把 span 发送到 Jaeger/Tempo
        .with(fmt::layer())                      // 同时打印到控制台
        .init();
}
// 现在 #[instrument] span 会自动变成分布式 trace！
```
