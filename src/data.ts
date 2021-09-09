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
          label: "¿Qué edad tenés?",
          min: 0
        }
      },
      {
        key: "morir",
        input: {
          label: "¿Hasta qué edad te gustaría vivir?",
          type: "slider",
          min: 0,
          max: 130,
          minLabel: "0 años",
          maxLabel: "130 años"
        }
      }
    ],
    extraData: {
      tabName: "Longitud del camino",
      book: "Libro de la vida",
      bookText:
        "“...es imposible conocer el límite máximo de tiempo vivible para los humanos. Lo único que sabemos es que estas personas excepcionales que viven más de 110 años dificilmente llegan a los 120: ese parece ser un límite más o menos razonable.”"
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
          label: "¿Tenés hijes?",
          options: [
            { text: "Sí", value: "1" },
            { text: "No", value: "0" }
          ]
        }
      },
      {
        key: "volveria",
        input: {
          type: "slider",
          label: "Si pudieras volver el tiempo atrás ¿volverías a tenerlos?",
          minLabel: "Seguro que no",
          maxLabel: "Seguro que sí"
        },
        condition: (state) => state["hijes-tenes"] === "1"
      },
      {
        key: "gustaria",
        input: {
          type: "slider",
          label: "¿Te gustaría tenerlos? ",
          minLabel: "Seguro que no",
          maxLabel: "Seguro que sí"
        },
        condition: (state) => state["hijes-tenes"] === "0"
      }
    ],
    extraData: {
      tabName: "Hijes",
      book: "Libro de la vida",
      bookText:
        "“...Si nacer es uno de los hitos centrales en las trayectorias de vida de los humanos, dar lugar a ese nacimiento —es decir, transitar el parto y lo que le sigue— no se queda muy atrás…”"
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
            "¿Hasta qué momento de la gestación te parece que es aceptable hacer un aborto?",
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
            "¿En qué momento de tu gestación creés que apareciste vos como persona?",
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
        "“...el problema, más que por la definición del inicio de la vida, podía ser abordado en términos del estatus de un embrión o feto frente al de una persona, es decir, un ser humano.”"
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
            "¿En qué medida el género que te asignaron al nacer coincide con el que te autopercibís?",
          minLabel: "Nada",
          maxLabel: "Totalmente"
        }
      }
    ],
    extraData: {
      tabName: "Quién da estos pasos",
      book: "Libro de la vida",
      bookText:
        "“... muchas personas perciben que sus características corporales no necesariamente tienen que ver con el género con el que se perciben. Los tratamientos hormonales permiten a las personas transgénero poner en acuerdo su identidad de género autopercibida con estas características corporales.”"
    }
  },
  {
    step: 5,
    key: "morir",
    questions: [
      {
        key: "curpo",
        input: {
          label: "¿Te interesa que pase con tu cuerpo luego de morir? ",
          type: "slider",
          minLabel: "Nada",
          maxLabel: "Mucho"
        }
      },
      {
        key: "redes",
        input: {
          label: "¿Te interesa qué pase con tus redes sociales luego de morir?",
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
        "“Entonces, me explica aquello que ya conté: que hoy las personas tienen más miedo a ser enterradas vivas que a morirse. Por ello, muchos piden ser enterrados con el celular…”"
    }
  },
  {
    step: 6,
    key: "miedo",
    questions: [
      {
        key: "propia",
        input: {
          label: "¿Cuánto miedo le tenés a la muerte?",
          type: "slider",
          minLabel: "Nada",
          maxLabel: "Mucho"
        }
      },
      {
        key: "resto",
        input: {
          label: "¿Cuánto miedo le tenés a la muerte de les demás?",
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
        "“Se cree que el moribundo aguardaba en silencio, como quien espera una noticia importante e inevitable. Alrededor quedaban los que estuviesen. Siempre mucha gente: principalmente conocidos, pero también los había desconocidos.”"
    }
  },
  {
    step: 7,
    key: "muerte",
    questions: [
      {
        key: "experiencia",
        input: {
          label: "¿Hay experiencia después de la muerte? ",
          type: "slider",
          minLabel: "Seguro que no",
          maxLabel: "Seguro que sí"
        }
      },
      {
        key: "eutanasia",
        input: {
          label:
            "¿Te parece que una persona debe tener derecho a acceder a una eutanasia?",
          type: "slider",
          minLabel: "Seguro que no",
          maxLabel: "Seguro que sí"
        }
      }
    ],
    extraData: {
      tabName: "Interrupción del viaje",
      book: "Libro de la muerte",
      bookText:
        "“...la soberanía sobre los cuerpos y, más aún, sobre las existencias, es algo que no puede conquistarse tan fácil. Pero los deseos de la Interrupción Voluntaria de la Vida comienzan a ser identificados y reconocidos por los Estados, que toman nota de la situación y, en algunos casos, ensayan leyes para garantizar nuevos derechos.”"
    }
  }
];

export const STEPS: Step[] = preSteps.map((step) => ({
  ...step,
  validationSchema: getSchema(step)
}));
