import { nanoid } from 'nanoid';
import { VALID_FILE_EXTENSIONS } from '../constants';

/**
 *
 * @returns a unique id
 */
export function generateRandomId() {
  return nanoid();
}

/**
 * Extracts the file extension if its valid (txt, json, js, or ts)
 * otherwise it returns null
 * @param {string} fileName
 * @returns
 */
export function extractFileExtension(fileName) {
  const regex = new RegExp(
    '^([a-zA-Z0-9])+.(' + VALID_FILE_EXTENSIONS.join('|') + ')$'
  );
  if (!regex.test(fileName)) return null;

  return fileName.split('.').pop();
}
