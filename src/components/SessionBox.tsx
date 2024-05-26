import React, {useState} from "react";
import {ChatSession} from "../interface/message";
import {Button, Collapsible, Dropdown, Layout, List, Modal, Tooltip, Typography} from "@douyinfe/semi-ui";
import {
  IconChevronDown,
  IconChevronUp,
  IconClose,
  IconHash, IconMoon,
  IconPlus, IconSettingStroked, IconSidebar, IconSun
} from "@douyinfe/semi-icons";
import {SessionSetting} from "../interface/setting";
import {LocalForageService as storage} from "../utils/storage";

interface SessionBoxProps {
  sessionSidebar: boolean;
  currentCommentSessionId: string;
  currentCommentSessionTitle: string;
  themeMode: string;
  commentSessionList: ChatSession[];
  sessionSetting: SessionSetting;
  createSession: (roleId: string) => void;
  selectSession: (sessionId: string) => void;
  removeSession: (event: React.MouseEvent<HTMLButtonElement>, sessionId: string) => void;
  triggerSessionSidebar: () => void;
  jumpPage: (path: string) => void;
  switchThemeMode: () => void;
}

const sessionEqual = (prevProps: SessionBoxProps, currentProps: SessionBoxProps) => {
  return prevProps.sessionSidebar === currentProps.sessionSidebar
    && prevProps.themeMode === currentProps.themeMode
    && prevProps.currentCommentSessionId === currentProps.currentCommentSessionId
    && prevProps.currentCommentSessionTitle === currentProps.currentCommentSessionTitle;
};

export const SessionBox: React.FC<SessionBoxProps> = React.memo((
  {
    sessionSidebar,
    currentCommentSessionId,
    currentCommentSessionTitle,
    themeMode,
    commentSessionList,
    sessionSetting,
    createSession,
    selectSession,
    removeSession,
    triggerSessionSidebar,
    jumpPage,
    switchThemeMode
  }
) => {
  const { Sider, Header, Content, Footer } = Layout;
  const { Text } = Typography;

  const [sessionRemoveModal, sessionRemoveContextHolder] = Modal.useModal();
  const [showHistorySession, setShowHistorySession] = useState<boolean>(false);

  const changeHistorySession = () => {
    setShowHistorySession(prevState => !prevState);
  }

  const toSettingPage = async () => {
    const settingLastPath = await storage.getItem<string>("setting_last_path");
    if (settingLastPath) {
      jumpPage(settingLastPath);
    } else {
      jumpPage("/setting/model");
    }
  }

  return (
    <Sider className={`comment-sider full-height${sessionSidebar ? "" : " hidden"}`}>
      <Header data-tauri-drag-region className="comment-session-header">
        <div data-tauri-drag-region className="comment-session-top">
          <Tooltip content={'会话栏显隐'}>
            <Button
              theme="borderless"
              type="tertiary"
              icon={<IconSidebar/>}
              aria-label="会话栏显隐"
              onClick={triggerSessionSidebar}
            />
          </Tooltip>
        </div>
        <Text
          data-tauri-drag-region
          className="comment-session-title"
          children="若华"
        />
        <Text
          data-tauri-drag-region
          className="comment-session-title2"
          children="构建你的专属人工智能助手"
        />
        <Button
          className="comment-session-plus"
          theme="light"
          type="tertiary"
          size="large"
          icon={<IconPlus/>}
          onClick={() => createSession("")}
          children="创建新的聊天"
        />
      </Header>
      <Content data-tauri-drag-region className="comment-session-main">
        <List
          className="comment-session-list"
          dataSource={commentSessionList.slice(0, sessionSetting.chatSessionMaxNumber)}
          split={false}
          size="small"
          header={
            <Text className="comment-session-bar">近期聊天</Text>
          }
          renderItem={item => (
            <List.Item
              key={item.id}
              className={"comment-session-item" + (item.id == currentCommentSessionId ? " checked" : "")}
              onClick={() => selectSession(item.id)}
            >
              <Text icon={<IconHash/>}>{item.content}</Text>
              <div className="comment-session-more">
                <Button
                  theme="borderless"
                  type="tertiary"
                  size="small"
                  icon={<IconClose/>}
                  onClick={(event) => sessionRemoveModal.confirm({
                    title: "要删除此对话吗？",
                    content: "删除后将不在此处显示，并且该对话所有内容无法找回。",
                    okButtonProps: {type: 'danger', autoFocus: true},
                    onOk: () => removeSession(event, item.id)
                  })}
                />
              </div>
            </List.Item>
          )}
        />
        <List
          style={{display: commentSessionList.length > sessionSetting.chatSessionMaxNumber ? "block" : "none"}}
          className="comment-session-list"
          split={false}
          size="small"
        >
          <List.Item className="comment-session-item" onClick={changeHistorySession}>
            {
              showHistorySession ? (
                <Text icon={<IconChevronUp />}>收起</Text>
              ) : (
                <Text icon={<IconChevronDown />}>展开</Text>
              )
            }
          </List.Item>
        </List>
        <Collapsible isOpen={showHistorySession && commentSessionList.length > sessionSetting.chatSessionMaxNumber}>
          <List
            className="comment-session-list"
            dataSource={commentSessionList.slice(sessionSetting.chatSessionMaxNumber)}
            split={false}
            size="small"
            renderItem={item => (
              <List.Item
                key={item.id}
                className={"comment-session-item" + (item.id == currentCommentSessionId ? " checked" : "")}
                onClick={() => selectSession(item.id)}
              >
                <Text icon={<IconHash/>}>{item.content}</Text>
                <div className="comment-session-more">
                  <Button
                    theme="borderless"
                    type="tertiary"
                    size="small"
                    icon={<IconClose/>}
                    onClick={(event) => sessionRemoveModal.confirm({
                      title: "要删除此对话吗？",
                      content: "删除后将不在此处显示，并且该对话所有内容无法找回。",
                      okButtonProps: {type: 'danger', autoFocus: true},
                      onOk: () => removeSession(event, item.id)
                    })}
                  />
                </div>
              </List.Item>
            )}
          />
        </Collapsible>
      </Content>
      {sessionRemoveContextHolder}
      <Footer className="comment-session-footer">
        <Tooltip content="深/浅色切换">
          <Button
            type="tertiary"
            icon={themeMode === 'dark' ? <IconMoon /> : <IconSun />}
            aria-label="切换外观模式"
            onClick={switchThemeMode}
            children="切换外观模式"
          />
        </Tooltip>
        <Button
          type="tertiary"
          icon={<IconSettingStroked />}
          aria-label="菜单"
          onClick={toSettingPage}
          children="菜单设置"
        />
      </Footer>
    </Sider>
  )
}, sessionEqual);