import {
  FileValidator,
  Injectable,
  ParseFileOptions,
  ParseFilePipe,
  PipeTransform,
} from '@nestjs/common';
import { IFile } from '@nestjs/common/pipes/file/interfaces';


export interface ParseFileFieldsOptions {
  commonOptions?: ParseFileOptions;
  fields: { name: string; options?: ParseFileOptions }[];
}

type FileFields = Record<string, IFile[]>;

/**
 * Defines the ParseFileFields Pipe that can be used to validate multiple files.
 * It should be used only with the `@UploadedFiles()` decorator and  `FileFieldsInterceptor` and `AnyFilesInterceptor`.
 */
@Injectable()
export class ParseFileFieldsPipe implements PipeTransform<FileFields, Promise<FileFields>> {
  private pipesMap = new Map<string, ParseFilePipe>();

  constructor(private readonly options: ParseFileFieldsOptions) {}

  async transform(value: FileFields): Promise<FileFields> {
    const { fields, commonOptions } = this.options;
    const promises: Promise<IFile[]>[] = [];

    for (const { name, options } of fields) {
      let pipe = this.pipesMap.get(name);

      if (!pipe) {
        const mergedOptions = options
          ? this.mergeWithCommonOptions(options)
          : commonOptions;

        pipe = new ParseFilePipe(mergedOptions);
        this.pipesMap.set(name, pipe);
      }

      promises.push(pipe.transform(value[name]));
    }

    const values = await Promise.all(promises);
    const output: FileFields = {};

    for (let i = 0; i < fields.length; ++i) {
      output[fields[i].name] = values[i];
    }

    return output;
  }

  public mergeWithCommonOptions(options: ParseFileOptions): ParseFileOptions {
    const {
      fileIsRequired,
      validators,
      errorHttpStatusCode,
      exceptionFactory,
    } = options;
    const { commonOptions } = this.options;
    const commonValidators: FileValidator[] = commonOptions?.validators ?? [];

    return {
      fileIsRequired: fileIsRequired ?? commonOptions?.fileIsRequired ?? true,
      errorHttpStatusCode:
        errorHttpStatusCode ?? commonOptions?.errorHttpStatusCode,
      validators: commonValidators.concat(validators ?? []),
      exceptionFactory: exceptionFactory ?? commonOptions?.exceptionFactory,
    };
  }
}
