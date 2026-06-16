# 翻译进度

本文件记录 `zh-cn` 中文版相对于 `original-en` 英文原版的翻译状态。默认以 `zh-cn/csharp-book` 为工作目录，`original-en/csharp-book` 只作为对照源。

## 状态约定

- `已翻译`：已完成中文翻译，可继续校对。
- `目录已翻译`：已完成目录或配置层面的中文化，正文尚未完整翻译。
- `未翻译`：仍为英文原文。

## 进度

| 文件 | 状态 | 说明 |
|------|------|------|
| `csharp-book/book.toml` | 已翻译 | 书名与语言配置已本地化。 |
| `csharp-book/src/SUMMARY.md` | 已翻译 | mdBook 侧边栏目录已中文化。 |
| `csharp-book/src/ch00-introduction.md` | 已翻译 | 导言、自学指南与总目录已中文化。 |
| `csharp-book/src/ch01-introduction-and-motivation.md` | 已翻译 | 导论与学习动机已中文化。 |
| `csharp-book/src/ch02-getting-started.md` | 已翻译 | 入门准备、Cargo 与 CLI 输入已中文化。 |
| `csharp-book/src/ch02-1-essential-keywords-reference.md` | 已翻译 | 核心关键字速查已中文化。 |
| `csharp-book/src/ch03-built-in-types-and-variables.md` | 已翻译 | 内置类型、变量、字符串、格式化与转换已中文化。 |
| `csharp-book/src/ch03-1-true-immutability-vs-record-illusions.md` | 已翻译 | C# record 与 Rust 真正不可变性对比已中文化。 |
| `csharp-book/src/ch04-control-flow.md` | 已翻译 | 函数、表达式、条件与循环控制已中文化。 |
| `csharp-book/src/ch05-data-structures-and-collections.md` | 已翻译 | 元组、newtype、数组/切片、结构体与方法已中文化。 |
| `csharp-book/src/ch05-1-constructor-patterns.md` | 已翻译 | `new()`、`Default`、工厂方法与 builder pattern 已中文化。 |
| `csharp-book/src/ch05-2-collections-vec-hashmap-and-iterators.md` | 已翻译 | `Vec<T>`、`HashMap`、所有权与迭代器模式已中文化。 |
| `csharp-book/src/ch06-enums-and-pattern-matching.md` | 已翻译 | 代数数据类型、enum、`match` 与模式匹配已中文化。 |
| `csharp-book/src/ch06-1-exhaustive-matching-and-null-safety.md` | 已翻译 | 穷尽匹配、`Option<T>`、`Result<T, E>` 与空值安全已中文化。 |
| `csharp-book/src/ch07-ownership-and-borrowing.md` | 已翻译 | 所有权规则、借用、移动语义与 RAII 已中文化。 |
| `csharp-book/src/ch07-1-memory-safety-deep-dive.md` | 已翻译 | 引用、生命周期基础、内存安全与借用检查器保证已中文化。 |
| `csharp-book/src/ch07-2-lifetimes-deep-dive.md` | 已翻译 | 生命周期标注、省略规则、`'static` 与常见修复模式已中文化。 |
| `csharp-book/src/ch07-3-smart-pointers-beyond-single-ownership.md` | 已翻译 | `Box<T>`、`Rc<T>`、`Arc<T>`、`RefCell<T>`、`Cow` 与 `Drop` 已中文化。 |
| `csharp-book/src/ch08-crates-and-modules.md` | 未翻译 |  |
| `csharp-book/src/ch08-1-package-management-cargo-vs-nuget.md` | 未翻译 |  |
| `csharp-book/src/ch09-error-handling.md` | 未翻译 |  |
| `csharp-book/src/ch09-1-crate-level-error-types-and-result-alias.md` | 未翻译 |  |
| `csharp-book/src/ch10-traits-and-generics.md` | 未翻译 |  |
| `csharp-book/src/ch10-1-generic-constraints.md` | 未翻译 |  |
| `csharp-book/src/ch10-2-inheritance-vs-composition.md` | 未翻译 |  |
| `csharp-book/src/ch11-from-and-into-traits.md` | 未翻译 |  |
| `csharp-book/src/ch12-closures-and-iterators.md` | 未翻译 |  |
| `csharp-book/src/ch12-1-macros-primer.md` | 未翻译 |  |
| `csharp-book/src/ch13-concurrency.md` | 未翻译 |  |
| `csharp-book/src/ch13-1-asyncawait-deep-dive.md` | 未翻译 |  |
| `csharp-book/src/ch14-unsafe-rust-and-ffi.md` | 未翻译 |  |
| `csharp-book/src/ch14-1-testing.md` | 未翻译 |  |
| `csharp-book/src/ch15-migration-patterns-and-case-studies.md` | 未翻译 |  |
| `csharp-book/src/ch15-1-essential-crates-for-c-developers.md` | 未翻译 |  |
| `csharp-book/src/ch15-2-incremental-adoption-strategy.md` | 未翻译 |  |
| `csharp-book/src/ch16-best-practices.md` | 未翻译 |  |
| `csharp-book/src/ch16-1-performance-comparison-and-migration.md` | 未翻译 |  |
| `csharp-book/src/ch16-2-learning-path-and-resources.md` | 未翻译 |  |
| `csharp-book/src/ch16-3-rust-tooling-ecosystem.md` | 未翻译 |  |
| `csharp-book/src/ch17-capstone-project.md` | 未翻译 |  |

## 翻译规范

统一术语、语气和批量推进策略见同目录下的 `TRANSLATION_GUIDE.md`。后续翻译优先按连续上下文章节成批推进，不再按过小小节停止。

## 后续批次计划

| 批次 | 范围 | 说明 |
|------|------|------|
| A | `ch03-1` + `ch04` | 不可变性、表达式与控制流连续处理。 |
| B | `ch05` + `ch05-1` + `ch05-2` | 数据结构、构造模式、集合与迭代器连续处理。 |
| C | `ch06` + `ch06-1` | 枚举、模式匹配与空值安全连续处理。 |
| D | `ch07` + `ch07-1` + `ch07-2` + `ch07-3` | 所有权、内存安全、生命周期与智能指针作为同一大主题处理。 |
| E | `ch08` + `ch08-1` + `ch09` + `ch09-1` | 模块、crate、包管理与错误处理连续处理。 |
| F | `ch10` + `ch10-1` + `ch10-2` + `ch11` + `ch12` + `ch12-1` | trait、泛型、转换、闭包、迭代器与宏连续处理。 |
| G | `ch13` + `ch13-1` + `ch14` + `ch14-1` | 并发、async、unsafe、FFI 与测试连续处理。 |
| H | `ch15` 至 `ch17` | 迁移、最佳实践、工具生态与综合项目收尾。 |
