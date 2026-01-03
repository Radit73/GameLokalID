const BASE64_REGEX = /^[A-Za-z0-9+/]+={0,2}$/;

const isBase64String = (value) => {
  if (typeof value !== 'string') return false;
  const sanitized = value.trim();
  if (sanitized.length === 0 || sanitized.length % 4 !== 0) return false;
  if (!BASE64_REGEX.test(sanitized)) return false;
  try {
    const decoded = Buffer.from(sanitized, 'base64').toString('utf-8');
    const reencoded = Buffer.from(decoded, 'utf-8').toString('base64');
    return reencoded === sanitized;
  } catch (error) {
    return false;
  }
};

export const encodeField = (value) => {
  if (value === undefined || value === null) return null;
  return Buffer.from(String(value), 'utf-8').toString('base64');
};

export const decodeField = (value) => {
  if (value === undefined || value === null) return null;
  if (!isBase64String(value)) return value;
  try {
    return Buffer.from(value.trim(), 'base64').toString('utf-8');
  } catch (error) {
    return value;
  }
};

export const decodeUserRow = (row) => {
  if (!row) return row;
  return {
    ...row,
    name: decodeField(row.name),
    email: decodeField(row.email),
  };
};
