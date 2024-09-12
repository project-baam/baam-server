export function truncateData(data: any, limit: number): any {
  const jsonString = JSON.stringify(data);
  if (jsonString.length <= limit) return data;
  return JSON.parse(jsonString.slice(0, limit));
}
