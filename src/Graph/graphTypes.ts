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

export type NodeType = "form";

export interface GraphNode {
  nodeId: string;
  nodeType: NodeType;
  data: NodeData;
  name: string;
  position: { x: number; y: number };
  prerequisites: string[];
}

export type NodeData = {
  componentId: string;
  componentKey: string;
  componentType: "form";
};

export interface GraphEdge {
  source: string;
  target: string;
}

export type NodeComponent = FormDefinition;

export interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  reverseAdj: Map<string, string[]>;
}

export interface Blueprint {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  category: string;
  nodeById: Map<string, GraphNode>;
  forms: Map<string, FormDefinition>;
}
