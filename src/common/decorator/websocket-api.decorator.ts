import {
  applyDecorators,
  UseFilters,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  WebSocketGateway as NestWebSocketGateway,
  GatewayMetadata,
} from '@nestjs/websockets';
import { WebsocketExceptionFilter } from '../filters/websocket/websocket-exception.filter';
import { WebsocketParameterValidationExceptionFilter } from '../filters/websocket/websocket-parameter-validator-exception.fileter';
import { commonValidationPipeOptions } from 'src/config/validation-pipe.config';

export function AppWebsocketGateway(): ClassDecorator;
export function AppWebsocketGateway(port: number): ClassDecorator;
export function AppWebsocketGateway(options: GatewayMetadata): ClassDecorator;
export function AppWebsocketGateway(
  port: number,
  options?: GatewayMetadata,
): ClassDecorator;
export function AppWebsocketGateway(
  portOrOptions?: number | GatewayMetadata,
  options?: GatewayMetadata,
): ClassDecorator {
  const nestGatewayDecorator =
    typeof portOrOptions === 'number'
      ? NestWebSocketGateway(portOrOptions, options)
      : NestWebSocketGateway(portOrOptions);

  return applyDecorators(
    nestGatewayDecorator,
    UseFilters(
      WebsocketExceptionFilter,
      WebsocketParameterValidationExceptionFilter,
    ),
    UsePipes(
      new ValidationPipe({
        ...commonValidationPipeOptions,
      }),
    ),
  );
}
