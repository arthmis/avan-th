import type {
  RawActionBlueprintGraph,
  RawDynamicFieldConfig,
  RawFieldJsonType,
  RawFieldSchema,
  RawForm,
} from "../formsFetch";
import type {
  ActionBlueprintGraph,
  FormDefinition,
  FormField,
  GraphEdge,
  GraphNode,
} from "./graphTypes";

export function graphFromData(data: RawActionBlueprintGraph): ActionBlueprintGraph {
  const nodes: GraphNode[] = data.nodes.map((node) => ({
    nodeId: node.id,
    componentId: node.data.component_id,
    formId: node.data.component_id,
    name: node.data.name,
    position: node.position,
    prerequisites: node.data.prerequisites,
  }));

  const edges: GraphEdge[] = data.edges.map((edge) => ({
    source: edge.source,
    target: edge.target,
  }));

  const formsById: FormDefinition[] = data.forms.map(mapFormDefinition);
  const forms = new Map(formsById.map((form) => [form.id, form]));

  const nodeById = new Map(nodes.map((node) => [node.nodeId, node]));

  const reverseAdj = new Map<string, string[]>();
  for (const edge of edges) {
    const list = reverseAdj.get(edge.target) ?? [];
    list.push(edge.source);
    reverseAdj.set(edge.target, list);
  }

  return {
    id: data.id,
    tenantId: data.tenant_id,
    name: data.name,
    description: data.description,
    category: data.category,
    nodes,
    edges,
    forms,
    reverseAdj,
    nodeById,
  };
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
