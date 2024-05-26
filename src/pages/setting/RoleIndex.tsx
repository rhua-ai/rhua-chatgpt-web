import {
  Button,
  Card, Dropdown, Form,
  Input,
  Layout,
  List, Modal, Popconfirm, Toast,
} from "@douyinfe/semi-ui";
import {IconMore, IconPlus, IconSearch} from "@douyinfe/semi-icons";
import React, {createRef, useEffect, useState} from "react";
import {Role} from "../../interface/role";
import {LocalForageService as storage} from "../../utils/storage";
import {nanoid} from "ai";

function RoleIndex() {
  const { Header, Content } = Layout;

  const [roleList, setRoleList] = useState<Role[]>([]);
  const [roleModal, setRoleModal] = useState<boolean>(false);
  const [roleForm, setRoleForm] = useState<Role>();

  const roleFormRef = createRef<Form<Role>>();

  useEffect(() => {
    storage.getItem<Role[]>("role_list").then(roleList => {
      setRoleList(roleList ?? []);
    });
  }, []);

  const showRoleModal = () => {
    setRoleModal(true);
  }

  const hideRoleModal = () => {
    setRoleForm(undefined);
    setRoleModal(false);
  }

  const showRoleUpdateModal = (role: Role) => {
    roleFormRef.current?.formApi.setValues(role);
    setRoleForm(role);
    showRoleModal();
  }

  const roleSubmit = () => {
    if (!roleForm) {
      Toast.warning({
        content: "表单为空",
        showClose: false,
        duration: 2
      });
      return;
    }
    if (roleForm.id) {
      setRoleList(prevRoleList => {
        const newRoleList = [...prevRoleList];
        for (let i = 0; i < newRoleList.length; i++) {
          if (newRoleList[i].id === roleForm.id) {
            const role = newRoleList[i];
            newRoleList[i] = {
              ...role,
              name: roleForm.name,
              preset: roleForm.preset
            };
            break;
          }
        }
        storage.setItem("role_list", newRoleList);
        hideRoleModal();
        return newRoleList;
      });
    } else {
      const newRoleForm = {...roleForm};
      newRoleForm.id = nanoid();
      storage.pushItem<Role>("role_list", newRoleForm).then(roleList => {
        setRoleList(roleList);
        hideRoleModal();
      });
    }
  }

  const roleRemove = (roleId: string) => {
    let newRoleList: Role[] = [];
    setRoleList(roleList => {
      newRoleList = roleList.filter(role => role.id !== roleId);
      return newRoleList;
    });
    storage.setItem("role_list", newRoleList);
  }

  const roleFormChange = (role: Role, field: any) => {
    if (Object.keys(field).length > 1) {
      return;
    }
    if (roleForm) {
      setRoleForm({...roleForm, name: role.name, preset: role.preset});
    } else {
      setRoleForm(role);
    }
  }

  const style = {
    border: '1px solid var(--semi-color-border)',
    backgroundColor: 'var(--semi-color-bg-2)',
    borderRadius: '8px',
  };

  return (
    <div className="setting-main full-height">
      <Layout>
        <Header className="role-header">
          <Input
            prefix={<IconSearch />}
            showClear
            placeholder="搜索"
            style={{ width: 200 }}
          />
          <Button
            theme='solid'
            type='primary'
            icon={<IconPlus />}
            onClick={showRoleModal}
          >新增角色</Button>
        </Header>
        <Content className="role-box">
          <List
            grid={{
              gutter: [20, 20],
              xs: 24,
              sm: 24,
              md: 12,
              lg: 8,
              xl: 6,
              xxl: 4,
            }}
            dataSource={roleList}
            renderItem={role => (
              <List.Item style={style}>
                <Card
                  style={{ width: '100%' }}
                  bordered={false}
                  title={role.name}
                  headerExtraContent={
                    <Dropdown
                      clickToHide={true}
                      render={
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => showRoleUpdateModal(role)}>编辑</Dropdown.Item>
                          <Popconfirm
                            title="确定要删除吗？"
                            content="删除后数据无法找回。"
                            position="top"
                            showArrow={true}
                            zIndex={1065}
                            onConfirm={() => roleRemove(role.id)}
                            okButtonProps={{
                              type: 'danger'
                            }}
                            children={
                              <Dropdown.Item type="danger">删除</Dropdown.Item>
                            }
                          />
                        </Dropdown.Menu>
                      }
                      children={
                        <Button
                          theme="borderless"
                          type="tertiary"
                          size="small"
                          icon={<IconMore />}
                        />
                      }
                    />
                  }
                  children={role.preset}
                />
              </List.Item>
            )}
          />
        </Content>
        <Modal
          title="添加角色"
          visible={roleModal}
          onOk={roleSubmit}
          onCancel={hideRoleModal}
          centered
        >
          <Form ref={roleFormRef} initValues={roleForm} onValueChange={roleFormChange}>
            <Form.Input field='name' label="角色名" placeholder='角色名'/>
            <Form.TextArea field='preset' label="预设消息" placeholder='每次对话前预设置在最前面的系统消息'/>
          </Form>
        </Modal>
      </Layout>
    </div>
  );
}

export default RoleIndex;