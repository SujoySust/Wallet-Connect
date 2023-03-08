export const pOptions = {
  getCursor: (record) => ({ id: record.id }),
  encodeCursor: <Cursor>(prismaCursor: Cursor) =>
    Buffer.from(JSON.stringify(prismaCursor)).toString('base64'),
  decodeCursor: (cursor: string) =>
    JSON.parse(Buffer.from(cursor, 'base64').toString('ascii')),
};
