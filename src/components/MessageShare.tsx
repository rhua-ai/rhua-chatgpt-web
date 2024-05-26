import React, {createRef, useEffect, useState} from "react";
import {ChatMessage, ChatSession} from "../interface/message";
import {Button, Checkbox, CheckboxGroup, List, Modal, Steps, Tag, Toast} from "@douyinfe/semi-ui";
import Text from "@douyinfe/semi-ui/lib/es/typography/text";
import {IconBox, IconClock, IconPulse, IconUser} from "@douyinfe/semi-icons";
import {
  BotMessageShareBox,
  UserMessageDocShareBox, UserMessageShareBox
} from "./MessageBox";
import {toPng} from "html-to-image";
import {CommonUtil} from "../utils/common-util";
import {downloadDir} from "@tauri-apps/api/path";
import {writeBinaryFile} from "@tauri-apps/api/fs";
import {dialog} from "@tauri-apps/api";

interface MessageShareProps {
  show: boolean;
  messageList: ChatMessage[];
  chatSessionLayout: string;
  chatSession: ChatSession | undefined;
  closeMessageShare: () => void;
}

const shareEqual = (prevProps: MessageShareProps, currentProps: MessageShareProps) => {
  return prevProps.show === currentProps.show
    && prevProps.chatSession?.id === currentProps.chatSession?.id
    && prevProps.messageList.length === currentProps.messageList.length
    && prevProps.chatSessionLayout === currentProps.chatSessionLayout;
};

export const MessageShare: React.FC<MessageShareProps> = React.memo((
  {
    show,
    messageList,
    chatSessionLayout,
    chatSession,
    closeMessageShare
  }
) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [checkedMessageIds, setCheckedMessageIds] = useState<string[]>([]);
  const messageShareRef = createRef<HTMLDivElement>();

  useEffect(() => {
    setCurrentStep(0);
    setCheckedMessageIds(messageList.map(message => message.id));
  }, [messageList])

  const nextStep = () => {
    setCurrentStep(prevState => prevState + 1);
  }

  const selectStep = (index: number) => {
    setCurrentStep(index);
  }

  const downloadMessageShareImage = () => {
    if (messageShareRef.current) {
      toPng(messageShareRef.current).then(async (image) => {
        if (window.__TAURI__) {
          const path = await downloadDir();
          const filePath = `${path}${chatSession?.content}.png`;
          const result = await dialog.save({
            defaultPath: filePath,
            filters: [
              {
                name: "PNG Files",
                extensions: ["png"],
              },
              {
                name: "All Files",
                extensions: ["*"],
              },
            ],
          });
          if (result !== null) {
            const response = await fetch(image);
            const buffer = await response.arrayBuffer();
            const uint8Array = new Uint8Array(buffer);
            await writeBinaryFile({
              path: result,
              contents: uint8Array
            });
            Toast.success({
              content: "下载成功",
              showClose: false,
              duration: 1
            });
          } else {
            Toast.warning({
              content: "下载已取消",
              showClose: false,
              duration: 1
            });
          }
        } else {
          const link = document.createElement("a");
          link.href = image;
          link.download = chatSession?.content + ".png";

          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
        }
      });
    }
  }

  const copyMessageShareImage = () => {
    if (messageShareRef.current) {
      try {
        toPng(messageShareRef.current).then(async (image) => {
          const base64Response = await fetch(image);
          const blob = await base64Response.blob();
          const clipboardItem = new ClipboardItem({ "image/png": blob });
          try {
            await navigator.clipboard.write([clipboardItem]);
            Toast.success({
              content: "复制成功",
              showClose: false,
              duration: 1
            });
          } catch (error) {
            console.log(error);
            Toast.error({
              content: "复制失败，请下载图片",
              showClose: false,
              duration: 2
            });
          }
        });
      } catch (error) {
        console.log(error);
      }
    }
  }

  return (
    <Modal
      className="semi-light-scrollbar"
      title="分享对话"
      visible={show}
      size="medium"
      onOk={nextStep}
      onCancel={closeMessageShare}
      footer={
        currentStep === 0 ? (
          <div className="message-share-footer">
            <Button
              type="primary"
              theme="solid"
              onClick={nextStep}
              children="预览效果"
            />
            <Button
              type="primary"
              theme="borderless"
              onClick={closeMessageShare}
              children="取消分享对话"
            />
          </div>
        ) : (
          <div className="message-share-footer">
            <Button
              type="primary"
              theme="solid"
              onClick={downloadMessageShareImage}
              children="下载图片"
            />
            <Button
              type="primary"
              theme="borderless"
              onClick={copyMessageShareImage}
              children="复制图片到粘贴板"
            />
          </div>
        )
      }
    >
      <Steps type="basic" current={currentStep}>
        <Steps.Step title="选取消息" onClick={() => selectStep(0)} />
        <Steps.Step title="预览下载" onClick={() => selectStep(1)} />
      </Steps>
      {
        currentStep === 0 ? (
          <div>
            <CheckboxGroup value={checkedMessageIds} onChange={(values) => setCheckedMessageIds(values)}>
              <List
                className="message-share-list"
                size="small"
                bordered
                dataSource={messageList}
                renderItem={message => (
                  <List.Item
                    key={message.id}
                    className="message-share-item"
                    children={
                      <Checkbox
                        value={message.id}
                        children={
                          <Text
                            type="secondary"
                            icon={message.type === 'user' ? <IconUser /> : <IconPulse />}
                            children={message.content}
                          />
                        }
                      />
                    }
                  />
                )}
              />
            </CheckboxGroup>
          </div>
        ) : (
          <div className="message-share-main">
            <div ref={messageShareRef}>
              <div className="message-share-header">
                <div className="message-share-header-memo">
                  <Text className="t1">若华</Text>
                  <Text className="t2">构建你的专属人工智能助手</Text>
                </div>
                <div className="message-share-header-memo">
                  <Tag
                    color='light-blue'
                    prefixIcon={<IconBox />}
                    size='large'
                    shape='circle'
                    children={`模型：${chatSession?.config.model}`}
                  />
                  <Tag
                    color='light-blue'
                    prefixIcon={<IconClock />}
                    size='large'
                    shape='circle'
                    children={`时间：${CommonUtil.getDateString()}`}
                  />
                </div>
              </div>
              <div className="message-share-box">
                <div className="message-share-title">{chatSession?.content}</div>
                {
                  messageList.filter(item => checkedMessageIds.some(mid => mid === item.id)).map((item) => {
                    return (
                      item.type === 'bot' ?
                        <BotMessageShareBox
                          key={item.id}
                          message={item}
                        />
                        :
                        chatSessionLayout === "doc" ? (
                          <UserMessageDocShareBox
                            key={item.id}
                            message={item}
                          />
                        ) : (
                          <UserMessageShareBox
                            key={item.id}
                            message={item}
                          />
                        )
                    )
                  })
                }
              </div>
            </div>
          </div>
        )
      }
    </Modal>
  );
}, shareEqual);