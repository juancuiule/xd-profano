import { Field, Form, Formik, FormikHelpers } from "formik";
import { useMemo, useReducer } from "react";
import * as Yup from "yup";
import { STEPS } from "./data";
import "./styles.css";
import { Step } from "./types";

import Stepper from "./components/Stepper";
import Button from "./components/Button";

type Data = Record<string, string | number>;

type State = {
  viewType: "questions" | "feedback" | "intro";
  step: number;
  data: Data;
  readonly config: {
    maxSteps: number;
  };
};

type Action =
  | { type: "next" }
  | { type: "start" }
  | { type: "submit"; data: Data; withFeedback?: boolean };

const initialState: State = {
  viewType: "intro",
  step: 1,
  data: {},
  config: {
    maxSteps: STEPS.length
  }
};

function reducer(state: State, action: Action): State {
  const nextStep = Math.min(state.step + 1, state.config.maxSteps);
  switch (action.type) {
    case "start":
      return {
        ...state,
        viewType: "questions",
        step: 1
      };
    case "submit":
      return {
        ...state,
        data: {
          ...state.data,
          ...action.data
        },
        viewType: action.withFeedback ? "feedback" : "questions",
        step: action.withFeedback ? state.step : nextStep
      };
    case "next":
      return {
        ...state,
        step: nextStep,
        viewType: "questions"
      };
    default:
      throw new Error();
  }
}

const App = () => {
  const [{ step, data, viewType, config }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const {
    key,
    questions,
    validationSchema = Yup.object(),
    postAnswerFeedback: { book, bookText }
  }: Step = useMemo(() => {
    return STEPS.find((x) => x.step === step) as Step;
  }, [step]);

  const next = () => {
    dispatch({ type: "next" });
  };

  const start = () => {
    dispatch({ type: "start" });
  };

  const initialValues: Data = useMemo(() => {
    const fromQuestions = Object.fromEntries(
      questions.map((q) => {
        const dataKey = `${key}-${q.key}`;
        return [dataKey, ""];
      })
    );
    return {
      ...data,
      ...fromQuestions
    };
  }, [key, data, questions]);

  return (
    <div
      style={{
        maxWidth: "min(600px, 100%)",
        minHeight: "calc(100vh - 24px)",
        padding: "24px",
        paddingTop: "0px",
        margin: "auto",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <div
        id="header"
        style={{
          height: "76px",
          fontSize: "36px",
          display: "flex",
          justifyContent: viewType === "intro" ? "flex-start" : "center",
          alignItems: "center",
          fontFamily: "var(--font-serif)"
        }}
      >
        Profano
      </div>

      {viewType === "questions" ? (
        <>
          <Stepper current={step} max={config.maxSteps} />
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              dispatch({
                type: "submit",
                data: values,
                withFeedback: true
              });
            }}
          >
            {({ errors, touched, values, setFieldValue, submitCount }) => {
              return (
                <>
                  <Form
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      minHeight: "calc(100vh - 76px - 28px - 24px)"
                    }}
                  >
                    {questions
                      .filter(
                        ({ condition }) =>
                          condition === undefined || condition(values)
                      )
                      .map((question, i) => {
                        const formKey = `${key}-${question.key}`;
                        return (
                          <div
                            key={`${formKey}-${i}`}
                            style={{
                              marginTop: i !== 0 ? `${60 - 24 - 8}px` : "60px"
                            }}
                          >
                            <label
                              htmlFor={formKey}
                              style={{
                                fontFamily: "var(--font-serif)",
                                fontWeight: 500,
                                fontSize: "24px",
                                lineHeight: "140%"
                              }}
                            >
                              {question.input.label}
                            </label>
                            {question.input.type === "button" ? (
                              <div
                                style={{
                                  marginTop: "20px",
                                  display: "flex",
                                  flexDirection:
                                    question.input.direction || "column",
                                  flexWrap: "wrap",
                                  justifyContent: "flex-start",
                                  alignItems: "stretch",
                                  gap: "20px"
                                }}
                              >
                                {question.input.options.map((option, i) => (
                                  <button
                                    style={{
                                      padding: "16px 24px",
                                      borderRadius: "8px",
                                      border: `1px solid ${
                                        values[formKey] === option.value
                                          ? "var(--primary)"
                                          : "black"
                                      }`,
                                      background: "transparent",
                                      fontFamily: "var(--font-serif)",
                                      fontWeight: 700,
                                      fontSize: "20px",
                                      lineHeight: "28px",
                                      textAlign: "left",
                                      color:
                                        values[formKey] === option.value
                                          ? "var(--primary)"
                                          : "black",
                                      cursor: "pointer"
                                    }}
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      setFieldValue(formKey, option.value);
                                      questions
                                        .filter(
                                          ({ condition }) =>
                                            condition !== undefined &&
                                            !condition({
                                              ...values,
                                              [formKey]: option.value
                                            })
                                        )
                                        .forEach((q) =>
                                          setFieldValue(
                                            `${key}-${q.key}`,
                                            undefined
                                          )
                                        );
                                    }}
                                  >
                                    {["A", "B"][i]}. {option.text}
                                  </button>
                                ))}
                              </div>
                            ) : question.input.type === "slider" ? (
                              <div
                                style={{
                                  marginTop: "20px",
                                  display: "flex",
                                  flexDirection: "column"
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    fontFamily: "var(--font-sans-serif)",
                                    fontWeight: 400,
                                    color: "var(--gray-4)",
                                    fontSize: "12px",
                                    lineHeight: "24px",
                                    textTransform: "uppercase"
                                  }}
                                >
                                  <span>{question.input.minLabel}</span>
                                  <span>{question.input.maxLabel}</span>
                                </div>
                                <input
                                  style={{ width: "100%" }}
                                  type="range"
                                  min={question.input.min || 0}
                                  max={question.input.max || 100}
                                  onChange={(e) => {
                                    setFieldValue(
                                      formKey,
                                      parseInt(e.target.value, 10)
                                    );
                                  }}
                                  value={values[question.key]}
                                  defaultValue={
                                    question.input.defaultValue ||
                                    Math.round(
                                      ((question.input.max || 100) -
                                        (question.input.min || 0)) /
                                        2
                                    ) + (question.input.min || 0)
                                  }
                                />
                              </div>
                            ) : question.input.type === "checkbox" ? (
                              <div
                                style={{
                                  marginTop: "20px",
                                  display: "flex",
                                  flexDirection: "column",
                                  flexWrap: "wrap",
                                  justifyContent: "flex-start",
                                  alignItems: "stretch",
                                  gap: "10px"
                                }}
                              >
                                {question.input.options.map((option, i) => (
                                  <label>
                                    <Field
                                      type="checkbox"
                                      name={formKey}
                                      value={option.value}
                                    />
                                    {option.text}
                                  </label>
                                ))}
                              </div>
                            ) : (
                              <div
                                style={{
                                  marginTop: "20px"
                                }}
                              >
                                <Field
                                  id={formKey}
                                  type="number"
                                  name={formKey}
                                  value={values[formKey]}
                                  placeholder=""
                                />
                              </div>
                            )}
                            {errors[formKey] &&
                            (touched[formKey] || submitCount > 0) ? (
                              <div
                                style={{
                                  fontFamily: "var(--font-sans-serif)",
                                  fontWeight: 400,
                                  color: "var(--error-color)",
                                  fontSize: "14px",
                                  lineHeight: "24px",
                                  marginTop: "8px"
                                }}
                              >
                                {errors[formKey]}
                              </div>
                            ) : (
                              <div
                                style={{
                                  height: "24px",
                                  marginTop: "8px"
                                }}
                              ></div>
                            )}
                          </div>
                        );
                      })}
                    <pre>
                      <code>{JSON.stringify(values, null, 2)}</code>
                    </pre>
                    <div style={{ height: "36px" }}></div>
                    <Button type="submit" label={"Siguiente"} />
                  </Form>
                </>
              );
            }}
          </Formik>
        </>
      ) : viewType === "feedback" ? (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              margin: "32px 0",
              background: "var(--gray-1)"
            }}
          >
            <img
              style={{ width: "auto", height: "100%" }}
              src={`/graficos/${key}.png`}
              alt="scatter-plot"
            />
          </div>
          <div
            style={{
              padding: "20px",
              fontFamily: "var(--font-serif)",
              fontSize: "19px",
              lineHeight: "140%",
              fontWeight: 500
            }}
          >
            <p>
              {bookText}{" "}
              <i
                style={{
                  fontWeight: 400
                }}
              >
                {book}
              </i>
              .
            </p>
          </div>
          <Button
            type={"button"}
            label={"Siguiente"}
            style={{
              margin: "20px"
            }}
            onClick={next}
          />
          <pre
            style={{
              fontSize: "12px"
            }}
          >
            <code>{JSON.stringify(data, null, 2)}</code>
          </pre>
        </>
      ) : (
        <>
          <h1
            style={{
              fontFamily: "var(--font-sans-serif)",
              fontWeight: 500,
              fontSize: "36px",
              lineHeight: "140%",
              color: "var(--primary)",
              textAlign: "center"
            }}
          >
            Usted está aquí
          </h1>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "19px",
              lineHeight: "140%",
              fontWeight: 500
            }}
          >
            Las formas de vivir y morir a lo largo de la historia han sido de lo
            más diversas. Acaso una de las pocas regularidades tenga que ver con
            lo sagrado: la gran mayoría de las culturas (especialmente las
            tradiciones religiosas) han estabilizado algún tipo de sacralidad
            respecto a la vida y la muerte. El problema es que, cuando algo se
            sacraliza, se detiene. Se vuelve inmóvil. Y la vida y la muerte son
            —como el tiempo y el espacio— planos interrelacionados: un océano en
            movimiento.
          </p>
          <p
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "19px",
              lineHeight: "140%",
              fontWeight: 500
            }}
          >
            En medio de ese océano, es fácil perderse. Las siguientes preguntas
            son sólo algunas de las infinitas que podemos hacernos para ubicar
            coordenadas. Saber qué pensamos y qué queremos respecto a las
            múltiples formas de conceptualizar la vida y la muerte. Y en qué
            lugar nos deja eso respecto a los demás.
          </p>
          <Button
            label={"Empezar"}
            onClick={start}
            style={{ marginTop: "auto" }}
          />
        </>
      )}
    </div>
  );
};

export default App;
