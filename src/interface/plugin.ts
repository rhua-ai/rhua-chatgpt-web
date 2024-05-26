export interface Plugin {

  id: string;

  name: string;

  detail: string;

  color: string;

  version: string;

  author: string;

  enabled: boolean;

  func: PluginFunc;

  settings?: PluginSetting[];

}

export interface PluginFunc {

  name: string;

  description: string;

  parameters?: PluginParameter[];

  body: string;
}

export interface PluginParameter {

  name: string;

  type: string;

  description: string;
}

export interface PluginSetting {

  name: string;

  title: string;

  value: string;

}

export interface PluginConfig {

  id: string;

  name: string;

  items: PluginConfigItem[];
}

export interface PluginConfigItem {

  name: string;

  value: string;

}