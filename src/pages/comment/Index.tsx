import {
  Banner,
  Button, Divider,
  Dropdown,
  Empty, Form, Input,
  Layout,
  Modal,
  Select,
  TagGroup,
  TextArea,
  Toast, Tooltip, Typography,
} from "@douyinfe/semi-ui";
import {
  IconHourglassStroked,
  IconImage, IconLink,
  IconPlusCircleStroked,
  IconSend, IconStarStroked, IconUserCircleStroked,
} from "@douyinfe/semi-icons";
import React, {createRef, useCallback, useEffect, useRef, useState} from "react";
import {LocalForageService as storage} from "../../utils/storage";
import PluginExecutor from "../../utils/plugin-executor";
import {nanoid} from "ai";
import {BaseCallbackHandler} from "@langchain/core/callbacks/base";
import {
  IllustrationNoContent, IllustrationNoContentDark
} from "@douyinfe/semi-illustrations";
import {useNavigate} from "react-router-dom";
import {TagProps} from "@douyinfe/semi-ui/lib/es/tag/interface";
import {ChatMessage, ChatMessageAddition, ChatSession} from "../../interface/message";
import {OptionProps} from "@douyinfe/semi-ui/lib/es/select";
import {Role} from "../../interface/role";
import {MessageUtil} from "../../utils/message-util";
import {BotMessageBox, UserMessageBox, UserMessageDocBox} from "../../components/MessageBox";
import {SessionBox} from "../../components/SessionBox";
import {CommentHeader} from "../../components/CommentHeader";
import {OpenAIAttribute} from "../../interface/llm";
import {SessionSetting} from "../../interface/setting";
import {initialOpenaiAttribute, initialSessionSetting} from "../../utils/initial-state";
import {MessageShare} from "../../components/MessageShare";
import {CommonUtil} from "../../utils/common-util";
import mermaid from "mermaid";
import {IconRating, IconSpin} from "@douyinfe/semi-icons-lab";

function CommentIndex() {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark');
  const [commentSessionList, setCommentSessionList] = useState<ChatSession[]>([]);
  const [currentCommentSessionId, setCurrentCommentSessionId] = useState<string>("");
  const [currentCommentSession, setCurrentCommentSession] = useState<ChatSession>();
  const [commentChatList, setCommentChatList] = useState<ChatMessage[]>([]);
  const [roleOptionProps, setRoleOptionProps] = useState<OptionProps[]>([]);
  const [sessionSidebar, setSessionSidebar] = useState<boolean>(true);
  const [showTitleSpin, setShowTitleSpin] = useState<boolean>(false);
  const [openaiAttribute, setOpenaiAttribute] = useState<OpenAIAttribute>({...initialOpenaiAttribute, apiKey: 'init'});
  const [sessionSetting, setSessionSetting] = useState<SessionSetting>(initialSessionSetting);
  const [showMessageShare, setShowMessageShare] = useState<boolean>(false);
  const [shareMessageList, setShareMessageList] = useState<ChatMessage[]>([]);

  const [sendAdditionType, setSendAdditionType] = useState<string>("");
  const [sendAdditionContent, setSendAdditionContent] = useState<string>("");
  const [sendAdditionList, setSendAdditionList] = useState<TagProps[]>([]);
  const sendAddition = (type: string) => {
    setSendAdditionType(type);
  }
  const sendAdditionSubmit = () => {
    const addition: TagProps = {
      tagKey: sendAdditionType + "_" + nanoid(),
      children: sendAdditionContent,
      closable: true,
      color: 'light-blue',
      prefixIcon: sendAdditionType === 'image' ? <IconImage /> : <IconLink />
    };
    setSendAdditionList(prevState => ([...prevState, addition]));
    setSendAdditionType("");
    setSendAdditionContent("");
  }
  const sendAdditionClose = () => {
    setSendAdditionType("");
  }
  const sendAdditionRemove = (tagChildren: React.ReactNode, event: React.MouseEvent<HTMLElement>, tagKey: string | number) => {
    setSendAdditionList(sendAdditionList => {
      const newList = [...sendAdditionList];
      return newList.filter(addition => addition.tagKey !== tagKey);
    });
  }
  const sendAdditionContentChange = (content: string) => {
    setSendAdditionContent(content);
  };

  useEffect(() => {
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      const mode = e.matches ? 'dark' : 'light';
      document.body.setAttribute('theme-mode', mode);
      storage.setItem("theme_mode", mode);
      setThemeMode(mode);
    };
    themeQuery.addEventListener('change', handleThemeChange);

    storage.getItem<'light' | 'dark'>("theme_mode").then(mode => {
      setThemeMode(mode ?? 'dark');
    });

    storage.getItem<OpenAIAttribute>("llm_openai_attribute").then(llmOpenaiAttribute => {
      setOpenaiAttribute(MessageUtil.openaiAttributeDefaultConvert(llmOpenaiAttribute));
    });

    storage.getItem<SessionSetting>("setting_session").then(setting => {
      setSessionSetting(MessageUtil.sessionSettingDefaultConvert(setting));
    });

    storage.getItem<ChatSession[]>("session_list").then(sessionList => {
      const newSessionList = [...sessionList ?? []];
      if (newSessionList == null || newSessionList.length == 0) {
        const now = new Date();
        newSessionList.push({
          id: nanoid(),
          name: "Bot",
          avatar: "Bot",
          content: "新的聊天",
          time: `${now.getHours()}:${now.getMinutes()}`,
          config: {
            roleId: "",
            model: sessionSetting.defaultModel,
            modelPrecision: sessionSetting.defaultModelPrecision
          }
        });
        storage.setItem("session_list", newSessionList);
      }
      setCommentSessionList(newSessionList);
      storage.getItem<string>("current_session_id").then(sessionId => {
        let newSessionId = sessionId;
        if (!newSessionId) {
          newSessionId = newSessionList[0].id;
        }
        const sessionFindIndex = newSessionList.findIndex(session => session.id === newSessionId);
        if (sessionFindIndex < 0) {
          newSessionId = newSessionList[0].id;
        }

        setCurrentCommentSessionId(newSessionId);
        const currentSession = newSessionList[sessionFindIndex];
        setCurrentCommentSession({
          ...currentSession,
          config: {...currentSession.config}
        });
        storage.getItem<ChatMessage[]>("chat_list_" + newSessionId).then(chatList => {
          setCommentChatList(() => chatList || []);
        });
      });
    });

    storage.getItem<boolean>("session_sidebar").then(sessionSidebar => {
      if (sessionSidebar == null) {
        sessionSidebar = true;
        storage.setItem("session_sidebar", sessionSidebar);
      }
      setSessionSidebar(sessionSidebar);
    });

    storage.getItem<Role[]>("role_list").then(roleList => {
      if (roleList) {
        const optionProps = roleList.map(role => {
          const option: OptionProps = {
            label: role.name,
            value: role.id,
          }
          return option;
        });
        setRoleOptionProps(optionProps)
      }
    });
  }, []);

  useEffect(() => {
    if (currentCommentSessionId != null && currentCommentSessionId != "") {
      if (commentChatList && commentChatList.length > 0) {
        const lastChat = commentChatList[commentChatList.length - 1];
        if (lastChat.completed || lastChat.content === '') {
          commentContentBoxScrollBottom();
          storage.setItem("chat_list_" + currentCommentSessionId, commentChatList);
        }
      }
    }
  }, [commentChatList]);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: themeMode === 'dark' ? 'dark' : 'neutral',
      securityLevel: "loose",
      flowchart: {
        htmlLabels: true,
        curve: 'linear'
      }
    });
  }, [themeMode]);

  const { Content, Footer } = Layout;
  const { Text } = Typography;

  const sendInputRef = useRef<HTMLTextAreaElement>(null);

  const [userChatContent, setUserChatContent] = useState("");
  const changeUserChatContent = setUserChatContent;

  const fetchAndSwitchModel = (inputMessage: ChatMessage): string => {
    let useVision: boolean = MessageUtil.isUseVision(inputMessage);
    if (!useVision) {
      for (let chatMessage of commentChatList) {
        if (MessageUtil.isUseVision(chatMessage)) {
          useVision = true;
          break;
        }
      }
    }

    if (!useVision) {
      return currentCommentSession?.config.model ?? (sessionSetting.defaultModel);
    }

    if (currentCommentSession?.config.model === sessionSetting.defaultVisionModel) {
      return currentCommentSession?.config.model ?? (sessionSetting.defaultVisionModel);
    }

    const newModel = sessionSetting.defaultVisionModel;
    setCommentSessionList(sessionList => {
      const newSessionList = [...sessionList];
      const findIndex = newSessionList.findIndex(session => session.id === currentCommentSessionId);
      const newSession = {
        ...newSessionList[findIndex],
        config: {
          ...newSessionList[findIndex].config,
          model: newModel
        }
      };
      newSessionList[findIndex] = newSession;
      setCurrentCommentSession(newSession);
      storage.setItem("session_list", newSessionList);
      return newSessionList;
    });

    return newModel;
  }

  const chatSubmit = () => {
    const lastUserChatContent = userChatContent;
    if (lastUserChatContent == "") {
      return;
    }

    const additions: ChatMessageAddition[] = [];
    if (sendAdditionList.length > 0) {
      for (const tagProp of sendAdditionList) {
        if (typeof tagProp.tagKey === 'string') {
          const keys = tagProp.tagKey.split("_")
          if (keys.length == 2) {
            additions.push({
              type: keys[0],
              content: tagProp.children as string
            });
          }
        }
      }
    }

    const inputMessage: ChatMessage = {
      id: nanoid(),
      type: 'user',
      name: sessionSetting.userName,
      content: lastUserChatContent,
      additions: additions,
      completed: true
    };

    setCommentChatList(prevState => {
      const newState = [
        ...prevState,
        inputMessage
      ];
      return newState;
    });

    setUserChatContent("");
    setSendAdditionList([]);
    sendInputRef.current?.focus();

    if (!openaiAttribute || !openaiAttribute.apiKey) {
      Toast.warning({
        showClose: true,
        duration: 3,
        content: <div>您还未配置模型API Key，<Text link underline onClick={() => jumpPage("/setting/model")}>前往配置</Text>。</div>
      });
      return;
    }

    const botMessage: ChatMessage = {
      id: nanoid(),
      type: 'bot',
      name: 'Bot',
      content: '',
      completed: false
    };

    setCommentChatList(prevState => {
      const newState = [
        ...prevState,
        botMessage
      ];
      return newState;
    });

    let historyChatList: ChatMessage[];
    if (commentChatList.length <= sessionSetting.chatMaxMemory) {
      historyChatList = commentChatList;
    } else {
      historyChatList = commentChatList.slice(commentChatList.length - sessionSetting.chatMaxMemory, commentChatList.length);
      for (let i = commentChatList.length - sessionSetting.chatMaxMemory - 1; i >= 0; i--) {
        const historyChat = commentChatList[i];
        if (historyChat.additions !== undefined && historyChat.additions.length > 0) {
          historyChatList.unshift(historyChat);
        }
      }
    }

    const model = fetchAndSwitchModel(inputMessage);
    const pluginExecutor = new PluginExecutor(
      openaiAttribute.baseURL,
      openaiAttribute.apiKey,
      model
    );

    pluginExecutor.execute(inputMessage, historyChatList, currentCommentSession?.config, sessionSetting, BaseCallbackHandler.fromMethods({
      handleLLMNewToken(token, idx, runId, parentRunId, tags, fields) {
        setCommentChatList(chatList => {
          const findIndex = chatList.findIndex(message => message.id === botMessage.id);
          if (findIndex >= 0) {
            if (chatList[findIndex].completed) {
              // 流还是会输出，后续得优化
            } else {
              const newChatList = [...chatList];
              const newChat = {
                ...newChatList[findIndex],
                content: newChatList[findIndex].content + token
              };
              newChatList[findIndex] = newChat;
              return newChatList;
            }
          }
          return chatList;
        });
      },
      handleLLMEnd(output, runId, parentRunId, tags) {
        const botChatContent = output.generations[0][0].text;
        if (botChatContent.length === 0) {
          return;
        }
        setCommentChatList(chatList => {
          const findIndex = chatList.findIndex(message => message.id === botMessage.id);
          if (findIndex >= 0) {
            if (!chatList[findIndex].completed) {
              const newChatList = [...chatList];
              const newChat = {
                ...newChatList[findIndex],
                completed: true
              };
              newChatList[findIndex] = newChat;

              const roleId = currentCommentSession?.config.roleId;
              if (historyChatList.length == 0 && (!roleId || roleId === "")) {
                autoUpdateSessionTitle(lastUserChatContent, botChatContent);
              }
              return newChatList;
            }
          }
          return chatList;
        });
      }
    })).catch((error) => {
      console.error(error);
      setCommentChatList(chatList => {
        const newChatList = [...chatList];
        let lastChat = newChatList[newChatList.length - 1];
        lastChat = {
          ...lastChat,
          content: lastChat.content + error.message,
          completed: true
        };
        newChatList[newChatList.length - 1] = lastChat;
        return newChatList;
      });
    });
  };

  const autoUpdateSessionTitle = async (lastUserChatContent: string, botChatContent: string) => {
    setShowTitleSpin(true);
    MessageUtil.getSessionTitle(openaiAttribute, sessionSetting, lastUserChatContent, botChatContent).then(title => {
      setCommentSessionList(sessionList => {
        let newSessionList: ChatSession[] = [...sessionList];
        const sessionIndex = newSessionList.findIndex(session => session.id === currentCommentSessionId);
        if (sessionIndex >= 0) {
          const newSession: ChatSession = {
            ...newSessionList[sessionIndex],
            content: title
          };
          newSessionList[sessionIndex] = newSession;
          setCurrentCommentSession(newSession);
          storage.setItem("session_list", newSessionList);
          setShowTitleSpin(false);
        }
        return newSessionList;
      });
    });
  }

  const chatEnterPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!event.shiftKey) {
      event.preventDefault();
      chatSubmit();
    }
  }

  const commentContentBoxScrollBottom = () => {
    const element = document.getElementsByClassName("comment-content-box");
    if (element) {
      element[0].scrollTo({
        top: element[0].scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  const triggerSessionSidebar = useCallback(() => {
    setSessionSidebar(prevState => {
      storage.setItem("session_sidebar", !prevState);
      return !prevState;
    });
  }, []);

  const selectSession = useCallback((sessionId: string) => {
    setCurrentCommentSessionId(sessionId);
    setCommentSessionList(sessionList => {
      setCurrentCommentSession(sessionList.find(session => session.id === sessionId));
      return sessionList;
    });
    storage.setItem("current_session_id", sessionId);
    storage.getItem<ChatMessage[]>("chat_list_" + sessionId).then(chatList => {
      setCommentChatList(() => chatList || []);
    });
  }, []);

  const removeSession = useCallback((event: React.MouseEvent<HTMLButtonElement>, sessionId: string) => {
    event.stopPropagation();
    if (!sessionId) {
      Toast.warning({
        content: "会话ID为空",
        showClose: false,
        duration: 2
      });
      return;
    }

    setCommentSessionList(sessionList => {
      if (sessionList.length <= 1) {
        Toast.warning({
          content: "最少保留一个会话",
          showClose: false,
          duration: 2
        });
        return sessionList;
      }

      let nextSessionIndex = sessionList.findIndex(session => session.id === sessionId);
      if (nextSessionIndex === sessionList.length - 1) {
        nextSessionIndex -= 1;
      }

      let newSessionList = sessionList.filter(session => session.id !== sessionId);
      storage.setItem("session_list", newSessionList);
      storage.removeItem("chat_list_" + sessionId);

      const newSession = newSessionList[nextSessionIndex];
      setCurrentCommentSessionId(newSession.id);
      setCurrentCommentSession(newSession);
      storage.setItem("current_session_id", newSession.id);
      storage.getItem<ChatMessage[]>("chat_list_" + newSession.id).then(chatList => {
        setCommentChatList(() => chatList || []);
      });

      Toast.success({
        content: "删除成功",
        showClose: false,
        duration: 2
      });

      return newSessionList;
    });
  }, []);

  const createSession = useCallback((roleId: string) => {
    let botName = "Bot";
    let sessionContent = "新的聊天";
    const role = roleOptionProps.find(role => role.value as string === roleId);
    if (role && role.label) {
      sessionContent = role.label as string;
      botName = role.label as string;
    }
    const newSession: ChatSession = {
      id: nanoid(),
      name: botName,
      avatar: "",
      content: sessionContent,
      time: `${new Date().getTime()}`,
      config: {
        roleId: roleId || sessionSetting.defaultRoleId,
        model: sessionSetting.defaultModel,
        modelPrecision: sessionSetting.defaultModelPrecision
      }
    };

    setCommentSessionList(sessionList => {
      const newSessionList = [...sessionList];
      newSessionList.unshift(newSession);
      setCommentSessionList(newSessionList);
      storage.setItem("session_list", newSessionList);
      return newSessionList;
    });

    setCurrentCommentSessionId(newSession.id);
    setCurrentCommentSession(newSession);
    storage.setItem("current_session_id", newSession.id);
    setCommentChatList([]);

    Toast.success({
      content: "聊天创建成功",
      showClose: false,
      duration: 1
    });
  }, [sessionSetting, roleOptionProps]);

  const renameSessionTitle = useCallback((content: string) => {
    setCommentSessionList(prevState => {
      const newSessionList = [...prevState];
      const newSession = newSessionList.find(state => state.id === currentCommentSessionId);
      if (newSession) {
        const sessionToUpdate: ChatSession = {
          ...newSession,
          content
        };
        Object.assign(newSession, sessionToUpdate);
        setCurrentCommentSession(sessionToUpdate);
      }
      storage.setItem("session_list", newSessionList);
      return newSessionList;
    });
  }, [currentCommentSessionId]);

  const clearCurrentChatList = useCallback(() => {
    setCurrentCommentSessionId(sessionId => {
      storage.setItem("chat_list_" + sessionId, []).then(() => {
        setCommentChatList([]);
        Toast.success({
          content: "当前对话已清空",
          showClose: false,
          duration: 1
        });
      });

      updateSessionTitleToInit(sessionId);

      return sessionId;
    });
  }, []);

  const updateSessionTitleToInit = useCallback((sessionId: string) => {
    setCommentSessionList(prevState => {
      const newSession = prevState.find(state => state.id === sessionId);
      if (newSession && newSession.config.roleId === "") {
        const newSessionList = [...prevState];
        const sessionToUpdate: ChatSession = {
          ...newSession,
          content: "新的聊天"
        };
        Object.assign(newSession, sessionToUpdate);
        setCurrentCommentSession(sessionToUpdate);
        storage.setItem("session_list", newSessionList);
        return newSessionList;
      }
      return prevState;
    });
  }, []);

  const navigate = useNavigate();
  const jumpPage = useCallback((to: string) => {
    navigate(to);
  }, []);

  const changeSessionRole = (roleId: string) => {
    if (!currentCommentSession || (currentCommentSession.config.roleId === "" && roleId === "")) {
      return;
    }
    if (commentChatList && commentChatList.length > 0) {
      createSession(roleId);
    } else {
      let sessionContent = "新的聊天";
      const role = roleOptionProps.find(role => role.value as string === roleId);
      if (role && role.label) {
        sessionContent = role.label as string;
      }
      const newCommentSession: ChatSession = {
        ...currentCommentSession,
        content: sessionContent,
        config: {
          ...currentCommentSession?.config,
          roleId
        }
      };
      setCommentSessionList(prevCommentSessionList => {
        const newCommentSessionList = [...prevCommentSessionList];
        const sessionToUpdate = newCommentSessionList.find(session => session.id === currentCommentSessionId);
        if (sessionToUpdate) {
          Object.assign(sessionToUpdate, newCommentSession);
        }
        setCurrentCommentSession(newCommentSession);
        storage.setItem("session_list", newCommentSessionList);
        return newCommentSessionList;
      });
    }
  }

  const changeSessionModel = (model: string) => {
    if (!currentCommentSession) {
      Toast.warning({
        content: "当前会话为空",
        showClose: false,
        duration: 2
      });
      return;
    }
    const newCommentSession: ChatSession = {
      ...currentCommentSession,
      config: {
        ...currentCommentSession?.config,
        model
      }
    };
    setCommentSessionList(prevCommentSessionList => {
      const newCommentSessionList = [...prevCommentSessionList];
      const sessionToUpdate = newCommentSessionList.find(session => session.id === currentCommentSessionId);
      if (sessionToUpdate) {
        Object.assign(sessionToUpdate, newCommentSession);
      }
      setCurrentCommentSession(newCommentSession);
      storage.setItem("session_list", newCommentSessionList);
      return newCommentSessionList;
    });
  }

  const changeSessionModelPrecision = (modelPrecision: "creativity" | "balance" | "precision") => {
    if (!currentCommentSession) {
      Toast.warning({
        content: "当前会话为空",
        showClose: false,
        duration: 2
      });
      return;
    }
    const newCommentSession: ChatSession = {
      ...currentCommentSession,
      config: {
        ...currentCommentSession?.config,
        modelPrecision
      }
    };
    setCommentSessionList(prevCommentSessionList => {
      const newCommentSessionList = [...prevCommentSessionList];
      const sessionToUpdate = newCommentSessionList.find(session => session.id === currentCommentSessionId);
      if (sessionToUpdate) {
        Object.assign(sessionToUpdate, newCommentSession);
      }
      setCurrentCommentSession(newCommentSession);
      storage.setItem("session_list", newCommentSessionList);
      return newCommentSessionList;
    });
  }

  const copyCommentChatItem = useCallback((chatId: string) => {
    setCommentChatList(chatList => {
      try {
        const chat = chatList.find(chat => chat.id === chatId);
        if (chat && chat.content && chat.content !== "") {
          navigator.clipboard.writeText(chat.content);
          Toast.success({
            content: "复制成功",
            showClose: false,
            duration: 2
          });
        }
      } catch (error) {
        console.log(error);
        Toast.error({
          content: "复制失败",
          showClose: false,
          duration: 2
        });
      }
      return chatList;
    });
  }, []);

  const [updateChatVisible, setUpdateChatVisible] = useState<boolean>(false);
  const [chatToUpdate, setChatToUpdate] = useState<ChatMessage>();
  const chatFormRef = createRef<Form<ChatMessage>>();
  const updateCommentChatItem = useCallback((chatId: string) => {
    setCommentChatList(chatList => {
      const chat = chatList.find(chat => chat.id === chatId);
      if (chat) {
        const newChat = {...chat, additions: [...chat.additions ?? []]};
        chatFormRef.current?.formApi.setValues(newChat);
        setChatToUpdate(newChat);
        setUpdateChatVisible(true);
      }
      return chatList;
    });
  }, []);

  const chatFormChange = (chat: ChatMessage, field: any) => {
    if (Object.keys(field).length > 1) {
      return;
    }
    const newChat = {...chat, additions: [...chat.additions ?? []]};
    setChatToUpdate(newChat);
  }

  const hiddenUpdateCommentChatItem = () => {
    setUpdateChatVisible(false);
  }

  const commentChatItemSubmit = () => {
    setCommentChatList(chatList => {
      let newChatList = [...chatList];

      const chatToFindIndex = newChatList.findIndex(chat => chat.id === chatToUpdate?.id);
      if (chatToFindIndex >= 0 && chatToUpdate) {
        newChatList[chatToFindIndex] = {
          ...chatToUpdate,
          additions: [...chatToUpdate.additions ?? []]
        };
      }

      setUpdateChatVisible(false);
      Toast.success({
        content: "保存成功",
        showClose: false,
        duration: 2
      });

      storage.setItem("chat_list_" + currentCommentSessionId, newChatList);
      return newChatList;
    });
  }

  const removeCommentChatItem = useCallback((chatId: string) => {
    setCommentChatList(prevState => {
      let newChatList = [...prevState];
      newChatList = newChatList.filter(chat => chat.id !== chatId);
      storage.setItem("chat_list_" + currentCommentSessionId, newChatList);
      Toast.success({
        content: "删除成功",
        showClose: false,
        duration: 2
      });

      if (newChatList.length === 0) {
        updateSessionTitleToInit(currentCommentSessionId);
      }

      return newChatList;
    });
  }, [currentCommentSessionId]);

  const stopChatStream = useCallback((chatId: string) => {
    setCommentChatList(chatList => {
      const findIndex = chatList.findIndex(message => message.id === chatId);
      if (findIndex >= 0) {
        if (!chatList[findIndex].completed) {
          const newChatList = [...chatList];
          const newChat = {
            ...newChatList[findIndex],
            completed: true
          };
          newChatList[findIndex] = newChat;
          return newChatList;
        }
      }
      return chatList;
    });
  }, []);

  const switchThemeMode = useCallback(() => {
    setThemeMode(mode => {
      const newMode = mode === 'dark' ? "light" : "dark";
      document.body.setAttribute('theme-mode', newMode);
      storage.setItem("theme_mode", newMode);
      return newMode;
    });
  }, []);

  const openMessageShare = useCallback(() => {
    setCommentChatList(prevState => {
      setShareMessageList([...prevState]);
      return prevState;
    });
    setShowMessageShare(true);
  }, []);

  const closeMessageShare = useCallback(() => {
    setShareMessageList([]);
    setShowMessageShare(false);
  }, []);

  return (
    <Layout className="full-height">
      <SessionBox
        sessionSidebar={sessionSidebar}
        currentCommentSessionId={currentCommentSessionId}
        currentCommentSessionTitle={currentCommentSession?.content ?? ""}
        themeMode={themeMode}
        commentSessionList={commentSessionList}
        sessionSetting={sessionSetting}
        createSession={createSession}
        selectSession={selectSession}
        removeSession={removeSession}
        triggerSessionSidebar={triggerSessionSidebar}
        jumpPage={jumpPage}
        switchThemeMode={switchThemeMode}
      />
      <Layout className="comment-box full-height">
        <CommentHeader
          sessionSidebar={sessionSidebar}
          showTitleSpin={showTitleSpin}
          sessionTitle={currentCommentSession?.content ?? "新的聊天"}
          sessionSetting={sessionSetting}
          createSession={createSession}
          clearCurrentChatList={clearCurrentChatList}
          renameSessionTitle={renameSessionTitle}
          triggerSessionSidebar={triggerSessionSidebar}
          openMessageShare={openMessageShare}
        />
        <Content className="comment-content-box">
          {
            (openaiAttribute.apiKey === '') && (
              <Banner
                style={{ marginBottom: 20 }}
                type="warning"
                description={<div>您还未配置模型API Key，<Text link underline onClick={() => jumpPage("/setting/model")}>前往配置</Text>。</div>}
              />
            )
          }
          {
            commentChatList.length > 0 ? (
              commentChatList.map((item) => {
                return (
                  item.type === 'bot' ?
                    <BotMessageBox
                      key={item.id}
                      message={item}
                      copyCommentChatItem={copyCommentChatItem}
                      updateCommentChatItem={updateCommentChatItem}
                      removeCommentChatItem={removeCommentChatItem}
                      stopChatStream={stopChatStream}
                    />
                    :
                    sessionSetting.chatSessionLayout === "doc" ? (
                      <UserMessageDocBox
                        key={item.id}
                        message={item}
                        copyCommentChatItem={copyCommentChatItem}
                        updateCommentChatItem={updateCommentChatItem}
                        removeCommentChatItem={removeCommentChatItem}
                      />
                    ) : (
                      <UserMessageBox
                        key={item.id}
                        message={item}
                        copyCommentChatItem={copyCommentChatItem}
                        updateCommentChatItem={updateCommentChatItem}
                        removeCommentChatItem={removeCommentChatItem}
                      />
                    )
                )
              })
            ) : (
              <Empty
                image={<IllustrationNoContent/>}
                darkModeImage={<IllustrationNoContentDark/>}
                title="你好啊"
                description="今天需要我做些什么呢？"
                style={{position: "absolute", top: "33%", left: "50%", transform: "translate(-50%, -33%)"}}
              />
            )
          }
          <Modal
            title="编辑消息"
            visible={updateChatVisible}
            onOk={commentChatItemSubmit}
            onCancel={hiddenUpdateCommentChatItem}
            centered
          >
            <Form ref={chatFormRef} initValues={chatToUpdate} onValueChange={chatFormChange}>
              <Form.TextArea
                field="content"
                label="内容"
                autosize={{ minRows: 3, maxRows: 8}}
              />
            </Form>
          </Modal>
          <MessageShare
            show={showMessageShare}
            messageList={shareMessageList}
            chatSessionLayout={sessionSetting.chatSessionLayout}
            chatSession={currentCommentSession}
            closeMessageShare={closeMessageShare}
          />
        </Content>
        <Footer className="comment-send-box">
          <div className="comment-send-top">
            <div className="comment-send-content">
              {sendAdditionList.length > 0 && (
                <div className="comment-addition-box">
                  <TagGroup
                    maxTagCount={3}
                    showPopover
                    style={{
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    tagList={sendAdditionList}
                    size='large'
                    onTagClose={sendAdditionRemove}
                  />
                </div>
              )}
              <TextArea
                className="comment-send-input"
                placeholder="Enter发送，Shift + Enter换行。"
                value={userChatContent}
                autosize={{minRows: 1, maxRows: 8}}
                onChange={(value) => changeUserChatContent(value)}
                onEnterPress={chatEnterPress}
                ref={sendInputRef}
              />
              <div className="comment-addon-box">
                <Dropdown
                  trigger={'click'}
                  clickToHide={true}
                  position={'top'}
                  render={
                    <Dropdown.Menu>
                      <Dropdown.Item
                        icon={<IconImage />}
                        children="图片链接"
                        onClick={() => sendAddition('image')}
                      />
                      <Dropdown.Item
                        icon={<IconLink />}
                        children="网页地址"
                        onClick={() => sendAddition('link')}
                      />
                    </Dropdown.Menu>
                  }
                >
                  <span style={{display: 'inline-block'}}>
                    <Tooltip content={'附加消息'}>
                      <Button
                        theme="borderless"
                        type="tertiary"
                        icon={<IconPlusCircleStroked />}
                        aria-label="附加消息"
                      />
                    </Tooltip>
                  </span>
                </Dropdown>
                <Divider layout="vertical" margin='6px'/>
                <Tooltip content={'发送'}>
                  <Button
                    theme="borderless"
                    type="primary"
                    icon={<IconSend/>}
                    aria-label="发送"
                    disabled={userChatContent === ""}
                    onClick={chatSubmit}
                  />
                </Tooltip>
              </div>
            </div>
          </div>
          <div className="comment-send-bottom">
            <Select
              size="small"
              optionList={roleOptionProps}
              value={currentCommentSession?.config?.roleId ?? sessionSetting.defaultRoleId}
              arrowIcon={<IconUserCircleStroked />}
              placeholder="选择角色"
              emptyContent="暂无角色"
              showClear={true}
              clickToHide={true}
              onChange={(value) => changeSessionRole(typeof value === "string" ? value : "")}
            />
            <Divider layout="vertical" margin='12px' style={{height: 16}}/>
            {
              openaiAttribute && (
                <Select
                  size="small"
                  value={currentCommentSession?.config?.model ?? sessionSetting.defaultModel}
                  arrowIcon={<IconStarStroked />}
                  placeholder="选择大模型"
                  emptyContent="暂无可用模型"
                  clickToHide={true}
                  onChange={(value) => changeSessionModel(value as string)}
                >
                  <Select.OptGroup
                    label="OpenAI"
                    children={CommonUtil.mergeAndDeduplication(openaiAttribute.defaultModels, openaiAttribute.customModels).map((model) => (
                      <Select.Option key={model} value={model}>{model}</Select.Option>
                    ))}
                  />
                </Select>
              )
            }
            <Divider layout="vertical" margin='12px' style={{height: 16}}/>
            <Select
              size="small"
              value={currentCommentSession?.config?.modelPrecision ?? sessionSetting.defaultModelPrecision}
              arrowIcon={<IconHourglassStroked />}
              clickToHide={true}
              onChange={(value) => changeSessionModelPrecision(value as "creativity" | "balance" | "precision")}
            >
              <Select.Option value="creativity">有创造力</Select.Option>
              <Select.Option value="balance">平衡</Select.Option>
              <Select.Option value="precision">精确</Select.Option>
            </Select>
          </div>
          <Modal
            title="附加消息"
            visible={sendAdditionType !== ""}
            onOk={sendAdditionSubmit}
            onCancel={sendAdditionClose}
            centered
          >
            <Input
              value={sendAdditionContent}
              onChange={(content) => sendAdditionContentChange(content)}
              prefix={sendAdditionType === 'image' ? <IconImage /> : <IconLink />}
              showClear
              placeholder={sendAdditionType === 'image' ? "请填写图片的链接地址" : "请填写网页地址"}
            />
          </Modal>
        </Footer>
      </Layout>
    </Layout>
  );
}

export default CommentIndex;
