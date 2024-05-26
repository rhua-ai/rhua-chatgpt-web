import React, {useState} from "react";
import {Button, Dropdown, Input, Layout, Modal, Toast, Tooltip} from "@douyinfe/semi-ui";
import {
  IconChevronDown, IconDeleteStroked, IconEditStroked,
  IconGlobe, IconPlus, IconShareStroked,
  IconSidebar
} from "@douyinfe/semi-icons";
import {SessionSetting} from "../interface/setting";

interface CommentHeaderProps {
  sessionSidebar: boolean;
  showTitleSpin: boolean;
  sessionTitle: string;
  sessionSetting: SessionSetting;
  createSession: (roleId: string) => void;
  clearCurrentChatList: () => void;
  renameSessionTitle: (content: string) => void;
  triggerSessionSidebar: () => void;
  openMessageShare: () => void;
}

const headerEqual = (prevProps: CommentHeaderProps, currentProps: CommentHeaderProps) => {
  return prevProps.sessionSidebar === currentProps.sessionSidebar
    && prevProps.showTitleSpin === currentProps.showTitleSpin
    && prevProps.sessionTitle === currentProps.sessionTitle
    && prevProps.sessionSetting.isShowHeaderTitle == currentProps.sessionSetting.isShowHeaderTitle;
};

export const CommentHeader: React.FC<CommentHeaderProps> = React.memo((
  {
    sessionSidebar,
    showTitleSpin,
    sessionTitle,
    sessionSetting,
    createSession,
    clearCurrentChatList,
    renameSessionTitle,
    triggerSessionSidebar,
    openMessageShare
  }
) => {
  const { Header } = Layout;
  const [titleRenameVisible, setTitleRenameVisible] = useState<boolean>(false);
  const [titleContent, setTitleContent] = useState<string>(sessionTitle);

  const titleContentChange = (content: string) => {
    setTitleContent(content);
  }

  const titleRenameShow = () => {
    setTitleContent(sessionTitle);
    setTitleRenameVisible(true);
  }

  const titleRenameCancel = () => {
    setTitleRenameVisible(false);
  }

  const titleRenameOk = () => {
    renameSessionTitle(titleContent);
    Toast.success({
      content: "修改成功",
      showClose: false,
      duration: 1
    });
    titleRenameCancel();
  }

  return (
    <Header data-tauri-drag-region className="comment-header">
      <div className={`comment-header-left${sessionSidebar ? "" : " not-show-bar"}`}>
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
      <div className="comment-header-title">
        {
          showTitleSpin ? (
            <IconGlobe spin />
          ) : (
            sessionSetting.isShowHeaderTitle === 'true' ? (
              <Dropdown
                trigger={'click'}
                clickToHide={true}
                position={'bottom'}
                render={
                  <Dropdown.Menu>
                    <Dropdown.Item
                      icon={<IconEditStroked />}
                      children="重命名"
                      onClick={titleRenameShow}
                    />
                    <Dropdown.Item
                      icon={<IconShareStroked />}
                      onClick={openMessageShare}
                      children="分享对话"
                    />
                    <Dropdown.Item
                      icon={<IconDeleteStroked />}
                      type="danger"
                      onClick={clearCurrentChatList}
                      children="清空对话"
                    />
                  </Dropdown.Menu>
                }
                children={
                  <Button
                    theme='borderless'
                    type='tertiary'
                    icon={<IconChevronDown size='small' />}
                    iconPosition='right'
                    children={sessionTitle}
                  />
                }
              />
            ) : ('')
          )
        }
      </div>
      <div className="comment-header-right">
        <Tooltip content={'创建新的聊天'}>
          <Button
            theme="borderless"
            type="tertiary"
            icon={<IconPlus />}
            aria-label="创建新的聊天"
            onClick={() => createSession("")}
          />
        </Tooltip>
      </div>
      <Modal
        title="标题重命名"
        visible={titleRenameVisible}
        onCancel={titleRenameCancel}
        onOk={titleRenameOk}
        centered
      >
        <Input
          value={titleContent}
          onChange={(content) => titleContentChange(content)}
          placeholder={"请输入聊天标题"}
        />
      </Modal>
    </Header>
  )
}, headerEqual);