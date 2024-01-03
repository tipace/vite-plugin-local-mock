export interface PluginConfig {
  dir?: string;
  enable?: boolean;
  pathMapConfig?: string;
}

export interface Router {
  url: string;
  path: string;
}

export interface RouterParams {
  [key: string]: string | null;
}
