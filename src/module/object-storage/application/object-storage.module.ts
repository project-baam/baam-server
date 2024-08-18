import { Module } from '@nestjs/common';
import { SpacesObjectStorage } from '../adapter/external/spaces-object-storage.service';
import { ObjectStorageService } from './object-storage.service.abstract';

@Module({
  providers: [
    {
      provide: ObjectStorageService,
      useClass: SpacesObjectStorage,
    },
  ],
  exports: [ObjectStorageService],
})
export class ObjectStorageModule {}
