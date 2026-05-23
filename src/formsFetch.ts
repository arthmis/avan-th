import { useEffect, useState } from "react";
import { graphFromData } from "./Graph/createGraph";
import type { ActionBlueprintGraph } from "./Graph/graphTypes";

export function useFetchGraph(tenantId: string, actionBlueprintId: string) {
  const [fetchState, setFetchState] = useState<FetchState>({ type: "loading" });

  useEffect(() => {
    const url = `http://localhost:3000/api/v1/${tenantId}/actions/blueprints/${actionBlueprintId}/graph`;
    const fetchFunc = async () => {
      try {
        const response = await fetch(url);
        const json: RawActionBlueprintGraph = await response.json();
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
  data: ActionBlueprintGraph;
};

export type FetchError = {
  type: "error";
  message: string;
};

export type FetchLoading = {
  type: "loading";
};

// ─── Root ─────────────────────────────────────────────────────────────────────

export type RawActionBlueprintGraph = {
  $schema?: string;
  id: string;
  tenant_id: string;
  name: string;
  description: string;
  category: string;
  nodes: RawNode[];
  edges: RawEdge[];
  forms: RawForm[];
  branches: unknown[];
  triggers: unknown[];
};

// ─── Primitives ───────────────────────────────────────────────────────────────

export type RawSlaDuration = {
  number: number;
  unit: "minutes" | "hours" | "days";
};

export type Position = {
  x: number;
  y: number;
};

// ─── Field Property Primitives ────────────────────────────────────────────────

/** The JSON Schema primitive type of a field value. */
export type RawFieldJsonType = "string" | "object" | "array" | "boolean" | "number";

/** The Avantos-specific UI widget type for a field. */
export type AvantosFieldType =
  | "button"
  | "checkbox-group"
  | "object-enum"
  | "short-text"
  | "multi-line-text"
  | "multi-select";

/** Describes the allowed values for enum-backed array fields. */
export type RawFieldItems = {
  enum: string[];
  type: "string";
};

// ─── Field Properties ─────────────────────────────────────────────────────────

export type RawFieldPropertyButton = {
  avantos_type: "button";
  title: string;
  type: "object";
};

export type RawFieldPropertyCheckboxGroup = {
  avantos_type: "checkbox-group";
  items: RawFieldItems;
  type: "array";
  uniqueItems: boolean;
};

export type RawFieldPropertyObjectEnum = {
  avantos_type: "object-enum";
  enum: Record<string, unknown>[] | undefined;
  title: string;
  type: "object";
};

export type RawFieldPropertyShortText = {
  avantos_type: "short-text";
  title: string;
  type: "string";
  format?: string;
};

export type RawFieldPropertyMultiLineText = {
  avantos_type: "multi-line-text";
  title: string;
  type: "string";
};

export type RawFieldPropertyMultiSelect = {
  avantos_type: "multi-select";
  items: RawFieldItems;
  type: "array";
  uniqueItems: boolean;
};

/** Discriminated union over all possible field property shapes. */
export type RawFieldProperty =
  | RawFieldPropertyButton
  | RawFieldPropertyCheckboxGroup
  | RawFieldPropertyObjectEnum
  | RawFieldPropertyShortText
  | RawFieldPropertyMultiLineText
  | RawFieldPropertyMultiSelect;

// ─── Form Schema ──────────────────────────────────────────────────────────────

export type RawFieldSchema = {
  type: "object";
  properties: Record<string, RawFieldProperty>;
  required: string[];
};

export type RawUiSchemaElementOptions = {
  format: string;
};

export type RawUiSchemaElement = {
  type: "Control" | "Button";
  scope: string;
  label: string;
  options?: RawUiSchemaElementOptions;
};

export type RawUiSchema = {
  type: "VerticalLayout";
  elements: RawUiSchemaElement[];
};

export type RawDynamicPayloadField = {
  type: "form_field";
  value: string;
};

export type RawDynamicFieldEntry = {
  selector_field: string;
  payload_fields: Record<string, RawDynamicPayloadField>;
  endpoint_id: string;
};

export type RawDynamicFieldConfig = Record<string, RawDynamicFieldEntry>;

// ─── Form ─────────────────────────────────────────────────────────────────────

export type RawComponent = RawForm;

export type RawForm = {
  id: string;
  name: string;
  component_type: "form";
  description: string;
  is_reusable: boolean;
  field_schema: RawFieldSchema;
  ui_schema: RawUiSchema;
  dynamic_field_config: RawDynamicFieldConfig;
};

// ─── Graph Nodes & Edges ──────────────────────────────────────────────────────

export type RawNodeData = {
  id: string;
  component_key: string;
  component_type: "form";
  component_id: string;
  name: string;
  prerequisites: string[];
  permitted_roles: string[];
  input_mapping: Record<string, unknown>;
  sla_duration: RawSlaDuration;
  approval_required: boolean;
  approval_roles: string[];
};

export type RawNode = {
  id: string;
  type: "form";
  position: Position;
  data: RawNodeData;
};

export type RawEdge = {
  source: string;
  target: string;
};
