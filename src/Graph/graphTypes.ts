import type { AvantosFieldType, RawFieldJsonType } from "../formsFetch";

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

export interface GraphNode {
  nodeId: string;
  componentId: string;
  formId: string;
  name: string;
  position: { x: number; y: number };
  prerequisites: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
}

export interface ActionBlueprintGraph {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  reverseAdj: Map<string, string[]>;
  nodeById: Map<string, GraphNode>;
  forms: Map<string, FormDefinition>;
}
