import { useState } from "react";
import type { Graph } from "../graph";
import { Form } from "./Form";

type Props = {
  forms: Graph;
};

export function FormList(props: Props) {
  return (
    <>
      {props.forms.map((form) => {
        return <Form key={form.nodeId} data={form} />;
      })}
    </>
  );
}
