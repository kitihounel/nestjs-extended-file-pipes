# nestjs-extended-file-pipes

The missing file validation pipes for NestJS

## 📑 Table of Contents

- [Description](#-description)
- [Installation](#-installation)
- [Usage](#-usage)
- [API](#-api)
- [Testing](#-testing)
- [License](#-license)

## 📖 Description

When dealing with file uploads, NestJS offers the `ParseFilePipe` to help validate files uploaded under the same field
name. But when several files are uploaded with different field names, there is not built-in pipe available and the validation
is usually done in a controller or service method.

```typescript
@Post('upload')
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'avatar', maxCount: 1 },
    { name: 'background', maxCount: 1 },
  ])
)
uploadFile(
  @UploadedFiles()
  files: { avatar?: Express.Multer.File[], background?: Express.Multer.File[] }
) {
  const { avatar, background } = files;
  // Files are usually validated here...
}
```

This package adds two new file pipes, `ParseFileFieldsPipe` and `GroupFilesPipe` that can be used to validate multiple
files. Their purpose is to help removing the file validation code from controllers and services methods.

## 📦 Installation

```bash
npm install nestjs-extended-file-pipes
```

## 🚀 Usage

The `ParseFileFieldsPipe` is the main component of this package. Under the hood, it uses the built-in `ParseFilePipe`
to validate the files. Its constructor accepts an `options` parameter with a `fields` property that defines for each
file field the specific options that will passed to the underlying `ParseFilePipe` object used for validation.

```typescript
import { Controller, FileTypeValidator, MaxFileSizeValidator, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ParseFileFieldsPipe } from 'nestjs-extended-file-pipes';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'avatar', maxCount: 1 },
      { name: 'documents', maxCount: 2 },
    ]),
  )
  upload(
    @UploadedFiles(
      new ParseFileFieldsPipe({
        commonOptions: {
          validators: [
            new MaxFileSizeValidator({ maxSize: 5_242_880 }), // 5 Mio
          ],
        },
        fields: [
          {
            name: 'documents',
            options: {
              fileIsRequired: false,
              validators: [
                new FileTypeValidator({ fileType: 'application/pdf' }),
              ],
            },
          },
          {
            name: 'avatar',
            options: {
              validators: [
                new FileTypeValidator({ fileType: /.(jpeg|png)$/ }),
              ],
            },
          },
        ],
      })
    )
    files: { avatar: Express.Multer.File[], documents?: Express.Multer.File[] },
  ) {
    console.log('Received:', files);
  }
}
```

The `commonOptions` property is used to define options shared by all the underlying `ParseFilePipe` objects created
to validate the fields.

The built-in `AnyFilesInterceptor()` allows to extract files uploaded with arbitrary field names. If you want to
group the files by field name like the `FileFieldsInterceptor` does, you can use the `GroupFilesPipe`.

```typescript
import { Controller, Post, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { GroupFilesPipe } from 'nestjs-extended-file-pipes';

@Controller('uploads')
export class UploadsController {
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  upload(
    @UploadedFiles(new GroupFilesPipe())
    files: Record<string, Express.Multer.File[]>,
  ) {
    console.log('Received:', files);
  }
}
```

It is also possible to validate files extracted with `AnyFilesInterceptor()` by using `GroupFilesPipe`
and `ParseFileFieldsPipe` together:

```typescript
@Post()
@UseInterceptors(AnyFilesInterceptor())
upload(
  @UploadedFiles(
    new GroupFilesPipe(),
    new ParseFileFieldsPipe({
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
          name: 'avatar'
          options: {
            validators: [
              new FileTypeValidator({ fileType: /.(jpeg|png)$/ }),
            ],
          },
        },
      ],
    })
  )
  files: { avatar: Express.Multer.File[], documents: Express.Multer.File[] },
) {
  console.log('Received:', files);
}
```

## 🧩 API

### `ParseFileFieldsPipe`

`constructor(options: ParseFileFieldsOptions): ParseFileFieldsPipe`

- `options`: Object that contains the options that will be passed to the ParseFilePipe created to validate each field.
  It contains the following properties:
  - `commonOptions`?: Options shared by the underlying `ParseFilePipe` objects created.
  - `fields`: For each file field, the key name and the options that will be passed to the underlying `ParseFilePipe`.

### `GroupFilesPipe`

`constructor(): GroupFilesPipe`

Used to group files in an plain object like the built-in `FileFieldsInterceptor` does. It should ony be used with
`AnyFilesInterceptor()` which just put the uploaded files in an array by default.

## 🧪 Testing

```bash
npm test
```

## 📄 License

This library is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
