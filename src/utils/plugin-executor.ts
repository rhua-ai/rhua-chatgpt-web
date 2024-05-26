import {AgentExecutor, createOpenAIFunctionsAgent} from "langchain/agents";
import {BaseMessagePromptTemplateLike, ChatPromptTemplate, MessagesPlaceholder} from "@langchain/core/prompts";
import {ChatOpenAI, OpenAIEmbeddings} from "@langchain/openai";
import {BaseCallbackHandler} from "@langchain/core/callbacks/base";
import {AIMessage, HumanMessage} from "@langchain/core/messages";
import {DynamicStructuredTool, DynamicTool, StructuredTool} from "@langchain/core/tools";
import {z} from "zod";
import {LocalForageService as storage} from "./storage";
import {Plugin} from "../interface/plugin";
import {ChatMessage, ChatSessionConfig} from "../interface/message";
import {MessageUtil} from "./message-util";
import {Calculator} from "@langchain/community/tools/calculator";
import {Role} from "../interface/role";
import {RunnableConfig} from "@langchain/core/runnables";
import {CallbackManagerForToolRun} from "@langchain/core/callbacks/manager";
import {SessionSetting} from "../interface/setting";
import {getModelTemperatureByPrecision, getModelTopPByPrecision} from "./initial-state";
import {InputValues} from "@langchain/core/memory";

class PluginExecutor {

  private baseURL: string;
  private apikey: string;
  private modelName: string;

  constructor(baseURL: string, apikey: string, modelName: string) {
    this.baseURL = baseURL;
    this.apikey = apikey;
    this.modelName = modelName;
  }

  public async execute(inputMessage: ChatMessage, historyChatList: ChatMessage[], sessionConfig: ChatSessionConfig | undefined, sessionSetting: SessionSetting, handler: BaseCallbackHandler) {
    const promptMessages: (ChatPromptTemplate<InputValues, string> | BaseMessagePromptTemplateLike)[] = [
      ["system", `客户端已经集成markdown、mermaid。`],
      new MessagesPlaceholder({
        variableName: "",
        optional: true
      }),
      new MessagesPlaceholder("chat_history"),
      new MessagesPlaceholder("chat_input"),
      new MessagesPlaceholder("agent_scratchpad")
    ];

    let systemMessage = sessionSetting.defaultSystemMessage ?? "";
    if (sessionConfig && sessionConfig.roleId) {
      const roleList = await storage.getItem<Role[]>("role_list");
      const role = roleList?.find(role => role.id === sessionConfig.roleId);
      if (role) {
        systemMessage = role.preset;
      }
    }
    if (systemMessage.length > 0) {
      promptMessages.unshift(["system", `${systemMessage}`]);
    }

    const prompt = ChatPromptTemplate.fromMessages(promptMessages);

    // const prompt = await pull<ChatPromptTemplate>("hwchase17/openai-functions-agent");

    const model = new ChatOpenAI({
      temperature: getModelTemperatureByPrecision(sessionConfig?.modelPrecision ?? sessionSetting.defaultModelPrecision),
      topP: getModelTopPByPrecision(sessionConfig?.modelPrecision ?? sessionSetting.defaultModelPrecision),
      modelName: this.modelName,
      openAIApiKey: this.apikey,
      streaming: true,
      maxTokens: sessionSetting.chatMaxToken
    }, {
      baseURL: this.baseURL
    });

    const embeddings = new OpenAIEmbeddings({
      modelName: this.modelName,
      openAIApiKey: this.apikey,
    }, {
      baseURL: this.baseURL
    });

    const tools: StructuredTool[] = [
      new Calculator()
    ];

    const pluginList = await storage.getItem<Plugin[]>("plugin_list");
    if (pluginList && pluginList.length > 0) {
      for (let plugin of pluginList) {
        if (!plugin.enabled) {
          continue;
        }

        let zp = "";
        let args = "";
        if (plugin.func.parameters) {
          for (let parameter of plugin.func.parameters) {
            if (zp) {
              zp += ", ";
            }
            zp += `${parameter.name}: z.${parameter.type}().describe("${parameter.description}")`;

            if (args) {
              args += ", ";
            }
            args += parameter.name;
          }
        }

        if (zp !== "" && args !== "") {
          const schemaObject = new Function('z', `return z.object({${zp}});`);
          const funcBody = new Function(`{${args}}`, `return (async () => {${plugin.func.body}})();`) as (input: z.infer<z.ZodObject<any, any, any, any>>, runManager?: CallbackManagerForToolRun, config?: RunnableConfig) => Promise<string>;
          const tool = new DynamicStructuredTool({
            name: plugin.func.name,
            description: plugin.func.description,
            schema: schemaObject(z),
            func: funcBody
          });
          tools.push(tool);
        } else {
          const funcBody = new Function(`return (async () => {${plugin.func.body}})();`) as (input: string, runManager?: CallbackManagerForToolRun, config?: RunnableConfig) => Promise<string>;
          const tool = new DynamicTool({
            name: plugin.func.name,
            description: plugin.func.description,
            func: funcBody
          });
          tools.push(tool);
        }
      }
    }

    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      tools: tools,
      prompt: prompt
    });

    const agentExecutor = AgentExecutor.fromAgentAndTools({
      agent: agent,
      tools: tools
    });

    const chatHistory = [];
    for (const chatMessage of historyChatList) {
      const messageContent = MessageUtil.covertChatContent(chatMessage);
      if (chatMessage.type === 'user') {
        chatHistory.push(new HumanMessage({
          content: messageContent
        }));
      } else if (chatMessage.type === 'bot') {
        chatHistory.push(new AIMessage({
          content: messageContent
        }));
      }
    }

    const chatInput = new HumanMessage({
      content: MessageUtil.covertChatContent(inputMessage)
    });

    await agentExecutor.invoke({
      chat_history: chatHistory,
      chat_input: chatInput
    }, {
      callbacks: [handler]
    });
  }
}

export default PluginExecutor;