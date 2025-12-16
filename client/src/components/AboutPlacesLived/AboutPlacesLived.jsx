import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetch from "../../hooks/useDataFetch";
import useApiPrivate from "../../hooks/useApiPrivate";
import Modal from "../Modal";
// import styles from "./AboutPlacesLived.module.css";

const currentYear = new Date().getFullYear();
const years = Array.from(
  { length: currentYear - 1900 + 1 },
  (_, i) => currentYear - i,
);

const CITY_TYPES = ["PLACELIVED", "CURRENTCITY", "HOMETOWN"];
const CITY_TYPES_STRING = CITY_TYPES.reduce((prev, cur, i) => {
  if (i === CITY_TYPES.length - 1) {
    return prev + `or '${cur}'`;
  }
  return prev + `'${cur}', `;
}, "");

function CityForm({ handleClose, refetch, city, type }) {
  const api = useApiPrivate();
  const { user } = useOutletContext();
  const [name, setName] = useState(city?.name ?? "");
  const [yearMoved, setYearMoved] = useState(city?.yearMoved ?? undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState(null);

  if (!CITY_TYPES.includes(type)) {
    return (
      <h1>
        {`ERROR: a 'type' prop is required for the CityForm component. Values for the 'type' prop can be one of ${CITY_TYPES_STRING}`}
      </h1>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors(null);
    setIsLoading(true);

    api({
      method: city ? "PUT" : "POST",
      url: `/users/${user.id}/city${city ? "/" + city.id : ""}`,
      data: {
        name,
        yearMoved,
        isHometown: type === "HOMETOWN",
        isCurrentCity: type === "CURRENTCITY",
      },
    })
      .then(() => {
        refetch();
        handleClose();
      })
      .catch((err) => {
        console.error(`${type} ${city ? "edit" : "creation"} error`, err);

        if (err.response?.status === 400) {
          setErrors(err.response.data.errors);
        } else {
          setErrors([
            { msg: err.response?.data?.message || "Something went wrong." },
          ]);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {isLoading && <p>Creating City Record...</p>}
      {errors && (
        <ul>
          {errors.map((error, i) => (
            <li key={i}>{error.msg}</li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit}>
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
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <button onClick={handleClose}>Cancel</button>
          <button type="submit">Save</button>
        </div>
      </form>
    </>
  );
}

function City({ refetch, city, type }) {
  const api = useApiPrivate();
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!CITY_TYPES.includes(type)) {
    return (
      <h1>
        {`ERROR: a 'type' prop is required for the City component. Values for the 'type' prop can be one of ${CITY_TYPES_STRING}`}
      </h1>
    );
  }

  const handleDelete = () => {
    setError(null);
    setIsLoading(true);

    api
      .delete(`/users/${user.id}/city/${city.id}`)
      .then(() => {
        refetch();
      })
      .catch((err) => {
        console.error(`${type} delete error`, err);

        setError(err.response?.data?.message || "Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <>
      {showDeleteModal && (
        <Modal handleClose={() => setShowDeleteModal(false)}>
          <p>Are you sure you want to delete '{city.name}' forever?</p>
          <div>
            <button onClick={handleDelete} disabled={isLoading}>
              DELETE
            </button>
            <button
              onClick={() => setShowDeleteModal(false)}
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
          {isLoading && <p>Deleting...</p>}
          {error && <p>An error occured. Please try again.</p>}
        </Modal>
      )}
      {showEditForm ? (
        <CityForm
          handleClose={() => setShowEditForm(false)}
          refetch={refetch}
          city={city}
          type={type}
        />
      ) : (
        <div>
          <p>{city.name}</p>
          {type === "CURRENTCITY" ? (
            <p>Current city</p>
          ) : type === "HOMETOWN" ? (
            <p>Hometown</p>
          ) : (
            type === "PLACELIVED" &&
            city.yearMoved && <p>Moved in {city.yearMoved}</p>
          )}
          {auth.user.id === user.id && (
            <>
              <button onClick={() => setShowEditForm(true)}>Edit</button>
              <button onClick={() => setShowDeleteModal(true)}>Delete</button>
            </>
          )}
        </div>
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
  const [showPlaceLivedForm, setShowPlaceLivedForm] = useState(false);
  const [showHometownForm, setShowHometownForm] = useState(false);
  const [showCurrentCityForm, setShowCurrentCityForm] = useState(false);

  const isCurrentUser = user.id === auth.user.id;

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          {isCurrentUser &&
            (showPlaceLivedForm ? (
              <CityForm
                handleClose={() => setShowPlaceLivedForm(false)}
                refetch={refetch}
                type={"PLACELIVED"}
              />
            ) : (
              <button onClick={() => setShowPlaceLivedForm(true)}>
                Add city
              </button>
            ))}
          {data.cities.length > 0 ? (
            data.cities.map((city) => (
              <City
                key={city.id}
                refetch={refetch}
                city={city}
                type={"PLACELIVED"}
              />
            ))
          ) : (
            <p>No city information</p>
          )}
          {data.hometown ? (
            <City city={data.hometown} refetch={refetch} type={"HOMETOWN"} />
          ) : (
            isCurrentUser &&
            (showHometownForm ? (
              <CityForm
                handleClose={() => setShowHometownForm(false)}
                refetch={refetch}
                type={"HOMETOWN"}
              />
            ) : (
              <button onClick={() => setShowHometownForm(true)}>
                Add hometown
              </button>
            ))
          )}
          {data.currentCity ? (
            <City
              city={data.currentCity}
              refetch={refetch}
              type={"CURRENTCITY"}
            />
          ) : (
            isCurrentUser &&
            (showCurrentCityForm ? (
              <CityForm
                handleClose={() => setShowCurrentCityForm(false)}
                refetch={refetch}
                type={"CURRENTCITY"}
              />
            ) : (
              <button onClick={() => setShowCurrentCityForm(true)}>
                Add current city
              </button>
            ))
          )}
        </>
      )}
    </>
  );
}

export default AboutPlacesLived;
