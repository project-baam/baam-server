import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  InvalidFileNameCharatersError,
  InvalidFileNameExtensionError,
} from 'src/common/types/error/application-exceptions';
import { MAX_PROFILE_IMAGES } from '../../adapter/presenter/rest/constants/profile-image.constants';

export const profileImageMulterOptions: MulterOptions = {
  limits: { fileSize: 5 * 1024 * 1024, files: MAX_PROFILE_IMAGES },
  fileFilter: (_req, file, cb) => {
    const originName = Buffer.from(file.originalname, 'ascii')
      .toString('utf-8')
      .normalize('NFC');

    const allowedCharacters = /^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣._\s-]+$/;
    if (!allowedCharacters.test(originName)) {
      return cb(new InvalidFileNameCharatersError(), false);
    }

    const allowedExtensions = /\.(jpg|jpeg|png|gif)$/i;
    if (!allowedExtensions.test(file.originalname)) {
      return cb(new InvalidFileNameExtensionError(), false);
    }

    cb(null, true);
  },
};
