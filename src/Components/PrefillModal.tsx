import type { Blueprint, GlobalDataSource, NodeDataSource, PrefillDataSource } from "../Graph/graph";
import type { AncestorNode } from "../Graph/traverseGraph";
import type { PrefillSource } from "../PrefillMap";

type Props = {
  blueprint: Blueprint;
  upstreamNodes: AncestorNode[];
  onSelect: (source: PrefillSource) => void;
  onClose: () => void;
};

export function PrefillModal({ blueprint, upstreamNodes, onSelect, onClose }: Props) {
  return (
    <div style={{ border: "1px solid #888", padding: 12, marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <strong>Select data element to map</strong>
        <button type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </div>

      {upstreamNodes.length === 0 && blueprint.globalDataSources.size === 0 && (
        <p>No upstream data sources available.</p>
      )}
      {Array.from(blueprint.globalDataSources, ([key, dataSource]) => {
        return (
          <DataSourceView
            key={key}
            blueprint={blueprint}
            dataSource={dataSource}
            onSelect={onSelect}
            onClose={onClose}
          />
        );
      })}

      {upstreamNodes.map(({ node }) => {
        const nodeDataSource: NodeDataSource = {
          sourceType: "node",
          data: node,
        };
        return (
          <DataSourceView
            key={node.nodeId}
            blueprint={blueprint}
            dataSource={nodeDataSource}
            onSelect={onSelect}
            onClose={onClose}
          />
        );
      })}
    </div>
  );
}

type DataSourceViewProps = {
  blueprint: Blueprint;
  dataSource: PrefillDataSource;
  onSelect: (source: PrefillSource) => void;
  onClose: () => void;
};

function DataSourceView({ blueprint, dataSource, onSelect }: DataSourceViewProps) {
  switch (dataSource.sourceType) {
    case "node":
      return (
        <NodeDataSourceView blueprint={blueprint} dataSource={dataSource} onSelect={onSelect} />
      );
    case "global":
      return <GlobalDataSourceView dataSource={dataSource} onSelect={onSelect} />;
    default:
      return undefined;
  }
}

type NodeDataSourceViewProps = {
  blueprint: Blueprint;
  dataSource: NodeDataSource;
  onSelect: (source: PrefillSource) => void;
};

function NodeDataSourceView({ blueprint, dataSource, onSelect }: NodeDataSourceViewProps) {
  switch (dataSource.data.data.componentType) {
    case "form": {
      const formDefinition = blueprint.forms.get(dataSource.data.data.componentId);
      if (!formDefinition) {
        return undefined;
      }

      return formDefinition.fields.map((f) => (
        <button
          key={`${dataSource.data.nodeId}-${f.key}`}
          type="button"
          style={{ display: "block", margin: "2px 0" }}
          onClick={() =>
            onSelect({
              sourceType: "node",
              sourceNodeId: dataSource.data.nodeId,
              sourceName: dataSource.data.name,
              fieldKey: f.key,
              fieldLabel: f.label,
            })
          }
        >
          {dataSource.data.name} &gt; {f.label}
        </button>
      ));
    }
    default:
      return undefined;
  }
}

type GlobalDataSourceViewProps = {
  dataSource: GlobalDataSource;
  onSelect: (source: PrefillSource) => void;
};

function GlobalDataSourceView({ dataSource, onSelect }: GlobalDataSourceViewProps) {
  return dataSource.data.fields.map((f) => (
    <button
      key={f.key}
      type="button"
      style={{ display: "block", margin: "2px 0" }}
      onClick={() =>
        onSelect({
          sourceType: "global",
          sourceName: dataSource.data.label,
          fieldKey: f.key,
          fieldLabel: f.label,
        })
      }
    >
      {dataSource.data.label} &gt; {f.label}
    </button>
  ));
}
