# 测试

<a id="testing-in-rust-vs-c"></a>

## Rust 测试与 C# 测试

> **你将学到什么：** 内置 `#[test]` 与 xUnit 的对比，使用 `rstest` 编写参数化测试（类似 `[Theory]`），使用 `proptest` 做属性测试，使用 `mockall` 做 mock，以及 async 测试模式。
>
> **难度：** 🟡 中级

### 单元测试

```csharp
// C#：xUnit
using Xunit;

public class CalculatorTests
{
    [Fact]
    public void Add_ReturnsSum()
    {
        var calc = new Calculator();
        Assert.Equal(5, calc.Add(2, 3));
    }

    [Theory]
    [InlineData(1, 2, 3)]
    [InlineData(0, 0, 0)]
    [InlineData(-1, 1, 0)]
    public void Add_Theory(int a, int b, int expected)
    {
        Assert.Equal(expected, new Calculator().Add(a, b));
    }
}
```

```rust
// Rust：内置测试，不需要外部框架
pub fn add(a: i32, b: i32) -> i32 { a + b }

#[cfg(test)]  // 只在 `cargo test` 时编译
mod tests {
    use super::*;  // 从父模块导入

    #[test]
    fn add_returns_sum() {
        assert_eq!(add(2, 3), 5);
    }

    #[test]
    fn add_negative_numbers() {
        assert_eq!(add(-1, 1), 0);
    }

    #[test]
    #[should_panic(expected = "overflow")]
    fn add_overflow_panics() {
        let _ = add(i32::MAX, 1); // debug 模式下会 panic
    }
}
```

### 参数化测试（类似 `[Theory]`）

```rust
// 使用 `rstest` crate 编写参数化测试
use rstest::rstest;

#[rstest]
#[case(1, 2, 3)]
#[case(0, 0, 0)]
#[case(-1, 1, 0)]
fn test_add(#[case] a: i32, #[case] b: i32, #[case] expected: i32) {
    assert_eq!(add(a, b), expected);
}

// Fixture：类似测试 setup 方法
#[rstest]
fn test_with_fixture(#[values(1, 2, 3)] x: i32) {
    assert!(x > 0);
}
```

### 断言对比

| C# (xUnit) | Rust | 说明 |
|-------------|------|-------|
| `Assert.Equal(expected, actual)` | `assert_eq!(expected, actual)` | 失败时打印 diff |
| `Assert.NotEqual(a, b)` | `assert_ne!(a, b)` | |
| `Assert.True(condition)` | `assert!(condition)` | |
| `Assert.Contains("sub", str)` | `assert!(str.contains("sub"))` | |
| `Assert.Throws<T>(() => ...)` | `#[should_panic]` | 或使用 `std::panic::catch_unwind` |
| `Assert.Null(obj)` | `assert!(option.is_none())` | Rust 没有 null，使用 `Option` |

### 测试组织

```text
my_crate/
├── src/
│   ├── lib.rs          # 单元测试在 #[cfg(test)] mod tests { } 中
│   └── parser.rs       # 每个模块都可以有自己的 test 模块
├── tests/              # 集成测试（每个文件都是单独 crate）
│   ├── parser_test.rs  # 像外部调用方一样测试公开 API
│   └── api_test.rs
└── benches/            # Benchmark（使用 criterion crate）
    └── my_benchmark.rs
```

```rust
// tests/parser_test.rs：集成测试
// 只能访问公开 API（类似从 assembly 外部进行测试）
use my_crate::parser;

#[test]
fn test_parse_valid_input() {
    let result = parser::parse("valid input");
    assert!(result.is_ok());
}
```

### Async 测试

```csharp
// C#：xUnit async 测试
[Fact]
public async Task GetUser_ReturnsUser()
{
    var service = new UserService();
    var user = await service.GetUserAsync(1);
    Assert.Equal("Alice", user.Name);
}
```

```rust
// Rust：使用 tokio 的 async 测试
#[tokio::test]
async fn get_user_returns_user() {
    let service = UserService::new();
    let user = service.get_user(1).await.unwrap();
    assert_eq!(user.name, "Alice");
}
```

### 使用 mockall 做 Mock

```rust
use mockall::automock;

#[automock]                         // 生成 MockUserRepo 结构体
trait UserRepo {
    fn find_by_id(&self, id: u32) -> Option<User>;
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn service_returns_user_from_repo() {
        let mut mock = MockUserRepo::new();
        mock.expect_find_by_id()
            .with(mockall::predicate::eq(1))
            .returning(|_| Some(User { name: "Alice".into() }));

        let service = UserService::new(mock);
        let user = service.get_user(1).unwrap();
        assert_eq!(user.name, "Alice");
    }
}
```

```csharp
// C#：Moq 等价写法
var mock = new Mock<IUserRepo>();
mock.Setup(r => r.FindById(1)).Returns(new User { Name = "Alice" });
var service = new UserService(mock.Object);
Assert.Equal("Alice", service.GetUser(1).Name);
```

<details>
<summary><strong>🏋️ 练习：编写全面测试</strong>（点击展开）</summary>

**挑战：** 给定下面这个函数，编写测试覆盖：正常路径、空输入、数字字符串和 Unicode。

```rust
pub fn title_case(input: &str) -> String {
    input.split_whitespace()
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                Some(c) => format!("{}{}", c.to_uppercase(), chars.as_str().to_lowercase()),
                None => String::new(),
            }
        })
        .collect::<Vec<_>>()
        .join(" ")
}
```

<details>
<summary>🔑 参考答案</summary>

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn happy_path() {
        assert_eq!(title_case("hello world"), "Hello World");
    }

    #[test]
    fn empty_input() {
        assert_eq!(title_case(""), "");
    }

    #[test]
    fn single_word() {
        assert_eq!(title_case("rust"), "Rust");
    }

    #[test]
    fn already_title_case() {
        assert_eq!(title_case("Hello World"), "Hello World");
    }

    #[test]
    fn all_caps() {
        assert_eq!(title_case("HELLO WORLD"), "Hello World");
    }

    #[test]
    fn extra_whitespace() {
        // split_whitespace 会处理多个空格
        assert_eq!(title_case("  hello   world  "), "Hello World");
    }

    #[test]
    fn unicode() {
        assert_eq!(title_case("café résumé"), "Café Résumé");
    }

    #[test]
    fn numeric_words() {
        assert_eq!(title_case("hello 42 world"), "Hello 42 World");
    }
}
```

**关键要点：** Rust 内置测试框架可以覆盖大多数单元测试需求。使用 `rstest` 编写参数化测试，使用 `mockall` 做 mock，不需要像 xUnit 那样的大型测试框架。

</details>
</details>


<!-- ch14a.1: Property Testing with proptest -->
<a id="property-testing-proving-correctness-at-scale"></a>

## 属性测试：大规模证明正确性

熟悉 **FsCheck** 的 C# 开发者会认出 property-based testing：你不是编写一个个具体测试用例，而是描述对**所有可能输入**都必须成立的性质，然后由框架生成成千上万个随机输入来尝试打破它。

### 为什么属性测试重要

```csharp
// C#：手写单元测试只检查特定用例
[Fact]
public void Reverse_Twice_Returns_Original()
{
    var list = new List<int> { 1, 2, 3 };
    list.Reverse();
    list.Reverse();
    Assert.Equal(new[] { 1, 2, 3 }, list);
}
// 那空列表呢？单元素呢？10,000 个元素呢？负数呢？
// 你需要手写大量用例。
```

```rust
// Rust：proptest 自动生成上千个输入
use proptest::prelude::*;

fn reverse<T: Clone>(v: &[T]) -> Vec<T> {
    v.iter().rev().cloned().collect()
}

proptest! {
    #[test]
    fn reverse_twice_is_identity(ref v in prop::collection::vec(any::<i32>(), 0..1000)) {
        let reversed_twice = reverse(&reverse(v));
        prop_assert_eq!(v, &reversed_twice);
    }
    // proptest 会用数百个随机 Vec<i32> 值运行这段测试：
    // [], [0], [i32::MIN, i32::MAX], [42; 999], 随机序列...
    // 如果失败，它会 SHRINK 到最小失败输入！
}
```

### proptest 入门

```toml
# Cargo.toml
[dev-dependencies]
proptest = "1.4"
```

### C# 开发者常用模式

```rust
use proptest::prelude::*;

// 1. Roundtrip 性质：serialize → deserialize = identity
// （类似测试 JsonSerializer.Serialize → Deserialize）
proptest! {
    #[test]
    fn json_roundtrip(name in "[a-zA-Z]{1,50}", age in 0u32..150) {
        let user = User { name: name.clone(), age };
        let json = serde_json::to_string(&user).unwrap();
        let parsed: User = serde_json::from_str(&json).unwrap();
        prop_assert_eq!(user, parsed);
    }
}

// 2. 不变量性质：输出总是满足某个条件
proptest! {
    #[test]
    fn sort_output_is_sorted(ref v in prop::collection::vec(any::<i32>(), 0..500)) {
        let mut sorted = v.clone();
        sorted.sort();
        // 每对相邻元素都必须有序
        for window in sorted.windows(2) {
            prop_assert!(window[0] <= window[1]);
        }
    }
}

// 3. Oracle 性质：比较两个实现
proptest! {
    #[test]
    fn fast_path_matches_slow_path(input in "[0-9a-f]{1,100}") {
        let result_fast = parse_hex_fast(&input);
        let result_slow = parse_hex_slow(&input);
        prop_assert_eq!(result_fast, result_slow);
    }
}

// 4. 自定义 strategy：生成领域专用测试数据
fn valid_email() -> impl Strategy<Value = String> {
    ("[a-z]{1,20}", "[a-z]{1,10}", prop::sample::select(vec!["com", "org", "io"]))
        .prop_map(|(user, domain, tld)| format!("{}@{}.{}", user, domain, tld))
}

proptest! {
    #[test]
    fn email_parsing_accepts_valid_emails(email in valid_email()) {
        let result = Email::new(&email);
        prop_assert!(result.is_ok(), "Failed to parse: {}", email);
    }
}
```

### proptest 与 FsCheck 对比

| 功能 | C# FsCheck | Rust proptest |
|---------|-----------|---------------|
| 随机输入生成 | `Arb.Generate<T>()` | `any::<T>()` |
| 自定义生成器 | `Arb.Register<T>()` | `impl Strategy<Value = T>` |
| 失败后 shrink | 自动 | 自动 |
| 字符串模式 | 手写 | `"[regex]"` strategy |
| 集合生成 | `Gen.ListOf` | `prop::collection::vec(strategy, range)` |
| 组合生成器 | `Gen.Select` | `.prop_map()`、`.prop_flat_map()` |
| 配置（case 数量） | `Config.MaxTest` | 在 `proptest!` 块中使用 `#![proptest_config(ProptestConfig::with_cases(10000))]` |

### 什么时候用属性测试，什么时候用单元测试

| 使用**单元测试**的场景 | 使用 **proptest** 的场景 |
|------------------------|----------------------|
| 测试特定边界情况 | 在所有输入上验证不变量 |
| 测试错误消息/错误码 | Roundtrip 性质（parse ↔ format） |
| 集成/mock 测试 | 比较两个实现 |
| 行为依赖精确取值 | “对所有 X，性质 P 成立” |

---

## 集成测试：`tests/` 目录

单元测试位于 `src/` 中的 `#[cfg(test)]` 代码块内。集成测试位于单独的 `tests/` 目录中，用来测试你的 crate 的**公开 API**，就像 C# 集成测试会把项目当作外部 assembly 来引用。

```
my_crate/
├── src/
│   ├── lib.rs          // public API
│   └── internal.rs     // private implementation
├── tests/
│   ├── smoke.rs        // 每个文件都是单独的测试 binary
│   ├── api_tests.rs
│   └── common/
│       └── mod.rs      // 共享测试 helper
└── Cargo.toml
```

### 编写集成测试

`tests/` 中的每个文件都会被编译为一个依赖你的库的独立 crate：

```rust
// tests/smoke.rs：只能访问 my_crate 的 pub 条目
use my_crate::{process_order, Order, OrderResult};

#[test]
fn process_valid_order_returns_confirmation() {
    let order = Order::new("SKU-001", 3);
    let result = process_order(order);
    assert!(matches!(result, OrderResult::Confirmed { .. }));
}
```

### 共享测试 helper

把共享 setup 代码放到 `tests/common/mod.rs`，不要放在 `tests/common.rs`，否则它会被当成自己的测试文件：

```rust
// tests/common/mod.rs
use my_crate::Config;

pub fn test_config() -> Config {
    Config::builder()
        .database_url("sqlite::memory:")
        .build()
        .expect("test config must be valid")
}
```

```rust
// tests/api_tests.rs
mod common;

use my_crate::App;

#[test]
fn app_starts_with_test_config() {
    let config = common::test_config();
    let app = App::new(config);
    assert!(app.is_healthy());
}
```

### 运行特定类型测试

```bash
cargo test                  # 运行所有测试（单元 + 集成）
cargo test --lib            # 只运行单元测试（类似 dotnet test --filter Category=Unit）
cargo test --test smoke     # 只运行 tests/smoke.rs
cargo test --test api_tests # 只运行 tests/api_tests.rs
```

**与 C# 的关键差异：** 集成测试文件只能访问你的 crate 的 `pub` API。私有函数不可见，这会迫使你通过公开接口测试，通常能带来更好的测试设计。

***
