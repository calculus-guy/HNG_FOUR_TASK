declare module 'amqplib' {
  import { EventEmitter } from 'events';

  export interface Connection extends EventEmitter {
    createChannel(): Promise<Channel>;
    createConfirmChannel(): Promise<ConfirmChannel>;
    close(): Promise<void>;
    on(event: 'error', listener: (err: Error) => void): this;
    on(event: 'close', listener: () => void): this;
  }

  export interface Channel extends EventEmitter {
    assertQueue(queue: string, options?: any): Promise<any>;
    assertExchange(exchange: string, type: string, options?: any): Promise<any>;
    bindQueue(queue: string, source: string, pattern: string, args?: any): Promise<any>;
    consume(
      queue: string,
      onMessage: (msg: ConsumeMessage | null) => void,
      options?: any
    ): Promise<any>;
    ack(message: ConsumeMessage, allUpTo?: boolean): void;
    nack(message: ConsumeMessage, allUpTo?: boolean, requeue?: boolean): void;
    sendToQueue(queue: string, content: Buffer, options?: any): boolean;
    publish(exchange: string, routingKey: string, content: Buffer, options?: any): boolean;
    close(): Promise<void>;
  }

  export interface ConfirmChannel extends Channel {
    // ConfirmChannel has the same methods as Channel
  }

  export interface ConsumeMessage {
    content: Buffer;
    fields: any;
    properties: {
      messageId?: string;
      [key: string]: any;
    };
  }
  export function connect(url: string | any): Promise<Connection>;
}