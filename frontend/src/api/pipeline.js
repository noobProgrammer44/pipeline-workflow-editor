const API_URL = 'http://localhost:8000/pipelines/parse';

export async function parsePipeline(nodes, edges) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nodes: nodes.map((n) => ({ id: n.id, type: n.type, data: n.data })),
      edges: edges.map((e) => ({ source: e.source, target: e.target, id: e.id })),
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Server error (${res.status})`);
  }
  return res.json();
}
