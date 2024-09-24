import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from '../../application/object-storage.service.abstract';
import { PutObjectCommandInput, S3 } from '@aws-sdk/client-s3';
import {
  DeleteFileParams,
  UploadFileParams,
} from '../../application/dto/object-storage.dto';
import { EnvironmentService } from '../../../../config/environment/environment.service';
import * as path from 'path';

@Injectable()
export class SpacesObjectStorage implements ObjectStorageService {
  private readonly s3Client: S3;
  private readonly bucket: string;

  constructor(private readonly environmentService: EnvironmentService) {
    this.s3Client = new S3({
      forcePathStyle: false,
      endpoint: this.environmentService.get<string>('SPACES_ENDPOINT')!,
      region: this.environmentService.get<string>('SPACES_REGION')!,
      credentials: {
        accessKeyId: this.environmentService.get<string>('SPACES_KEY')!,
        secretAccessKey: this.environmentService.get<string>('SPACES_SECRET')!,
      },
    });
    this.bucket = this.environmentService.get<string>('SPACES_BUCKET')!;
  }

  getKey(objectUrl: string): string;
  getKey(params: UploadFileParams): string;
  getKey(urlOrParams: UploadFileParams | string): string {
    if (typeof urlOrParams === 'string') {
      return urlOrParams.replace(
        this.environmentService.get<string>('SPACES_ENDPOINT')!,
        '',
      );
    } else {
      const { category, environment, uniqueKey, file } = urlOrParams;
      const fileExtension = path.extname(file.originalname);
      return `${environment}/${category}/${uniqueKey}${fileExtension}`;
    }
  }

  async uploadFile(params: UploadFileParams): Promise<string> {
    const { mimetype, buffer } = params.file;
    const Key = this.getKey(params);
    const Bucket = this.bucket;

    const uploadParams: PutObjectCommandInput = {
      Bucket,
      Key,
      Body: buffer,
      ACL: 'public-read',
      ContentType: mimetype,
      Expires: params.expiredAt,
    };

    await this.s3Client.putObject(uploadParams);

    return `${this.environmentService.get<string>('SPACES_ENDPOINT')}/${Bucket}/${Key}`;
  }

  async deleteFile(params: DeleteFileParams): Promise<void> {
    await this.s3Client.deleteObject({
      Bucket: this.bucket,
      Key: this.getKey(params.objectUrl),
    });
  }
}
