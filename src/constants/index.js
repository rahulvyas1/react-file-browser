export const VALID_FILE_EXTENSIONS = ['json', 'txt', 'js', 'ts'];

/**
 * default content for all the supported file extensions
 */
export const DEFAULT_CONTENT = {
  json: '{ }',
  js: `console.log('hello world!');`,
  ts: `let message: string = 'Hello, World!';
  console.log(message);`,
  txt: 'test',
};
