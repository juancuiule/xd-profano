import * as Yup from "yup";
import { PreStep, Step, SubSchema } from "./types";

const getSchema = (step: PreStep) => {
  const shape = step.questions.reduce(
    (acum, { input, key, condition }) => {
      const schemaKey = `${step.key}-${key}`;
      switch (input.type) {
        case "button":
          return {
            ...acum,
            [schemaKey]: Yup.string()
              .oneOf(input.options.map((option) => option.value))
              .required("Este es un campo requerido")
          };
        case "numeric-input":
          let { min: inputMin, max: inputMax } = input;
          return {
            ...acum,
            [schemaKey]: Yup.string()
              .test({
                test: (value) =>
                  value !== undefined &&
                  (inputMin === undefined || parseInt(value, 10) >= inputMin) &&
                  (inputMax === undefined || parseInt(value, 10) <= inputMax),
                message:
                  inputMax !== undefined && inputMin !== undefined
                    ? `El valor tiene que estar entre ${inputMin} y ${inputMax}`
                    : inputMax !== undefined
                    ? `El valor tiene que ser menor o igual a ${inputMax}`
                    : `El valor tiene que ser mayor o igual a ${inputMin}`
              })
              .required("Este es un campo requerido")
          };
        case "slider":
          const { min: sliderMin = 0, max: sliderMax = 100 } = input;
          return {
            ...acum,
            [schemaKey]:
              condition !== undefined
                ? Yup.number()
                    .min(sliderMin)
                    .max(sliderMax)
                    .test({
                      name: "conditional",
                      test: (value, context) =>
                        !condition(context.parent) || value !== undefined,
                      message: "Este es un campo requerido"
                    })
                : Yup.number()
                    .min(sliderMin)
                    .max(sliderMax)
                    .required("Este es un campo requerido")
          };
        default:
          break;
      }
      return acum;
    },
    {} as {
      [key: string]: SubSchema;
    }
  );
  return Yup.object().shape(shape);
};

const preSteps: PreStep[] = [
  {
    step: 1,
    key: "edad",
    questions: [
      {
        key: "actual",
        input: {
          type: "numeric-input",
          label: "??Qu?? edad ten??s?",
          min: 0
        }
      },
      {
        key: "morir",
        input: {
          label: "??Hasta qu?? edad te gustar??a vivir?",
          type: "slider",
          min: 0,
          max: 130,
          minLabel: "0 a??os",
          maxLabel: "130 a??os"
        }
      }
    ],
    extraData: {
      tabName: "Longitud del camino",
      book: "Libro de la vida",
      bookText:
        "???...es imposible conocer el l??mite m??ximo de tiempo vivible para los humanos. Lo ??nico que sabemos es que estas personas excepcionales que viven m??s de 110 a??os dificilmente llegan a los 120: ese parece ser un l??mite m??s o menos razonable.???"
    }
  },
  {
    step: 2,
    key: "hijes",
    questions: [
      {
        key: "tenes",
        input: {
          type: "button",
          label: "??Ten??s hijes?",
          options: [
            { text: "S??", value: "1" },
            { text: "No", value: "0" }
          ]
        }
      },
      {
        key: "volveria",
        input: {
          type: "slider",
          label: "Si pudieras volver el tiempo atr??s ??volver??as a tenerlos?",
          minLabel: "Seguro que no",
          maxLabel: "Seguro que s??"
        },
        condition: (state) => state["hijes-tenes"] === "1"
      },
      {
        key: "gustaria",
        input: {
          type: "slider",
          label: "??Te gustar??a tenerlos? ",
          minLabel: "Seguro que no",
          maxLabel: "Seguro que s??"
        },
        condition: (state) => state["hijes-tenes"] === "0"
      }
    ],
    extraData: {
      tabName: "Hijes",
      book: "Libro de la vida",
      bookText:
        "???...Si nacer es uno de los hitos centrales en las trayectorias de vida de los humanos, dar lugar a ese nacimiento ???es decir, transitar el parto y lo que le sigue??? no se queda muy atr??s??????"
    }
  },
  {
    step: 3,
    key: "gestacion",
    questions: [
      {
        key: "aborto",
        input: {
          label:
            "??Hasta qu?? momento de la gestaci??n te parece que es aceptable hacer un aborto?",
          type: "slider",
          min: 0,
          max: 42,
          minLabel: "0 semanas",
          maxLabel: "42 semanas"
        }
      },
      {
        key: "persona",
        input: {
          label:
            "??En qu?? momento de tu gestaci??n cre??s que apareciste vos como persona?",
          type: "slider",
          min: 0,
          max: 42,
          minLabel: "0 semanas",
          maxLabel: "42 semanas"
        }
      }
    ],
    extraData: {
      tabName: "Punto de partida",
      book: "Libro de la vida",
      bookText:
        "???...el problema, m??s que por la definici??n del inicio de la vida, pod??a ser abordado en t??rminos del estatus de un embri??n o feto frente al de una persona, es decir, un ser humano.???"
    }
  },
  {
    step: 4,
    key: "genero",
    questions: [
      {
        key: "coincide",
        input: {
          type: "slider",
          label:
            "??En qu?? medida el g??nero que te asignaron al nacer coincide con el que te autopercib??s?",
          minLabel: "Nada",
          maxLabel: "Totalmente"
        }
      }
    ],
    extraData: {
      tabName: "Qui??n da estos pasos",
      book: "Libro de la vida",
      bookText:
        "???... muchas personas perciben que sus caracter??sticas corporales no necesariamente tienen que ver con el g??nero con el que se perciben. Los tratamientos hormonales permiten a las personas transg??nero poner en acuerdo su identidad de g??nero autopercibida con estas caracter??sticas corporales.???"
    }
  },
  {
    step: 5,
    key: "morir",
    questions: [
      {
        key: "curpo",
        input: {
          label: "??Te interesa que pase con tu cuerpo luego de morir? ",
          type: "slider",
          minLabel: "Nada",
          maxLabel: "Mucho"
        }
      },
      {
        key: "redes",
        input: {
          label: "??Te interesa qu?? pase con tus redes sociales luego de morir?",
          type: "slider",
          minLabel: "Nada",
          maxLabel: "Mucho"
        }
      }
    ],
    extraData: {
      tabName: "El final",
      book: "Libro de la muerte",
      bookText:
        "???Entonces, me explica aquello que ya cont??: que hoy las personas tienen m??s miedo a ser enterradas vivas que a morirse. Por ello, muchos piden ser enterrados con el celular??????"
    }
  },
  {
    step: 6,
    key: "miedo",
    questions: [
      {
        key: "propia",
        input: {
          label: "??Cu??nto miedo le ten??s a la muerte?",
          type: "slider",
          minLabel: "Nada",
          maxLabel: "Mucho"
        }
      },
      {
        key: "resto",
        input: {
          label: "??Cu??nto miedo le ten??s a la muerte de les dem??s?",
          type: "slider",
          minLabel: "Nada",
          maxLabel: "Mucho"
        }
      }
    ],
    extraData: {
      tabName: "Abismo",
      book: "Libro de la muerte",
      bookText:
        "???Se cree que el moribundo aguardaba en silencio, como quien espera una noticia importante e inevitable. Alrededor quedaban los que estuviesen. Siempre mucha gente: principalmente conocidos, pero tambi??n los hab??a desconocidos.???"
    }
  },
  {
    step: 7,
    key: "muerte",
    questions: [
      {
        key: "experiencia",
        input: {
          label: "??Hay experiencia despu??s de la muerte? ",
          type: "slider",
          minLabel: "Seguro que no",
          maxLabel: "Seguro que s??"
        }
      },
      {
        key: "eutanasia",
        input: {
          label:
            "??Te parece que una persona debe tener derecho a acceder a una eutanasia?",
          type: "slider",
          minLabel: "Seguro que no",
          maxLabel: "Seguro que s??"
        }
      }
    ],
    extraData: {
      tabName: "Interrupci??n del viaje",
      book: "Libro de la muerte",
      bookText:
        "???...la soberan??a sobre los cuerpos y, m??s a??n, sobre las existencias, es algo que no puede conquistarse tan f??cil. Pero los deseos de la Interrupci??n Voluntaria de la Vida comienzan a ser identificados y reconocidos por los Estados, que toman nota de la situaci??n y, en algunos casos, ensayan leyes para garantizar nuevos derechos.???"
    }
  }
];

export const STEPS: Step[] = preSteps.map((step) => ({
  ...step,
  validationSchema: getSchema(step)
}));
