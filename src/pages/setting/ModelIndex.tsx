import {Form, Tooltip} from "@douyinfe/semi-ui";
import React, {createRef, useEffect, useState} from "react";
import {LocalForageService as storage} from "../../utils/storage";
import {OpenAIAttribute} from "../../interface/llm";
import {initialOpenaiAttribute} from "../../utils/initial-state";
import {MessageUtil} from "../../utils/message-util";
import {IconHelpCircle} from "@douyinfe/semi-icons";

function ModelIndex() {
  const [openaiAttribute, setOpenaiAttribute] = useState<OpenAIAttribute>(initialOpenaiAttribute);

  const openaiAttributeFormRef = createRef<Form<OpenAIAttribute>>();

  useEffect(() => {
    fetchOpenaiAttribute();
  }, []);

  const fetchOpenaiAttribute = async () => {
    const llmOpenaiAttribute = await storage.getItem<OpenAIAttribute>("llm_openai_attribute");
    const newOpenaiAttribute = MessageUtil.openaiAttributeDefaultConvert(llmOpenaiAttribute);
    setOpenaiAttribute(newOpenaiAttribute);
    openaiAttributeFormRef.current?.formApi.setValues(newOpenaiAttribute);
  }

  const openaiAttributeChange = (llmOpenaiAttribute: OpenAIAttribute, field: any) => {
    if (Object.keys(field).length > 1) {
      return;
    }
    setOpenaiAttribute(llmOpenaiAttribute);
    storage.setItem("llm_openai_attribute", llmOpenaiAttribute);
  }

  return (
    <Form
      ref={openaiAttributeFormRef}
      initValues={openaiAttribute}
      className="setting-form"
      onValueChange={openaiAttributeChange}
      children={
        <Form.Section text={'OpenAI'}>
          <Form.Input
            field='baseURL'
            label={{
              text: '接口地址',
              extra: <Tooltip content="请输入模型接口地址，支持使用openai协议兼容的地址。" children={<IconHelpCircle />} />
            }}
            placeholder="https://api.oneapi.com/v1"
          />
          <Form.Input
            field='apiKey'
            label='API Key'
            mode="password"
          />
          <Form.TagInput
            field="defaultModels"
            label='默认的模型'
            disabled
          />
          <Form.TagInput
            field="customModels"
            label={{
              text: '自定义模型',
              extra: <Tooltip content="如果想添加除默认模型之外的其它模型，可以在这里输入，然后按回车添加。" children={<IconHelpCircle />} />
            }}
            placeholder='输入后按回车添加自定义模型'
          />
        </Form.Section>
      }
    />
  );
}

export default ModelIndex;