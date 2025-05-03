import {
  Controller,
  FileTypeValidator,
  MaxFileSizeValidator,
  Post,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { AnyFilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';

import { GroupFilesPipe } from '../../src/group-files.pipe';
import { ParseFileFieldsPipe } from '../../src/parse-file-fields.pipe';


const parseFileFieldsOptions = {
  commonOptions: {
    validators: [
      new MaxFileSizeValidator({ maxSize: 5_242_880 }), // 5 Mio
    ],
  },
  fields: [
    {
      name: 'documents',
      options: {
        validators: [
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }
    },
    {
      name: 'images',
      options: {
        validators: [
          new FileTypeValidator({ fileType: /.(jpeg|png)$/ }),
        ],
      },
    },
  ],
};

@Controller('uploads')
export class AppController {
  constructor() {}

  @UseInterceptors(AnyFilesInterceptor())
  @Post('group-files')
  async groupFiles(
    @UploadedFiles(new GroupFilesPipe())
    files: Record<string, Express.Multer.File[]>
  ) {
    const response: Record<string, number> = {};

    for (const key of Object.keys(files)) {
      response[key] = files[key].length;
    }

    return response;
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'images', maxCount: 2 },
      { name: 'documents', maxCount: 4 },
    ]),
  )
  @Post('validate')
  validate(
    @UploadedFiles(new ParseFileFieldsPipe(parseFileFieldsOptions))
    files: { images: Express.Multer.File[], documents: Express.Multer.File[] },
  ) {
    return {
      message: 'Files accepted',
    };
  }
}
