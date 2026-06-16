# 面向 C# 程序员的 Rust（中文翻译）

本仓库用于整理和翻译 Microsoft `RustTraining` 中的 `csharp-book` 内容，目标是形成适合中文读者阅读的《面向 C# 程序员的 Rust》。

## 目录结构

- `original-en/`：英文原版参考副本，后续翻译时不要直接修改。
- `zh-cn/csharp-book/`：中文 mdBook 项目，正文翻译在这里推进。
- `zh-cn/translation-meta/`：翻译准则、术语约定和进度记录。

## 本地预览

```powershell
Set-Location "zh-cn/csharp-book"
mdbook serve --open
```

也可以只构建静态站点：

```powershell
Set-Location "zh-cn/csharp-book"
mdbook build
```

## 当前进度

翻译进度见 `zh-cn/translation-meta/TRANSLATION_PROGRESS.md`。
