import { Injectable } from '@nestjs/common';
import { ObjectStorageService } from '../../application/object-storage.service.abstract';
import { S3 } from '@aws-sdk/client-s3';
import {
  DeleteFileParams,
  UploadFileParams,
} from '../../application/dto/object-storage.dto';
import { EnvironmentService } from '../../../../config/environment/environment.service';

@Injectable()
export class SpacesObjectStorage implements ObjectStorageService {
  private readonly s3Client: S3;
  private readonly bucket: string;

  constructor(private readonly environmentService: EnvironmentService) {
    this.s3Client = new S3({
      forcePathStyle: false,
      endpoint: this.environmentService.get<string>('SPACES_ENDPOINT')!,
      region: this.environmentService.get<string>('SPACES_REGION')!,
      // region: 'us-east-1',
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
      const { category, environment, uniqueKey } = urlOrParams;
      return `${environment}/${category}/${uniqueKey}`;
    }
  }

  async uploadFile(params: UploadFileParams): Promise<string> {
    const { mimetype, buffer } = params.file;
    const Key = this.getKey(params);
    const Bucket = this.bucket;

    const createResult = await this.s3Client.createMultipartUpload({
      Bucket,
      Key,
      ACL: 'public-read',
      Metadata: {
        'Content-Type': `${mimetype}`,
      },
    });

    const uploadResult = await this.s3Client.uploadPart({
      Bucket,
      Key,
      Body: buffer,
      PartNumber: 1,
      UploadId: createResult.UploadId,
    });

    const result = await this.s3Client.completeMultipartUpload({
      Bucket,
      Key,
      UploadId: createResult.UploadId,
      MultipartUpload: {
        Parts: [
          {
            PartNumber: 1,
            ETag: uploadResult.ETag,
          },
        ],
      },
    });

    return [
      this.environmentService.get<string>('SPACES_ENDPOINT'),
      Bucket,
      Key,
    ].join('/');
  }

  async deleteFile(params: DeleteFileParams): Promise<void> {
    await this.s3Client.deleteObject({
      Bucket: this.bucket,
      Key: this.getKey(params.objectUrl),
    });
  }
}
