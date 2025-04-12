import { AttributeType } from "../types.js";

export function parseContentByType(value: string, type: AttributeType): string | number | boolean | Date {
  switch (type) {
    case 'number':
      return parseFloat(value);
    case 'boolean':
      return value === 'true';
    case 'date':
      return new Date(value);
    case 'object':
      return JSON.parse(value).toString();
    case 'array':
      return JSON.parse(value).toString();
    case 'string':
    default:
      return value;
  }
}