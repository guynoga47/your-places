import React, { useState, useEffect, useContext } from "react";
import { useParams, useHistory } from "react-router-dom";

import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import Card from "../../shared/components/UIElements/Card";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/utils/validators";

import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";

import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

import "./PlaceForm.css";

const UpdatePlace = (props) => {
  const [isLoading, error, sendRequest, clearError] = useHttpClient();
  const [loadedPlace, setLoadedPlace] = useState();
  const history = useHistory();
  const auth = useContext(AuthContext);
  const placeId = useParams().placeId;
  //we wont need to get setFormData on NewPlace because we never need to set the
  //data more then once.
  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: true,
      },
      description: {
        value: "",
        isValid: true,
      },
    },
    true
  );

  /*
  calling setFormData here will cause infinite loop of rerendering.
  because setFormData actually dispatches new action, which changes the state
  and then when UpdatePlace.jsx reevaluates, it meets setFormData again and returns
  a new object (with the same values) that triggers another revaluation and so forth.
  this is why we need useEffect, so we will only set this if setFormData or 
  identifiedPlace changes. setFormData won't change because we wrapped it in useCallback,
  identifiedPlace won't change because on every reevaluation we will find the same item in
  memory (using find(...)) hence getting the same object.
  */
  useEffect(() => {
    const fetchPlace = async () => {
      await sendRequest(`http://localhost:5000/api/places/${placeId}`)
        .then((responseData) => {
          setLoadedPlace(responseData.place);
          setFormData(
            {
              title: {
                value: responseData.place.title,
                isValid: true,
              },
              description: {
                value: responseData.place.description,
                isValid: true,
              },
            },
            true
          );
        })
        .catch(() => {});
    };
    fetchPlace();
  }, [sendRequest, placeId, setFormData]);

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }
  if (!loadedPlace && !error) {
    return (
      <div className="center center">
        <Card>
          <h2>Could not find place!</h2>
        </Card>
      </div>
    );
  }

  const placeUpdateSubmitHandler = async (event) => {
    event.preventDefault();
    await sendRequest(
      `http://localhost:5000/api/places/${placeId}`,
      "PATCH",
      JSON.stringify({
        title: formState.inputs.title.value,
        description: formState.inputs.description.value,
      }),
      { "Content-Type": "application/json" }
    )
      .then(() => {
        history.push(`/${auth.userId}/places`);
      })
      .catch();
  };
  //we are not migrating our form submit handlers to the custom hook useForm
  //because the submission logic is very specific in each of the components
  //that uses useForm.
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <form className={"place-form"} onSubmit={placeUpdateSubmitHandler}>
        <Input
          id="title"
          element="input"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid input."
          onInput={inputHandler}
          initialValue={loadedPlace.title}
          initialValid={true}
        />
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (min. 5 characters)."
          onInput={inputHandler}
          initialValue={loadedPlace.description}
          initialValid={true}
        />
        <Button type="submit" disabled={!formState.isValid}>
          UPDATE PLACE
        </Button>
      </form>
    </React.Fragment>
  );
};

export default UpdatePlace;
