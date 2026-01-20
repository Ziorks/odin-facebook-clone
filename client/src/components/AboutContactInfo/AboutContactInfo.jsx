import { useContext, useState } from "react";
import { useOutletContext } from "react-router-dom";
import AuthContext from "../../contexts/AuthContext";
import useDataFetch from "../../hooks/useDataFetch";
import AboutForm from "../AboutForm";
import AboutDisplay from "../AboutDisplay";
import { YEARS, MONTHS } from "../../utils/constants";
// import styles from "./AboutContactInfo.module.css";

function MultiStringForm({
  handleClose,
  onSuccess,
  stringArr,
  label,
  fieldName,
  inputType,
  max,
}) {
  const { user } = useOutletContext();
  const [values, setValues] = useState(stringArr || [""]);
  const [changesMade, setChangesMade] = useState(false);

  const url = `/users/${user.id}/about_contact_info`;
  const errMsg = `${fieldName} edit error`;
  const loadingMsg = `Updating ${label}...`;

  return (
    <AboutForm
      handleClose={handleClose}
      onSuccess={onSuccess}
      method={"PUT"}
      url={url}
      data={{ [fieldName]: values }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
      disableSave={!changesMade}
    >
      {values.map((value, i) => {
        const id = `${fieldName}_${i}`;
        return (
          <div key={i}>
            <label htmlFor={id}>{label}</label>{" "}
            <input
              type={inputType}
              name={id}
              id={id}
              value={value}
              autoComplete="off"
              onChange={(e) => {
                setValues((prev) => prev.toSpliced(i, 1, e.target.value));
                if (!changesMade) setChangesMade(true);
              }}
            />
          </div>
        );
      })}
      {values.length < max && (
        <button
          type="button"
          onClick={() => setValues((prev) => [...prev, ""])}
        >
          Add {label}
        </button>
      )}
    </AboutForm>
  );
}

function MultiStringDisplay({
  stringArr,
  refetch,
  label,
  fieldName,
  inputType,
  max,
}) {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const renderEditForm = (handleClose) => (
    <MultiStringForm
      onSuccess={() => {
        refetch();
        handleClose();
      }}
      handleClose={handleClose}
      stringArr={stringArr}
      label={label}
      fieldName={fieldName}
      inputType={inputType}
      max={max}
    />
  );
  const isCurrentUser = user.id === auth.user.id;
  const lowerLabel = label.toLowerCase();
  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };

  return (
    <>
      {stringArr.length > 0 ? (
        <AboutDisplay renderEditForm={renderEditForm}>
          <p>{label}s</p>
          {stringArr.map((string, i) => (
            <p key={i}>{string}</p>
          ))}
        </AboutDisplay>
      ) : isCurrentUser ? (
        showForm ? (
          <MultiStringForm
            handleClose={handleClose}
            onSuccess={onSuccess}
            fieldName={fieldName}
            label={label}
            inputType={inputType}
            max={max}
          />
        ) : (
          <button onClick={() => setShowForm(true)}>
            Add {/[aeiou]/i.test(label[0]) ? "an" : "a"} {lowerLabel}
          </button>
        )
      ) : (
        <p>No {lowerLabel}s to show</p>
      )}
    </>
  );
}

function GenderForm({ handleClose, onSuccess, gender }) {
  const { user } = useOutletContext();
  const [value, setValue] = useState(gender ?? undefined);
  const [changesMade, setChangesMade] = useState(false);

  const method = "PUT";
  const url = `/users/${user.id}/about_contact_info`;
  const errMsg = `gender edit error`;
  const loadingMsg = "Updating Gender...";

  return (
    <AboutForm
      handleClose={handleClose}
      onSuccess={onSuccess}
      method={method}
      url={url}
      data={{ gender: value || null }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
      disableSave={!changesMade}
    >
      <div>
        <label htmlFor="value">Gender</label>
        <select
          name="value"
          id="value"
          value={value}
          onChange={(e) => {
            setValue(e.target.value || undefined);
            if (!changesMade) setChangesMade(true);
          }}
        >
          <option value={""}>Gender</option>
          <option value={"MALE"}>Male</option>
          <option value={"FEMALE"}>Female</option>
          <option value={"OTHER"}>Other</option>
        </select>
      </div>
    </AboutForm>
  );
}

function GenderDisplay({ gender, refetch }) {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const renderEditForm = (handleClose) => (
    <GenderForm
      onSuccess={() => {
        refetch();
        handleClose();
      }}
      handleClose={handleClose}
      gender={gender}
    />
  );
  const isCurrentUser = user.id === auth.user.id;
  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };

  return (
    <>
      {gender ? (
        <AboutDisplay renderEditForm={renderEditForm}>
          <p>
            {gender.slice(0, 1).toUpperCase() + gender.slice(1).toLowerCase()}
          </p>
          <p>Gender</p>
        </AboutDisplay>
      ) : isCurrentUser ? (
        showForm ? (
          <GenderForm handleClose={handleClose} onSuccess={onSuccess} />
        ) : (
          <button onClick={() => setShowForm(true)}>Add your gender</button>
        )
      ) : (
        <p>No gender to show</p>
      )}
    </>
  );
}

function BirthdayForm({ handleClose, onSuccess, birthday }) {
  const { user } = useOutletContext();
  const [month, setMonth] = useState(birthday?.month ?? undefined);
  const [day, setDay] = useState(birthday?.day ?? undefined);
  const [year, setYear] = useState(birthday?.year ?? undefined);
  const [changesMade, setChangesMade] = useState(false);

  const method = "PUT";
  const url = `/users/${user.id}/about_contact_info`;
  const errMsg = "birthday edit error";
  const loadingMsg = "Updating Birthday...";

  return (
    <AboutForm
      handleClose={handleClose}
      onSuccess={onSuccess}
      method={method}
      url={url}
      data={{
        birthday: {
          month: month || null,
          day: day || null,
          year: year || null,
        },
      }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
      disableSave={!changesMade}
    >
      <div>
        <label htmlFor="month">Month</label>
        <select
          name="month"
          id="month"
          value={month}
          onChange={(e) => {
            const value = +e.target.value || undefined;
            const nDays = value ? MONTHS[value - 1].nDays : undefined;
            setMonth(value);
            if (day > nDays || !value) {
              setDay(nDays);
            }
            if (!changesMade) setChangesMade(true);
          }}
        >
          <option value={""}>Month</option>
          {MONTHS.map((month, i) => (
            <option key={i} value={i + 1}>
              {month.name}
            </option>
          ))}
        </select>
      </div>
      {month && (
        <div>
          <label htmlFor="day">Day</label>
          <select
            name="day"
            id="day"
            value={day}
            onChange={(e) => {
              setDay(+e.target.value || undefined);
              if (!changesMade) setChangesMade(true);
            }}
          >
            <option value={""}>Day</option>
            {Array.from({ length: MONTHS[month - 1].nDays }).map((_, i) => (
              <option key={i} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label htmlFor="year">Year</label>
        <select
          name="year"
          id="year"
          value={year}
          onChange={(e) => {
            setYear(+e.target.value || undefined);
            if (!changesMade) setChangesMade(true);
          }}
        >
          <option value={""}>Year</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </AboutForm>
  );
}

function BirthdayDisplay({ birthday, refetch }) {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const [showForm, setShowForm] = useState(false);
  const renderEditForm = (handleClose) => (
    <BirthdayForm
      onSuccess={() => {
        refetch();
        handleClose();
      }}
      handleClose={handleClose}
      birthday={birthday}
    />
  );
  const isCurrentUser = user.id === auth.user.id;
  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };

  return (
    <>
      {birthday.month || birthday.year ? (
        <AboutDisplay renderEditForm={renderEditForm}>
          <p>
            {birthday.month && MONTHS[birthday.month - 1].name}
            {birthday.day && ` ${birthday.day}`}
            {birthday.month && birthday.year && ", "}
            {birthday.year}
          </p>
          <p>Birthday</p>
        </AboutDisplay>
      ) : isCurrentUser ? (
        showForm ? (
          <BirthdayForm handleClose={handleClose} onSuccess={onSuccess} />
        ) : (
          <button onClick={() => setShowForm(true)}>Add your birthday</button>
        )
      ) : (
        <p>No birthday to show</p>
      )}
    </>
  );
}

function AboutContactInfo() {
  const { user } = useOutletContext();
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_contact_info`,
  );

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>An error occured while fetching data. Please try again</p>}
      {data && (
        <>
          <h3>Contact info</h3>
          <MultiStringDisplay
            stringArr={data.phoneNumbers}
            refetch={refetch}
            fieldName={"phoneNumbers"}
            label={"Phone Number"}
            inputType={"tel"}
            max={5}
          />
          <MultiStringDisplay
            stringArr={data.emails}
            refetch={refetch}
            fieldName={"emails"}
            label={"Email"}
            inputType={"email"}
            max={5}
          />

          <h3>Websites and social links</h3>
          <MultiStringDisplay
            stringArr={data.websites}
            refetch={refetch}
            fieldName={"websites"}
            label={"Website"}
            inputType={"url"}
            max={5}
          />
          <MultiStringDisplay
            stringArr={data.socialLinks}
            refetch={refetch}
            fieldName={"socialLinks"}
            label={"Social Link"}
            inputType={"url"}
            max={5}
          />

          <h3>Basic info</h3>
          <GenderDisplay gender={data.gender} refetch={refetch} />

          <BirthdayDisplay birthday={data.birthday} refetch={refetch} />

          <MultiStringDisplay
            stringArr={data.languages}
            refetch={refetch}
            fieldName={"languages"}
            label={"Language"}
            inputType={"text"}
            max={20}
          />
        </>
      )}
    </>
  );
}

export default AboutContactInfo;
