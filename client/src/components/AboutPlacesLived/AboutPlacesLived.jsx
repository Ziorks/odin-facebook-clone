import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  IoMapOutline,
  IoLocationOutline,
  IoHomeOutline,
} from "react-icons/io5";
import { YEARS } from "../../utils/constants";
import { capitalizeFirstLetters } from "../../utils/helperFunctions";
import useDataFetch from "../../hooks/useDataFetch";
import AboutForm from "../AboutForm";
import FormInput from "../FormInput";
import AboutDisplay from "../AboutDisplay";
import styles from "./AboutPlacesLived.module.css";

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
      <div className={styles.formContentContainer}>
        <FormInput
          type="text"
          label={
            isCurrentCity ? "Current city" : isHometown ? "Hometown" : "City"
          }
          autoComplete="off"
          required={true}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!changesMade) setChangesMade(true);
          }}
        />
        {!(isCurrentCity || isHometown) && (
          <div className={styles.selectInputContainer}>
            <span>Year moved</span>
            <FormInput
              type="select"
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
            </FormInput>
          </div>
        )}
      </div>
    </AboutForm>
  );
}

function UniqueCityDisplay({ city, isCurrentCity, isHometown, refetch }) {
  if (isCurrentCity && isHometown) {
    <h1>
      {`ERROR: The 'isCurrentCity' and 'isHometown' props for the UniqueCityDisplay component can't both be true.`}
    </h1>;
  }
  const { user, isCurrentUser } = useOutletContext();
  const [showForm, setShowForm] = useState(false);

  const label = isCurrentCity ? "current city" : "hometown";
  const img = isCurrentCity ? <IoLocationOutline /> : <IoHomeOutline />;

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
          deleteConfirmMsg={`Are you sure you want to remove '${city.name}' from your profile?`}
          renderEditForm={renderEditForm}
        >
          <div className={styles.displayContentContainer}>
            {img}
            <div>
              <p>{city.name}</p>
              <p>{capitalizeFirstLetters(label)}</p>
            </div>
          </div>
        </AboutDisplay>
      ) : (
        isCurrentUser &&
        (showForm ? (
          <CityForm
            handleClose={handleClose}
            onSuccess={onSuccess}
            isCurrentCity={isCurrentCity}
            isHometown={isHometown}
          />
        ) : (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            {img}
            Add your {label}
          </button>
        ))
      )}
    </>
  );
}

function PlacesLivedDisplay({ cities, refetch }) {
  const { user, isCurrentUser } = useOutletContext();
  const [showForm, setShowForm] = useState(false);

  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };
  const getRenderEditForm = (city) => {
    return (handleClose) => (
      <CityForm
        onSuccess={() => {
          refetch();
          handleClose();
        }}
        handleClose={handleClose}
        city={city}
      />
    );
  };

  return (
    <>
      {cities.length > 0 && (
        <>
          {cities.map((city) => (
            <AboutDisplay
              key={city.id}
              onDelete={refetch}
              deleteUrl={`/users/${user.id}/city/${city.id}`}
              deleteErrMsg={"city delete error"}
              deleteConfirmMsg={`Are you sure you want to remove '${city.name}' from your profile?`}
              renderEditForm={getRenderEditForm(city)}
            >
              <div className={styles.displayContentContainer}>
                <IoMapOutline />
                <div>
                  <p>{city.name}</p>
                  {city.yearMoved && <p>Moved in {city.yearMoved}</p>}
                </div>
              </div>
            </AboutDisplay>
          ))}
        </>
      )}
      {isCurrentUser &&
        cities.length < 20 &&
        (showForm ? (
          <CityForm handleClose={handleClose} onSuccess={onSuccess} />
        ) : (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <IoMapOutline />
            Add a city
          </button>
        ))}
    </>
  );
}

function AboutPlacesLived() {
  const { user, isCurrentUser } = useOutletContext();
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_places_lived`,
  );

  return (
    <div className={styles.primaryContainer}>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <h3>Places lived</h3>
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

          <PlacesLivedDisplay cities={data.cities} refetch={refetch} />

          {!isCurrentUser &&
            !data.currentCity &&
            !data.hometown &&
            !data.cities.length > 0 && <p>No cities to show</p>}
        </>
      )}
    </div>
  );
}

export default AboutPlacesLived;
