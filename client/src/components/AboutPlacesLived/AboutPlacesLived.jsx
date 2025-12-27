import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetch from "../../hooks/useDataFetch";
import AboutForm from "../AboutForm";
import AboutDisplay from "../AboutDisplay";
import { capitalizeFirstLetters } from "../../utils/helperFunctions";
import { YEARS } from "../../utils/constants";
// import styles from "./AboutPlacesLived.module.css";

const CITY_TYPES = ["PLACELIVED", "CURRENTCITY", "HOMETOWN"];
const CITY_TYPES_STRING = CITY_TYPES.reduce((prev, cur, i) => {
  if (i === CITY_TYPES.length - 1) {
    return prev + `or '${cur}'`;
  }
  return prev + `'${cur}', `;
}, "");

function CityForm({ handleClose, refetch, city, type }) {
  const { user } = useOutletContext();
  const [name, setName] = useState(city?.name ?? "");
  const [yearMoved, setYearMoved] = useState(city?.yearMoved ?? undefined);

  const method = city ? "PUT" : "POST";
  const url = `/users/${user.id}/city${city ? "/" + city.id : ""}`;
  const errMsg = `${type} ${city ? "edit" : "creation"} error`;
  const loadingMsg = `${city ? "Updating" : "Creating"} City Record...`;

  if (!CITY_TYPES.includes(type)) {
    return (
      <h1>
        {`ERROR: a 'type' prop is required for the CityForm component. Values for the 'type' prop can be one of ${CITY_TYPES_STRING}`}
      </h1>
    );
  }

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={method}
      url={url}
      data={{
        name,
        yearMoved: yearMoved || null,
        isHometown: type === "HOMETOWN",
        isCurrentCity: type === "CURRENTCITY",
      }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
    >
      <div>
        <label htmlFor="name">City</label>
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      {type === "PLACELIVED" && (
        <div>
          {<span>Year moved </span>}
          <select
            name="yearMoved"
            id="yearMoved"
            value={yearMoved}
            onChange={(e) => setYearMoved(+e.target.value || undefined)}
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

function UniqueCityDisplay({ city, type, refetch, isCurrentUser }) {
  const { user } = useOutletContext();
  const [showForm, setShowForm] = useState(false);

  let label;

  switch (type) {
    case "HOMETOWN":
      label = "hometown";
      break;
    case "CURRENTCITY":
      label = "current city";
      break;
    default:
      return (
        <h1>
          Invalid 'type' prop: '{type}' provided to UniqueCityDisplay component.
          Type can either be 'HOMETOWN' or 'CURRENTCITY'
        </h1>
      );
  }

  return (
    <>
      {city ? (
        <AboutDisplay
          key={city.id}
          refetch={refetch}
          deleteUrl={`/users/${user.id}/city/${city.id}`}
          deleteErrMsg={`${label} delete error`}
          deleteConfirmMsg={`Are you sure you want to delete '${city.name}' forever?`}
          renderEditForm={(handleClose) => (
            <CityForm
              refetch={refetch}
              handleClose={handleClose}
              city={city}
              type={type}
            />
          )}
        >
          <p>{city.name}</p>
          <p>{capitalizeFirstLetters(label)}</p>
        </AboutDisplay>
      ) : isCurrentUser ? (
        showForm ? (
          <CityForm
            handleClose={() => setShowForm(false)}
            refetch={refetch}
            type={type}
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

function PlacesLivedDisplay({ cities, refetch, isCurrentUser }) {
  const { user } = useOutletContext();
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      {isCurrentUser &&
        cities.length < 20 &&
        (showForm ? (
          <CityForm
            handleClose={() => setShowForm(false)}
            refetch={refetch}
            type={"PLACELIVED"}
          />
        ) : (
          <button onClick={() => setShowForm(true)}>Add a city</button>
        ))}
      {cities.length > 0 ? (
        <>
          {cities.map((city) => (
            <AboutDisplay
              key={city.id}
              refetch={refetch}
              deleteUrl={`/users/${user.id}/city/${city.id}`}
              deleteErrMsg={"city delete error"}
              deleteConfirmMsg={`Are you sure you want to delete '${city.name}' forever?`}
              renderEditForm={(handleClose) => (
                <CityForm
                  refetch={refetch}
                  handleClose={handleClose}
                  city={city}
                  type={"PLACELIVED"}
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
  const { auth } = useContext(AuthContext);
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_places_lived`,
  );

  const isCurrentUser = user.id === auth.user.id;

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <h3>Places Lived</h3>
          <PlacesLivedDisplay
            cities={data.cities}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
          />

          <UniqueCityDisplay
            city={data.currentCity}
            type={"CURRENTCITY"}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
          />

          <UniqueCityDisplay
            city={data.hometown}
            type={"HOMETOWN"}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
          />
        </>
      )}
    </>
  );
}

export default AboutPlacesLived;
