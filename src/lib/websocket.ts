
import { authService } from './cognito';

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
  private baseUrl: string;
  private messageHandlers: ((message: string) => void)[] = [];
  private connectionHandlers: (() => void)[] = [];
  private errorHandlers: ((error: Event) => void)[] = [];
  private closeHandlers: (() => void)[] = [];
  private connectionTimeout: NodeJS.Timeout | null = null;

  constructor(baseUrl: string = 'wss://ct3ranhp35.execute-api.us-east-1.amazonaws.com/production') {
    this.baseUrl = baseUrl;
  }

  async connect(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Get auth token and construct URL with query parameter
        const tokens = await authService.getTokens();
        if (!tokens?.idToken) {
          reject(new Error('No authentication token available'));
          return;
        }

        // Try different query parameter names that AWS API Gateway might expect
        // Based on the logs, we need to pass the token so the Lambda authorizer can access it
        const url = `${this.baseUrl}?token=${encodeURIComponent(tokens.idToken)}`;
        console.log('🔌 Connecting to WebSocket with token as query parameter:', this.baseUrl + '?token=***');
        
        // Set connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
            console.error('❌ WebSocket connection timeout');
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000); // 10 second timeout

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected successfully');
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          // Don't send any immediate messages - let AWS API Gateway handle the $connect route
          console.log('📡 WebSocket connection established, ready for messages');
          
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
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          this.errorHandlers.forEach(handler => handler(error));
          reject(error);
        };

        this.ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected:', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
          
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          // If connection closes immediately after opening, it might be an auth issue
          if (event.code === 1006) {
            console.error('❌ WebSocket closed abnormally - likely authentication issue');
          }
          
          this.closeHandlers.forEach(handler => handler());
          this.ws = null;
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        
        if (this.connectionTimeout) {
          clearTimeout(this.connectionTimeout);
          this.connectionTimeout = null;
        }
        
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
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    if (this.ws) {
      console.log('🔌 Disconnecting WebSocket...');
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  // Method to retry connection with different query parameter names if needed
  async connectWithAlternativeAuth(): Promise<void> {
    const authParams = ['token', 'authToken', 'Authorization', 'access_token'];
    
    for (const paramName of authParams) {
      try {
        console.log(`🔄 Trying WebSocket connection with parameter: ${paramName}`);
        
        const tokens = await authService.getTokens();
        if (!tokens?.idToken) {
          throw new Error('No authentication token available');
        }

        const url = `${this.baseUrl}?${paramName}=${encodeURIComponent(tokens.idToken)}`;
        await this.connectWithUrl(url);
        console.log(`✅ WebSocket connected successfully with parameter: ${paramName}`);
        return;
      } catch (error) {
        console.log(`❌ Failed to connect with parameter ${paramName}:`, error);
        continue;
      }
    }
    
    throw new Error('Failed to connect with any authentication parameter');
  }

  private connectWithUrl(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const ws = new WebSocket(url);
      
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error('Connection timeout'));
      }, 5000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close(); // Close test connection
        resolve();
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      ws.onclose = (event) => {
        clearTimeout(timeout);
        if (event.code !== 1000) {
          reject(new Error(`Connection failed with code: ${event.code}`));
        }
      };
    });
  }
}
