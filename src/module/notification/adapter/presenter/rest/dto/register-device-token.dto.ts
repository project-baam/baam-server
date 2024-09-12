import { OSType } from './../../../../domain/enums/device.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { DeviceType } from 'src/module/notification/domain/enums/device.enum';

export class RegisterDeviceTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

  @ApiProperty()
  @IsEnum(DeviceType)
  deviceType: DeviceType;

  @ApiProperty()
  @IsEnum(OSType)
  osType: OSType;
}
