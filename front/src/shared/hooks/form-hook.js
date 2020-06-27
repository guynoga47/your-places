import { useCallback, useReducer } from "react";

const formReducer = (state, action) => {
  switch (action.type) {
    case "INPUT_CHANGE":
      let formIsValid = true;
      for (const inputId in state.inputs) {
        if (!state.inputs[inputId]) {
          continue;
        }
        if (inputId === action.inputId) {
          formIsValid = formIsValid && action.isValid;
        } else {
          formIsValid = formIsValid && state.inputs[inputId].isValid;
        }
      }
      return {
        ...state,
        inputs: {
          ...state.inputs,
          [action.inputId]: { value: action.value, isValid: action.isValid },
        },
        isValid: formIsValid,
      };
    case "SET_DATA":
      return {
        inputs: action.inputs,
        isValid: action.formIsValid,
      };
    default:
      return state;
  }
};

export const useForm = (initialInputs, initialFormValidity) => {
  const [formState, dispatch] = useReducer(formReducer, {
    inputs: initialInputs,
    isValid: initialFormValidity,
  });

  const inputHandler = useCallback((id, value, isValid) => {
    console.log(id, value, isValid);
    dispatch({
      type: "INPUT_CHANGE",
      value: value,
      isValid: isValid,
      inputId: id,
    });
  }, []);

  const setFormData = useCallback((inputData, formValidity) => {
    dispatch({
      type: "SET_DATA",
      inputs: inputData,
      formIsValid: formValidity,
    });
  }, []);

  return [formState, inputHandler, setFormData];
};

/* Custom hook explanation:
Custom hooks allows you to encapsulate and share stateful component logic.

You can build a hook that uses other built-in hooks (like useState()) and any 
component that uses your hook will then use the built-in hooks you might 
be using in your custom hook as well.

This allows us to build hooks like the useForm() hook we have built.
The idea here is that we can share our stateful form logic (that uses useReducer() in our case) 
across components. This avoids code duplication, makes it easy to change the 
code and leads to more readable code.

With all that "custom hook" jargon, it's easy to overlook that custom hooks in the 
end are normal JavaScript functions though - never forget that!

If you use useForm() in your component function, it will get called for 
every re-evaluation of your component (i.e. for every re-render cycle). 
Hence all the logic in a custom hook runs every time your component function
is executed.


*/
