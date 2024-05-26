/**
 * 会话设置
 *
 * @author xggz
 * @since 2024/4/29
 */
export interface SessionSetting {

  /**
   * 用户名
   */
  userName: string;

  /**
   * 默认对话模型
   */
  defaultModel: string;

  /**
   * 默认摘要模型
   */
  defaultSummaryModel: string;

  /**
   * 默认视觉模型
   */
  defaultVisionModel: string;

  /**
   * 默认模型精度（有创造力、平衡、精确）
   */
  defaultModelPrecision: "creativity" | "balance" | "precision";

  /**
   * 默认角色
   */
  defaultRoleId: string;

  /**
   * 默认系统消息
   */
  defaultSystemMessage: string;

  /**
   * 聊天最多记忆（条）
   */
  chatMaxMemory: number;

  /**
   * 聊天最长Token
   */
  chatMaxToken: number;

  /**
   * 近期聊天显示数量
   */
  chatSessionMaxNumber: number;

  /**
   * 是否显示顶部对话标题
   */
  isShowHeaderTitle: "true" | "false";

  /**
   * 对话排版方式
   */
  chatSessionLayout: "doc" | "chat";

}