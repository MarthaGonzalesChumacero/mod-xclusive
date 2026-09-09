const GRAPHQL_URL = 'http://localhost:3000/graphql';

export async function gqlRequest<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data as T;
}
