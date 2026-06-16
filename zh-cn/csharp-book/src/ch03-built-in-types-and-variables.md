# 3. 内置类型与变量

## 变量与可变性

> **你将学到什么：** Rust 的变量声明与可变性模型如何对应 C# 的 `var`/`const`，原始类型的映射，`String` 与 `&str` 之间非常关键的区别，类型推断，以及 Rust 处理类型转换的方式为何不同于 C#。
>
> **难度：** 🟢 初级

### C# 变量声明

```csharp
// C# - 变量默认可变
int count = 0;           // 可变
count = 5;               // ✅ 可以

// readonly 字段（只适用于类级别字段，不适用于局部变量）
// readonly int maxSize = 100;  // 初始化后不可变

const int BUFFER_SIZE = 1024; // 编译期常量（可用于局部变量或字段）
```

### Rust 变量声明

```rust
// Rust - 变量默认不可变
let count = 0;           // 默认不可变
// count = 5;            // ❌ 编译错误：不能给不可变变量二次赋值

let mut count = 0;       // 显式可变
count = 5;               // ✅ 可以

const BUFFER_SIZE: usize = 1024; // 编译期常量
```

### C# 开发者需要建立的关键心智模型

```rust
// 可以把 'let' 想成把 C# readonly 字段语义应用到所有变量上
let name = "John";       // 类似 readonly 字段：一旦设置就不能修改
let mut age = 30;        // 类似：int age = 30;

// 变量遮蔽（Rust 特有）
let spaces = "   ";        // 字符串
let spaces = spaces.len(); // 现在它是数字（usize）
// 这不同于修改变量：这里创建的是一个新变量
```

### 实用示例：计数器

```csharp
// C# 版本
public class Counter
{
    private int value = 0;
    
    public void Increment()
    {
        value++;  // 修改
    }
    
    public int GetValue() => value;
}
```

```rust
// Rust 版本
pub struct Counter {
    value: i32,  // 默认私有
}

impl Counter {
    pub fn new() -> Counter {
        Counter { value: 0 }
    }
    
    pub fn increment(&mut self) {  // 修改需要 &mut
        self.value += 1;
    }
    
    pub fn get_value(&self) -> i32 {
        self.value
    }
}
```

***

## 数据类型对比

### 原始类型

| C# 类型 | Rust 类型 | 大小 | 范围 |
|---------|-----------|------|------|
| `byte` | `u8` | 8 位 | 0 到 255 |
| `sbyte` | `i8` | 8 位 | -128 到 127 |
| `short` | `i16` | 16 位 | -32,768 到 32,767 |
| `ushort` | `u16` | 16 位 | 0 到 65,535 |
| `int` | `i32` | 32 位 | -2³¹ 到 2³¹-1 |
| `uint` | `u32` | 32 位 | 0 到 2³²-1 |
| `long` | `i64` | 64 位 | -2⁶³ 到 2⁶³-1 |
| `ulong` | `u64` | 64 位 | 0 到 2⁶⁴-1 |
| `float` | `f32` | 32 位 | IEEE 754 |
| `double` | `f64` | 64 位 | IEEE 754 |
| `bool` | `bool` | 1 位 | true/false |
| `char` | `char` | 32 位 | Unicode 标量值 |

### 尺寸类型（很重要！）

```csharp
// C# - int 始终是 32 位
int arrayIndex = 0;
long fileSize = file.Length;
```

```rust
// Rust - 尺寸类型会匹配指针大小（32 位或 64 位）
let array_index: usize = 0;    // 类似 C 中的 size_t
let file_size: u64 = file.len(); // 显式 64 位
```

### 类型推断

```csharp
// C# - var 关键字
var name = "John";        // string
var count = 42;           // int
var price = 29.99;        // double
```

```rust
// Rust - 自动类型推断
let name = "John";        // &str（字符串切片）
let count = 42;           // i32（默认整数类型）
let price = 29.99;        // f64（默认浮点类型）

// 显式类型标注
let count: u32 = 42;
let price: f32 = 29.99;
```

### 数组与集合概览

```csharp
// C# - 引用类型，分配在堆上
int[] numbers = new int[5];        // 固定大小
List<int> list = new List<int>();  // 动态大小
```

```rust
// Rust - 有多种选择
let numbers: [i32; 5] = [1, 2, 3, 4, 5];  // 栈上数组，固定大小
let mut list: Vec<i32> = Vec::new();       // 堆上 vector，动态大小
```

***

## 字符串类型：String 与 &str

这是 C# 开发者最容易困惑的概念之一，所以我们仔细拆开看。

### C# 字符串处理

```csharp
// C# - 简单的字符串模型
string name = "John";           // 字符串字面量
string greeting = "Hello, " + name;  // 字符串拼接
string upper = name.ToUpper();  // 方法调用
```

### Rust 字符串类型

```rust
// Rust - 两种主要字符串类型

// 1. &str（字符串切片）- 类似 C# 中的 ReadOnlySpan<char>
let name: &str = "John";        // 字符串字面量（不可变、借用）

// 2. String - 类似 StringBuilder 或可变字符串
let mut greeting = String::new();       // 空字符串
greeting.push_str("Hello, ");          // 追加
greeting.push_str(name);               // 追加

// 或者直接创建
let greeting = String::from("Hello, John");
let greeting = "Hello, John".to_string();  // 将 &str 转换为 String
```

### 什么时候用哪一个？

| 场景 | 使用 | C# 对应概念 |
|------|------|-------------|
| 字符串字面量 | `&str` | `string` 字面量 |
| 函数参数（只读） | `&str` | `string` 或 `ReadOnlySpan<char>` |
| 拥有所有权、可修改的字符串 | `String` | `StringBuilder` |
| 返回拥有所有权的字符串 | `String` | `string` |

### 实用示例

```rust
// 接受任意字符串类型的函数
fn greet(name: &str) {  // 同时接受 String 和 &str
    println!("Hello, {}!", name);
}

fn main() {
    let literal = "John";                    // &str
    let owned = String::from("Jane");        // String
    
    greet(literal);                          // 可以
    greet(&owned);                           // 可以（把 String 借用为 &str）
    greet("Bob");                            // 可以
}

// 返回拥有所有权的字符串的函数
fn create_greeting(name: &str) -> String {
    format!("Hello, {}!", name)  // format! 宏返回 String
}
```

### C# 开发者可以这样理解

```rust
// &str 类似 ReadOnlySpan<char>：它是指向字符串数据的一段视图
// String 类似你拥有并且可以修改的 char[]

let borrowed: &str = "I don't own this data";
let owned: String = String::from("I own this data");

// 二者之间的转换
let owned_copy: String = borrowed.to_string();  // 复制为拥有所有权的 String
let borrowed_view: &str = &owned;               // 从 owned 中借用出视图
```

***

## 打印与字符串格式化

C# 开发者会大量使用 `Console.WriteLine` 和字符串插值（`$""`）。Rust 的格式化系统同样强大，但它使用宏和格式说明符。

### 基本输出

```csharp
// C# 输出
Console.Write("no newline");
Console.WriteLine("with newline");
Console.Error.WriteLine("to stderr");

// 字符串插值（C# 6+）
string name = "Alice";
int age = 30;
Console.WriteLine($"{name} is {age} years old");
```

```rust
// Rust 输出：全都是宏（注意 !）
print!("no newline");              // → stdout，无换行
println!("with newline");           // → stdout + 换行
eprint!("to stderr");              // → stderr，无换行  
eprintln!("to stderr with newline"); // → stderr + 换行

// 字符串格式化（类似 $"" 插值）
let name = "Alice";
let age = 30;
println!("{name} is {age} years old");     // 内联捕获变量（Rust 1.58+）
println!("{} is {} years old", name, age); // 位置参数

// format! 返回 String，而不是打印
let msg = format!("{name} is {age} years old");
```

### 格式说明符

```csharp
// C# 格式说明符
Console.WriteLine($"{price:F2}");         // 固定小数位：29.99
Console.WriteLine($"{count:D5}");         // 补零整数：00042
Console.WriteLine($"{value,10}");         // 右对齐，宽度 10
Console.WriteLine($"{value,-10}");        // 左对齐，宽度 10
Console.WriteLine($"{hex:X}");            // 十六进制：FF
Console.WriteLine($"{ratio:P1}");         // 百分比：85.0%
```

```rust
// Rust 格式说明符
println!("{price:.2}");          // 2 位小数：29.99
println!("{count:05}");          // 补零，宽度 5：00042
println!("{value:>10}");         // 右对齐，宽度 10
println!("{value:<10}");         // 左对齐，宽度 10
println!("{value:^10}");         // 居中对齐，宽度 10
println!("{hex:#X}");            // 带前缀十六进制：0xFF
println!("{hex:08X}");           // 十六进制补零：000000FF
println!("{bits:#010b}");        // 带前缀二进制：0b00001010
println!("{big}", big = 1_000_000); // 命名参数
```

### Debug 打印与 Display 打印

```rust
// {:?}  — Debug trait（给开发者看的输出，可自动派生）
// {:#?} — 美化版 Debug（缩进、多行）
// {}    — Display trait（给用户看的输出，需要手动实现）

#[derive(Debug)] // 自动生成 Debug 输出
struct Point { x: f64, y: f64 }

let p = Point { x: 1.5, y: 2.7 };

println!("{:?}", p);   // Point { x: 1.5, y: 2.7 }   — 紧凑调试输出
println!("{:#?}", p);  // Point {                     — 美化调试输出
                        //     x: 1.5,
                        //     y: 2.7,
                        // }
// println!("{}", p);  // ❌ 错误：Point 没有实现 Display

// 为面向用户的输出实现 Display：
use std::fmt;

impl fmt::Display for Point {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "({}, {})", self.x, self.y)
    }
}
println!("{}", p);    // (1.5, 2.7)  — 面向用户更友好
```

```csharp
// C# 中的对应关系：
// {:?}  ≈ object.GetType().ToString() 或反射转储
// {}    ≈ object.ToString()
// 在 C# 中重写 ToString()；在 Rust 中实现 Display
```

### 速查

| C# | Rust | 输出 |
|----|------|------|
| `Console.WriteLine(x)` | `println!("{x}")` | Display 格式化 |
| `$"{x}"`（插值） | `format!("{x}")` | 返回 `String` |
| `x.ToString()` | `x.to_string()` | 需要 `Display` trait |
| 重写 `ToString()` | `impl Display` | 面向用户的输出 |
| 调试器视图 | `{:?}` 或 `dbg!(x)` | 面向开发者的输出 |
| `String.Format("{0:F2}", x)` | `format!("{x:.2}")` | 格式化后的 `String` |
| `Console.Error.WriteLine` | `eprintln!()` | 写入 stderr |

***

## 类型转换

C# 有隐式转换、显式强制转换 `(int)x`，以及 `Convert.To*()`。Rust 更严格：没有隐式数值转换。

### 数值转换

```csharp
// C# — 隐式转换与显式转换
int small = 42;
long big = small;              // 隐式扩大转换：OK
double d = small;              // 隐式扩大转换：OK
int truncated = (int)3.14;     // 显式缩窄转换：3
byte b = (byte)300;            // 静默溢出：44

// 安全转换
if (int.TryParse("42", out int parsed)) { /* ... */ }
```

```rust
// Rust — 所有数值转换都必须显式
let small: i32 = 42;
let big: i64 = small as i64;       // 扩大转换：显式使用 'as'
let d: f64 = small as f64;         // 整数到浮点：显式
let truncated: i32 = 3.14_f64 as i32; // 缩窄转换：3（截断）
let b: u8 = 300_u16 as u8;        // 溢出：回绕为 44（类似 C# unchecked）

// 使用 TryFrom 进行安全转换
use std::convert::TryFrom;
let safe: Result<u8, _> = u8::try_from(300_u16); // Err — 超出范围
let ok: Result<u8, _>   = u8::try_from(42_u16);  // Ok(42)

// 字符串解析：返回 Result，而不是 bool + out 参数
let parsed: Result<i32, _> = "42".parse::<i32>();   // Ok(42)
let bad: Result<i32, _>    = "abc".parse::<i32>();  // Err(ParseIntError)

// 使用 turbofish 语法：
let n = "42".parse::<f64>().unwrap(); // 42.0
```

### 字符串转换

```csharp
// C#
int n = 42;
string s = n.ToString();          // "42"
string formatted = $"{n:X}";
int back = int.Parse(s);          // 42 或抛出异常
bool ok = int.TryParse(s, out int result);
```

```rust
// Rust — 通过 Display 使用 to_string()，通过 FromStr 使用 parse()
let n: i32 = 42;
let s: String = n.to_string();            // "42"（使用 Display trait）
let formatted = format!("{n:X}");         // "2A"
let back: i32 = s.parse().unwrap();       // 42，失败则 panic
let result: Result<i32, _> = s.parse();   // Ok(42) — 安全版本

// &str ↔ String 转换（Rust 中最常见的转换）
let owned: String = "hello".to_string();    // &str → String
let owned2: String = String::from("hello"); // &str → String（等价）
let borrowed: &str = &owned;               // String → &str（免费，只是借用）
```

### 引用转换（没有继承强制转换！）

```csharp
// C# — 向上转型与向下转型
Animal a = new Dog();              // 向上转型（隐式）
Dog d = (Dog)a;                    // 向下转型（显式，可能抛异常）
if (a is Dog dog) { /* ... */ }    // 使用模式匹配安全向下转型
```

```rust
// Rust — 没有继承，也没有向上/向下转型
// 使用 trait object 实现多态：
let animal: Box<dyn Animal> = Box::new(Dog);

// “向下转型”需要 Any trait（很少需要）：
use std::any::Any;
if let Some(dog) = animal_any.downcast_ref::<Dog>() {
    // 使用 dog
}
// 实践中，优先使用 enum 代替向下转型：
enum Animal {
    Dog(Dog),
    Cat(Cat),
}
match animal {
    Animal::Dog(d) => { /* 使用 d */ }
    Animal::Cat(c) => { /* 使用 c */ }
}
```

### 速查

| C# | Rust | 说明 |
|----|------|------|
| `(int)x` | `x as i32` | 截断/回绕转换 |
| 隐式扩大转换 | 必须使用 `as` | 没有隐式数值转换 |
| `Convert.ToInt32(x)` | `i32::try_from(x)` | 安全，返回 `Result` |
| `int.Parse(s)` | `s.parse::<i32>().unwrap()` | 失败时 panic |
| `int.TryParse(s, out n)` | `s.parse::<i32>()` | 返回 `Result<i32, _>` |
| `(Dog)animal` | 不可用 | 使用 enum 或 `Any` |
| `as Dog` / `is Dog` | `downcast_ref::<Dog>()` | 通过 `Any` trait；优先使用 enum |

***

## 注释与文档

### 普通注释

```csharp
// C# 注释
// 单行注释
/* 多行
   注释 */

/// <summary>
/// XML 文档注释
/// </summary>
/// <param name="name">用户姓名</param>
/// <returns>问候语字符串</returns>
public string Greet(string name)
{
    return $"Hello, {name}!";
}
```

```rust
// Rust 注释
// 单行注释
/* 多行
   注释 */

/// 文档注释（类似 C# ///）
/// 这个函数按姓名问候用户。
/// 
/// # 参数
/// 
/// * `name` - 表示用户姓名的字符串切片
/// 
/// # 返回值
/// 
/// 包含问候语的 `String`
/// 
/// # 示例
/// 
/// ```
/// let greeting = greet("Alice");
/// assert_eq!(greeting, "Hello, Alice!");
/// ```
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}
```

### 文档生成

```bash
# 生成文档（类似 C# 中的 XML docs）
cargo doc --open

# 运行文档测试
cargo test --doc
```

---

## 练习

<details>
<summary><strong>🏋️ 练习：类型安全的温度转换</strong>（点击展开）</summary>

创建一个 Rust 程序，完成以下要求：

1. 声明一个表示摄氏绝对零度（`-273.15`）的 `const`。
2. 声明一个记录已执行转换次数的 `static` 计数器（使用 `AtomicU32`）。
3. 编写函数 `celsius_to_fahrenheit(c: f64) -> f64`，当温度低于绝对零度时返回 `f64::NAN`。
4. 演示变量遮蔽：先把字符串 `"98.6"` 解析成 `f64`，再进行转换。

<details>
<summary>🔑 参考答案</summary>

```rust
use std::sync::atomic::{AtomicU32, Ordering};

const ABSOLUTE_ZERO_C: f64 = -273.15;
static CONVERSION_COUNT: AtomicU32 = AtomicU32::new(0);

fn celsius_to_fahrenheit(c: f64) -> f64 {
    if c < ABSOLUTE_ZERO_C {
        return f64::NAN;
    }
    CONVERSION_COUNT.fetch_add(1, Ordering::Relaxed);
    c * 9.0 / 5.0 + 32.0
}

fn main() {
    let temp = "98.6";           // &str
    let temp: f64 = temp.parse().unwrap(); // 遮蔽为 f64
    let temp = celsius_to_fahrenheit(temp); // 遮蔽为华氏温度
    println!("{temp:.1}°F");
    println!("Conversions: {}", CONVERSION_COUNT.load(Ordering::Relaxed));
}
```

</details>
</details>

***