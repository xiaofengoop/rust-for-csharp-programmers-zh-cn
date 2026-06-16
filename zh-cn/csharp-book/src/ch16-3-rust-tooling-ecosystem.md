<a id="essential-rust-tooling-for-c-developers"></a>
## 面向 C# 开发者的 Rust 核心工具

> **你将学到什么：** Rust 开发工具与 C# 对应工具的映射：Clippy（Roslyn analyzer）、rustfmt（dotnet format）、cargo doc（XML docs）、cargo watch（dotnet watch）和 VS Code 扩展。
>
> **难度：** 🟢 初级

### 工具对照

| C# 工具 | Rust 对应工具 | 安装方式 | 用途 |
|---------|----------------|---------|---------|
| Roslyn analyzer | **Clippy** | `rustup component add clippy` | Lint + 风格建议 |
| `dotnet format` | **rustfmt** | `rustup component add rustfmt` | 自动格式化 |
| XML doc comment | **`cargo doc`** | 内置 | 生成 HTML 文档 |
| OmniSharp / Roslyn | **rust-analyzer** | VS Code 扩展 | IDE 支持 |
| `dotnet watch` | **cargo-watch** | `cargo install cargo-watch` | 保存后自动重新构建 |
| — | **cargo-expand** | `cargo install cargo-expand` | 查看宏展开 |
| `dotnet audit` | **cargo-audit** | `cargo install cargo-audit` | 安全漏洞扫描 |

### Clippy：你的自动代码评审员

```bash
# 在项目上运行 Clippy
cargo clippy

# 把 warning 当作 error（CI/CD）
cargo clippy -- -D warnings

# 自动应用修复建议
cargo clippy --fix
```

```rust
// Clippy 可以捕获数百种反模式：

// Clippy 之前：
if x == true { }           // 警告：不要和 bool 做相等比较
let _ = vec.len() == 0;    // 警告：改用 .is_empty()
for i in 0..vec.len() { }  // 警告：改用 .iter().enumerate()

// 应用 Clippy 建议之后：
if x { }
let _ = vec.is_empty();
for (i, item) in vec.iter().enumerate() { }
```

### rustfmt：一致格式化

```bash
# 格式化所有文件
cargo fmt

# 只检查格式，不修改文件（CI/CD）
cargo fmt -- --check
```

```toml
# rustfmt.toml — 自定义格式化（类似 .editorconfig）
max_width = 100
tab_spaces = 4
use_field_init_shorthand = true
```

### cargo doc：文档生成

```bash
# 生成并打开文档（包含依赖）
cargo doc --open

# 运行文档测试
cargo test --doc
```

```rust
/// 计算圆的面积。
///
/// # 参数
/// * `radius` - 圆的半径（必须为非负数）
///
/// # 示例
/// ```
/// let area = my_crate::circle_area(5.0);
/// assert!((area - 78.54).abs() < 0.01);
/// ```
///
/// # Panics
/// 如果 `radius` 为负数，则 panic。
pub fn circle_area(radius: f64) -> f64 {
    assert!(radius >= 0.0, "radius must be non-negative");
    std::f64::consts::PI * radius * radius
}
// 文档注释中 ``` 代码块里的代码会在 cargo test 期间被编译并运行！
```

### cargo watch：自动重新构建

```bash
# 文件变化后自动重新构建（类似 dotnet watch）
cargo watch -x check          # 只做类型检查（最快）
cargo watch -x test           # 保存后运行测试
cargo watch -x 'run -- args'  # 保存后运行程序
cargo watch -x clippy         # 保存后运行 lint
```

### cargo expand：查看宏生成的代码

```bash
# 查看 derive 宏展开后的输出
cargo expand --lib            # 展开 lib.rs
cargo expand module_name      # 展开特定模块
```

### 推荐 VS Code 扩展

| 扩展 | 用途 |
|-----------|---------|
| **rust-analyzer** | 代码补全、内联错误、重构。 |
| **CodeLLDB** | 调试器（类似 Visual Studio 调试器）。 |
| **Even Better TOML** | Cargo.toml 语法高亮。 |
| **crates** | 在 Cargo.toml 中显示最新 crate 版本。 |
| **Error Lens** | 内联显示错误/warning。 |

***

要深入学习本指南提及的高级主题，可参阅配套训练文档：

- **[Rust Patterns](../../rust-patterns-book/src/SUMMARY.md)** — Pin projection、自定义 allocator、arena pattern、lock-free 数据结构和高级 unsafe pattern。
- **[Async Rust Training](../../async-book/src/SUMMARY.md)** — 深入 tokio、async 取消安全、stream 处理和生产级 async 架构。
- **[Rust Training for C++ Developers](../../c-cpp-book/src/SUMMARY.md)** — 如果团队也有 C++ 背景会很有用；涵盖移动语义映射、RAII 差异，以及 template 与泛型对比。
- **[Rust Training for C Developers](../../c-cpp-book/src/SUMMARY.md)** — 适合互操作场景；涵盖 FFI pattern、嵌入式 Rust 调试和 `no_std` 编程。
