import {Form, Select, Tooltip} from "@douyinfe/semi-ui";
import React, {createRef, useEffect, useState} from "react";
import {LocalForageService as storage} from "../../utils/storage";
import {SessionSetting} from "../../interface/setting";
import {OpenAIAttribute} from "../../interface/llm";
import {Role} from "../../interface/role";
import {initialSessionSetting} from "../../utils/initial-state";
import {IconHelpCircle} from "@douyinfe/semi-icons";
import {MessageUtil} from "../../utils/message-util";
import {CommonUtil} from "../../utils/common-util";

function NormalIndex() {
  const [sessionSetting, setSessionSetting] = useState<SessionSetting>(initialSessionSetting);
  const [openaiAttribute, setOpenaiAttribute] = useState<OpenAIAttribute>();
  const [roleList, setRoleList] = useState<Role[]>();

  const sessionSettingFormRef = createRef<Form<SessionSetting>>();

  useEffect(() => {
    fetchSessionSetting();
    fetchOpenaiAttribute();
    fetchRoleList();
  }, []);

  const fetchSessionSetting = async () => {
    const setting = await storage.getItem<SessionSetting>("setting_session");
    const newSetting = MessageUtil.sessionSettingDefaultConvert(setting);
    setSessionSetting(newSetting);
    sessionSettingFormRef.current?.formApi.setValues(newSetting);
  }

  const fetchOpenaiAttribute = async () => {
    const llmOpenaiAttribute = await storage.getItem<OpenAIAttribute>("llm_openai_attribute");
    const newOpenaiAttribute = MessageUtil.openaiAttributeDefaultConvert(llmOpenaiAttribute);
    setOpenaiAttribute(newOpenaiAttribute);
  }

  const fetchRoleList = async () => {
    const roles = await storage.getItem<Role[]>("role_list");
    if (roles && roles.length > 0) {
      setRoleList(roles);
    }
  }

  const sessionSettingChange = (setting: SessionSetting, field: any) => {
    if (Object.keys(field).length > 1) {
      return;
    }
    setSessionSetting(setting);
    storage.setItem("setting_session", setting);
  }

  return (
    <Form
      ref={sessionSettingFormRef}
      initValues={sessionSetting}
      className="setting-form"
      onValueChange={sessionSettingChange}
    >
      <Form.Section text={'用户'}>
        <Form.Input
          field="userName"
          label="用户名"
          placeholder="我"
        />
      </Form.Section>
      <Form.Section text={'会话'}>
        <Form.Select
          className="full-width"
          field='defaultModel'
          label="默认对话模型"
          placeholder="选择对话模型"
          emptyContent="暂无可用模型"
          clickToHide={true}
        >
          {
            openaiAttribute && (
              <Form.Select.OptGroup
                label="OpenAI"
                children={CommonUtil.mergeAndDeduplication(openaiAttribute.defaultModels, openaiAttribute.customModels).map((model) => (
                  <Select.Option key={model} value={model}>{model}</Select.Option>
                ))}
              />
            )
          }
        </Form.Select>
        <Form.Select
          className="full-width"
          field='defaultSummaryModel'
          label={{
            text: "默认摘要模型",
            extra: <Tooltip content="根据第一轮对话来总结标题的模型。" children={<IconHelpCircle />} />
          }}
          placeholder="选择摘要模型"
          emptyContent="暂无可用模型"
          clickToHide={true}
        >
          {
            openaiAttribute && (
              <Form.Select.OptGroup
                label="OpenAI"
                children={CommonUtil.mergeAndDeduplication(openaiAttribute.defaultModels, openaiAttribute.customModels).map((model) => (
                  <Select.Option key={model} value={model}>{model}</Select.Option>
                ))}
              />
            )
          }
        </Form.Select>
        <Form.Select
          className="full-width"
          field='defaultVisionModel'
          label={{
            text: "默认视觉模型",
            extra: <Tooltip content="当对话中出现图片时，会自动切换到视觉模型。" children={<IconHelpCircle />} />
          }}
          placeholder="选择视觉模型"
          emptyContent="暂无可用模型"
          clickToHide={true}
        >
          {
            openaiAttribute && (
              <Form.Select.OptGroup
                label="OpenAI"
                children={CommonUtil.mergeAndDeduplication(openaiAttribute.defaultModels, openaiAttribute.customModels).map((model) => (
                  <Select.Option key={model} value={model}>{model}</Select.Option>
                ))}
              />
            )
          }
        </Form.Select>
        <Form.RadioGroup
          field="defaultModelPrecision"
          label="默认模型精度"
          type="card"
          direction='vertical'
        >
          <Form.Radio
            value="creativity"
            extra='以创新和独特的方式解决问题或生成结果。'
            children="更有创造力"
          />
          <Form.Radio
            value="balance"
            extra='平衡在创造力和精确性之间。'
            children="更平衡"
          />
          <Form.Radio
            value="precision"
            extra='谨慎地生成一些符合事实和逻辑的回答。'
            children="更精确"
          />
        </Form.RadioGroup>
        <Form.Select
          className="full-width"
          field='defaultRoleId'
          label="默认角色"
          placeholder="聊天的默认角色，可不选"
          emptyContent="暂无可用角色"
          clickToHide={true}
          showClear={true}
        >
          {
            roleList && roleList.length > 0 && (
              roleList.map((role) => (
                <Select.Option key={role.id} value={role.id}>{role.name}</Select.Option>
              ))
            )
          }
        </Form.Select>
        <Form.Input
          field="defaultSystemMessage"
          label={{
            text: "默认系统消息",
            extra: <Tooltip content="每次对话固定在最前面的系统消息。" children={<IconHelpCircle />} />
          }}
          placeholder="为空则不添加系统消息"
          showClear={true}
        />
        <Form.InputNumber
          className="full-width"
          field="chatMaxMemory"
          label={{
            text: "聊天最长记忆条数",
            extra: <Tooltip content="每次聊天时，AI能记住之前对话的条数（鱼的记忆只有7秒？），越多越方便AI整体的对话理解，但消耗的Token也越多。" children={<IconHelpCircle />} />
          }}
          min={1}
          suffix="条"
        />
        <Form.InputNumber
          className="full-width"
          field="chatMaxToken"
          label={{
            text: "生成文本的最大长度",
            extra: <Tooltip content="用来限制AI单次回复的最大文本长度，如果希望生成较长的回答，可以设置大一点，相反则设置小一点。" children={<IconHelpCircle />} />
          }}
          min={10}
          suffix="条"
        />
      </Form.Section>
      <Form.Section text={'聊天界面'}>
        <Form.InputNumber
          className="full-width"
          field="chatSessionMaxNumber"
          label="近期聊天显示数量（超出折叠）"
          min={1}
          suffix="行"
        />
        <Form.RadioGroup
          field="isShowHeaderTitle"
          label="是否显示顶部对话标题"
        >
          <Form.Radio value='true'>显示</Form.Radio>
          <Form.Radio value='false'>不显示</Form.Radio>
        </Form.RadioGroup>
        <Form.RadioGroup
          field="chatSessionLayout"
          label="对话排版方式"
          type="card"
          direction='vertical'
        >
          <Form.Radio
            value="chat"
            extra='AI的对话框在左边，用户的在右边。'
            children="聊天模式"
          />
          <Form.Radio
            value="doc"
            extra='AI和用户的对话框都在左边开始。'
            children="文档模式"
          />
        </Form.RadioGroup>
      </Form.Section>
    </Form>
  );
}

export default NormalIndex;