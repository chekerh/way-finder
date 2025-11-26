import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway()
export class RealTimeGateway {
  @WebSocketServer() server: Server;

  @SubscribeMessage('price_alert')
  handlePriceAlert(@MessageBody() data: any) {
    this.server.emit('price_alert', data);
  }

  @SubscribeMessage('chat_message')
  handleChatMessage(@MessageBody() message: string) {
    this.server.emit('chat_message', message);
  }
}
