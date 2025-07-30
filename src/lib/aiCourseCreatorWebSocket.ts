import { authService } from './cognito';
import { getAICourseCreatorWebSocketUrl } from './config';

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
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 3;
  private isReconnecting: boolean = false;

  constructor(baseUrl?: string) {
    // Provide fallback URL if not specified
    this.baseUrl = baseUrl || getAICourseCreatorWebSocketUrl();
    console.log('🔧 AI Course Creator WebSocket initialized with URL:', this.baseUrl);
  }

  async connect(): Promise<void> {
    if (this.isReconnecting) {
      return;
    }

    this.isReconnecting = true;
    const timeout = setTimeout(() => {
      this.isReconnecting = false;
      throw new Error('WebSocket connection timeout after 10 seconds');
    }, 10000);

    try {
      // Get authentication tokens with retry logic
      let tokens = null;
      let tokenRetries = 0;
      while (!tokens && tokenRetries < 3) {
        tokens = await authService.getTokens();
        if (!tokens) {
          tokenRetries++;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!tokens?.idToken) {
        throw new Error('No authentication token available after retries');
      }

      // Connect with authentication
      const wsUrl = `${this.baseUrl}?Authorization=${encodeURIComponent(`Bearer ${tokens.idToken}`)}`;
      console.log('🔌 Connecting to AI Course Creator WebSocket...');
      
      return new Promise<void>((resolve, reject) => {
        try {
          this.ws = new WebSocket(wsUrl);

          this.ws.onopen = () => {
            clearTimeout(timeout);
            this.isReconnecting = false;
            this.reconnectAttempts = 0;
            console.log('✅ AI Course Creator WebSocket connected successfully');
            this.connectionHandlers.forEach(handler => {
              try {
                handler();
              } catch (error) {
                console.error('Error in connection handler:', error);
              }
            });
            resolve();
          };

          this.ws.onmessage = (event) => {
            console.log('📨 AI Course Creator WebSocket message received:', event.data);
            this.messageHandlers.forEach(handler => {
              try {
                handler(event.data);
              } catch (error) {
                console.error('Error in message handler:', error);
              }
            });
          };

          this.ws.onerror = (error) => {
            clearTimeout(timeout);
            this.isReconnecting = false;
            console.error('❌ AI Course Creator WebSocket error:', error);
            this.errorHandlers.forEach(handler => {
              try {
                handler(error);
              } catch (error) {
                console.error('Error in error handler:', error);
              }
            });
            reject(error);
          };

          this.ws.onclose = (event) => {
            clearTimeout(timeout);
            this.isReconnecting = false;
            console.log('🔌 AI Course Creator WebSocket connection closed:', {
              code: event.code,
              reason: event.reason,
              wasClean: event.wasClean
            });
            
            // Auto-reconnect on unexpected closures
            if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
              this.attemptReconnect();
            }
            
            this.closeHandlers.forEach(handler => {
              try {
                handler();
              } catch (error) {
                console.error('Error in close handler:', error);
              }
            });
          };
        } catch (error) {
          clearTimeout(timeout);
          this.isReconnecting = false;
          reject(error);
        }
      });
    } catch (error) {
      clearTimeout(timeout);
      this.isReconnecting = false;
      throw error;
    }
  }

  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Maximum reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
    
    console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('❌ Reconnection failed:', error);
      }
    }, delay);
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