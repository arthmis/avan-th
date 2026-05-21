import { useEffect, useState } from "react";
import { graphFromData } from "./graph";
import type { Graph } from "./graph";

export function useFetchGraph(tenantId: string, actionBlueprintId: string) {
  const [fetchState, setFetchState] = useState<FetchState>({ type: "loading" });

  useEffect(() => {
    const url = `http://localhost:3000/api/v1/${tenantId}/actions/blueprints/${actionBlueprintId}/graph`;
    const fetchFunc = async () => {
      try {
        const response = await fetch(url);
        const json: JSONGraphDescription = await response.json();
        const forms = graphFromData(json);
        setFetchState({ type: "success", data: forms });
      } catch {
        setFetchState({
          type: "error",
          message: "Couldn't fetch data from server",
        });
      }
    };

    fetchFunc();
  }, [tenantId, actionBlueprintId]);

  return fetchState;
}

export type FetchState = FetchSuccess | FetchError | FetchLoading;

export type FetchSuccess = {
  type: "success";
  data: Graph;
};

export type FetchError = {
  type: "error";
  message: string;
};

export type FetchLoading = {
  type: "loading";
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export type JSONGraphDescription = {
  $schema?: string;
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  category: string;
  nodes: Node[];
  edges: Edge[];
  forms: Form[];
  branches: unknown[];
  triggers: unknown[];
};

// ─── Primitives ───────────────────────────────────────────────────────────────

export type SlaDuration = {
  number: number;
  unit: "minutes" | "hours" | "days";
};

export type Position = {
  x: number;
  y: number;
};

// ─── Field Properties ─────────────────────────────────────────────────────────

export type EnumItems = {
  enum: string[];
  type: "string";
};

export type FieldPropertyButton = {
  avantos_type: "button";
  title: string;
  type: "object";
};

export type FieldPropertyCheckboxGroup = {
  avantos_type: "checkbox-group";
  items: EnumItems;
  type: "array";
  uniqueItems: boolean;
};

export type FieldPropertyObjectEnum = {
  avantos_type: "object-enum";
  enum: Record<string, unknown>[] | null;
  title: string;
  type: "object";
};

export type FieldPropertyShortText = {
  avantos_type: "short-text";
  title: string;
  type: "string";
  format?: string;
};

export type FieldPropertyMultiLineText = {
  avantos_type: "multi-line-text";
  title: string;
  type: "string";
};

export type FieldPropertyMultiSelect = {
  avantos_type: "multi-select";
  items: EnumItems;
  type: "array";
  uniqueItems: boolean;
};

export type FieldProperty =
  | FieldPropertyButton
  | FieldPropertyCheckboxGroup
  | FieldPropertyObjectEnum
  | FieldPropertyShortText
  | FieldPropertyMultiLineText
  | FieldPropertyMultiSelect;

// ─── Form Schema ──────────────────────────────────────────────────────────────

export type FieldSchema = { [property: string]: JsonSchema7 };
// export type FieldSchema = {
//   type: "object";
//   properties: Record<string, FieldProperty>;
//   required?: string[];
// };

export type UIElementOptions = {
  format: string;
};

export type UIElement = {
  type: "Control" | "Button";
  scope: string;
  label: string;
  options?: UIElementOptions;
};

export type UISchema = {
  type: "VerticalLayout";
  elements: UIElement[];
};

export type PayloadField = {
  type: "form_field";
  value: string;
};

export type DynamicFieldConfigItem = {
  selector_field: string;
  payload_fields: Record<string, PayloadField>;
  endpoint_id: string;
};

export type DynamicFieldConfig = Record<string, DynamicFieldConfigItem>;

// ─── Form ─────────────────────────────────────────────────────────────────────

export type Form = {
  id: string;
  name: string;
  description: string;
  is_reusable: boolean;
  field_schema: FieldSchema;
  ui_schema: UISchema;
  dynamic_field_config: DynamicFieldConfig;
};

// ─── Graph Nodes & Edges ──────────────────────────────────────────────────────

export type NodeData = {
  id: string;
  component_key: string;
  component_type: "form";
  component_id: string;
  name: string;
  prerequisites: string[];
  permitted_roles: string[];
  input_mapping: Record<string, unknown>;
  sla_duration: SlaDuration;
  approval_required: boolean;
  approval_roles: string[];
};

export type Node = {
  id: string;
  type: "form";
  position: Position;
  data: NodeData;
};

export type Edge = {
  source: string;
  target: string;
};
