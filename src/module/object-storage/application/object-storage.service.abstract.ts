import { DeleteFileParams, UploadFileParams } from './dto/object-storage.dto';

export abstract class ObjectStorageService {
  abstract uploadFile(params: UploadFileParams): Promise<string>;
  abstract deleteFile(params: DeleteFileParams): Promise<void>;
}
