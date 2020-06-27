import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PlaceList from "../components/PlaceList";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";

const UserPlaces = (props) => {
  /*
    useParams hook is used to get the dynamic parameter from the path that triggered the
    rendering of this component. each render of this component is invoked by accessing
    /:userId/places so thats how we fetch the specific userId, and we can filter the list of places
    so it will only contain that userId places.
    */
  const [loadedPlaces, setLoadedPlaces] = useState();
  const [isLoading, error, sendRequest, clearError] = useHttpClient();
  const userId = useParams().userId;

  useEffect(() => {
    const fetchPlaces = async () => {
      sendRequest(`http://localhost:5000/api/places/user/${userId}`)
        .then((responseData) => {
          setLoadedPlaces(responseData.places);
        })
        .catch(() => {});
    };
    fetchPlaces();
  }, [sendRequest, userId]);

  const placeDeleteHandler = (deletedPlaceId) => {
    setLoadedPlaces((prevPlaces) =>
      prevPlaces.filter((place) => place.id !== deletedPlaceId)
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeleteHandler} />
      )}
    </React.Fragment>
  );
};

export default UserPlaces;
