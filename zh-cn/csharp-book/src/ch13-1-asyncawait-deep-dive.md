# Async/Await 深入解析

<a id="async-programming-c-task-vs-rust-future"></a>

## Async 编程：C# Task 与 Rust Future

> **你将学到什么：** Rust 惰性的 `Future` 与 C# 立即执行的 `Task`，executor 模型（tokio），通过 `Drop` + `select!` 取消与 `CancellationToken` 的对比，以及真实项目中的并发请求模式。
>
> **难度：** 🔴 高级

C# 开发者非常熟悉 `async`/`await`。Rust 使用相同的关键字，但执行模型有根本差异。

### Executor 模型

```csharp
// C#：运行时提供内置线程池和 task scheduler
// async/await 开箱即用
public async Task<string> FetchDataAsync(string url)
{
    using var client = new HttpClient();
    return await client.GetStringAsync(url);  // 由 .NET 线程池调度
}
// .NET 管理线程池、task 调度和同步上下文
```

```rust
// Rust：没有内置异步运行时。你需要选择 executor。
// 最流行的是 tokio。
async fn fetch_data(url: &str) -> Result<String, reqwest::Error> {
    let body = reqwest::get(url).await?.text().await?;
    Ok(body)
}

// 你必须有异步运行时才能执行 async 代码：
#[tokio::main]  // 这个宏会设置 tokio 异步运行时
async fn main() {
    let data = fetch_data("https://example.com").await.unwrap();
    println!("{}", &data[..100]);
}
```

### Future 与 Task

| | C# `Task<T>` | Rust `Future<Output = T>` |
|---|---|---|
| **执行** | 创建后立即开始 | **惰性**，直到被 `.await` 才做事 |
| **Runtime** | 内置（CLR 线程池） | 外部提供（tokio、async-std 等） |
| **取消** | `CancellationToken` | 丢弃 `Future`（或使用 `tokio::select!`） |
| **状态机** | 编译器生成 | 编译器生成 |
| **大小** | 堆分配 | 装箱前在栈上 |

```rust
// 重要：Rust 中的 Future 是惰性的！
async fn compute() -> i32 { println!("Computing!"); 42 }

let future = compute();  // 什么也不会打印，Future 还没被 poll。
let result = future.await; // 现在才会打印 "Computing!"
```

```csharp
// C# Task 会立即开始！
var task = ComputeAsync();  // 立刻打印 "Computing!"
var result = await task;    // 这里只是等待完成
```

<a id="cancellation-cancellationtoken-vs-drop--select"></a>

### 取消：CancellationToken 与 Drop / select!

```csharp
// C#：使用 CancellationToken 协作式取消
public async Task ProcessAsync(CancellationToken ct)
{
    while (!ct.IsCancellationRequested)
    {
        await Task.Delay(1000, ct);  // 被取消时抛异常
        DoWork();
    }
}

var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
await ProcessAsync(cts.Token);
```

```rust
// Rust：通过丢弃 future 取消，或使用 tokio::select!
use tokio::time::{sleep, Duration};

async fn process() {
    loop {
        sleep(Duration::from_secs(1)).await;
        do_work();
    }
}

// 使用 select! 的超时模式
async fn run_with_timeout() {
    tokio::select! {
        _ = process() => { println!("Completed"); }
        _ = sleep(Duration::from_secs(5)) => { println!("Timed out!"); }
    }
    // 当 select! 选择超时分支时，process() future 会被丢弃
    // 也就是自动清理，不需要 CancellationToken
}
```

### 真实模式：带超时的并发请求

```csharp
// C#：带取消的并发 HTTP 请求
public async Task<string[]> FetchAllAsync(string[] urls, CancellationToken ct)
{
    var tasks = urls.Select(url => httpClient.GetStringAsync(url, ct));
    return await Task.WhenAll(tasks);
}
```

```rust
// Rust：使用 tokio::join! 或 futures::join_all 进行并发请求
use futures::future::join_all;

async fn fetch_all(urls: &[&str]) -> Vec<Result<String, reqwest::Error>> {
    let futures = urls.iter().map(|url| reqwest::get(*url));
    let responses = join_all(futures).await;

    let mut results = Vec::new();
    for resp in responses {
        results.push(resp?.text().await);
    }
    results
}

// 带超时：
async fn fetch_all_with_timeout(urls: &[&str]) -> Result<Vec<String>, &'static str> {
    tokio::time::timeout(
        Duration::from_secs(10),
        async {
            let futures: Vec<_> = urls.iter()
                .map(|url| async { reqwest::get(*url).await?.text().await })
                .collect();
            let results = join_all(futures).await;
            results.into_iter().collect::<Result<Vec<_>, _>>()
        }
    )
    .await
    .map_err(|_| "Request timed out")?
    .map_err(|_| "Request failed")
}
```

<details>
<summary><strong>🏋️ 练习：Async 超时模式</strong>（点击展开）</summary>

**挑战：** 编写一个 async 函数，同时从两个 URL 获取数据，返回先响应的那个，并取消另一个。（这相当于 C# 中的 `Task.WhenAny`。）

<details>
<summary>🔑 参考答案</summary>

```rust
use tokio::time::{sleep, Duration};

// 模拟 async fetch
async fn fetch(url: &str, delay_ms: u64) -> String {
    sleep(Duration::from_millis(delay_ms)).await;
    format!("Response from {url}")
}

async fn fetch_first(url1: &str, url2: &str) -> String {
    tokio::select! {
        result = fetch(url1, 200) => {
            println!("URL 1 won");
            result
        }
        result = fetch(url2, 500) => {
            println!("URL 2 won");
            result
        }
    }
    // 输掉分支的 future 会被自动丢弃（取消）
}

#[tokio::main]
async fn main() {
    let result = fetch_first("https://fast.api", "https://slow.api").await;
    println!("{result}");
}
```

**关键要点：** `tokio::select!` 是 Rust 中对应 `Task.WhenAny` 的工具，它让多个 future 竞速，在第一个完成时返回，并丢弃（取消）其余 future。

</details>
</details>

### 使用 `tokio::spawn` 启动独立 task

在 C# 中，`Task.Run` 会启动独立于调用方运行的工作。Rust 中的对应工具是 `tokio::spawn`：

```rust
use tokio::task;

async fn background_work() {
    // 独立运行，即使调用方的 future 被丢弃也会继续
    let handle = task::spawn(async {
        tokio::time::sleep(Duration::from_secs(2)).await;
        42
    });

    // 在 spawned task 运行时做其他工作...
    println!("Doing other work");

    // 需要结果时再 await
    let result = handle.await.unwrap(); // 42
}
```

```csharp
// C# 等价写法
var task = Task.Run(async () => {
    await Task.Delay(2000);
    return 42;
});
// 做其他工作...
var result = await task;
```

**关键差异：** 普通 `async {}` 块是惰性的，不被 await 就什么也不做。`tokio::spawn` 会立即把它提交到 runtime 上运行，类似 C# 的 `Task.Run`。

<a id="pin-why-rust-async-has-a-concept-c-doesnt"></a>

### Pin：Rust Async 中 C# 没有的概念

C# 开发者不会遇到 `Pin`：CLR 的垃圾回收器可以自由移动对象，并自动更新所有引用。Rust 没有 GC。当编译器把 `async fn` 转换成状态机时，这个结构体可能包含指向自身字段的内部指针。移动这个结构体会让这些指针失效。

`Pin<T>` 是一个包装器，意思是：**“这个值在内存中不会再被移动。”**

```rust
// 你会在这些上下文中看到 Pin：
trait Future {
    type Output;
    fn poll(self: Pin<&mut Self>, cx: &mut Context<'_>) -> Poll<Self::Output>;
    //           ^^^^^^^^^^^^^^ pinned：内部引用保持有效
}

// 从 trait 返回 boxed future：
fn make_future() -> Pin<Box<dyn Future<Output = i32> + Send>> {
    Box::pin(async { 42 })
}
```

**实践中，你几乎不会自己写 `Pin`。** `async fn` 和 `.await` 语法会处理它。你通常只会在这些地方遇到它：

- 编译器错误消息中（跟随建议即可）。
- `tokio::select!` 中（使用 `pin!()` 宏）。
- 返回 `dyn Future` 的 trait 方法中（使用 `Box::pin(async { ... })`）。

> **想进一步深入？** 配套的 [Async Rust Training](../../async-book/src/ch04-pin-and-unpin.md) 完整介绍了 Pin、Unpin、自引用结构体和结构化 pinning。

***
