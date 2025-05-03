import { GroupFilesPipe } from './group-files.pipe';


describe('GroupFilesPipe', () => {
  let pipe: GroupFilesPipe;

  beforeEach(() => {
    pipe = new GroupFilesPipe();
  });

  describe('transform', () => {
    it('should return an empty object when the input is an empty array', () => {
      expect(pipe.transform([])).toEqual({});
    });

    it('should throw when the input value is not an array', () => {
      const inputObj = { foo: 'bar' };

      expect(() => pipe.transform(inputObj)).toThrow();
      expect(() => pipe.transform('a random string')).toThrow();
      expect(() => pipe.transform(null)).toThrow();
      expect(() => pipe.transform(undefined)).toThrow();
    });

    it('should throw when one file misses the "fieldname" prop', () => {
      const input = [
        { fieldname: 'foo', mimetype: 'image/png' },
        { fieldname: 'bar', mimetype: 'application/pdf' },
        { mimetype: 'video/mp4' },
      ];

      expect(() => pipe.transform(input)).toThrow();
    });

    it('should group files by fieldname', () => {
      const input = [
        { fieldname: 'foo', mimetype: 'image/png' },
        { fieldname: 'bar', mimetype: 'application/pdf' },
        { fieldname: 'baz', mimetype: 'video/mp4' },
        { fieldname: 'foo', mimetype: 'image/jpeg' },
      ];
      const result = {
        foo: [
          { fieldname: 'foo', mimetype: 'image/png' },
          { fieldname: 'foo', mimetype: 'image/jpeg' },
        ],
        bar: [{ fieldname: 'bar', mimetype: 'application/pdf' }],
        baz: [{ fieldname: 'baz', mimetype: 'video/mp4' }],
      };

      expect(pipe.transform(input)).toEqual(result);
    });
  });
});
