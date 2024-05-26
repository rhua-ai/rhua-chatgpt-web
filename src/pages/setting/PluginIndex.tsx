import {
  ArrayField,
  Avatar,
  Button,
  Card,
  Checkbox,
  Empty,
  Form,
  Input,
  Layout,
  List, Popconfirm, Toast, Tooltip,
  Typography
} from "@douyinfe/semi-ui";
import {IconComponent, IconMinusCircle, IconPlus, IconPlusCircle, IconSearch} from "@douyinfe/semi-icons";
import {
  IllustrationIdle,
  IllustrationIdleDark,
} from "@douyinfe/semi-illustrations";
import React, {createRef, useEffect, useState} from "react";
import {Plugin} from "../../interface/plugin";
import {nanoid} from "ai";
import {LocalForageService as storage} from "../../utils/storage";

function PluginIndex() {
  const { Sider, Header, Content, Footer } = Layout;
  const { Text } = Typography;

  const [pluginList, setPluginList] = useState<Plugin[]>([]);
  const [currentPlugin, setCurrentPlugin] = useState<Plugin>();

  const [panel, setPanel] = useState<string>("");

  const pluginFormRef = createRef<Form<Plugin>>();

  useEffect(() => {
    storage.getItem<Plugin[]>("plugin_list").then(pluginList => {
      setPluginList(pluginList ?? []);
    });
  }, []);

  const showPluginDetail = (pluginId: string) => {
    const plugin = pluginList.find(plugin => plugin.id === pluginId);
    if (plugin) {
      const newCurrentPlugin: Plugin = {
        id: plugin.id,
        name: plugin.name,
        detail: plugin.detail,
        color: plugin.color,
        version: plugin.version,
        author: plugin.author,
        enabled: plugin.enabled,
        func: {
          ...plugin.func,
          parameters: plugin.func.parameters?.map(parameter => ({...parameter}))
        },
        settings: plugin.settings?.map(setting => ({...setting}))
      };
      pluginFormRef.current?.formApi.setValues(newCurrentPlugin, { isOverride: true });
      setCurrentPlugin(newCurrentPlugin);
      if (panel !== "form") {
        setPanel("form");
      }
    }
  }

  const createPlugin = () => {
    const newPlugin: Plugin = {
      id: nanoid(),
      name: "测试插件",
      detail: "",
      color: "var(--semi-color-primary)",
      version: "1.0.0",
      author: "xggz",
      enabled: false,
      func: {
        name: "",
        description: "",
        parameters: [],
        body: ""
      },
      settings: []
    };
    pluginFormRef.current?.formApi.setValues(newPlugin, { isOverride: true });
    setCurrentPlugin(newPlugin);
    setPanel("form");
    setPluginList(prevPluginList => [...prevPluginList, newPlugin]);
    storage.pushItem("plugin_list", newPlugin);
  }

  const pluginChange = (plugin: Plugin, field: any) => {
    if (Object.keys(field).length > 1) {
      return;
    }

    if (!currentPlugin) {
      Toast.warning({
        content: "表单为空",
        showClose: false,
        duration: 2
      });
      return;
    }

    const newCurrentPlugin = {...currentPlugin,
      name: plugin.name,
      detail: plugin.detail,
      color: plugin.color,
      version: plugin.version,
      author: plugin.author,
      enabled: plugin.enabled,
      func: {
        ...plugin.func,
        parameters: plugin.func.parameters?.map(parameter => ({...parameter}))
      },
      settings: plugin.settings?.map(setting => ({...setting}))
    };

    setPluginList(prevPluginList => {
      const newPluginList = [...prevPluginList];
      const pluginToUpdate = newPluginList.find(np => np.id === newCurrentPlugin.id);
      if (pluginToUpdate) {
        Object.assign(pluginToUpdate, newCurrentPlugin);
      }
      setCurrentPlugin(newCurrentPlugin);
      storage.setItem("plugin_list", newPluginList);
      return newPluginList;
    });
  }

  const pluginEnabled = (pluginId: string, checked: boolean | undefined) => {
    setPluginList(prevPluginList => {
      const newPluginList = [...prevPluginList];
      for (let i = 0; i < newPluginList.length; i++) {
        if (newPluginList[i].id === pluginId) {
          const plugin = newPluginList[i];
          newPluginList[i] = {
            ...plugin,
            enabled: checked || false
          };
          break;
        }
      }
      storage.setItem("plugin_list", newPluginList);
      return newPluginList;
    });
  }

  const pluginRemove = () => {
    if (!currentPlugin) {
      Toast.warning({
        content: "表单为空",
        showClose: false,
        duration: 2
      });
      return;
    }

    let newPluginList: Plugin[] = [];
    setPluginList(pluginList => {
      newPluginList = pluginList.filter(plugin => plugin.id !== currentPlugin.id);
      return newPluginList;
    });
    storage.setItem("plugin_list", newPluginList);
    setCurrentPlugin(undefined);
    setPanel("");
  }

  return (
    <div className="setting-main full-height">
      <Layout className="setting-content full-height">
        <Sider className="setting-left full-height">
          <List
            className="setting-nav full-height"
            dataSource={pluginList}
            split={false}
            header={
              <div className="setting-bar">
                <Input
                  prefix={<IconSearch/>}
                  placeholder="搜索"
                  showClear
                  style={{ marginRight: 10 }}
                />
                <Tooltip
                  content="创建插件"
                >
                  <Button
                    icon={<IconPlus/>}
                    theme="solid"
                    onClick={createPlugin}
                  />
                </Tooltip>
              </div>
            }
            renderItem={plugin => (
              <List.Item
                className={`setting-list-item${currentPlugin?.id === plugin.id ? ' active' : ''}`}
                header={<Avatar style={{backgroundColor: plugin.color}}><IconComponent /></Avatar>}
                main={
                  <div>
                    <span style={{
                      color: 'var(--semi-color-text-0)',
                      fontSize: '16px',
                      fontWeight: 500}}
                    >{plugin.name}</span>
                    <p style={{
                      color: 'var(--semi-color-text-2)',
                      margin: '5px 0',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',}}
                    >{plugin.version} {plugin.author}</p>
                  </div>
                }
                extra={
                  <Checkbox
                    onChange={(e) => pluginEnabled(plugin.id, e.target.checked)}
                    defaultChecked={plugin.enabled}
                    aria-label="是否启用"
                  />
                }
                onClick={() => showPluginDetail(plugin.id)}
              />
            )}
          />
        </Sider>
        <Content className="setting-right">
          { panel === "" &&
            <Empty
              image={<IllustrationIdle />}
              darkModeImage={<IllustrationIdleDark />}
              description="选择插件以预览详细信息"
              style={{position: "absolute", top: "33%", left: "50%", transform: "translate(-50%, -33%)" }}
            />
          }
          { panel === "detail" &&
            <Layout>
              <Header>
                <Text>{currentPlugin?.name}</Text>
              </Header>
              <Content>
                {currentPlugin?.detail}
              </Content>
            </Layout>
          }
          { panel === "form" &&
            <Layout>
              <Content>
                <Form className="setting-form" ref={pluginFormRef} initValues={currentPlugin} onValueChange={pluginChange}>
                  <Form.Section text={'基础信息'}>
                    <Form.Input field='name' label='名字' />
                    <Form.Input field='version' label='版本' />
                    <Form.Input field='author' label='作者' />
                  </Form.Section>
                  <Form.Section text={'执行函数'}>
                    <Form.Input field='func.name' label='函数名' />
                    <Form.Input field='func.description' label='函数描述' />
                    <Text strong style={{ marginBottom: 4, display: "block" }}>函数入参</Text>
                    <Card>
                      <ArrayField field='func.parameters'>
                        {({ add, arrayFields, addWithInitValue }) => (
                          <React.Fragment>
                            <Button
                              icon={<IconPlusCircle />}
                              onClick={() => {addWithInitValue({ name: '', type: 'string', description: '' });}}
                            >添加参数</Button>
                            {
                              arrayFields.map(({ field, key, remove }, i) => (
                                <div key={key} style={{ width: 1000, display: 'flex' }}>
                                  <Form.Input
                                    field={`${field}[name]`}
                                    label='参数名'
                                    style={{ width: 120, marginRight: 16 }}
                                  >
                                  </Form.Input>
                                  <Form.Select
                                    field={`${field}[type]`}
                                    label='参数类型'
                                    style={{ width: 120, marginRight: 16 }}
                                    optionList={[
                                      { label: '字符串', value: 'string' },
                                      { label: '数字', value: 'number' },
                                    ]}
                                  >
                                  </Form.Select>
                                  <Form.Input
                                    field={`${field}[description]`}
                                    label='参数描述'
                                    style={{ width: 150 }}
                                  >
                                  </Form.Input>
                                  <Button
                                    type='danger'
                                    theme='borderless'
                                    icon={<IconMinusCircle />}
                                    onClick={remove}
                                    style={{ margin: '36px 12px 12px 12px' }}
                                  />
                                </div>
                              ))
                            }
                          </React.Fragment>
                        )}
                      </ArrayField>
                    </Card>
                    <Form.TextArea
                      field='func.body'
                      label='函数代码'
                      placeholder='函数代码'
                      autosize={{ minRows: 3, maxRows: 12}}
                    />
                  </Form.Section>
                </Form>
              </Content>
              <Footer className="setting-footer">
                <Button theme='solid' block disabled>导出插件配置</Button>
                <Popconfirm
                  title="确定要删除吗？"
                  content="删除后此插件配置无法找回，请谨慎操作。"
                  position="top"
                  showArrow={true}
                  zIndex={1065}
                  onConfirm={pluginRemove}
                  okButtonProps={{
                    type: 'danger'
                  }}
                  children={
                    <Button theme='light' type='danger' block>删除此插件</Button>
                  }
                />
              </Footer>
            </Layout>
          }
        </Content>
      </Layout>
    </div>
  );
}

export default PluginIndex;