import type { Blueprint, PrefillDataSource } from "../../Graph/graph";
import type { PrefillSource } from "../../hooks/usePrefillMap";
import { GlobalDataSourceView } from "./GlobalDataSourceView";
import { NodeDataSourceView } from "./NodeDataSourceView";

type DataSourceViewProps = {
  blueprint: Blueprint;
  dataSource: PrefillDataSource;
  onSelect: (source: PrefillSource) => void;
  onClose: () => void;
};

export function DataSourceView({ blueprint, dataSource, onSelect }: DataSourceViewProps) {
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
