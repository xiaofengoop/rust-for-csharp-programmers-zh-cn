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