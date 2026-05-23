import type {
  AvantosFieldType,
  RawActionBlueprintGraph,
  RawDynamicFieldConfig,
  RawFieldJsonType,
  RawFieldSchema,
  RawForm,
} from "../formsFetch";

export function graphFromData(data: RawActionBlueprintGraph): {
  graph: Graph;
  blueprint: Blueprint;
} {
  const nodes: GraphNode[] = data.nodes.map((node) => ({
    nodeId: makeNodeId(node.id),
    nodeType: node.type,
    name: node.data.name,
    data: {
      componentId: node.data.component_id,
      componentKey: node.data.component_key,
      componentType: node.data.component_type,
    },
    position: node.position,
    prerequisites: node.data.prerequisites as NodeId[],
  }));

  const edges: GraphEdge[] = data.edges.map((edge) => ({
    source: makeNodeId(edge.source),
    target: makeNodeId(edge.target),
  }));

  const formsById: FormDefinition[] = data.forms.map(mapFormDefinition);
  const forms = new Map(formsById.map((form) => [form.id, form]));

  const nodeById = new Map(nodes.map((node) => [node.nodeId, node]));

  const reverseAdj = new Map<NodeId, NodeId[]>();
  for (const edge of edges) {
    const list = reverseAdj.get(edge.target) ?? [];
    list.push(edge.source);
    reverseAdj.set(edge.target, list);
  }

  const graph: Graph = { nodes, edges, reverseAdj };

  const globalDataSources = new Map<string, GlobalDataSource>([
    [
      "user_context",
      {
        sourceType: "global",
        data: {
          label: "User Context",
          fields: [
            { key: "first_name", label: "First Name", primitiveType: "string" },
            { key: "last_name", label: "Last Name", primitiveType: "string" },
            { key: "email", label: "Email", primitiveType: "string" },
            { key: "role", label: "Role", primitiveType: "string" },
          ],
        },
      },
    ],
    [
      "organization",
      {
        sourceType: "global",
        data: {
          label: "Organization",
          fields: [
            { key: "org_name", label: "Name", primitiveType: "string" },
            { key: "org_id", label: "ID", primitiveType: "string" },
            { key: "plan", label: "Plan", primitiveType: "string" },
          ],
        },
      },
    ],
  ]);

  const blueprint: Blueprint = {
    id: data.id,
    tenantId: data.tenant_id,
    name: data.name,
    description: data.description,
    category: data.category,
    nodeById,
    forms,
    globalDataSources,
  };

  return { graph, blueprint };
}

function mapFormFields(
  fieldSchema: RawFieldSchema,
  dynamicFieldConfig: RawDynamicFieldConfig,
): FormField[] {
  const requiredSet = new Set(fieldSchema.required);
  const dynamicKeys = new Set(Object.keys(dynamicFieldConfig));

  return Object.entries(fieldSchema.properties).map(([key, prop]) => ({
    key,
    label: "title" in prop ? prop.title : key,
    avantosType: prop.avantos_type,
    jsonType: prop.type as RawFieldJsonType,
    format: prop.avantos_type === "short-text" ? prop.format : undefined,
    isRequired: requiredSet.has(key),
    isDynamic: dynamicKeys.has(key),
  }));
}

function mapFormDefinition(raw: RawForm): FormDefinition {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    isReusable: raw.is_reusable,
    fields: mapFormFields(raw.field_schema, raw.dynamic_field_config),
  };
}

export type NodeId = string & { readonly __brand: "NodeId" };

function makeNodeId(id: string): NodeId {
  return id as NodeId;
}

export interface FormField {
  key: string;
  label: string;
  avantosType: AvantosFieldType;
  jsonType: RawFieldJsonType;
  format?: string;
  isRequired: boolean;
  isDynamic: boolean;
}

export interface FormDefinition {
  id: string;
  name: string;
  description: string;
  isReusable: boolean;
  fields: FormField[];
}

export type NodeType = "form";

export interface GraphNode {
  nodeId: NodeId;
  nodeType: NodeType;
  data: NodeData;
  name: string;
  position: { x: number; y: number };
  prerequisites: NodeId[];
}

export type NodeData = {
  componentId: string;
  componentKey: string;
  componentType: "form";
};

export interface GraphEdge {
  source: NodeId;
  target: NodeId;
}

export type NodeComponent = FormDefinition;

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  reverseAdj: Map<NodeId, NodeId[]>;
}

export interface Blueprint {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: string;
  nodeById: Map<NodeId, GraphNode>;
  forms: Map<string, FormDefinition>;
  globalDataSources: Map<string, GlobalDataSource>;
}

export type PrefillDataSource = NodeDataSource | GlobalDataSource;

export type NodeDataSource = {
  sourceType: "node";
  data: GraphNode;
};

export type GlobalDataSource = {
  sourceType: "global";
  data: {
    label: string;
    fields: DataSourceFields[];
  };
};

export type DataSourceFields = {
  key: string;
  label: string;
  primitiveType: RawFieldJsonType;
};
