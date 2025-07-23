import { authService } from './cognito';

// AI Course Creator specific message interfaces
export interface AICourseCreatorMessage {
  UserPrompt: string;
  SpaceId: string;
}

export interface AICourseCreatorResponse {
  status?: string;
  content?: string;
}

export class AICourseCreatorWebSocketService {
  private ws: WebSocket | null = null;
  private baseUrl: string;
  private messageHandlers: ((message: string) => void)[] = [];
  private connectionHandlers: (() => void)[] = [];
  private errorHandlers: ((error: Event) => void)[] = [];
  private closeHandlers: (() => void)[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async connect(): Promise<void> {
    const timeout = setTimeout(() => {
      throw new Error('WebSocket connection timeout');
    }, 10000);

    try {
      // Get authentication tokens
      const tokens = await authService.getTokens();
      if (!tokens?.idToken) {
        throw new Error('No authentication token available');
      }

      // Connect with authentication
      const wsUrl = `${this.baseUrl}?token=${tokens.idToken}`;
      
      return new Promise<void>((resolve, reject) => {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('AI Course Creator WebSocket connected');
          this.connectionHandlers.forEach(handler => handler());
          resolve();
        };

        this.ws.onmessage = (event) => {
          console.log('AI Course Creator WebSocket message received:', event.data);
          this.messageHandlers.forEach(handler => handler(event.data));
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error('AI Course Creator WebSocket error:', error);
          this.errorHandlers.forEach(handler => handler(error));
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('AI Course Creator WebSocket connection closed');
          this.closeHandlers.forEach(handler => handler());
        };
      });
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }
  }

  sendMessage(userPrompt: string, spaceId: string): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: AICourseCreatorMessage = {
        UserPrompt: userPrompt,
        SpaceId: spaceId
      };
      
      console.log('Sending AI Course Creator message:', message);
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('AI Course Creator WebSocket is not connected');
    }
  }

  onMessage(handler: (message: string) => void): void {
    this.messageHandlers.push(handler);
  }

  onConnection(handler: () => void): void {
    this.connectionHandlers.push(handler);
  }

  onError(handler: (error: Event) => void): void {
    this.errorHandlers.push(handler);
  }

  onClose(handler: () => void): void {
    this.closeHandlers.push(handler);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}