import configData from '../../config.json';

// TypeScript interfaces for type safety
export interface ApiConfig {
  baseUrl: string;
  region: string;
  external: {
    devTo: string;
    localDevelopment: string;
  };
}

export interface CognitoConfig {
  userPoolId: string;
  userPoolClientId: string;
  passwordRequirements: {
    minLength: number;
    requireLowercase: boolean;
    requireUppercase: boolean;
    requireNumbers: boolean;
    requireSpecialCharacters: boolean;
  };
  signUpVerification: string;
  loginMethods: string[];
  requiredAttributes: string[];
}

export interface WebSocketConfig {
  aiAssistant: string;
  aiCourseCreator: string;
  qaChat: string;
}

export interface BrandConfig {
  name: string;
  subtitle: string;
  logo: string;
  colors: {
    primary: string;
    gradients: {
      primary: string;
      primaryHover: string;
      brandText: string;
    };
  };
  fonts: {
    primary: string;
    secondary: string;
  };
}

export interface AppDefaults {
  emailDomain: string;
  emailPlaceholder: string;
}

export interface Config {
  application: {
    name: string;
    brand: BrandConfig;
    defaults: AppDefaults;
  };
  api: ApiConfig;
  aws: {
    region: string;
    cognito: CognitoConfig;
  };
  websockets: WebSocketConfig;
}

// Export the typed configuration
export const config: Config = configData as Config;

// Utility functions to get configuration values with environment variable fallbacks
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_BASE_URL || config.api.baseUrl;
};

export const getCognitoUserPoolId = (): string => {
  return import.meta.env.VITE_COGNITO_USER_POOL_ID || config.aws.cognito.userPoolId;
};

export const getCognitoUserPoolClientId = (): string => {
  return import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID || config.aws.cognito.userPoolClientId;
};

export const getAIAssistantWebSocketUrl = (): string => {
  return import.meta.env.VITE_WS_BASE_URL || config.websockets.aiAssistant;
};

export const getAICourseCreatorWebSocketUrl = (): string => {
  return import.meta.env.VITE_AI_COURSE_CREATOR_WS_URL || config.websockets.aiCourseCreator;
};

export const getQAChatWebSocketUrl = (): string => {
  return config.websockets.qaChat;
};

export const getDevToApiUrl = (): string => {
  return config.api.external.devTo;
};

export const getEmailPlaceholder = (): string => {
  return config.application.defaults.emailPlaceholder;
};

// Export individual config sections for convenience
export const apiConfig = config.api;
export const cognitoConfig = config.aws.cognito;
export const websocketConfig = config.websockets;
export const brandConfig = config.application.brand;
export const appDefaults = config.application.defaults;