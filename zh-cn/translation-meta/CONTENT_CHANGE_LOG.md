# 内容含义变更记录

本文件记录中文书稿中非纯翻译、非纯格式修复的内容含义调整。后续同步 upstream `microsoft/RustTraining` 时，应优先检查这些条目，避免把本地审校修订误判为普通翻译差异。

## 2026-06-17：收敛绝对化表述与补充工程边界

### 背景

根据 `CONTENT_REVIEW_NOTES.md` 的第 1-5 类建议，对正文中容易误导读者的绝对化表述进行小范围修订。第 6 类“代码示例偏教学化，不应直接视为生产模板”本轮暂缓，未进入正文修改。

### 变更范围

- `zh-cn/csharp-book/src/ch01-introduction-and-motivation.md`
  - 将“编译期安全，零运行时成本”改为更准确的“编译期表达空值和共享约束，常见检查可被优化”。
  - 将“管道中完全没有 null”改为“没有隐式 null；需要表达缺失值时使用 Option”。
  - 将“正确性是类型系统的属性，整类 bug 不可能出现”改为“部分正确性前移到类型系统；业务规则、死锁、资源耗尽和错误建模仍需工程设计”。

- `zh-cn/csharp-book/src/ch03-1-true-immutability-vs-record-illusions.md`
  - 将 Mermaid 图中的“零运行时开销”改为“无额外运行时检查”，避免把不可变性教学点泛化为所有 Rust 抽象都零成本。

- `zh-cn/csharp-book/src/ch05-data-structures-and-collections.md`
  - 补充 `Span<T>` 可引用栈上或托管内存数据，避免把它简单说成“栈上”。
  - 将 Inline Arrays 从“栈上缓冲区”修正为“内联缓冲区”，并说明是否位于栈上取决于宿主值位置。
  - 将“C# 类总是通过引用存在于堆上”改为“C# class 的常见实例模型是通过引用访问托管对象；对象通常位于托管堆上”，并补充具体布局与优化取决于编译器和运行时。

- `zh-cn/csharp-book/src/ch07-1-memory-safety-deep-dive.md`
  - 将“所有权系统阻止内存泄漏”改为“防止悬垂引用，并让清理路径明确；泄漏模式仍需通过设计避免”。
  - 将图中的“无内存泄漏”改为“避免悬垂引用”，将“最佳性能”改为“可预测性能”。

- `zh-cn/csharp-book/src/ch07-ownership-and-borrowing.md`
  - 将图中的“零运行时成本、无内存泄漏”改为“常见检查前移到编译期、避免悬垂引用、Rc 循环等仍需处理”。

- `zh-cn/csharp-book/src/ch07-3-smart-pointers-beyond-single-ownership.md`
  - 将 `LinkedListNode<int>` 示例中的“总是分配在堆上”改为“作为引用类型，通常由运行时在托管堆上管理”，避免把常见运行时模型写成绝对语言规则。

- `zh-cn/csharp-book/src/ch09-error-handling.md`
  - 将图中的“零运行时开销、错误不能被忽略”改为“普通控制流、未使用 Result 会告警”。
  - 新增说明：`Result` 的显式性不等于错误处理自动正确，错误建模、上下文、恢复和传播仍需工程设计。

- `zh-cn/csharp-book/src/ch09-1-crate-level-error-types-and-result-alias.md`
  - 将 `thiserror` / `anyhow` 的选择准则从硬性二分改为优先建议。
  - 补充库和应用在错误边界上可能混合使用两者，以及不透明错误不宜直接暴露给需要精确处理错误的调用方。

- `zh-cn/csharp-book/src/ch10-traits-and-generics.md`
  - 将“C# interface 总是可以作为返回类型使用”改为“C# 中经常直接把 interface 作为返回类型暴露”。
  - 将“interface 始终动态分发、迭代器对象分配在堆上”和“delegate 总是分配在堆上”改为受编译器/JIT 优化影响的描述。

- `zh-cn/csharp-book/src/ch13-concurrency.md`
  - 将“数据竞争不可能发生、零成本抽象”改为“安全代码防止数据竞争、显式同步成本”。
  - 补充 `Arc<Mutex<T>>` 是常见模式但不应作为默认答案，生产服务还应考虑 atomic、消息传递、分片锁、无共享设计和锁持有时间。
  - 补充 Rust 的线程安全保证不等于自动消除死锁、活锁、饥饿或业务竞态。

### 同步 upstream 时的处理建议

- 如果 upstream 后续也修正了同类表述，优先比较 upstream 新语义与本地审校语义，保留更准确且更适合中文读者的版本。
- 如果 upstream 改动只是还原旧式强表述，不应自动覆盖本文件记录的本地修订。
- 如果 upstream 增加了更详细的现代 C# 或生产并发说明，可以考虑用 upstream 内容替换本地短说明，并在本文件追加记录。

## 2026-06-17：本土化表达与行业例子收缩

### 背景

根据中文技术读者的阅读习惯，修正若干英文化直译和无关行业色彩较强的表达。通用技术圈表达如“最佳实践”“痛点”“魔法字符串”“零成本抽象”“惯用 Rust”保留不动。

### 变更范围

- `zh-cn/translation-meta/TRANSLATION_GUIDE.md`
  - 新增本土化翻译原则：避免英文比喻直译，非必要时收缩无关行业例子，保留中文技术圈已通用表达。

- `zh-cn/csharp-book/src/ch01-introduction-and-motivation.md`
  - 将 `pit of success` 的直译“成功之坑”改为“默认路径清晰”。
  - 将“语言哲学对比”改为“语言设计取向对比”，降低直译味。
  - 将低延迟示例从金融交易命名（`HighFrequencyTrader`、`MarketTick`、`Trade`）改为通用事件处理命名（`LowLatencyProcessor`、`InputEvent`、`ProcessedEvent`）。
  - 将“关键市场时刻”“金融逻辑”“高频交易”“医疗设备、汽车、金融系统”等收缩为更通用的软件工程场景，如“最不该停顿的时候”“计费逻辑”“低延迟服务、大吞吐数据处理”“基础设施组件、边缘设备、延迟敏感服务”。
  - 将“上市时间优先”“云成本”改为“上线速度优先”“云资源成本 / 基础设施成本”。
  - 将“一等公民与事后补上的能力”“上帝基类”“团队纪律”等英文化或生硬表达改为“语言内置支持与后续增强”“超大基类”“团队规范”。

- `zh-cn/csharp-book/src/ch03-1-true-immutability-vs-record-illusions.md`
  - 将“需要纪律 / 需要团队纪律”改为“需要团队约定”，语气更自然。

- `zh-cn/csharp-book/src/ch13-concurrency.md`
  - 清理章节末尾标题粘连残留。

- `zh-cn/csharp-book/src/ch14-1-testing.md`
  - 将“迫使你通过公开接口测试”改为“你会更多通过公开接口测试”，避免语气过硬。

- `zh-cn/csharp-book/src/ch15-migration-patterns-and-case-studies.md`
  - 将“所有权模型迫使设计走向流式处理 / 借用检查器自然把你引向”改为更自然的“促使你更早考虑数据所有权和处理边界 / 流式处理更容易保持所有权关系清晰”。

- `zh-cn/csharp-book/src/ch16-1-performance-comparison-and-migration.md`
  - 将“金融系统、安全关键应用”改为“支付、权限、数据处理等容错空间很小的应用”。

- `zh-cn/csharp-book/src/ch16-best-practices.md`
  - 清理章节末尾标题粘连残留。

- `zh-cn/csharp-book/src/ch17-capstone-project.md`
  - 清理章节末尾标题粘连残留。

## 2026-06-17：完整中英对照复读后的结构修正

### 背景

按章节完整复读英文原文与中文译文，重点检查前后文风格、术语一致性、语义贴合度、中文表达是否过度直译，以及大批量翻译后可能出现的结构残留。

### 变更范围

- `zh-cn/csharp-book/src/ch03-1-true-immutability-vs-record-illusions.md`
  - 修正 Mermaid 图中样式引用的节点名，将旧的 `RUST_ZERO` 改为当前实际节点 `RUST_LOW_COST`，避免图表渲染时样式丢失。

- `zh-cn/csharp-book/src/ch15-2-incremental-adoption-strategy.md`
  - 补回章节末尾分隔线，使章节收尾与英文原版及其他章节保持一致。

### 复读结论

- 本轮复读中曾将部分读取窗口停在中途的输出误判为章节截断；重新读取文件尾部后确认 `ch13-concurrency.md`、`ch14-1-testing.md`、`ch17-capstone-project.md` 等尾部内容完整。
- 对结构检查中由行内文本或文档注释导致的假阳性做了人工确认，例如 `ch00-introduction.md` 中的 `<details>` 说明文字和 `ch16-3-rust-tooling-ecosystem.md` 文档注释中的代码围栏文本，不作为正文结构问题处理。