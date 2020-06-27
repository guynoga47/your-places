import { createContext } from "react";

export const AuthContext = createContext({
  isLoggedIn: false,
  userId: null,
  login: () => {},
  logout: () => {},
});

/*
This is only the initial state. 
the actual values we use for the context are defined in the values prop when
defining the authContext.provider component.
*/
