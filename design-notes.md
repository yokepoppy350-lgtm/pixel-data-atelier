# 视觉与动作设计依据 / Design rationale

根据用户对配色疲劳与桌宠僵硬的反馈，重新设计视觉与动作。

## 颜色

参考 IBM Carbon 的「中性色 + 有目的的色彩重点」，不用统一品牌色染满所有内容。暖纸底与深墨紫导航形成阅读层次。桃色开场、蓝色数据指标、紫色分析标签、橙色处理动作，各自承担角色。类别柱状图用稳定的类别色，直方图用单色序列，相关性使用双向色阶，并保留标签与数值。

https://www.carbondesignsystem.com/building-blocks/data-visualization/color-palettes

## 动作

参考游戏动画中的 squash/stretch、anticipation、follow-through 和 staging。飞行速度逐渐变化，到达目标前减速，身体随转向倾斜，悬停时轻微呼吸。翅膀六个姿态，尾巴与脚延迟摆动，间歇眨眼，拖动时表情变化。鼠标移入会减速，方便点击。拍扁使用单独的扁平姿态和短暂碰撞反馈，随后完全静止，只有用户点「唤醒」才恢复。角色为本项目原创程序绘制像素图，没有复制参考作品资产。

https://www.gamedeveloper.com/game-platforms/12-principles-for-game-animation
https://studiominiboss.itch.io/pixel-art-tutorials

## 布局 / Layout

从品牌宣传页式仪表盘改为数据工作簿：标题栏、文件操作、横向功能页签、原表预览、图形观察、数据备忘和操作记录。删除大标语、四张 KPI 卡与固定侧边栏。数据表是首屏主体，分析结果与处理控件紧邻放置，宽表格仅在自己的区域滚动。

参考 Observable 的 table cell 与 DuckDB 的 table summary/notebook；经典桌面窗口参考 98.css，但没有导入或复制其样式。

https://observablehq.github.io/documentation/cells/data-table
https://www.duckdb.org/2025/03/12/duckdb-ui
https://jdan.github.io/98.css/

## Scope

Palette and motion choices adapt the references to a bilingual analysis workspace. They are design decisions, not claims that one visual style is objectively superior.
