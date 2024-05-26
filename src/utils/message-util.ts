import {ChatMessage} from "../interface/message";
import {AIMessage, HumanMessage, MessageContent, SystemMessage} from "@langchain/core/messages";
import {BaseMessage, MessageContentComplex} from "@langchain/core/dist/messages";
import {ChatOpenAI} from "@langchain/openai";
import {OpenAIAttribute} from "../interface/llm";
import {SessionSetting} from "../interface/setting";
import {initialOpenaiAttribute, initialSessionSetting} from "./initial-state";

export class MessageUtil {

  /**
   * 转换聊天内容
   *
   * @param message
   */
  static covertChatContent(message: ChatMessage): MessageContent {
    let messageContent: MessageContent;
    if (message.additions !== undefined && message.additions.length > 0) {
      const chatContent: MessageContentComplex[] = [];
      chatContent.push({
        type: "text",
        text: message.content
      })
      if (message.additions) {
        for (let addition of message.additions) {
          if (addition.type === 'image') {
            chatContent.push({
              type: 'image_url',
              image_url: {
                url: addition.content
              }
            });
          } else if (addition.type === 'link') {
            chatContent.push({
              type: "text",
              text: addition.content
            })
          }
        }
      }
      messageContent = chatContent;
    } else {
      messageContent = message.content;
    }
    return messageContent;
  }

  /**
   * 判断消息是否有视觉信息
   *
   * @param inputMessage
   */
  static isUseVision(inputMessage: ChatMessage): boolean {
    if (!inputMessage || inputMessage.additions === undefined || inputMessage.additions.length === 0) {
      return false;
    }

    return inputMessage.additions.some(addition => addition.type === 'image');
  }

  static async getSessionTitle(llmOpenAIAttribute: OpenAIAttribute, sessionSetting: SessionSetting, userMessage: string, botMessage: string): Promise<string> {
    const model = new ChatOpenAI({
      temperature: 0.3,
      topP: 0.2,
      modelName: sessionSetting.defaultSummaryModel,
      openAIApiKey: llmOpenAIAttribute.apiKey
    }, {
      baseURL: llmOpenAIAttribute.baseURL
    });

    const chatHistory: BaseMessage[] = [];
    chatHistory.push(new HumanMessage({
      content: userMessage
    }));
    chatHistory.push(new AIMessage({
      content: botMessage
    }));
    chatHistory.push(new HumanMessage("使用六到八个字直接返回这句话的简要主题，如果没有主题直接返回“闲聊对话”，注意主题中不要多余的解释和不要标点符号，主题中也不要语气词"));

    const result = await model.invoke(chatHistory);

    return typeof result.content === 'string'? result.content : "新的聊天";
  }

  static async generateStructurePrompts(llmOpenAIAttribute: OpenAIAttribute, sessionSetting: SessionSetting, originPrompt: string): Promise<string> {
    const model = new ChatOpenAI({
      temperature: 0.3,
      topP: 0.2,
      modelName: sessionSetting.defaultSummaryModel,
      openAIApiKey: llmOpenAIAttribute.apiKey
    }, {
      baseURL: llmOpenAIAttribute.baseURL
    });

    const chatHistory: BaseMessage[] = [];
    chatHistory.push(new SystemMessage({
      content: ``
    }));
    chatHistory.push(new HumanMessage({
      content: originPrompt
    }));

    const result = await model.invoke(chatHistory);

    return typeof result.content === 'string'? result.content : originPrompt;
  }

  /**
   * 会话设置的默认值转换
   *
   * @param sessionSetting
   */
  static sessionSettingDefaultConvert(sessionSetting : SessionSetting | null): SessionSetting {
    if (!sessionSetting) {
      return {...initialSessionSetting};
    }
    const newSessionSetting: SessionSetting = {...sessionSetting};
    newSessionSetting.userName = sessionSetting.userName || initialSessionSetting.userName;
    newSessionSetting.defaultModel = sessionSetting.defaultModel || initialSessionSetting.defaultModel;
    newSessionSetting.defaultSummaryModel = sessionSetting.defaultSummaryModel || initialSessionSetting.defaultSummaryModel;
    newSessionSetting.defaultModelPrecision = sessionSetting.defaultModelPrecision || initialSessionSetting.defaultModelPrecision;
    newSessionSetting.defaultRoleId = sessionSetting.defaultRoleId || initialSessionSetting.defaultRoleId;
    newSessionSetting.defaultSystemMessage = sessionSetting.defaultSystemMessage || initialSessionSetting.defaultSystemMessage;
    newSessionSetting.chatMaxMemory = sessionSetting.chatMaxMemory || initialSessionSetting.chatMaxMemory;
    newSessionSetting.chatMaxToken = sessionSetting.chatMaxToken || initialSessionSetting.chatMaxToken;
    newSessionSetting.chatSessionMaxNumber = sessionSetting.chatSessionMaxNumber || initialSessionSetting.chatSessionMaxNumber;
    newSessionSetting.isShowHeaderTitle = sessionSetting.isShowHeaderTitle || initialSessionSetting.isShowHeaderTitle;
    newSessionSetting.chatSessionLayout = sessionSetting.chatSessionLayout || initialSessionSetting.chatSessionLayout;
    return newSessionSetting;
  }

  /**
   * OpenAI属性的默认值转换
   *
   * @param openaiAttribute
   */
  static openaiAttributeDefaultConvert(openaiAttribute: OpenAIAttribute | null): OpenAIAttribute {
    if (!openaiAttribute) {
      return {...initialOpenaiAttribute};
    }
    const newOpenaiAttribute: OpenAIAttribute = {...openaiAttribute};
    newOpenaiAttribute.baseURL = openaiAttribute.baseURL || initialOpenaiAttribute.baseURL;
    newOpenaiAttribute.apiKey = openaiAttribute.apiKey || initialOpenaiAttribute.apiKey;
    newOpenaiAttribute.defaultModels = initialOpenaiAttribute.defaultModels;
    newOpenaiAttribute.customModels = openaiAttribute.customModels || initialOpenaiAttribute.customModels;
    return newOpenaiAttribute;
  }

  /**
   * 消息类容转换
   *
   * @param content
   */
  static messageContentConvert(content: string) {
    let escapedText = "";
    for (let i = 0; i < content.length; i += 1) {
      let char = content[i];
      const nextChar = content[i + 1] || " ";
      if (char === "$" && nextChar >= "0" && nextChar <= "9") {
        char = "\\$";
      }
      escapedText += char;
    }

    const pattern = /(```[\s\S]*?```|`.*?`)|\\\[([\s\S]*?[^\\])\\\]|\\\((.*?)\\\)/g;
    return escapedText.replace(
      pattern,
      (match, codeBlock, squareBracket, roundBracket) => {
        if (codeBlock) {
          return codeBlock;
        } else if (squareBracket) {
          return `$$${squareBracket}$$`;
        } else if (roundBracket) {
          return `$${roundBracket}$`;
        }
        return match;
      }
    );
  }
}