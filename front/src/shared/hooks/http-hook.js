import { useState, useEffect, useCallback, useRef } from "react";
/*
With use callback we ensure this function never gets recreated once the component
using it gets rerendered.
*/
export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const activeHttpRequests = useRef([]); //stores data across rerender cycles

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      try {
        setIsLoading(true);
        const httpAbortController = new AbortController();
        activeHttpRequests.current.push(httpAbortController);
        /* useRef always wraps the data it gets with an object that has an
        current property */
        const response = await fetch(url, {
          method: method,
          body,
          headers,
          signal: httpAbortController.signal, //links the AbortController to this request
        });
        const responseData = await response.json();
        activeHttpRequests.current = activeHttpRequests.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortController
        );

        if (!response.ok) {
          throw new Error(responseData.message);
        }
        setIsLoading(false);
        return responseData;
      } catch (error) {
        setError(error.message);
        setIsLoading(false);
        throw error; //so the component using our hook has a chance to know that something went wrong.
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    return () => {
      activeHttpRequests.current.forEach((abortCtrl) => abortCtrl.abort());
    };
    /*
    the purpose of this function is to never with a request that is on its
    way out if we switch away from the component that triggers the request 
    */
  }, []);
  /*
  when we return a function from useEffect, the returned fucntion is executed as a cleanup function
  before the next time useEffect runs again or also when the component that uses useEffect unmounts (which is
  the component that uses our custom hook)
*/

  return [isLoading, error, sendRequest, clearError];
};
