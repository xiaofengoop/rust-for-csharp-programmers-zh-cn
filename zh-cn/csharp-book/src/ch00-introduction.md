# 面向 C# 程序员的 Rust：完整训练指南

本书面向已经具备 C# 经验的开发者，系统介绍如何学习 Rust。内容覆盖从基础语法到高级模式的完整路径，重点放在两门语言之间的概念转换、设计取舍与实践差异上。

## 课程概览

- **为什么是 Rust**：Rust 对 C# 开发者的价值：性能、安全性与正确性
- **入门准备**：安装、工具链与第一个程序
- **基础构件**：类型、变量与控制流
- **数据结构**：数组、元组、结构体与集合
- **模式匹配与枚举**：代数数据类型与穷尽匹配
- **所有权与借用**：Rust 的内存管理模型
- **模块与 crate**：代码组织与依赖管理
- **错误处理**：基于 `Result` 的错误传播
- **trait 与泛型**：Rust 的类型系统
- **闭包与迭代器**：函数式编程模式
- **并发**：由类型系统保证的无畏并发，以及 async/await 深入解析
- **Unsafe Rust 与 FFI**：何时以及如何越过安全 Rust 的边界
- **迁移模式**：真实场景中的 C# 到 Rust 迁移方式与渐进式采用
- **最佳实践**：面向 C# 开发者的惯用 Rust 写法

---

# 自学指南

这套材料既可以用于讲师带领的课程，也适合自学。如果你准备独立完成学习，可以按下面的方式提高收益。

**节奏建议：**

| 章节 | 主题 | 建议时间 | 检查点 |
|------|------|----------|--------|
| 1-4 | 环境搭建、类型、控制流 | 1 天 | 你可以用 Rust 写一个 CLI 温度转换器 |
| 5-6 | 数据结构、枚举、模式匹配 | 1-2 天 | 你可以定义带数据的枚举，并用 `match` 做穷尽匹配 |
| 7 | 所有权与借用 | 1-2 天 | 你可以解释为什么 `let s2 = s1` 会让 `s1` 失效 |
| 8-9 | 模块、错误处理 | 1 天 | 你可以创建一个多文件项目，并用 `?` 传播错误 |
| 10-12 | trait、泛型、闭包、迭代器 | 1-2 天 | 你可以把一段 LINQ 链转换为 Rust 迭代器 |
| 13 | 并发与 async | 1 天 | 你可以用 `Arc<Mutex<T>>` 写出线程安全计数器 |
| 14 | Unsafe Rust、FFI、测试 | 1 天 | 你可以通过 P/Invoke 从 C# 调用 Rust 函数 |
| 15-16 | 迁移、最佳实践、工具链 | 按需学习 | 参考材料：在编写真实代码时查阅 |
| 17 | 综合项目 | 1-2 天 | 你拥有一个可以获取天气数据的 CLI 工具 |

**如何使用练习：**

- 各章节会在可折叠的 `<details>` 区块中提供动手练习和答案。
- **请务必先尝试练习，再展开答案。** 和借用检查器较劲是学习的一部分，编译器错误信息就是你的老师。
- 如果卡住超过 15 分钟，可以展开答案，研究之后再收起，从头重新做一遍。
- [Rust Playground](https://play.rust-lang.org/) 可以让你在不安装本地环境的情况下运行代码。

**难度标记：**

- 🟢 **初级**：可以直接从 C# 概念迁移理解
- 🟡 **中级**：需要理解所有权或 trait
- 🔴 **高级**：涉及生命周期、async 内部机制或 unsafe 代码

**遇到瓶颈时：**

- 仔细阅读编译器错误信息，Rust 的错误提示非常有帮助。
- 重新阅读相关章节。所有权等概念通常需要第二遍才真正贯通。
- [Rust 标准库文档](https://doc.rust-lang.org/std/) 很优秀，可以直接搜索任意类型或方法。
- 若要深入 async 模式，可以参考配套的 [Async Rust Training](../async-book/)。

---

# 目录

## 第一部分：基础

### 1. 导论与学习动机 🟢

- [面向 C# 开发者的 Rust 价值](ch01-introduction-and-motivation.md#the-case-for-rust-for-c-developers)
- [Rust 解决的常见 C# 痛点](ch01-introduction-and-motivation.md#common-c-pain-points-that-rust-addresses)
- [何时选择 Rust 而不是 C#](ch01-introduction-and-motivation.md#when-to-choose-rust-over-c)
- [语言哲学对比](ch01-introduction-and-motivation.md#language-philosophy-comparison)
- [速查：Rust 与 C#](ch01-introduction-and-motivation.md#quick-reference-rust-vs-c)

### 2. 入门准备 🟢

- [安装与环境配置](ch02-getting-started.md#installation-and-setup)
- [你的第一个 Rust 程序](ch02-getting-started.md#your-first-rust-program)
- [Cargo 与 NuGet/MSBuild](ch02-getting-started.md#cargo-vs-nugetmsbuild)
- [读取输入与 CLI 参数](ch02-getting-started.md#reading-input-and-cli-arguments)
- [核心 Rust 关键字 *(可选参考，按需查阅)*](ch02-1-essential-keywords-reference.md#essential-rust-keywords-for-c-developers)

### 3. 内置类型与变量 🟢

- [变量与可变性](ch03-built-in-types-and-variables.md#variables-and-mutability)
- [原始类型对比](ch03-built-in-types-and-variables.md#primitive-types)
- [字符串类型：String 与 &str](ch03-built-in-types-and-variables.md#string-types-string-vs-str)
- [打印与字符串格式化](ch03-built-in-types-and-variables.md#printing-and-string-formatting)
- [类型转换与显式转换](ch03-built-in-types-and-variables.md#type-casting-and-conversions)
- [真正的不可变性与 record 的错觉](ch03-1-true-immutability-vs-record-illusions.md#true-immutability-vs-record-illusions)

### 4. 控制流 🟢

- [函数与方法](ch04-control-flow.md#functions-vs-methods)
- [表达式与语句（很重要！）](ch04-control-flow.md#expression-vs-statement-important)
- [条件语句](ch04-control-flow.md#conditional-statements)
- [循环与迭代](ch04-control-flow.md#loops)

### 5. 数据结构与集合 🟢

- [元组与解构](ch05-data-structures-and-collections.md#tuples-and-destructuring)
- [数组与切片](ch05-data-structures-and-collections.md#arrays-and-slices)
- [结构体与类](ch05-data-structures-and-collections.md#structs-vs-classes)
- [构造模式](ch05-1-constructor-patterns.md#constructor-patterns)
- [`Vec<T>` 与 `List<T>`](ch05-2-collections-vec-hashmap-and-iterators.md#vect-vs-listt)
- [HashMap 与 Dictionary](ch05-2-collections-vec-hashmap-and-iterators.md#hashmap-vs-dictionary)

### 6. 枚举与模式匹配 🟡

- [代数数据类型与 C# union](ch06-enums-and-pattern-matching.md#algebraic-data-types-vs-c-unions)
- [穷尽模式匹配](ch06-1-exhaustive-matching-and-null-safety.md#exhaustive-pattern-matching-compiler-guarantees-vs-runtime-errors)
- [用于空值安全的 `Option<T>`](ch06-1-exhaustive-matching-and-null-safety.md#null-safety-nullablet-vs-optiont)
- [守卫与高级模式](ch06-enums-and-pattern-matching.md#guards-and-advanced-patterns)

### 7. 所有权与借用 🟡

- [理解所有权](ch07-ownership-and-borrowing.md#understanding-ownership)
- [移动语义与引用语义](ch07-ownership-and-borrowing.md#move-semantics)
- [借用与引用](ch07-ownership-and-borrowing.md#borrowing-basics)
- [内存安全深入解析](ch07-1-memory-safety-deep-dive.md#references-vs-pointers)
- [生命周期深入解析](ch07-2-lifetimes-deep-dive.md#lifetimes-telling-the-compiler-how-long-references-live) 🔴
- [智能指针、Drop 与 Deref](ch07-3-smart-pointers-beyond-single-ownership.md#smart-pointers-when-single-ownership-isnt-enough) 🔴

### 8. crate 与模块 🟢

- [Rust 模块与 C# 命名空间](ch08-crates-and-modules.md#rust-modules-vs-c-namespaces)
- [crate 与 .NET 程序集](ch08-crates-and-modules.md#crates-vs-net-assemblies)
- [包管理：Cargo 与 NuGet](ch08-1-package-management-cargo-vs-nuget.md#package-management-cargo-vs-nuget)

### 9. 错误处理 🟡

- [异常与 `Result<T, E>`](ch09-error-handling.md#exceptions-vs-resultt-e)
- [`?` 运算符](ch09-error-handling.md#the--operator-propagating-errors-concisely)
- [自定义错误类型](ch06-1-exhaustive-matching-and-null-safety.md#custom-error-types)
- [crate 级错误类型与 Result 别名](ch09-1-crate-level-error-types-and-result-alias.md#crate-level-error-types-and-result-aliases)
- [错误恢复模式](ch09-1-crate-level-error-types-and-result-alias.md#error-recovery-patterns)

### 10. trait 与泛型 🟡

- [trait 与接口](ch10-traits-and-generics.md#traits---rusts-interfaces)
- [继承与组合](ch10-2-inheritance-vs-composition.md#inheritance-vs-composition)
- [泛型约束：where 与 trait bound](ch10-1-generic-constraints.md#generic-constraints-where-vs-trait-bounds)
- [常见标准库 trait](ch10-traits-and-generics.md#common-standard-library-traits)

### 11. From 与 Into trait 🟡

- [Rust 中的类型转换](ch11-from-and-into-traits.md#type-conversions-in-rust)
- [为自定义类型实现 From](ch11-from-and-into-traits.md#rust-from-and-into)

### 12. 闭包与迭代器 🟡

- [Rust 闭包](ch12-closures-and-iterators.md#rust-closures)
- [LINQ 与 Rust 迭代器](ch12-closures-and-iterators.md#linq-vs-rust-iterators)
- [宏入门](ch12-1-macros-primer.md#macros-code-that-writes-code)

---

## 第二部分：并发与系统编程

### 13. 并发 🔴

- [线程安全：约定与类型系统保证](ch13-concurrency.md#thread-safety-convention-vs-type-system-guarantees)
- [async/await：C# Task 与 Rust Future](ch13-1-asyncawait-deep-dive.md#async-programming-c-task-vs-rust-future)
- [取消模式](ch13-1-asyncawait-deep-dive.md#cancellation-cancellationtoken-vs-drop--select)
- [Pin 与 tokio::spawn](ch13-1-asyncawait-deep-dive.md#pin-why-rust-async-has-a-concept-c-doesnt)

### 14. Unsafe Rust、FFI 与测试 🟡

- [何时以及为何使用 unsafe](ch14-unsafe-rust-and-ffi.md#when-you-need-unsafe)
- [通过 FFI 与 C# 互操作](ch14-unsafe-rust-and-ffi.md#interop-with-c-via-ffi)
- [Rust 与 C# 中的测试](ch14-1-testing.md#testing-in-rust-vs-c)
- [属性测试与 mock](ch14-1-testing.md#property-testing-proving-correctness-at-scale)

---

## 第三部分：迁移与最佳实践

### 15. 迁移模式与案例研究 🟡

- [Rust 中的常见 C# 模式](ch15-migration-patterns-and-case-studies.md#common-c-patterns-in-rust)
- [C# 开发者常用 crate](ch15-1-essential-crates-for-c-developers.md#essential-crates-for-c-developers)
- [渐进式采用策略](ch15-2-incremental-adoption-strategy.md#incremental-adoption-strategy)

### 16. 最佳实践与参考资料 🟡

- [面向 C# 开发者的惯用 Rust](ch16-best-practices.md#best-practices-for-c-developers)
- [性能对比：托管代码与原生代码](ch16-1-performance-comparison-and-migration.md#performance-comparison-managed-vs-native)
- [常见陷阱与解决方案](ch16-2-learning-path-and-resources.md#common-pitfalls-for-c-developers)
- [学习路径与后续资源](ch16-2-learning-path-and-resources.md#learning-path-and-next-steps)
- [Rust 工具生态](ch16-3-rust-tooling-ecosystem.md#essential-rust-tooling-for-c-developers)

---

## 综合项目

### 17. 综合项目 🟡

- [构建 CLI 天气工具](ch17-capstone-project.md#capstone-project-build-a-cli-weather-tool)：把结构体、trait、错误处理、async、模块、serde 与测试组合成一个可工作的应用程序
