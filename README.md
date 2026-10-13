# 数析工坊 · Data Atelier

双语像素桌面风格的数据分析工作簿，参考 pandas 的常见分析流程。
Bilingual pixel desktop workbook for common pandas-inspired analysis workflows.

**Live site:** https://yokepoppy350-lgtm.github.io/pixel-data-atelier/

## 功能 / Features

- CSV / TSV / JSON / XLSX 导入、CSV 粘贴、示例数据。XLSX 读取第一张工作表。
- 数据预览、整表搜索、筛选、排序、字段选择。
- 缺失检测与填充、去重、类型转换、两列四则运算、左连接与内连接。
- 分组聚合、透视表、描述统计、日期聚合、Pearson 相关性。
- 柱状、折线、散点、直方和相关性热力图；由当前数据动态计算。
- CSV / JSON / SVG / Python 步骤 / 分析结果导出，20 步撤销重做。
- 原创像素猫桌宠：带惯性飞行、六帧翅膀、眨眼、尾巴跟随；拖动、拍扁暂停、主动唤醒与收起。

Import CSV, TSV, JSON or XLSX; inspect and transform rows; group, pivot, describe, resample and correlate; visualize and export. All computation stays in the browser. The original pixel cat flies, blinks, can be dragged and squashed, and stays paused until Wake is chosen.

## 本地打开 / Run locally

直接打开 `index.html`，或在此目录运行：

```sh
python -m http.server 8000
```

访问 http://localhost:8000 。无需安装前端依赖。所有资产包含在此目录，离线可用。
No frontend installation or build is needed; assets are vendored for offline use.

## 数据与范围 / Data and scope

示例 `demo-retail.csv` 为固定种子生成的合成零售数据：243 行、11 列、3 个整行重复、16 个缺失单元格；不代表真实经营情况。
`lookup.csv` 可按 `region` 连接，添加区域目标与负责人。

文件上限 10 MB、50,000 行、100 列。分组图显示前 24 组，散点显示前 5,000 点，热力图显示前 10 个数值列。数据与步骤自动保存在当前浏览器的 localStorage，可在「操作记录」清除。

本站使用 JavaScript 实现常见表格操作，并非完整 pandas Python 运行环境。标准差采用样本标准差，分位数采用线性插值；相关性按有效配对计算。无效日期会在聚合时跳过并提示。Python 导出记录已应用的步骤，原始输入文件和读取函数需要按实际情况设置。透视表特殊列名冲突会加数字后缀。空结果不会替换当前数据表。

This is a JavaScript implementation of common table operations, not a full pandas runtime. Exported Python steps are learning/reproduction recipes; choose the correct input file and reader. Special pivot category label collisions receive numeric suffixes. Correlation is not causation.

## 验证 / Validation

`VALIDATION.md` 记录实际执行的数值检查、pandas 对照与浏览器验证。
See `VALIDATION.md` for executed checks and limitations.

运行 `node tests.cjs` 可执行 20 项引擎检查；结果写入 `test-results/`。
Run `node tests.cjs` for the 20 engine checks; reports are written to `test-results/`.

## 参考与许可 / References and attribution

- pandas User Guide: https://pandas.pydata.org/docs/user_guide/
- IBM Carbon palette guidance: https://www.carbondesignsystem.com/building-blocks/data-visualization/color-palettes
- Observable table workflows: https://observablehq.github.io/documentation/cells/data-table
- DuckDB local notebook UI: https://www.duckdb.org/2025/03/12/duckdb-ui
- Classic window layout reference: https://jdan.github.io/98.css/ (reference only; no CSS copied)
- Game animation principles: https://www.gamedeveloper.com/game-platforms/12-principles-for-game-animation
- SheetJS CE 0.18.5 is vendored as `xlsx.full.min.js`; its Apache 2.0 license is retained in `LICENSE-SheetJS.txt`.

宠物与布局为本项目原创代码绘制，未复制参考站点资产。
Pet art and layout are original procedural/code assets; reference sites' assets are not copied.
