import { Field, Form, Formik } from "formik";
import { useMemo, useReducer, useState } from "react";
import * as Yup from "yup";
import { STEPS } from "./data";
import "./styles.css";
import { Step } from "./types";

import Stepper from "./components/Stepper";
import Button from "./components/Button";

type Data = Record<string, string | number>;

type State = {
  viewType: "questions" | "feedback" | "intro" | "end";
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
      return state.step === state.config.maxSteps
        ? {
            ...state,
            viewType: "end"
          }
        : {
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
    extraData: { book, bookText }
  }: Step = useMemo(() => {
    return STEPS.find((x) => x.step === step) as Step;
  }, [step]);

  const next = () => {
    window.scrollTo(0, 0);
    dispatch({ type: "next" });
  };

  const start = () => {
    window.scrollTo(0, 0);
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

  const [currentFeedback, setCurrentFeedback] = useState("edad");

  return (
    <div
      id="container"
      style={{
        maxWidth: "min(600px, 100%)",
        minHeight: "calc(100vh - 24px)",
        padding: "24px",
        paddingTop: "0px",
        margin: "auto",
        display: "flex",
        flexDirection: "column"
        // overflowX: "hidden"
      }}
    >
      <div
        id="header"
        style={{
          height: "76px",
          fontSize: "36px",
          display: "flex",
          justifyContent: ["intro", "end"].includes(viewType)
            ? "flex-start"
            : "center",
          alignItems: "center",
          fontFamily: "var(--font-serif)"
        }}
      >
        <svg
          width="107"
          height="37"
          viewBox="0 0 107 37"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity="0.9"
            d="M0 29.2235L2.6186 29.0251V6.85964L0 6.66126V6.33063H10.7124C14.561 6.33063 17.7483 8.32764 17.7483 12.2688C17.7483 16.5802 13.8997 18.0482 9.65442 19.0665H6.17619V29.0251L9.25767 29.2235V29.5541H0V29.2235ZM6.17619 18.6169H8.79478C11.8498 18.6169 13.9394 16.0644 13.9394 12.5729C13.9394 9.34598 12.6169 6.66126 9.25767 6.66126L6.17619 6.85964V18.6169ZM18.6873 29.2235L20.7504 29.0251V14.8609L18.5947 15.3635L18.555 15.0328L23.4351 13.7764H23.7658L23.8716 18.9475L27.1514 13.7764H29.3071V17.1621H25.5247L23.898 19.4236V29.0516L26.8869 29.25V29.5806H18.6873V29.2235ZM30.3916 22.2274C30.3916 17.0563 33.645 14.689 38.4193 13.6045C42.5985 13.6045 45.5477 16.8844 45.5477 21.4339C45.5477 26.5785 42.2943 29.0384 37.4539 30.0567C33.3541 30.0567 30.3916 26.7768 30.3916 22.2274ZM42.1753 22.4919C42.1753 17.2811 40.1783 14.3583 37.5597 14.3583C35.0733 14.3583 33.7376 16.9108 33.7376 21.1958C33.7376 26.0098 35.6685 29.3558 38.3532 29.3558C40.8528 29.3558 42.1753 26.671 42.1753 22.4919ZM46.8173 29.2235L48.9731 29.0251V14.5964H46.8173V14.2658H48.9731V13.8955C48.9731 11.7398 49.3037 10.5759 50.4675 9.41211L53.8532 6H57.3711V8.48634H52.5306L52.3984 8.92278C52.1339 9.78242 52.1339 10.5495 52.1339 12.8771V14.2658H56.2205V14.5964H52.1339V29.0384L55.5857 29.2367V29.5674H46.8173V29.2235ZM61.9206 30.0567C59.3284 30.0567 57.5033 28.6681 57.5033 26.142C57.5033 25.0179 57.834 23.7879 59.2887 22.6902L66.4171 20.4023V18.1408C66.4171 16.2099 66.351 14.7287 63.6002 14.7287C62.9389 14.7287 62.5686 14.8345 61.6428 15.099L60.9154 18.8549H57.9927V16.3554L64.235 13.6045C68.5464 13.6045 69.6441 15.1254 69.6441 18.5111V25.7453C69.6441 26.8033 69.8822 27.7687 70.2392 28.7606L71.9585 28.5226L72.0246 28.8532L67.1842 29.779L66.5229 26.9223L61.9206 30.0567ZM65.6104 27.2001L66.4436 26.5652V20.6932L62.3834 22.267C61.4577 22.9944 60.8625 23.9599 60.8625 25.3221C60.8625 27.0414 61.7883 28.139 63.1241 28.139C64.0498 28.139 65.0417 27.61 65.6104 27.2001ZM73.3339 29.2235L75.3971 29.0251V14.8609L73.2414 15.3635L73.2017 15.0328L78.2141 13.7764H78.5447V17.3208L84.5225 13.6045C87.6436 13.6045 88.3049 15.2312 88.3049 18.4846V29.0384L90.659 29.2367V29.5674H83.5306V29.2367L85.0912 29.0384V18.273C85.0912 16.2496 84.3902 15.6147 83.0677 15.6147C81.8774 15.6147 81.0707 16.1438 79.7482 16.9373L78.5579 17.6647V29.0119L80.1185 29.2103V29.5409H73.3472V29.2235H73.3339ZM91.3599 22.2274C91.3599 17.0563 94.6133 14.689 99.3877 13.6045C103.567 13.6045 106.516 16.8844 106.516 21.4339C106.516 26.5785 103.263 29.0384 98.4222 30.0567C94.3092 30.0567 91.3599 26.7768 91.3599 22.2274ZM103.144 22.4919C103.144 17.2811 101.147 14.3583 98.528 14.3583C96.0417 14.3583 94.7059 16.9108 94.7059 21.1958C94.7059 26.0098 96.6368 29.3558 99.3215 29.3558C101.808 29.3558 103.144 26.671 103.144 22.4919Z"
            fill="black"
          />
        </svg>
      </div>

      {viewType === "questions" ? (
        <>
          <Stepper current={step} max={config.maxSteps} />
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              window.scrollTo(0, 0);
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
                                <input
                                  type="number"
                                  value={values[formKey]}
                                  inputMode="numeric"
                                  name={formKey}
                                  id={formKey}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    setFieldValue(formKey, value);
                                  }}
                                />
                                {/* <Field
                                  id={formKey}
                                  type="number"
                                  name={formKey}
                                  value={values[formKey]}
                                  placeholder=""
                                /> */}
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
              marginTop: "36px",
              background: "var(--gray-1)"
            }}
          >
            <div
              style={{
                height: "350px",
                maxWidth: "350px",
                width: "100%",
                border: "1px solid var(--secondary)"
              }}
            ></div>
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
      ) : viewType === "intro" ? (
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
          <div
            style={{
              display: "flex",
              height: "40px",
              overflowX: "scroll",
              flexWrap: "nowrap",
              gap: "8px"
            }}
            className="hideScrollbar"
          >
            {STEPS.map((s) => (
              <button
                key={s.key}
                style={{
                  border: "1px solid var(--primary)",
                  borderRadius: "4px",
                  background:
                    currentFeedback === s.key
                      ? "var(--primary)"
                      : "transparent",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  display: "inline-flex",
                  padding: "12px 8px",
                  whiteSpace: "nowrap",
                  textTransform: "uppercase",
                  fontFamily: "var(--font-sans-serif)",
                  fontSize: "16px",
                  color: currentFeedback === s.key ? "white" : "var(--primary)",
                  cursor: "pointer"
                }}
                onClick={() => {
                  setCurrentFeedback(s.key);
                }}
              >
                {s.extraData.tabName}
              </button>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "36px",
              background: "var(--gray-1)"
            }}
          >
            <div
              style={{
                height: "350px",
                maxWidth: "350px",
                width: "100%",
                border: "1px solid var(--secondary)"
              }}
            ></div>
          </div>
          <div
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "19px",
              lineHeight: "140%"
            }}
          >
            <p>
              <span role="img" aria-label="emoji de cámara con flash">
                📸
              </span>{" "}
              ¡Hacé una captura de pantalla, compartí tu ubicación existencial.
            </p>
            <p>
              Todas las culturas han conceptualizado la vida y la muerte de
              diversas maneras. Y todas las personas, eventualmente, ponemos en
              juego esas conceptualizaciones. Sobre la forma en la que
              entendemos la muerte, tomamos decisiones de vida. Y viceversa. Por
              eso es tan importante hablar de estos temas. Conocer lo que
              piensan los demás, lo que quieren y lo que pueden.
            </p>
            <p>
              El Libro de la vida y el Libro de la muerte, los dos volúmenes que
              componen Profano, tratan sobre esto. Específicamente, sobre la
              vida y la muerte de los seres humanos. Los infinitos caminos que
              hay para transitarlas. Las distintas formas de experimentarlas. El
              derecho a decidir sobre ambas. Lo que nos toca en suerte y lo que
              podemos hacer con eso.
            </p>
          </div>
          <Button label="Conocé los liros" />
        </>
      )}
    </div>
  );
};

export default App;
