import { Injectable, type PipeTransform } from '@nestjs/common';


interface FileField {
  fieldname: string;
}

/**
 * Defines the GroupFiles Pipe. This pipe can be used to group incoming files by `fieldname`, before validation.
 * It should only be used with `AnyFilesInterceptor()` and  `@UploadedFiles()` decorator.
 */
@Injectable()
export class GroupFilesPipe implements PipeTransform<unknown, Record<string, FileField[]>> {
  transform(value: unknown): Record<string, FileField[]> {
    if (!Array.isArray(value)) {
      throw new Error('The pipe is expecting an array as input');
    }

    const result: Record<string, FileField[]> = {};

    for (const file of value) {
      if (!('fieldname' in file) || typeof file.fieldname !== 'string') {
        throw new Error("File is missing the 'fieldname' property");
      }

      let group = result[file.fieldname];

      if (!group) {
        group = [];
        result[file.fieldname] = group;
      }

      group.push(file);
    }

    return result;
  }
}
