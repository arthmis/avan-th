<!--Plan: Journey Builder Prefill UI

Here's a breakdown of what needs to be built, organized by concern:

---

### 1. Project Setup & API Layer

- Start a React + TypeScript app (e.g. Vite)
- Create an **API client module** that fetches from the mock server's `action-blueprint-graph-get` endpoint
- Model the response into typed interfaces:
  - `Form` — id, name, fields (each field has id, name, type)
  - `Edge` — source form id → target form id (represents a dependency)
  - `Graph` — collection of forms + edges

---

### 2. DAG Graph Utilities

- Build a **graph utility module** that takes the raw API response and constructs an adjacency structure
- Implement two traversal functions:
  - `getDirectDependencies(formId, graph)` → returns forms that the given form *directly* depends on
  - `getTransitiveDependencies(formId, graph)` → returns *all* upstream forms (BFS/DFS excluding direct ones, or returning all with a "depth" label)
- These utilities are pure functions — easy to test and reuse

---

### 3. Extensible Data Source Architecture

This is the critical design piece. Define a **`DataSource` interface**:

```
interface DataSource {
  id: string
  label: string        // e.g. "Form B (Direct)", "Global Data"
  getOptions(formId, graph, globalData) → PrefillOption[]
}
```

Each `PrefillOption` represents one selectable item (a form field, a global property, etc.).

Implement three concrete data sources:
- **`DirectFormFieldsSource`** — uses `getDirectDependencies()`, returns fields of those forms
- **`TransitiveFormFieldsSource`** — uses `getTransitiveDependencies()`, returns fields of upstream forms
- **`GlobalDataSource`** — returns whatever global data you define (e.g. hardcoded user context, org name, etc.)

Register sources in a **central array/registry**. The modal iterates this registry to render sections — adding a new source requires only implementing the interface and adding it to the registry. No other code changes.

---

### 4. State Management

- **`prefillMappings`**: a nested map of `formId → fieldId → PrefillOption | null`
- **`selectedFormId`**: which form is currently active in the panel
- **`modalState`**: which field (if any) is open in the picker modal

Keep this in React context or a simple top-level state (no need for Redux at this scale).

---

### 5. Component Hierarchy

```
App
├── FormList
│   └── FormItem (clickable → sets selectedFormId)
└── PrefillPanel (shown when a form is selected)
    ├── FieldRow (one per field on the form)
    │   ├── FieldName
    │   ├── CurrentMapping (or "No prefill")
    │   └── ClearButton (X — only shown when mapping exists)
    └── PrefillModal (shown when a field without mapping is clicked)
        └── DataSourceSection[] (one per registered DataSource)
            └── PrefillOptionItem (selectable)
```

---

### 6. User Interaction Flow

1. App loads → fetches graph → renders `FormList`
2. User clicks a form → `PrefillPanel` opens showing that form's fields
3. Each field row shows its current mapping (if any) with a clear (X) button
4. Clicking a field with no mapping → opens `PrefillModal`
5. Modal renders each `DataSource` as a labeled section with its options
6. User picks an option → mapping is saved → modal closes → row now shows the mapping
7. User clicks X → mapping is cleared

---

### 7. Key Design Decisions & Rationale

| Decision | Rationale |
|---|---|
| `DataSource` interface/registry | Satisfies "any combination of sources, easy to add new ones" without code changes elsewhere |
| Pure graph utility functions | Decoupled from UI, independently testable |
| Single `prefillMappings` state | One source of truth; easy to serialize/persist later |
| No node-based UI | Explicitly out of scope per the challenge |
| Global data as a `DataSource` implementor | Keeps it symmetric with form-based sources; swap or extend freely |

---

### Summary of Deliverables

1. **API module** — typed fetch + response models
2. **Graph utilities** — direct + transitive dependency traversal
3. **DataSource registry** — interface + 3 implementations
4. **State layer** — prefill mappings + selected form + modal state
5. **UI components** — `FormList`, `PrefillPanel`, `FieldRow`, `PrefillModal`, `DataSourceSection-->

Journey Builder React Coding Challenge — Implementation Plan

---

### Phase 1 — Project Setup & Data Modeling

**Steps:**
1. Scaffold a new app using **Vite + React + TypeScript**
2. Install dependencies: a fetching library (TanStack Query or SWR), a state manager (Zustand or Context), and a testing framework (Vitest + Testing Library)
3. Configure environment variables for the mock server base URL
4. Define all **TypeScript types** derived from the API response first — everything else flows from this shape:

```
ActionBlueprintGraph
 ├── nodes: FormNode[]           // id, name, fields[]
 │    └── fields: FormField[]   // id, name, type
 └── edges: Edge[]              // source: nodeId, target: nodeId
```

And the client-side prefill mapping shape:

```
PrefillMap: Record<
  formId,
  Record<fieldId, PrefillSource | null>
>

PrefillSource {
  sourceType: string   // 'direct_form' | 'transitive_form' | 'global' | ...
  sourceId:   string   // formId, or global category id
  fieldId:    string
  label:      string   // human-readable display string
}
```

---

### Phase 2 — API Layer

**Steps:**
1. Create a single API client module that wraps `fetch` (or axios) with the base URL from env
2. Create one function `getActionBlueprintGraph()` that hits the `action-blueprint-graph-get` endpoint
3. Map the raw API response into your clean internal types in this layer — nothing else in the app should know about the raw shape
4. Use TanStack Query (or SWR) to cache, deduplicate, and manage loading/error states

---

### Phase 3 — DAG Traversal Algorithm

This is the core algorithmic piece. Given a selected form node, you need to find:
- **Direct predecessors** — forms whose edge points directly to this form
- **Transitive predecessors** — all other ancestors, reachable by walking edges upstream

**Algorithm — Reverse BFS:**

```
function getUpstreamForms(targetFormId, edges):
  
  // Build reverse adjacency map: target → [sources]
  reverseAdj = {}
  for each edge (source → target):
    reverseAdj[target].push(source)

  directParents   = new Set()
  transitiveAncs  = new Set()
  
  queue = reverseAdj[targetFormId] (the direct parents)
  mark all as directParents

  while queue not empty:
    current = dequeue()
    for each parent of current in reverseAdj:
      if parent not visited:
        transitiveAncs.add(parent)
        enqueue(parent)

  return { directParents, transitiveAncestors }
```

**Why BFS over DFS:** BFS naturally gives you level-by-level discovery, so determining "direct" vs "transitive" is trivial — it's just the first level vs everything deeper.

**Key invariant to enforce:** Since this is a DAG (no cycles), you never need cycle detection, but you do need the `visited` set to avoid traversing shared ancestors multiple times.

---

### Phase 4 — Extensible Prefill Data Source Architecture

This is the most architecturally significant design decision in the challenge. The key requirement is: **any combination of data sources can be used without code changes**, and **new sources are easy to add**.

**Use the Strategy / Registry Pattern:**

Define a `PrefillDataSource` interface:

```
interface PrefillDataSource {
  id:       string
  label:    string           // shown as a group header in the modal
  getOptions(
    context: PrefillContext  // { selectedForm, graph, allForms }
  ): PrefillOption[]
}
```

Create a `PrefillSourceRegistry` — a simple array or map that holds all registered sources. The app initializes it once at startup:

```
registry.register(new DirectFormFieldsSource())
registry.register(new TransitiveFormFieldsSource())
registry.register(new GlobalDataSource())
```

The prefill modal **does not know about any specific source**. It simply calls `registry.getAll()` and renders whatever each source returns, grouped by `source.label`.

**Adding a new source in the future = create one new class that implements the interface and register it. Zero other changes required.**

---

### Phase 5 — State Management

**Local state is sufficient** for the prefill map since it doesn't need to persist across sessions (for this challenge). Use either:
- React `useReducer` + Context for a clean action-based model, or
- Zustand store for simplicity

The state shape:

```
{
  graph:      ActionBlueprintGraph | null
  prefillMap: PrefillMap                    // persists all mappings
  selectedFormId: string | null
  modalFieldId:   string | null             // which field the modal is open for
}

Actions:
  SET_GRAPH
  SELECT_FORM(formId)
  OPEN_PREFILL_MODAL(fieldId)
  CLOSE_PREFILL_MODAL
  SET_PREFILL(formId, fieldId, source)
  CLEAR_PREFILL(formId, fieldId)
```

---

### Phase 6 — Component Hierarchy

```
App
├── GraphProvider (data fetching + state)
└── Layout
    ├── FormList
    │    └── FormListItem (click → sets selectedFormId)
    └── PrefillPanel (shown when a form is selected)
         ├── PrefillPanelHeader (form name)
         ├── FieldRow (one per field)
         │    ├── FieldName
         │    ├── PrefillBadge (current source, or "not set")
         │    └── ClearButton (X — only when mapping exists)
         └── PrefillModal (portal, shown when modalFieldId is set)
              └── DataSourceGroup (one per registered source)
                   └── PrefillOptionRow (click → sets mapping, closes modal)
```

**Key composition rules:**
- `FieldRow` is purely presentational — receives data and callbacks, knows nothing about the graph or registry
- `PrefillPanel` owns the logic of calling the registry and passing options down
- `PrefillModal` is decoupled from the source types — it only renders what it's given

---

### Phase 7 — Testing Strategy

Tests to write, ordered by priority:

| Test | Type | What it validates |
|---|---|---|
| `getUpstreamForms()` | Unit | Correct direct vs transitive splits across various DAG shapes |
| `DirectFormFieldsSource.getOptions()` | Unit | Returns only fields from direct parents |
| `TransitiveFormFieldsSource.getOptions()` | Unit | Returns fields from all ancestors, excluding direct |
| `PrefillSourceRegistry` | Unit | Correctly calls all registered sources, merges results |
| `FieldRow` | Component | Renders badge, fires callbacks on click and clear |
| `PrefillPanel` | Component | Shows correct fields, opens modal on click, updates on selection |
| Prefill roundtrip | Integration | Select form → open modal → pick source → badge updates → clear → badge gone |

**Edge cases for the DAG algorithm to specifically test:**
- Diamond dependency (A→B, A→C, B→D, C→D — A should appear only once in D's transitive ancestors)
- Form with no dependencies (empty result)
- Chain of 4+ depth (correct layer classification)

---

### Phase 8 — Documentation

Write a `README.md` covering:
1. How to run the mock server locally
2. How to run the frontend
3. **How to add a new data source** — this should be a clear step-by-step section since the challenge explicitly evaluates it
