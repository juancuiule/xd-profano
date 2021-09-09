import * as Yup from "yup";
import Lazy from "yup/lib/Lazy";
import { RequiredNumberSchema } from "yup/lib/number";
import { AssertsShape, Assign, TypeOfShape } from "yup/lib/object";
import Reference from "yup/lib/Reference";
import { RequiredStringSchema } from "yup/lib/string";

type Input = {
  label: string;
};

type SliderInput = Input & {
  type: "slider";
  minLabel: string;
  maxLabel: string;
  min?: number;
  max?: number;
  defaultValue?: number;
};

type Option = {
  text: string;
  value: string;
};

type ButtonGroup = Input & {
  type: "button";
  options: Option[];
  direction?: "column" | "row";
};

type CheckboxGroup = Input & {
  type: "checkbox";
  options: Option[];
};

type NumericInput = Input & {
  type: "numeric-input";
  min?: number;
  max?: number;
};

type Question = {
  key: string;
  input: SliderInput | ButtonGroup | NumericInput | CheckboxGroup;
  condition?: (state: Record<string, string | number>) => boolean;
};

export type SubSchema =
  | RequiredNumberSchema<number | undefined, Record<string, any>>
  | RequiredStringSchema<string | undefined, Record<string, any>>
  | Yup.NumberSchema<number | undefined, Record<string, any>>
  | Yup.StringSchema<string | undefined, Record<string, any>>;

export interface PreStep {
  step: number;
  key: string;
  questions: Question[];
  extraData: {
    book: "Libro de la vida" | "Libro de la muerte";
    bookText: string;
    tabName: string;
  };
}

export interface Step extends PreStep {
  validationSchema?: Yup.ObjectSchema<
    Assign<
      Record<
        string,
        Yup.AnySchema<any, any, any> | Reference<unknown> | Lazy<any, any>
      >,
      { [key: string]: SubSchema }
    >,
    Record<string, any>,
    TypeOfShape<{
      [x: string]:
        | Yup.AnySchema<any, any, any>
        | Reference<unknown>
        | Lazy<any, any>;
    }>,
    AssertsShape<Record<any, any>>
  >;
}
