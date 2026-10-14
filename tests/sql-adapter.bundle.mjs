// server/native/sql-adapter.ts
var rowsToColumns = (rows = []) => rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key.replace(/[A-Z]/g, (letter) => "_" + letter.toLowerCase()), value])));
function adaptBlinkSql(client) {
  return {
    async sql(query, args) {
      const result = await client.sql(query, args);
      return { ...result, rows: rowsToColumns(result.rows) };
    },
    async batch(statements, mode) {
      const result = await client.batch(statements, mode);
      return { ...result, results: (result.results || []).map((item) => ({ ...item, rows: rowsToColumns(item.rows) })) };
    }
  };
}
export {
  adaptBlinkSql
};
