
export interface WebSocketMessage {
  UserPrompt: string;
  SpaceId: string;
}

export interface WebSocketResponse {
  status?: string;
  message?: string;
  type?: string;
  data?: any;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: ((message: string) => void)[] = [];
  private connectionHandlers: (() => void)[] = [];
  private errorHandlers: ((error: Event) => void)[] = [];
  private closeHandlers: (() => void)[] = [];

  constructor(url: string = 'wss://pgnyjmjo7a.execute-api.us-east-1.amazonaws.com/production/') {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.connectionHandlers.forEach(handler => handler());
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            // Handle all responses as strings since the server sends string responses
            const messageData = event.data;
            console.log('WebSocket message received:', messageData);
            this.messageHandlers.forEach(handler => handler(messageData));
          } catch (error) {
            console.error('Error handling WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.errorHandlers.forEach(handler => handler(error));
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.closeHandlers.forEach(handler => handler());
          this.ws = null;
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  sendMessage(userPrompt: string, spaceId: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const message: WebSocketMessage = {
      UserPrompt: userPrompt,
      SpaceId: spaceId
    };

    console.log('Sending WebSocket message:', message);
    this.ws.send(JSON.stringify(message));
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
