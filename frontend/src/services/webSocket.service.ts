import { io, Socket } from "socket.io-client";

class WebSocketService {
  private socket: Socket | null = null;

  connect(userId: string): void {
    const socketUrl = "http://localhost:3000";

    if (this.socket) {
      console.log("Already connected to WebSocket");
      return;
    }

    this.socket = io(socketUrl, {
      query: { userId },
    });

    this.socket.on("connect", () => {
      console.log(`Connected to WebSocket as ${userId}`);
    });

    this.socket.on("connect_error", (error: Error) => {
      console.error("WebSocket connection error:", error);
    });

    this.socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket");
    });
  }

  sendMessage(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  joinRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit("joinKanbanRoom", roomId);
      console.log(`Joined room: ${roomId}`);
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit("leaveKanbanRoom", roomId);
      console.log(`Left room: ${roomId}`);
    }
  }

  onMessage(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  offMessage(event: string): void {
    if (this.socket) {
      this.socket.off(event);
    }
  }
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log("Disconnected from WebSocket");
    }
  }
}

const webSocketService = new WebSocketService();
export default webSocketService;
