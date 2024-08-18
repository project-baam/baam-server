import { SupportedEnvironment } from 'src/config/environment/environment';
import { StorageCategory } from '../../domain/enums/storage-category.enum';

export interface UploadFileParams {
  file: Express.Multer.File;
  category: StorageCategory;
  environment: SupportedEnvironment;
  uniqueKey: string | number;
}

export interface DeleteFileParams {
  objectUrl: string;
}
