# 翻译准则

本准则用于保持 `zh-cn` 中文版在术语、语气和章节组织上的一致性。英文原文保留在 `original-en`，翻译工作在 `zh-cn` 中进行。

## 基本原则

- 面向读者的标题、正文、表格、练习说明、图示文案使用中文。
- 代码、命令、API 名称、类型名、crate 名称、文件名和链接目标保持原文。
- 技术内容优先准确，其次顺畅；必要时采用“中文（English）”首次引入，后续使用稳定译名。
- 示例代码中的字符串若属于演示输出，可以保留英文；若是解释性注释，翻译为中文。
- 不改动 mdBook 链接目标、章节文件名和锚点引用，避免破坏导航。

## 语气风格

- 面向 C# 开发者解释 Rust，语气保持教学感、直接、清楚。
- 用“你”称呼读者，避免过度书面化。
- 对概念差异使用“对应”“类似”“不同于”“更严格”等稳定表达。
- 遇到 Rust 特有概念时先给直观类比，再说明边界。
- 翻译应面向中文技术读者做本土化表达，避免保留英文比喻的直译。例如 `pit of success` 不译作“成功之坑”，应按语境译为“默认路径清晰”“容易写出正确代码”等。
- 原文中的行业例子若不是讲解所必需，优先收缩为程序员容易理解的通用软件场景，避免引入金融、医疗、汽车等无关行业专业词。
- 已在中文技术圈通用的表达可以保留，例如“最佳实践”“痛点”“魔法字符串”“零成本抽象”“惯用 Rust”。
- 需要压缩时，优先选择简短、清晰、自然的中文表达，不为逐词对应牺牲可读性。

## 术语表

| 英文 | 中文译法 | 备注 |
|------|----------|------|
| C# developer | C# 开发者 | 目录中可用“C# 程序员”呼应书名，正文优先“开发者”。 |
| Rust for C# Programmers | 面向 C# 程序员的 Rust | 书名固定译法。 |
| Getting Started | 入门准备 | 章节名固定译法。 |
| Introduction and Motivation | 导论与学习动机 | 章节名固定译法。 |
| Built-in Types and Variables | 内置类型与变量 | 章节名固定译法。 |
| ownership | 所有权 | 固定译法。 |
| borrowing | 借用 | 固定译法。 |
| borrow checker | 借用检查器 | 固定译法。 |
| lifetime | 生命周期 | 固定译法。 |
| trait | trait | 保留英文，不译作“特征”。 |
| crate | crate | 保留英文。 |
| module | 模块 | 固定译法。 |
| enum | enum / 枚举 | 概念解释中用“枚举”，涉及 Rust 类型名时保留 `enum`。 |
| pattern matching | 模式匹配 | 固定译法。 |
| exhaustive matching | 穷尽匹配 | 固定译法。 |
| null safety | 空值安全 | 固定译法。 |
| null reference exception | 空引用异常 | 固定译法。 |
| data race | 数据竞争 | 固定译法。 |
| runtime overhead | 运行时开销 | 固定译法。 |
| zero-cost abstraction | 零成本抽象 | 固定译法。 |
| deterministic performance | 确定性性能 | 固定译法。 |
| async/await | async/await | 语言关键字和常用技术名，保留英文。 |
| async runtime | 异步运行时 | 指 tokio、async-std 等执行 async 代码的运行时。 |
| executor | executor | Rust async 专有概念，保留英文，必要时解释为执行器。 |
| fearless concurrency | 无畏并发 | 固定译法。 |
| span | span（作用域上下文） | `tracing` 术语，首次出现时说明含义，后续可用 `span`。 |
| subscriber | Subscriber / subscriber | `tracing-subscriber` API 概念，保留英文，必要时解释为订阅器。 |
| structured logging | 结构化日志 | 固定译法。 |
| observability | 可观测性 | 固定译法。 |
| benchmark | 基准测试 | 固定译法。 |
| incremental adoption | 渐进式采用 | 固定译法。 |
| repository pattern | Repository Pattern（仓储模式） | 首次出现中英对照，后续可用“仓储模式”。 |
| builder pattern | builder pattern / 构建器模式 | 泛称保留英文或译为构建器模式；标题首次出现中英对照。 |
| string slice | 字符串切片 | 固定译法。 |
| mutable / immutable | 可变 / 不可变 | 固定译法。 |
| variable shadowing | 变量遮蔽 | 固定译法。 |
| type inference | 类型推断 | 固定译法。 |
| type annotation | 类型标注 | 固定译法。 |
| casting / conversion | 强制转换 / 转换 | `cast` 语境用“强制转换”，一般 `conversion` 用“转换”。 |
| workspace | workspace | 与 Rust/Cargo 术语相关时保留英文；必要时解释为工作区。 |
| solution | Solution | 指 C# `.sln` 时保留英文。 |
| CLI | CLI | 保留英文。 |
| FFI | FFI | 保留英文。 |
| unsafe | unsafe | 指 Rust 关键字时保留英文。 |
| smart pointer | 智能指针 | 固定译法。 |

## 批量推进策略

后续不再按过小小节停止，优先按连续上下文成批翻译：

1. 第 3 章配套小节 + 第 4 章主章：不可变性、表达式、控制流是连续基础概念。
2. 第 5 章主章 + 两个第 5 章配套小节：数据结构、构造模式、集合放在同一批。
3. 第 6 章主章 + 空值安全配套小节：枚举、模式匹配、`Option<T>` 连续处理。
4. 第 7 章主章 + 三个深入小节：所有权、内存安全、生命周期、智能指针作为一个大主题处理，必要时分两轮但不中断概念链。
5. 第 8-9 章：模块/crate/包管理与错误处理连续处理。
6. 第 10-12 章：trait、泛型、转换 trait、闭包、迭代器、宏连续处理。
7. 第 13-14 章：并发、async、unsafe、FFI、测试连续处理。
8. 第 15-17 章：迁移、最佳实践、工具生态与综合项目连续收尾。

每批完成后更新 `TRANSLATION_PROGRESS.md`，并运行 `mdbook build` 或确认 `mdbook serve` 自动重建成功。
