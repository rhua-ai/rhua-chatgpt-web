import { Layout } from "@douyinfe/semi-ui";
import {Navigate, Route, Routes} from "react-router-dom";
import CommentIndex from "./pages/comment/Index";
import SettingIndex from "./pages/setting/Index";
import RoleIndex from "./pages/setting/RoleIndex";
import ModelIndex from "./pages/setting/ModelIndex";
import PluginIndex from "./pages/setting/PluginIndex";
import NormalIndex from "./pages/setting/NormalIndex";
import NotFound from "./pages/404";
import {invoke} from "@tauri-apps/api/tauri";
import {useEffect, useState} from "react";
import {LocalForageService as storage} from "./utils/storage";

function Index() {
  const [runEnvType, setRunEnvType] = useState<string>("web");
  const { Content } = Layout;

  useEffect(() => {
    invoke("get_os_name").then((osName) => {
      setRunEnvType(osName as string);
    }).catch(() => console.log("Web浏览器"));

    storage.getItem<'light' | 'dark'>("theme_mode").then(mode => {
      if (mode) {
        document.body.setAttribute('theme-mode', mode);
      } else {
        document.body.setAttribute('theme-mode', 'dark');
      }
    });
  }, []);

  return (
    <Content className={`env-${runEnvType} main-box full-height semi-light-scrollbar`}>
      <Routes>
        <Route path="/" element={<Navigate to="/comment" />} />
        <Route path="/setting" element={<SettingIndex />} children={[
          <Route key="setting-role" path="role" element={<RoleIndex />} />,
          <Route key="setting-model" path="model" element={<ModelIndex />} />,
          <Route key="setting-plugin" path="plugin" element={<PluginIndex />} />,
          <Route key="setting-normal" path="normal" element={<NormalIndex />} />,
        ]} />
        <Route path="/comment" element={<CommentIndex />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Content>
  );
}

export default Index;