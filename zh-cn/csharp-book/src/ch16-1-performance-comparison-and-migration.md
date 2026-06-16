<a id="performance-comparison-managed-vs-native"></a>
## 性能比较：托管运行时与原生执行

> **你将学到什么：** C# 与 Rust 在真实世界中的性能差异：启动时间、内存占用、吞吐 benchmark、CPU 密集型负载，以及何时迁移、何时继续留在 C# 的决策树。
>
> **难度：** 🟡 中级

### 真实世界性能特征

| **方面** | **C# (.NET)** | **Rust** | **性能影响** |
|------------|---------------|----------|------------------------|
| **启动时间** | 100-500ms（JIT）；5-30ms（.NET 8 AOT） | 1-10ms（原生二进制） | 🚀 **比 JIT 快 10-50 倍** |
| **内存占用** | +30-100%（GC 开销 + 元数据） | 基准水平（极小 runtime） | 💾 **少用 30-50% RAM** |
| **GC 暂停** | 周期性暂停 1-100ms | 永不暂停（无 GC） | ⚡ **延迟更稳定** |
| **CPU 使用** | +10-20%（GC + JIT 开销） | 基准水平（直接执行） | 🔋 **效率提升 10-20%** |
| **二进制大小** | 30-200MB（带 runtime）；10-30MB（AOT trim） | 1-20MB（静态二进制） | 📦 **部署体积更小** |
| **内存安全** | 运行期检查 | 编译期证明 | 🛡️ **零开销安全性** |
| **并发性能** | 良好（需要谨慎同步） | 优秀（无畏并发） | 🏃 **可伸缩性更强** |

> **关于 .NET 8+ AOT 的说明**：Native AOT 明显缩小了启动时间差距（5-30ms）。但在吞吐和内存方面，GC 开销与暂停仍然存在。评估迁移时，请 benchmark 你的**具体负载**，标题数字可能误导判断。

### 基准测试示例

```csharp
// C# - JSON 处理基准测试
public class JsonProcessor
{
    public async Task<List<User>> ProcessJsonFile(string path)
    {
        var json = await File.ReadAllTextAsync(path);
        var users = JsonSerializer.Deserialize<List<User>>(json);
        
        return users.Where(u => u.Age > 18)
                   .OrderBy(u => u.Name)
                   .Take(1000)
                   .ToList();
    }
}

// 典型性能：100MB 文件约 200ms
// 内存占用：峰值约 500MB（GC 开销）
// 二进制大小：约 80MB（self-contained）
```

```rust
// Rust - 等价 JSON 处理
use serde::{Deserialize, Serialize};
use tokio::fs;

#[derive(Deserialize, Serialize)]
struct User {
    name: String,
    age: u32,
}

pub async fn process_json_file(path: &str) -> Result<Vec<User>, Box<dyn std::error::Error>> {
    let json = fs::read_to_string(path).await?;
    let mut users: Vec<User> = serde_json::from_str(&json)?;
    
    users.retain(|u| u.age > 18);
    users.sort_by(|a, b| a.name.cmp(&b.name));
    users.truncate(1000);
    
    Ok(users)
}

// 典型性能：同一个 100MB 文件约 120ms
// 内存占用：峰值约 200MB（无 GC 开销）
// 二进制大小：约 8MB（静态二进制）
```

### CPU 密集型负载

```csharp
// C# - 数学计算
public class Mandelbrot
{
    public static int[,] Generate(int width, int height, int maxIterations)
    {
        var result = new int[height, width];
        
        Parallel.For(0, height, y =>
        {
            for (int x = 0; x < width; x++)
            {
                var c = new Complex(
                    (x - width / 2.0) * 4.0 / width,
                    (y - height / 2.0) * 4.0 / height);
                
                result[y, x] = CalculateIterations(c, maxIterations);
            }
        });
        
        return result;
    }
}

// 性能：约 2.3 秒（8 核机器）
// 内存：约 500MB
```

```rust
// Rust - 使用 Rayon 实现相同计算
use rayon::prelude::*;
use num_complex::Complex;

pub fn generate_mandelbrot(width: usize, height: usize, max_iterations: u32) -> Vec<Vec<u32>> {
    (0..height)
        .into_par_iter()
        .map(|y| {
            (0..width)
                .map(|x| {
                    let c = Complex::new(
                        (x as f64 - width as f64 / 2.0) * 4.0 / width as f64,
                        (y as f64 - height as f64 / 2.0) * 4.0 / height as f64,
                    );
                    calculate_iterations(c, max_iterations)
                })
                .collect()
        })
        .collect()
}

// 性能：约 1.1 秒（同一台 8 核机器）
// 内存：约 200MB
// 速度快 2 倍，内存占用少 60%
```

### 何时选择哪种语言

**选择 C# 的情况：**

- **快速开发至关重要**：工具生态成熟丰富。
- **团队具备 .NET 经验**：已有知识和技能可以直接复用。
- **企业集成**：大量使用 Microsoft 生态。
- **性能要求适中**：现有性能已经足够。
- **丰富 UI 应用**：WPF、WinUI、Blazor 应用。
- **原型与 MVP**：需要快速上市。

**选择 Rust 的情况：**

- **性能非常关键**：CPU/内存密集型应用。
- **资源约束重要**：嵌入式、边缘计算、serverless。
- **长时间运行服务**：Web 服务器、数据库、系统服务。
- **系统级编程**：OS 组件、驱动、网络工具。
- **高可靠性要求**：金融系统、安全关键应用。
- **并发/并行负载**：高吞吐数据处理。

### 迁移策略决策树

```mermaid
graph TD
    START["正在考虑 Rust？"]
    PERFORMANCE["性能是否关键？"]
    TEAM["团队是否有时间学习？"]
    EXISTING["是否有大型既有 C# 代码库？"]
    NEW_PROJECT["是新项目/新组件吗？"]
    
    INCREMENTAL["渐进式采用：<br/>• 先从 CLI 工具开始<br/>• 迁移性能关键组件<br/>• 构建新微服务"]
    
    FULL_RUST["全面采用 Rust：<br/>• 全新项目<br/>• 系统级服务<br/>• 高性能 API"]
    
    STAY_CSHARP["继续使用 C#：<br/>• 优化现有代码<br/>• 使用 .NET AOT / 性能特性<br/>• 考虑 .NET Native"]
    
    START --> PERFORMANCE
    PERFORMANCE -->|是| TEAM
    PERFORMANCE -->|否| STAY_CSHARP
    
    TEAM -->|是| EXISTING
    TEAM -->|否| STAY_CSHARP
    
    EXISTING -->|是| NEW_PROJECT
    EXISTING -->|否| FULL_RUST
    
    NEW_PROJECT -->|新建| FULL_RUST
    NEW_PROJECT -->|既有| INCREMENTAL
    
    style FULL_RUST fill:#c8e6c9,color:#000
    style INCREMENTAL fill:#fff3e0,color:#000
    style STAY_CSHARP fill:#e3f2fd,color:#000
```
