import { isEmpty } from 'es-toolkit/compat';

const CSSVariable = (variableName) => {
  if (document.readyState !== 'complete') {
    // eslint-disable-next-line no-console
    // console.error(
    //   'You attempted to read the value of a CSS variable before all app resources were loaded! Move calls to getCSSVariableAs* outside of the top level scope of your components.',
    // );
  }

  const variable = getComputedStyle(document.body)
    .getPropertyValue(variableName)
    .trim();
  if (isEmpty(variable)) {
    // eslint-disable-next-line no-console
    console.warn(`CSS variable "${variableName}" not found!`);
    return null;
  }
  return variable;
};

export const getCSSVariableAsString = (variableName) =>
  CSSVariable(variableName);

// Coerce the CSS variable to a number
export const getCSSVariableAsNumber = (variableName) =>
  parseFloat(CSSVariable(variableName));
