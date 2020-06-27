import React, { useEffect, useState } from "react";
import UsersList from "../components/UsersList";

import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

const Users = () => {
  const [isLoading, error, sendRequest, clearError] = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState(false);
  /*
  useEffect with empty dependency array is somewhat equivalent to componentDidMount, meaning,
  first render will happen before the code in useEffect with [] is executed, and we will have no
  users to show.
  */
  useEffect(() => {
    const fetchUsers = async () => {
      sendRequest("http://localhost:5000/api/users")
        .then((responseData) => {
          setLoadedUsers(responseData.users);
        })
        .catch((error) => {
          console.log(error);
        }); //default is GET without headers or body
      /* we reach here whether we catch and error or not. because catching an error doesnt stop execution. */
    };
    fetchUsers();
  }, [sendRequest]);
  /*
   thats why its important to wrap sendRequest in useCallback in the http-hook,
   because in this way we wont recreate the function every time the Users component rerenders:
   every rerender of this component leads to applying the hooks again, hence 
    recreating the sendRequest function, unless we wrap it in useCallback. every
    recreation of the sendRequest leads to invoking useEffect function again because 
    it depends on sendRequest, and in useEffect we change Users component state which
    results in rerendering of this component. and we get infinite rerender cycle.
   */

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </React.Fragment>
  );
};

export default Users;
