import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {Button, Layout, Radio, RadioGroup, Tooltip} from "@douyinfe/semi-ui";
import {
  IconGridStroked,
  IconRotationStroked,
  IconSettingStroked,
  IconStarStroked,
  IconUserCircleStroked,
} from "@douyinfe/semi-icons";
import React, {useEffect, useState} from "react";
import {LocalForageService as storage} from "../../utils/storage";
import { RadioChangeEvent } from "@douyinfe/semi-ui/lib/es/radio";

function SettingIndex() {
  const { Content, Header } = Layout;
  const location = useLocation();
  const navigate = useNavigate();

  const jumpPage = (event: RadioChangeEvent) => {
    storage.setItem("setting_last_path", event.target.value);
    navigate(event.target.value);
  }

  const backChat = () => {
    navigate("/comment");
  }

  const [title, setTitle] = useState<string>("");
  const pathToTitle: { [key: string]: string } = {
    '/setting/normal': '通用设置',
    '/setting/role': '角色预设',
    '/setting/model': '模型',
    '/setting/plugin': '插件',
  };
  useEffect(() => {
    setTitle(pathToTitle[location.pathname] || "Setting");
  }, [location.pathname]);

  useEffect(() => {
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      const mode = e.matches ? 'dark' : 'light';
      document.body.setAttribute('theme-mode', mode);
      storage.setItem("theme_mode", mode);
    };
    themeQuery.addEventListener('change', handleThemeChange);
  }, []);

  return (
    <Layout className="full-height">
      <Header data-tauri-drag-region className="setting-header">
        <div data-tauri-drag-region className="setting-title">{title}</div>
        <RadioGroup data-tauri-drag-region type='button' buttonSize='middle' defaultValue={location.pathname} onChange={jumpPage} aria-label="菜单">
          <Radio value='/setting/model'><IconStarStroked size="large" /><br/>模型</Radio>
          <Radio value='/setting/role'><IconUserCircleStroked size="large" /><br/>角色预设</Radio>
          <Radio value='/setting/plugin'><IconGridStroked size="large" /><br/>插件</Radio>
          <Radio value='/setting/normal'><IconSettingStroked size="large" /><br/>通用设置</Radio>
        </RadioGroup>
        <Tooltip content={'返回对话界面'}>
          <Button
            className="setting-back"
            theme="outline"
            type="danger"
            size="small"
            icon={<IconRotationStroked />}
            aria-label="返回"
            onClick={backChat}
          >返回</Button>
        </Tooltip>
      </Header>
      <Content className="setting-box full-height">
        <Outlet />
      </Content>
    </Layout>
  );
}

export default SettingIndex;