import { Field, Form, Formik, FormikHelpers } from "formik";
import { useMemo, useState } from "react";
import * as Yup from "yup";
import { Step, STEPS } from "./data";
import "./styles.css";

const App = () => {
  const [step, setStep] = useState(1);

  const {
    key,
    questions,
    validationSchema = Yup.object()
  }: Step = useMemo(() => {
    return STEPS.find((x) => x.step === step) as Step;
  }, [step]);

  const { key: prevKey, book, bookText }: Step = useMemo(() => {
    return STEPS.find((x) => x.step === Math.max(1, step - 1)) as Step;
  }, [step]);

  const next = () => {
    setStep((s) => Math.min(s + 1, STEPS.length));
  };

  return (
    <div
      style={{
        maxWidth: "min(600px, 100%)",
        padding: "24px",
        paddingTop: "0px",
        margin: "auto"
      }}
    >
      <div
        id="header"
        style={{
          height: "76px",
          fontSize: "36px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "var(--font-serif)"
        }}
      >
        Profano
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontFamily: "var(--font-sans-serif)",
          color: "var(--primary)",
          height: "28px"
        }}
      >
        <span
          style={{
            fontSize: "14px",
            lineHeight: "18px",
            fontWeight: 500
          }}
        >
          {step}/{STEPS.length}
        </span>
        <div
          style={{
            width: "100%",
            height: "5px",
            marginTop: "5px",
            background: `linear-gradient(to right, var(--primary) 0%, var(--primary) ${
              (step / STEPS.length) * 100
            }%, var(--gray-2) ${
              (step / STEPS.length) * 100
            }%, var(--gray-2) 100%)`
          }}
        ></div>
      </div>
      <Formik
        initialValues={Object.fromEntries(
          questions.map((q) => [`${key}-${q.key}`, ""])
        )}
        validationSchema={validationSchema}
        onSubmit={(
          values,
          { setFormikState }: FormikHelpers<Record<string, string>>
        ) => {
          next();
          document.getElementById("feedback")?.scrollIntoView();
          setFormikState((prevState) => ({ ...prevState, submitCount: 0 }));
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
                                {["A", "B", "C", "D"][i]}. {option.text}
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
                <div style={{ height: "36px" }}></div>
                <button
                  type="submit"
                  style={{
                    marginTop: "auto",
                    padding: "24px 40px",
                    height: "67px",
                    border: "2px solid var(--primary)",
                    cursor: "pointer",
                    fontSize: "19px",
                    lineHeight: "19px",
                    fontFamily: "var(--font-sans-serif)",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    background: "transparent"
                  }}
                >
                  Siguiente
                </button>
              </Form>

              <div
                id="feedback"
                style={{
                  marginTop: "200px",
                  minHeight: "100vh",
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
                    justifyContent: "center",
                    alignItems: "center",
                    fontFamily: "var(--font-serif)",
                    background: "var(--gray-1)"
                  }}
                >
                  Profano
                </div>
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
                    src={`/graficos/${prevKey}.png`}
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
                <button
                  type="button"
                  style={{
                    padding: "24px 40px",
                    height: "67px",
                    border: "2px solid var(--primary)",
                    cursor: "pointer",
                    fontSize: "19px",
                    lineHeight: "19px",
                    fontFamily: "var(--font-sans-serif)",
                    textTransform: "uppercase",
                    color: "var(--primary)",
                    background: "transparent",
                    margin: "20px",
                    marginTop: "auto"
                  }}
                  onClick={() => {
                    document.getElementById("header")?.scrollIntoView();
                  }}
                >
                  Siguiente
                </button>
              </div>
              <pre
                style={{
                  fontSize: "12px"
                }}
              >
                <code>{JSON.stringify(values, null, 2)}</code>
              </pre>
            </>
          );
        }}
      </Formik>
    </div>
  );
};

export default App;
