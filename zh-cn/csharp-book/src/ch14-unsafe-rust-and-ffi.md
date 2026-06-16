# 14. Unsafe Rust 与 FFI

## Unsafe Rust

> **你将学到什么：** `unsafe` 允许做什么（原始指针、FFI、未经检查的转换），safe wrapper 模式，调用原生代码时 C# P/Invoke 与 Rust FFI 的对比，以及 `unsafe` 块的安全检查清单。
>
> **难度：** 🔴 高级

Unsafe Rust 允许你执行借用检查器无法验证的操作。应当谨慎使用，并配上清晰文档。

> **高级内容：** 关于 unsafe 代码之上的安全抽象模式（arena allocator、无锁结构、自定义 vtable），见 [Rust Patterns](../../rust-patterns-book/src/summary.md)。

<a id="when-you-need-unsafe"></a>

### 什么时候需要 Unsafe

```rust
// 1. 解引用原始指针
let mut value = 42;
let ptr = &mut value as *mut i32;
// SAFETY: ptr points to a valid, live local variable.
unsafe {
    *ptr = 100; // 必须放在 unsafe 块中
}

// 2. 调用 unsafe 函数
unsafe fn dangerous() {
    // 内部实现要求调用方维持不变量
}

// SAFETY: no invariants to uphold for this example function.
unsafe {
    dangerous(); // 调用方承担责任
}

// 3. 访问可变静态变量
static mut COUNTER: u32 = 0;
// SAFETY: single-threaded context; no concurrent access to COUNTER.
unsafe {
    COUNTER += 1; // 非线程安全，调用方必须保证同步
}

// 4. 实现 unsafe trait
unsafe trait UnsafeTrait {
    fn do_something(&self);
}
```

### C# 对比：unsafe 关键字

```csharp
// C# unsafe：概念相似，但作用范围不同
unsafe void UnsafeExample()
{
    int value = 42;
    int* ptr = &value;
    *ptr = 100;
    
    // C# unsafe 主要关于指针运算
    // Rust unsafe 主要关于放宽所有权/借用规则
}

// C# fixed：固定托管对象
unsafe void PinnedExample()
{
    byte[] buffer = new byte[100];
    fixed (byte* ptr = buffer)
    {
        // ptr 只在这个块内有效
    }
}
```

### Safe Wrapper

```rust
/// 关键模式：把 unsafe 代码包装在安全 API 内部
pub struct SafeBuffer {
    data: Vec<u8>,
}

impl SafeBuffer {
    pub fn new(size: usize) -> Self {
        SafeBuffer { data: vec![0; size] }
    }
    
    /// 安全 API：带边界检查的访问
    pub fn get(&self, index: usize) -> Option<u8> {
        self.data.get(index).copied()
    }
    
    /// 快速的 unchecked 访问：内部使用 unsafe，但通过边界检查安全包装
    pub fn get_unchecked_safe(&self, index: usize) -> Option<u8> {
        if index < self.data.len() {
            // SAFETY: we just checked that index is in bounds
            Some(unsafe { *self.data.get_unchecked(index) })
        } else {
            None
        }
    }
}
```

***

<a id="interop-with-c-via-ffi"></a>

## 通过 FFI 与 C# 互操作

Rust 可以暴露 C 兼容函数，让 C# 通过 P/Invoke 调用。

```mermaid
graph LR
    subgraph "C# 进程"
        CS["C# 代码"] -->|"P/Invoke"| MI["Marshal 层<br/>UTF-16 → UTF-8<br/>struct layout"]
    end
    MI -->|"C ABI 调用"| FFI["FFI 边界"]
    subgraph "Rust cdylib（.so / .dll）"
        FFI --> RF["extern \"C\" fn<br/>#[no_mangle]"]
        RF --> Safe["Safe Rust<br/>内部实现"]
    end

    style FFI fill:#fff9c4,color:#000
    style MI fill:#bbdefb,color:#000
    style Safe fill:#c8e6c9,color:#000
```

### Rust 库（编译为 cdylib）

```rust
// src/lib.rs
#[no_mangle]
pub extern "C" fn add_numbers(a: i32, b: i32) -> i32 {
    a + b
}

#[no_mangle]
pub extern "C" fn process_string(input: *const std::os::raw::c_char) -> i32 {
    // SAFETY: input is non-null (checked inside) and assumed null-terminated by caller.
    let c_str = unsafe {
        if input.is_null() {
            return -1;
        }
        std::ffi::CStr::from_ptr(input)
    };
    
    match c_str.to_str() {
        Ok(s) => s.len() as i32,
        Err(_) => -1,
    }
}
```

```toml
# Cargo.toml
[lib]
crate-type = ["cdylib"]
```

### C# 调用方（P/Invoke）

```csharp
using System.Runtime.InteropServices;

public static class RustInterop
{
    [DllImport("my_rust_lib", CallingConvention = CallingConvention.Cdecl)]
    public static extern int add_numbers(int a, int b);
    
    [DllImport("my_rust_lib", CallingConvention = CallingConvention.Cdecl)]
    public static extern int process_string(
        [MarshalAs(UnmanagedType.LPUTF8Str)] string input);
}

// 用法
int sum = RustInterop.add_numbers(5, 3);  // 8
int len = RustInterop.process_string("Hello from C#!");  // 15
```

### FFI 安全检查清单

向 C# 暴露 Rust 函数时，这些规则可以避免最常见的 bug：

1. **始终使用 `extern "C"`**：否则 Rust 会使用自己的、不稳定的调用约定。C# P/Invoke 期望的是 C ABI。

2. **使用 `#[no_mangle]`**：防止 Rust 编译器改写函数名。没有它，C# 找不到符号。

3. **绝不要让 panic 穿过 FFI 边界**：Rust panic unwind 进入 C# 是**未定义行为**。在 FFI 入口捕获 panic：

    ```rust
    #[no_mangle]
    pub extern "C" fn safe_ffi_function() -> i32 {
        match std::panic::catch_unwind(|| {
            // 真实逻辑写在这里
            42
        }) {
            Ok(result) => result,
            Err(_) => -1,  // 返回错误码，而不是 panic 到 C# 中
        }
    }
    ```

4. **Opaque struct 与 transparent struct**：如果 C# 只持有指针（opaque handle），不需要 `#[repr(C)]`。如果 C# 通过 `StructLayout` 读取结构体字段，你**必须**使用 `#[repr(C)]`：

    ```rust
    // Opaque：C# 只持有 IntPtr。不需要 #[repr(C)]。
    pub struct Connection { /* Rust-only fields */ }

    // Transparent：C# 直接 marshal 字段。必须使用 #[repr(C)]。
    #[repr(C)]
    pub struct Point { pub x: f64, pub y: f64 }
    ```

5. **空指针检查**：解引用前总是验证指针。C# 可能传入 `IntPtr.Zero`。

6. **字符串编码**：C# 内部使用 UTF-16。`MarshalAs(UnmanagedType.LPUTF8Str)` 会转换为 Rust `CStr` 可用的 UTF-8。请明确记录这个契约。

### 端到端示例：带生命周期管理的 Opaque Handle

这是生产环境中很常见的模式：Rust 拥有对象，C# 持有 opaque handle，并通过显式 create/destroy 函数管理生命周期。

**Rust 侧**（`src/lib.rs`）：

```rust
use std::ffi::{c_char, CStr};

pub struct ImageProcessor {
    width: u32,
    height: u32,
    pixels: Vec<u8>,
}

/// Create a new processor. Returns null on invalid dimensions.
#[no_mangle]
pub extern "C" fn processor_new(width: u32, height: u32) -> *mut ImageProcessor {
    if width == 0 || height == 0 {
        return std::ptr::null_mut();
    }
    let proc = ImageProcessor {
        width,
        height,
        pixels: vec![0u8; (width * height * 4) as usize],
    };
    Box::into_raw(Box::new(proc)) // 分配到堆上，返回原始指针
}

/// Apply a grayscale filter. Returns 0 on success, -1 on null pointer.
#[no_mangle]
pub extern "C" fn processor_grayscale(ptr: *mut ImageProcessor) -> i32 {
    // SAFETY: ptr was created by Box::into_raw (non-null), still valid.
    let proc = match unsafe { ptr.as_mut() } {
        Some(p) => p,
        None => return -1,
    };
    for chunk in proc.pixels.chunks_exact_mut(4) {
        let gray = (0.299 * chunk[0] as f64
                  + 0.587 * chunk[1] as f64
                  + 0.114 * chunk[2] as f64) as u8;
        chunk[0] = gray;
        chunk[1] = gray;
        chunk[2] = gray;
    }
    0
}

/// Destroy the processor. Safe to call with null.
#[no_mangle]
pub extern "C" fn processor_free(ptr: *mut ImageProcessor) {
    if !ptr.is_null() {
        // SAFETY: ptr was created by processor_new via Box::into_raw
        unsafe { drop(Box::from_raw(ptr)); }
    }
}
```

**C# 侧**：

```csharp
using System.Runtime.InteropServices;

public sealed class ImageProcessor : IDisposable
{
    [DllImport("image_rust", CallingConvention = CallingConvention.Cdecl)]
    private static extern IntPtr processor_new(uint width, uint height);

    [DllImport("image_rust", CallingConvention = CallingConvention.Cdecl)]
    private static extern int processor_grayscale(IntPtr ptr);

    [DllImport("image_rust", CallingConvention = CallingConvention.Cdecl)]
    private static extern void processor_free(IntPtr ptr);

    private IntPtr _handle;

    public ImageProcessor(uint width, uint height)
    {
        _handle = processor_new(width, height);
        if (_handle == IntPtr.Zero)
            throw new ArgumentException("Invalid dimensions");
    }

    public void Grayscale()
    {
        if (processor_grayscale(_handle) != 0)
            throw new InvalidOperationException("Processor is null");
    }

    public void Dispose()
    {
        if (_handle != IntPtr.Zero)
        {
            processor_free(_handle);
            _handle = IntPtr.Zero;
        }
    }
}

// 用法：IDisposable 确保 Rust 内存被释放
using var proc = new ImageProcessor(1920, 1080);
proc.Grayscale();
// 自动调用 proc.Dispose() → processor_free() → Rust 丢弃 Vec
```

> **关键洞察：** 这是 Rust 版的 C# `SafeHandle` 模式。Rust 的 `Box::into_raw` / `Box::from_raw` 在 FFI 边界转移所有权，而 C# 的 `IDisposable` wrapper 负责确保清理。

---

## 练习

<details>
<summary><strong>🏋️ 练习：原始指针的安全 wrapper</strong>（点击展开）</summary>

你从一个 C 库收到原始指针。请编写一个安全的 Rust wrapper：

```rust
// 模拟 C API
extern "C" {
    fn lib_create_buffer(size: usize) -> *mut u8;
    fn lib_free_buffer(ptr: *mut u8);
}
```

要求：

1. 创建一个 `SafeBuffer` 结构体，包装这个原始指针。
2. 实现 `Drop`，调用 `lib_free_buffer`。
3. 通过 `as_slice()` 提供安全的 `&[u8]` 视图。
4. 确保 `SafeBuffer::new()` 在指针为空时返回 `None`。

<details>
<summary>🔑 参考答案</summary>

```rust,ignore
struct SafeBuffer {
    ptr: *mut u8,
    len: usize,
}

impl SafeBuffer {
    fn new(size: usize) -> Option<Self> {
        // SAFETY: lib_create_buffer returns a valid pointer or null (checked below).
        let ptr = unsafe { lib_create_buffer(size) };
        if ptr.is_null() {
            None
        } else {
            Some(SafeBuffer { ptr, len: size })
        }
    }

    fn as_slice(&self) -> &[u8] {
        // SAFETY: ptr is non-null (checked in new()), len is the
        // allocated size, and we hold exclusive ownership.
        unsafe { std::slice::from_raw_parts(self.ptr, self.len) }
    }
}

impl Drop for SafeBuffer {
    fn drop(&mut self) {
        // SAFETY: ptr was allocated by lib_create_buffer
        unsafe { lib_free_buffer(self.ptr); }
    }
}

// 用法：所有 unsafe 都被包含在 SafeBuffer 内部
fn process(buf: &SafeBuffer) {
    let data = buf.as_slice(); // 完全安全的 API
    println!("First byte: {}", data[0]);
}
```

**关键模式：** 把 `unsafe` 封装在很小的模块里，并配上 `// SAFETY:` 注释。对外暴露 100% 安全的公开 API。Rust 标准库就是这样做的，`Vec`、`String`、`HashMap` 内部都包含 unsafe，但对外提供安全接口。

</details>
</details>

***
