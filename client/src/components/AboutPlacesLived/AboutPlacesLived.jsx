import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetch from "../../hooks/useDataFetch";
import AboutForm from "../AboutForm";
import AboutDisplay from "../AboutDisplay";
import { capitalizeFirstLetters } from "../../utils/helperFunctions";
import { YEARS } from "../../utils/constants";
// import styles from "./AboutPlacesLived.module.css";

export function CityForm({
  handleClose,
  onSuccess,
  city,
  isCurrentCity,
  isHometown,
}) {
  if (isCurrentCity && isHometown) {
    <h1>
      {`ERROR: The 'isCurrentCity' and 'isHometown' props for the CityForm component can't both be true.`}
    </h1>;
  }
  const { user } = useOutletContext();
  const [name, setName] = useState(city?.name ?? "");
  const [yearMoved, setYearMoved] = useState(city?.yearMoved ?? undefined);
  const [changesMade, setChangesMade] = useState(false);

  const method = city ? "PUT" : "POST";
  const url = `/users/${user.id}/city${city ? "/" + city.id : ""}`;
  const errMsg = `city ${city ? "edit" : "creation"} error`;
  const loadingMsg = `${city ? "Updating" : "Creating"} City Record...`;

  return (
    <AboutForm
      handleClose={handleClose}
      onSuccess={onSuccess}
      method={method}
      url={url}
      data={{
        name,
        yearMoved: yearMoved || null,
        isHometown,
        isCurrentCity,
      }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
      disableSave={!changesMade}
    >
      <div>
        <label htmlFor="name">City</label>
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          autoComplete="off"
          onChange={(e) => {
            setName(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
          required
        />
      </div>
      {!(isCurrentCity || isHometown) && (
        <div>
          {<span>Year moved </span>}
          <select
            name="yearMoved"
            id="yearMoved"
            value={yearMoved}
            onChange={(e) => {
              setYearMoved(+e.target.value || undefined);
              if (!changesMade) setChangesMade(true);
            }}
          >
            <option value={0}>Year</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      )}
    </AboutForm>
  );
}

function UniqueCityDisplay({ city, isCurrentCity, isHometown, refetch }) {
  if (isCurrentCity && isHometown) {
    <h1>
      {`ERROR: The 'isCurrentCity' and 'isHometown' props for the UniqueCityDisplay component can't both be true.`}
    </h1>;
  }
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);

  const isCurrentUser = user.id === auth.user.id;
  const label = isCurrentCity ? "current city" : "hometown";

  const renderEditForm = (handleClose) => (
    <CityForm
      onSuccess={() => {
        refetch();
        handleClose();
      }}
      handleClose={handleClose}
      city={city}
      isCurrentCity={isCurrentCity}
      isHometown={isHometown}
    />
  );
  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };

  return (
    <>
      {city ? (
        <AboutDisplay
          key={city.id}
          onDelete={refetch}
          deleteUrl={`/users/${user.id}/city/${city.id}`}
          deleteErrMsg={`${label} delete error`}
          deleteConfirmMsg={`Are you sure you want to delete '${city.name}' forever?`}
          renderEditForm={renderEditForm}
        >
          <p>{city.name}</p>
          <p>{capitalizeFirstLetters(label)}</p>
        </AboutDisplay>
      ) : isCurrentUser ? (
        showForm ? (
          <CityForm
            handleClose={handleClose}
            onSuccess={onSuccess}
            isCurrentCity={isCurrentCity}
            isHometown={isHometown}
          />
        ) : (
          <button onClick={() => setShowForm(true)}>Add your {label}</button>
        )
      ) : (
        <p>No {label} to show</p>
      )}
    </>
  );
}

function PlacesLivedDisplay({ cities, refetch }) {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);

  const isCurrentUser = user.id === auth.user.id;
  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };

  return (
    <>
      {isCurrentUser &&
        cities.length < 20 &&
        (showForm ? (
          <CityForm handleClose={handleClose} onSuccess={onSuccess} />
        ) : (
          <button onClick={() => setShowForm(true)}>Add a city</button>
        ))}
      {cities.length > 0 ? (
        <>
          {cities.map((city) => (
            <AboutDisplay
              key={city.id}
              onDelete={refetch}
              deleteUrl={`/users/${user.id}/city/${city.id}`}
              deleteErrMsg={"city delete error"}
              deleteConfirmMsg={`Are you sure you want to delete '${city.name}' forever?`}
              renderEditForm={(handleClose) => (
                <CityForm
                  onSuccess={() => {
                    refetch();
                    handleClose();
                  }}
                  handleClose={handleClose}
                  city={city}
                />
              )}
            >
              <p>{city.name}</p>
              {city.yearMoved && <p>Moved in {city.yearMoved}</p>}
            </AboutDisplay>
          ))}
        </>
      ) : (
        <>{!isCurrentUser && <p>No cities to show</p>}</>
      )}
    </>
  );
}

function AboutPlacesLived() {
  const { user } = useOutletContext();
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_places_lived`,
  );

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <h3>Places Lived</h3>
          <PlacesLivedDisplay cities={data.cities} refetch={refetch} />

          <UniqueCityDisplay
            city={data.currentCity}
            isCurrentCity={true}
            refetch={refetch}
          />

          <UniqueCityDisplay
            city={data.hometown}
            isHometown={true}
            refetch={refetch}
          />
        </>
      )}
    </>
  );
}

export default AboutPlacesLived;
