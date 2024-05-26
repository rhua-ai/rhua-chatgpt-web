import {Avatar, Button, Dropdown, Spin, Tag, Tooltip, Typography} from "@douyinfe/semi-ui";
import {
  IconBulb,
  IconCopyStroked,
  IconDeleteStroked,
  IconEdit2Stroked,
  IconImage,
  IconLink, IconStop,
  IconTreeTriangleDown
} from "@douyinfe/semi-icons";
import React from "react";
import {ChatMessage} from "../interface/message";
import {MarkdownBox} from "./MarkdownBox";

interface MessageBoxProps {
  message: ChatMessage;
  copyCommentChatItem: (messageId: string) => void;
  updateCommentChatItem: (messageId: string) => void;
  removeCommentChatItem: (messageId: string) => void;
  stopChatStream?: (messageId: string) => void;
}

const messageEqual = (prevProps: MessageBoxProps, currentProps: MessageBoxProps) => {
  return prevProps.message.completed === currentProps.message.completed
    && prevProps.message.content === currentProps.message.content;
};

export const UserMessageBox: React.FC<MessageBoxProps> = React.memo((
  {
    message,
    copyCommentChatItem,
    updateCommentChatItem,
    removeCommentChatItem
  }
) => {
  const { Text } = Typography;
  return (
    <div className="comment-single-box user">
      <div className="comment-single-wrapper">
        <div id={`csh-${message.id}`} className="comment-single-hidden">
          <Dropdown
            trigger="hover"
            position="bottom"
            className="comment-single-hidden-dropdown"
            clickToHide={true}
            getPopupContainer={() => document.getElementById(`csh-${message.id}`)!}
            render={
              <Dropdown.Menu>
                <Tooltip position="right" content="复制">
                  <Dropdown.Item
                    onClick={() => copyCommentChatItem(message.id)}
                    children={<IconCopyStroked />}
                  />
                </Tooltip>
                <Tooltip position="right" content="修改">
                  <Dropdown.Item
                    onClick={() => updateCommentChatItem(message.id)}
                    children={<IconEdit2Stroked />}
                  />
                </Tooltip>
                <Tooltip position="right" content="删除">
                  <Dropdown.Item
                    type="danger"
                    onClick={() => removeCommentChatItem(message.id)}
                    children={<IconDeleteStroked />}
                  />
                </Tooltip>
              </Dropdown.Menu>
            }
          >
            <Button
              size="small"
              theme="light"
              type="tertiary"
              className="comment-single-hidden-button"
              icon={<IconTreeTriangleDown/>}
            />
          </Dropdown>
        </div>
        <div className="comment-single-content">
          <Text className="comment-single-username" type="quaternary" size='small'></Text>
          <div className="comment-single-text">{message.content}</div>
          <div className="comment-single-addition">
            {
              message.additions !== undefined && message.additions.length > 0 && (
                message.additions.map((addition, index) => (
                  <Tag
                    style={{marginTop: 5}}
                    key={message.id + "_" + index}
                    size="large"
                    color='light-blue'
                    prefixIcon={addition.type === "image" ? <IconImage/> : <IconLink/>}
                    shape='circle'
                    children={addition.content}
                  />
                ))
              )
            }
          </div>
        </div>
        <div className="comment-single-avatar">
          <Avatar
            style={{ backgroundColor: "var(--semi-color-info)" }}
            size="small"
            children={message.name}
          />
        </div>
      </div>
    </div>
  )
}, messageEqual);

export const UserMessageDocBox: React.FC<MessageBoxProps> = React.memo((
  {
    message,
    copyCommentChatItem,
    updateCommentChatItem,
    removeCommentChatItem
  }
) => {
  const { Text } = Typography;
  return (
    <div className="comment-single-box user-doc">
      <div className="comment-single-wrapper">
        <div className="comment-single-avatar">
          <Avatar
            style={{backgroundColor: "var(--semi-color-info)"}}
            size="small"
            children={message.name}
          />
        </div>
        <div className="comment-single-content">
          <Text className="comment-single-username" type="quaternary" size='small'></Text>
          <div className="comment-single-text">{message.content}</div>
          <div className="comment-single-addition">
            {
              message.additions !== undefined && message.additions.length > 0 && (
                message.additions.map((addition, index) => (
                  <Tag
                    style={{marginTop: 5}}
                    key={message.id + "_" + index}
                    size="large"
                    color='light-blue'
                    prefixIcon={addition.type === "image" ? <IconImage/> : <IconLink/>}
                    shape='circle'
                    children={addition.content}
                  />
                ))
              )
            }
          </div>
        </div>
        <div id={`csh-${message.id}`} className="comment-single-hidden">
          <Dropdown
            trigger="hover"
            position="bottom"
            className="comment-single-hidden-dropdown"
            clickToHide={true}
            getPopupContainer={() => document.getElementById(`csh-${message.id}`)!}
            render={
              <Dropdown.Menu>
                <Tooltip position="right" content="复制">
                  <Dropdown.Item
                    onClick={() => copyCommentChatItem(message.id)}
                    children={<IconCopyStroked />}
                  />
                </Tooltip>
                <Tooltip position="right" content="修改">
                  <Dropdown.Item
                    onClick={() => updateCommentChatItem(message.id)}
                    children={<IconEdit2Stroked />}
                  />
                </Tooltip>
                <Tooltip position="right" content="删除">
                  <Dropdown.Item
                    type="danger"
                    onClick={() => removeCommentChatItem(message.id)}
                    children={<IconDeleteStroked />}
                  />
                </Tooltip>
              </Dropdown.Menu>
            }
          >
            <Button
              size="small"
              theme="light"
              type="tertiary"
              className="comment-single-hidden-button"
              icon={<IconTreeTriangleDown/>}
            />
          </Dropdown>
        </div>
      </div>
    </div>
  )
}, messageEqual);

export const BotMessageBox: React.FC<MessageBoxProps> = React.memo((
  {
    message,
    copyCommentChatItem,
    updateCommentChatItem,
    removeCommentChatItem,
    stopChatStream
  }
) => {
  return (
    <div className="comment-single-box bot">
      <div className="comment-single-wrapper">
        <div className="comment-single-avatar">
          <Avatar
            style={{backgroundColor: 'var(--semi-color-primary)'}}
            size="small"
            contentMotion={message.completed != null && !message.completed}
            children={message.completed != null && !message.completed ? <IconStop /> : <IconBulb />}
            onClick={() => stopChatStream?.(message.id)}
          />
        </div>
        <div className="comment-single-content">
          {
            !message.completed && message.content == "" ? (
              <div className="comment-single-text"><Spin/></div>
            ) : (
              <div className="comment-single-text markdown-body">
                <MarkdownBox content={message.content} />
              </div>
            )
          }
        </div>
        <div id={`csh-${message.id}`} className="comment-single-hidden">
          <Dropdown
            trigger="hover"
            position="bottom"
            className="comment-single-hidden-dropdown"
            clickToHide={true}
            getPopupContainer={() => document.getElementById(`csh-${message.id}`)!}
            render={
              <Dropdown.Menu>
                <Tooltip position="left" content="复制">
                  <Dropdown.Item
                    onClick={() => copyCommentChatItem(message.id)}
                    children={<IconCopyStroked/>}
                  />
                </Tooltip>
                <Tooltip position="left" content="修改">
                  <Dropdown.Item
                    onClick={() => updateCommentChatItem(message.id)}
                    children={<IconEdit2Stroked/>}
                  />
                </Tooltip>
                <Tooltip position="left" content="删除">
                  <Dropdown.Item
                    type="danger"
                    onClick={() => removeCommentChatItem(message.id)}
                    children={<IconDeleteStroked/>}
                  />
                </Tooltip>
              </Dropdown.Menu>
            }
          >
            <Button
              size="small"
              theme="light"
              type="tertiary"
              className="comment-single-hidden-button"
              icon={<IconTreeTriangleDown/>}
            />
          </Dropdown>
        </div>
      </div>
    </div>
  )
}, messageEqual);


interface MessageBoxShareProps {
  message: ChatMessage;
}

const messageShareEqual = (prevProps: MessageBoxShareProps, currentProps: MessageBoxShareProps) => {
  return prevProps.message.completed === currentProps.message.completed
    && prevProps.message.content.length === currentProps.message.content.length;
};

export const UserMessageShareBox: React.FC<MessageBoxShareProps> = React.memo((
  {
    message
  }
) => {
  const {Text} = Typography;
  return (
    <div className="comment-single-box user">
      <div className="comment-single-wrapper">
        <div id={`csh-share-${message.id}`} className="comment-single-hidden">
        </div>
        <div className="comment-single-content">
          <Text className="comment-single-username" type="quaternary" size='small'></Text>
          <div className="comment-single-text">{message.content}</div>
          <div className="comment-single-addition">
            {
              message.additions !== undefined && message.additions.length > 0 && (
                message.additions.map((addition, index) => (
                  <Tag
                    style={{marginTop: 5}}
                    key={message.id + "_" + index}
                    size="large"
                    color='light-blue'
                    prefixIcon={addition.type === "image" ? <IconImage/> : <IconLink/>}
                    shape='circle'
                    children={addition.content}
                  />
                ))
              )
            }
          </div>
        </div>
        <div className="comment-single-avatar">
          <Avatar
            style={{backgroundColor: "var(--semi-color-info)"}}
            size="small"
            children={message.name}
          />
        </div>
      </div>
    </div>
  )
}, messageShareEqual);

export const UserMessageDocShareBox: React.FC<MessageBoxShareProps> = React.memo((
  {
    message
  }
) => {
  const {Text} = Typography;
  return (
    <div className="comment-single-box user-doc">
      <div className="comment-single-wrapper">
        <div className="comment-single-avatar">
          <Avatar
            style={{backgroundColor: "var(--semi-color-info)"}}
            size="small"
            children={message.name}
          />
        </div>
        <div className="comment-single-content">
          <Text className="comment-single-username" type="quaternary" size='small'></Text>
          <div className="comment-single-text">{message.content}</div>
          <div className="comment-single-addition">
            {
              message.additions !== undefined && message.additions.length > 0 && (
                message.additions.map((addition, index) => (
                  <Tag
                    style={{marginTop: 5}}
                    key={message.id + "_" + index}
                    size="large"
                    color='light-blue'
                    prefixIcon={addition.type === "image" ? <IconImage/> : <IconLink/>}
                    shape='circle'
                    children={addition.content}
                  />
                ))
              )
            }
          </div>
        </div>
        <div id={`csh-share-${message.id}`} className="comment-single-hidden">
        </div>
      </div>
    </div>
  )
}, messageShareEqual);

export const BotMessageShareBox: React.FC<MessageBoxShareProps> = React.memo((
  {
    message
  }
) => {
  return (
    <div className="comment-single-box bot">
      <div className="comment-single-wrapper">
        <div className="comment-single-avatar">
          <Avatar
            style={{backgroundColor: 'var(--semi-color-primary)'}}
            size="small"
            children={<IconBulb/>}
          />
        </div>
        <div className="comment-single-content">
          {
            <div className="comment-single-text markdown-body">
              <MarkdownBox content={message.content} />
            </div>
          }
        </div>
        <div id={`csh-share-${message.id}`} className="comment-single-hidden">
        </div>
      </div>
    </div>
  )
}, messageShareEqual);