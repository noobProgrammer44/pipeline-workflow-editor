from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from collections import defaultdict, deque

app = FastAPI()

# ── CORS (allow React dev server) ────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Models ───────────────────────────────────────────────────────────────────

class Node(BaseModel):
    id: str

    class Config:
        extra = "allow"

class Edge(BaseModel):
    source: str
    target: str

    class Config:
        extra = "allow"

class PipelineRequest(BaseModel):
    nodes: list[Node]
    edges: list[Edge]

class CycleInfo(BaseModel):
    cycle_path: list[str]
    cycle_node_ids: list[str]
    cycle_edges: list[list[str]]

class PipelineResponse(BaseModel):
    num_nodes: int
    num_edges: int
    is_dag: bool
    cycles: Optional[CycleInfo] = None

# ── Cycle detection helpers ──────────────────────────────────────────────────

def _dfs_find_cycle(adj: dict[str, list[str]], nodes: set[str]) -> list[str]:
    """Iterative DFS with gray/black coloring. Returns one cycle path."""
    WHITE, GRAY, BLACK = 0, 1, 2
    color = {n: WHITE for n in nodes}
    parent: dict[str, Optional[str]] = {}

    for start in nodes:
        if color[start] != WHITE:
            continue
        stack = [start]
        color[start] = GRAY
        parent[start] = None

        while stack:
            u = stack[-1]
            found = False
            for v in adj.get(u, []):
                if color[v] == GRAY:
                    # Back edge → extract cycle v → … → u → v
                    path = [v]
                    curr = u
                    while curr != v:
                        path.append(curr)
                        curr = parent[curr]
                    path.reverse()
                    return path
                if color[v] == WHITE:
                    color[v] = GRAY
                    parent[v] = u
                    stack.append(v)
                    found = True
                    break
            if not found:
                color[u] = BLACK
                stack.pop()

    return []


def _prune_to_cycle_nodes(remaining: set[str], edges: list[Edge]) -> set[str]:
    """Prune nodes that aren't actually in cycles (e.g. downstream of a cycle)."""
    nodes = set(remaining)
    changed = True
    while changed:
        changed = False
        in_deg: dict[str, int] = {n: 0 for n in nodes}
        out_deg: dict[str, int] = {n: 0 for n in nodes}
        for e in edges:
            if e.source in nodes and e.target in nodes:
                out_deg[e.source] += 1
                in_deg[e.target] += 1
        to_remove = {n for n in nodes if in_deg[n] == 0 or out_deg[n] == 0}
        if to_remove:
            nodes -= to_remove
            changed = True
    return nodes


def find_cycles(edges: list[Edge], remaining: set[str]) -> CycleInfo:
    """Given the nodes left after Kahn's, find cycle details."""
    cycle_nodes = _prune_to_cycle_nodes(remaining, edges)

    sub_adj: dict[str, list[str]] = defaultdict(list)
    cycle_edges: list[list[str]] = []

    for e in edges:
        if e.source in cycle_nodes and e.target in cycle_nodes:
            sub_adj[e.source].append(e.target)
            cycle_edges.append([e.source, e.target])

    cycle_path = _dfs_find_cycle(sub_adj, cycle_nodes)

    return CycleInfo(
        cycle_path=cycle_path,
        cycle_node_ids=list(cycle_nodes),
        cycle_edges=cycle_edges,
    )

# ── DAG analysis (Kahn's topological sort + cycle extraction) ────────────────

def analyze_dag(nodes: list[Node], edges: list[Edge]) -> tuple[bool, Optional[CycleInfo]]:
    if not nodes:
        return True, None

    node_ids = {n.id for n in nodes}
    adj: dict[str, list[str]] = defaultdict(list)
    in_degree: dict[str, int] = {nid: 0 for nid in node_ids}

    for e in edges:
        if e.source not in node_ids or e.target not in node_ids:
            continue
        adj[e.source].append(e.target)
        in_degree[e.target] = in_degree.get(e.target, 0) + 1

    queue = deque(nid for nid, deg in in_degree.items() if deg == 0)
    visited: set[str] = set()

    while queue:
        node = queue.popleft()
        visited.add(node)
        for neighbor in adj[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(visited) == len(node_ids):
        return True, None

    remaining = node_ids - visited
    return False, find_cycles(edges, remaining)

# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get('/')
def read_root():
    return {'Ping': 'Pong'}

@app.post('/pipelines/parse')
def parse_pipeline(pipeline: PipelineRequest) -> PipelineResponse:
    is_dag, cycle_info = analyze_dag(pipeline.nodes, pipeline.edges)
    return PipelineResponse(
        num_nodes=len(pipeline.nodes),
        num_edges=len(pipeline.edges),
        is_dag=is_dag,
        cycles=cycle_info,
    )
