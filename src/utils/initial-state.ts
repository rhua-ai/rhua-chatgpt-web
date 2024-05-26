import {SessionSetting} from "../interface/setting";
import {OpenAIAttribute} from "../interface/llm";

/**
 * 初始会话设置
 */
export const initialSessionSetting: SessionSetting = {
  userName: "我",
  defaultModel: "gpt-3.5-turbo",
  defaultSummaryModel: "gpt-3.5-turbo",
  defaultVisionModel: "gpt-4o",
  defaultModelPrecision: "creativity",
  defaultRoleId: "",
  defaultSystemMessage: "",
  chatMaxMemory: 4,
  chatMaxToken: 3000,
  chatSessionMaxNumber: 10,
  isShowHeaderTitle: "true",
  chatSessionLayout: "chat"
};

export const initialOpenaiAttribute: OpenAIAttribute = {
  baseURL: "",
  apiKey: "",
  defaultModels: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4o'],
  customModels: []
};

/**
 * 根据精度获取模型温度
 */
export const getModelTemperatureByPrecision = (precision: "creativity" | "balance" | "precision"): number => {
  switch (precision) {
    case "creativity":
      return 0.8;
    case "balance":
      return 0.5;
    case "precision":
      return 0.2;
    default:
      return 0.5;
  }
};

/**
 * 根据精度获取模型topP
 */
export const getModelTopPByPrecision = (precision: "creativity" | "balance" | "precision"): number => {
  switch (precision) {
    case "creativity":
      return 0.9;
    case "balance":
      return 0.7;
    case "precision":
      return 0.5;
    default:
      return 0.8;
  }
};