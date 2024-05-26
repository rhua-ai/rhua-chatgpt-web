/**
 * OpenAI属性
 */
export interface OpenAIAttribute {

    /**
     * 基础URL
     */
    baseURL: string;

    /**
     * APIKEY
     */
    apiKey: string;

    /**
     * 默认模型
     */
    defaultModels: string[];

    /**
     * 自定义模型
     */
    customModels: string[];
}