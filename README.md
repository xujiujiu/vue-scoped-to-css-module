# vue-scoped-to-cssModules
将 vue 2.x 工程的 scoped 转换成 css modules 的工具

## 插件安装

全局安装插件
```
npm i -g vue-scoped-to-cssModules
```
插件安装成功后可通过一下方式查看插件版本，若能正常展示版本号，即表示插件已安装成功
```
scoped2module -V
```

## 插件使用说明
通过下方指令可查看 scoped2module 插件可使用的转换指令
```
scoped2module -h
```

```
transform style of vue2 from scoped to css module

Options:
  -s, --src <path>          source file path, which can be a directory or a file path(default:PWD)
  -o, --out <path>          output file directory(default: temp_out)
  -e, --empty               empty the target directory(default: false)
  -q, --quiet               disabled transform success log(default: false)
  -i, --ignore <ignoredir>  ignore list of folders(default: "")
  -f, --format              format the file content(default: false)
  -V, --version             output the version number
  -h, --help                display help for command
```
### 参数 -s

-s 或 --src 用于指定需要转换的源文件路径，可以为目录或文件路径，默认为执行目录。值为文件路径时，需要为vue文件

```
scoped2module -s ./example  或 scoped2module -s ./example/test.vue
```

### 参数 -o

-o 或 --out 用于指定转换后的输出文件目录，默认为执行目录下的 temp_out，必须为文件夹形式

```
scoped2module -o ./temp
```

### 参数 -e

-e 或 --empty 用于指定在开始转换前是否清空目标目录【即 --out 指定的路径】

```
scoped2module -o ./temp -e   // 此指令在转换前清空 temp 目录内容
```

### 参数 -q

-q 或 --quiet 用于指定是否输出转换成功相关的转换日志，默认输出转换日志中包含所有转换成功和转换失败的记录，转换日志文件路径为：执行目录/scoped2module.log

```
scoped2module -q
```

### 参数 -i

-i 或--ignore 用于指定转换过程中需要忽略的文件夹，必须为文件夹名称

```
scoped2module -i pages  // 将在转换过程中忽略所有文件夹名称为 pages 下的所有 vue 文件
```
### 参数 -f

-f 或--format 用于指定格式化转换后的文件

```
scoped2module -f  // 将对执行目录下的所有执行过转换的文件进行格式化
```

