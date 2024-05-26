import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Index from "./Index";

// 应用样式
import "./styles.scss";
import "./markdown.css";
import "./markdown-dark.css";
import "katex/dist/katex.min.css"

// 主题样式
import "@semi-bot/semi-theme-xiangshuishidai/scss/index.scss";
import "@semi-bot/semi-theme-xiangshuishidai/scss/global.scss";
import "@semi-bot/semi-theme-xiangshuishidai/scss/animation.scss";
import "@semi-bot/semi-theme-xiangshuishidai/scss/local.scss";
import "@semi-bot/semi-theme-xiangshuishidai/semi.css";

// 启动主题
const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
document.body.setAttribute('theme-mode', themeQuery.matches ? 'dark' : 'light');

// 渲染根节点
createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Index />
  </BrowserRouter>
);