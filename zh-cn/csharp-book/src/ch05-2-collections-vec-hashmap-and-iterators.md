# 集合：Vec、HashMap 与迭代器

## `Vec<T>` vs `List<T>`

> **你将学到什么：** `Vec<T>` 与 `List<T>` 的对比，`HashMap` 与 `Dictionary` 的对比，安全访问模式（为什么 Rust 返回 `Option` 而不是抛异常），以及集合带来的所有权影响。
>
> **难度：** 🟢 初级

`Vec<T>` 是 Rust 中对应 C# `List<T>` 的类型，但它带有所有权语义。

### C# `List<T>`

```csharp
// C# List<T>：引用类型，分配在堆上
var numbers = new List<int>();
numbers.Add(1);
numbers.Add(2);
numbers.Add(3);

// 传给方法：复制的是引用
ProcessList(numbers);
Console.WriteLine(numbers.Count);  // 仍然可以访问

void ProcessList(List<int> list)
{
	list.Add(4);  // 修改原始 list
	Console.WriteLine($"Count in method: {list.Count}");
}
```

### Rust `Vec<T>`

```rust
// Rust Vec<T>：拥有所有权的类型，分配在堆上
let mut numbers = Vec::new();
numbers.push(1);
numbers.push(2);
numbers.push(3);

// 接收所有权的方法
process_vec(numbers);
// println!("{:?}", numbers);  // ❌ 错误：numbers 已经被移动

// 借用的方法
let mut numbers = vec![1, 2, 3];  // vec! 宏，写起来更方便
process_vec_borrowed(&mut numbers);
println!("{:?}", numbers);  // ✅ 仍然可以访问

fn process_vec(mut vec: Vec<i32>) {  // 取得所有权
	vec.push(4);
	println!("Count in method: {}", vec.len());
	// vec 在这里被丢弃
}

fn process_vec_borrowed(vec: &mut Vec<i32>) {  // 可变借用
	vec.push(4);
	println!("Count in method: {}", vec.len());
}
```

### 创建与初始化 Vector

```csharp
// C# List 初始化
var numbers = new List<int> { 1, 2, 3, 4, 5 };
var empty = new List<int>();
var sized = new List<int>(10);  // 初始容量

// 从其他集合创建
var fromArray = new List<int>(new[] { 1, 2, 3 });
```

```rust
// Rust Vec 初始化
let numbers = vec![1, 2, 3, 4, 5];  // vec! 宏
let empty: Vec<i32> = Vec::new();   // 空 Vec 需要类型标注
let sized = Vec::with_capacity(10); // 预分配容量

// 从迭代器创建
let from_range: Vec<i32> = (1..=5).collect();
let from_array = vec![1, 2, 3];
```

### 常见操作对比

```csharp
// C# List 操作
var list = new List<int> { 1, 2, 3 };

list.Add(4);                    // 添加元素
list.Insert(0, 0);              // 按索引插入
list.Remove(2);                 // 移除第一个匹配项
list.RemoveAt(1);               // 按索引移除
list.Clear();                   // 移除全部元素

int first = list[0];            // 索引访问
int count = list.Count;         // 获取数量
bool contains = list.Contains(3); // 检查是否包含
```

```rust
// Rust Vec 操作
let mut vec = vec![1, 2, 3];

vec.push(4);                    // 添加元素
vec.insert(0, 0);               // 按索引插入
vec.retain(|&x| x != 2);        // 移除元素（函数式风格）
vec.remove(1);                  // 按索引移除
vec.clear();                    // 移除全部元素

let first = vec[0];             // 索引访问（越界时 panic）
let safe_first = vec.get(0);    // 安全访问，返回 Option<&T>
let count = vec.len();          // 获取数量
let contains = vec.contains(&3); // 检查是否包含
```

### 安全访问模式

```csharp
// C# - 基于异常的边界检查
public int SafeAccess(List<int> list, int index)
{
	try
	{
		return list[index];
	}
	catch (ArgumentOutOfRangeException)
	{
		return -1;  // 默认值
	}
}
```

```rust
// Rust - 基于 Option 的安全访问
fn safe_access(vec: &[i32], index: usize) -> Option<i32> {
	vec.get(index).copied()  // 返回 Option<i32>
}

fn main() {
	let vec = vec![1, 2, 3];
    
	// 安全访问模式
	match vec.get(10) {
		Some(value) => println!("Value: {}", value),
		None => println!("Index out of bounds"),
	}
    
	// 或使用 unwrap_or
	let value = vec.get(10).copied().unwrap_or(-1);
	println!("Value: {}", value);
}
```

***

## HashMap vs Dictionary

`HashMap` 是 Rust 中对应 C# `Dictionary<K,V>` 的类型。

### C# Dictionary

```csharp
// C# Dictionary<TKey, TValue>
var scores = new Dictionary<string, int>
{
	["Alice"] = 100,
	["Bob"] = 85,
	["Charlie"] = 92
};

// 添加/更新
scores["Dave"] = 78;
scores["Alice"] = 105;  // 更新已有项

// 安全访问
if (scores.TryGetValue("Eve", out int score))
{
	Console.WriteLine($"Eve's score: {score}");
}
else
{
	Console.WriteLine("Eve not found");
}

// 迭代
foreach (var kvp in scores)
{
	Console.WriteLine($"{kvp.Key}: {kvp.Value}");
}
```

### Rust HashMap

```rust
use std::collections::HashMap;

// 创建并初始化 HashMap
let mut scores = HashMap::new();
scores.insert("Alice".to_string(), 100);
scores.insert("Bob".to_string(), 85);
scores.insert("Charlie".to_string(), 92);

// 或从迭代器创建
let scores: HashMap<String, i32> = [
	("Alice".to_string(), 100),
	("Bob".to_string(), 85),
	("Charlie".to_string(), 92),
].into_iter().collect();

// 添加/更新
let mut scores = scores;  // 设为可变
scores.insert("Dave".to_string(), 78);
scores.insert("Alice".to_string(), 105);  // 更新已有项

// 安全访问
match scores.get("Eve") {
	Some(score) => println!("Eve's score: {}", score),
	None => println!("Eve not found"),
}

// 迭代
for (name, score) in &scores {
	println!("{}: {}", name, score);
}
```

### HashMap 操作

```csharp
// C# Dictionary 操作
var dict = new Dictionary<string, int>();

dict["key"] = 42;                    // 插入/更新
bool exists = dict.ContainsKey("key"); // 检查是否存在
bool removed = dict.Remove("key");    // 移除
dict.Clear();                        // 清空全部

// 获取值，缺失时使用默认值
int value = dict.GetValueOrDefault("missing", 0);
```

```rust
use std::collections::HashMap;

// Rust HashMap 操作
let mut map = HashMap::new();

map.insert("key".to_string(), 42);   // 插入/更新
let exists = map.contains_key("key"); // 检查是否存在
let removed = map.remove("key");      // 移除，返回 Option<V>
map.clear();                         // 清空全部

// Entry API：用于更高级的操作
let mut map = HashMap::new();
map.entry("key".to_string()).or_insert(42);  // 不存在时插入
map.entry("key".to_string()).and_modify(|v| *v += 1); // 存在时修改

// 获取值，缺失时使用默认值
let value = map.get("missing").copied().unwrap_or(0);
```

### HashMap 键和值的所有权

```rust
// 理解 HashMap 中的所有权
fn ownership_example() {
	let mut map = HashMap::new();
    
	// String 键和值会被移动进 map
	let key = String::from("name");
	let value = String::from("Alice");
    
	map.insert(key, value);
	// println!("{}", key);   // ❌ 错误：key 已经被移动
	// println!("{}", value); // ❌ 错误：value 已经被移动
    
	// 通过引用访问
	if let Some(name) = map.get("name") {
		println!("Name: {}", name);  // 借用值
	}
}

// 使用 &str 作为键（不发生所有权转移）
fn string_slice_keys() {
	let mut map = HashMap::new();
    
	map.insert("name", "Alice");     // &str 键和值
	map.insert("age", "30");
    
	// 字符串字面量没有所有权问题
	println!("Name exists: {}", map.contains_key("name"));
}
```

***

## 使用集合

### 迭代模式

```csharp
// C# 迭代模式
var numbers = new List<int> { 1, 2, 3, 4, 5 };

// 带索引的 for 循环
for (int i = 0; i < numbers.Count; i++)
{
	Console.WriteLine($"Index {i}: {numbers[i]}");
}

// foreach 循环
foreach (int num in numbers)
{
	Console.WriteLine(num);
}

// LINQ 方法
var doubled = numbers.Select(x => x * 2).ToList();
var evens = numbers.Where(x => x % 2 == 0).ToList();
```

```rust
// Rust 迭代模式
let numbers = vec![1, 2, 3, 4, 5];

// 带索引的 for 循环
for (i, num) in numbers.iter().enumerate() {
	println!("Index {}: {}", i, num);
}

// 遍历值
for num in &numbers {  // 借用每个元素
	println!("{}", num);
}

// 迭代器方法（类似 LINQ）
let doubled: Vec<i32> = numbers.iter().map(|x| x * 2).collect();
let evens: Vec<i32> = numbers.iter().filter(|&x| x % 2 == 0).cloned().collect();

// 或者更高效地使用消耗型迭代器
let doubled: Vec<i32> = numbers.into_iter().map(|x| x * 2).collect();
```

### Iterator vs IntoIterator vs Iter

```rust
// 理解不同迭代方法
fn iteration_methods() {
	let vec = vec![1, 2, 3, 4, 5];
    
	// 1. iter() - 借用元素（&T）
	for item in vec.iter() {
		println!("{}", item);  // item 是 &i32
	}
	// 这里仍然可以使用 vec
    
	// 2. into_iter() - 取得所有权（T）
	for item in vec.into_iter() {
		println!("{}", item);  // item 是 i32
	}
	// 这里之后不能再使用 vec
    
	let mut vec = vec![1, 2, 3, 4, 5];
    
	// 3. iter_mut() - 可变借用（&mut T）
	for item in vec.iter_mut() {
		*item *= 2;  // item 是 &mut i32
	}
	println!("{:?}", vec);  // [2, 4, 6, 8, 10]
}
```

### 收集结果

```csharp
// C# - 处理可能出错的集合
public List<int> ParseNumbers(List<string> inputs)
{
	var results = new List<int>();
	foreach (string input in inputs)
	{
		if (int.TryParse(input, out int result))
		{
			results.Add(result);
		}
		// 静默跳过无效输入
	}
	return results;
}
```

```rust
// Rust - 使用 collect 显式处理错误
fn parse_numbers(inputs: Vec<String>) -> Result<Vec<i32>, std::num::ParseIntError> {
	inputs.into_iter()
		.map(|s| s.parse::<i32>())  // 返回 Result<i32, ParseIntError>
		.collect()                  // 收集为 Result<Vec<i32>, ParseIntError>
}

// 另一种做法：过滤掉错误
fn parse_numbers_filter(inputs: Vec<String>) -> Vec<i32> {
	inputs.into_iter()
		.filter_map(|s| s.parse::<i32>().ok())  // 只保留 Ok 值
		.collect()
}

fn main() {
	let inputs = vec!["1".to_string(), "2".to_string(), "invalid".to_string(), "4".to_string()];
    
	// 遇到第一个错误就失败的版本
	match parse_numbers(inputs.clone()) {
		Ok(numbers) => println!("All parsed: {:?}", numbers),
		Err(error) => println!("Parse error: {}", error),
	}
    
	// 跳过错误的版本
	let numbers = parse_numbers_filter(inputs);
	println!("Successfully parsed: {:?}", numbers);  // [1, 2, 4]
}
```

---

## 练习

<details>
<summary><strong>🏋️ 练习：从 LINQ 到迭代器</strong>（点击展开）</summary>

把下面的 C# LINQ 查询翻译成惯用 Rust 迭代器写法：

```csharp
var result = students
	.Where(s => s.Grade >= 90)
	.OrderByDescending(s => s.Grade)
	.Select(s => $"{s.Name}: {s.Grade}")
	.Take(3)
	.ToList();
```

使用这个结构体：

```rust
struct Student { name: String, grade: u32 }
```

返回一个 `Vec<String>`，包含成绩大于等于 90 的前三名学生，格式为 `"Name: Grade"`。

<details>
<summary>🔑 参考答案</summary>

```rust
#[derive(Debug)]
struct Student { name: String, grade: u32 }

fn top_students(students: &mut [Student]) -> Vec<String> {
	students.sort_by(|a, b| b.grade.cmp(&a.grade)); // 降序排序
	students.iter()
		.filter(|s| s.grade >= 90)
		.take(3)
		.map(|s| format!("{}: {}", s.name, s.grade))
		.collect()
}

fn main() {
	let mut students = vec![
		Student { name: "Alice".into(), grade: 95 },
		Student { name: "Bob".into(), grade: 88 },
		Student { name: "Carol".into(), grade: 92 },
		Student { name: "Dave".into(), grade: 97 },
		Student { name: "Eve".into(), grade: 91 },
	];
	let result = top_students(&mut students);
	assert_eq!(result, vec!["Dave: 97", "Alice: 95", "Carol: 92"]);
	println!("{result:?}");
}
```

**与 C# 的关键差异**：Rust 迭代器是惰性的（类似 LINQ），但 `.sort_by()` 是立即执行且原地排序的操作，没有惰性的 `OrderBy`。你需要先排序，再链式执行惰性操作。

</details>
</details>

***
