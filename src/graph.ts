import type { Form, JSONGraphDescription } from "./formsFetch";

export function graphFromData(data: JSONGraphDescription): Graph {
  const forms: Graph = [];

  for (const node of data.nodes) {
    const componentId = node.data.component_id;
    const form = data.forms.find((form) => {
      return form.id === componentId;
    });

    if (form) {
      forms.push({
        nodeId: node.id,
        nodeName: node.data.name,
        data: form,
      });
    }
  }

  return forms;
}

export type NodeForm = {
  nodeId: string;
  nodeName: string;
  data: Form;
};

export type Graph = NodeForm[];
