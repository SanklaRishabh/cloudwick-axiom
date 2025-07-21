
export interface WebSocketMessage {
  Query: string;
  SpaceId: string;
  FileName?: string;
}

export interface WebSocketResponse {
  Query?: string;
  Content?: string;
}

export class WebSocketService {
  private ws: WebSocket | null = null;
  private url: string;
  private messageHandlers: ((message: string) => void)[] = [];
  private connectionHandlers: (() => void)[] = [];
  private errorHandlers: ((error: Event) => void)[] = [];
  private closeHandlers: (() => void)[] = [];

  constructor(url: string = 'wss://ct3ranhp35.execute-api.us-east-1.amazonaws.com/production') {
    this.url = url;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connecting to WebSocket:', this.url);
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          
          // Send a connection establishment message to AWS API Gateway
          // This helps ensure we're properly connected to the $connect route
          const connectMessage = {
            action: 'connect',
            timestamp: new Date().toISOString()
          };
          
          try {
            this.ws?.send(JSON.stringify(connectMessage));
            console.log('📡 Connection establishment message sent');
          } catch (error) {
            console.warn('⚠️ Failed to send connection establishment message:', error);
          }
          
          this.connectionHandlers.forEach(handler => handler());
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            console.log('📨 WebSocket message received:', event.data);
            this.messageHandlers.forEach(handler => handler(event.data));
          } catch (error) {
            console.error('❌ Error handling WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.errorHandlers.forEach(handler => handler(error));
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
          this.closeHandlers.forEach(handler => handler());
          this.ws = null;
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  sendMessage(query: string, spaceId: string, fileName?: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const message: WebSocketMessage = {
      Query: query,
      SpaceId: spaceId,
      ...(fileName && { FileName: fileName })
    };

    console.log('📤 Sending WebSocket message:', message);
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
      console.log('🔌 Disconnecting WebSocket...');
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
