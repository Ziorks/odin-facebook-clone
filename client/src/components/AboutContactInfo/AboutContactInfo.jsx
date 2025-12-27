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
  refetch,
  stringArr,
  label,
  fieldName,
  inputType,
  max,
}) {
  const { user } = useOutletContext();
  const [values, setValues] = useState(stringArr || [""]);

  const url = `/users/${user.id}/about_contact_info`;
  const errMsg = `${fieldName} edit error`;
  const loadingMsg = `Updating ${label}...`;

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={"PUT"}
      url={url}
      data={{ [fieldName]: values }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
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
              onChange={(e) =>
                setValues((prev) => prev.toSpliced(i, 1, e.target.value))
              }
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
  isCurrentUser,
  label,
  fieldName,
  inputType,
  max,
}) {
  const [showForm, setShowForm] = useState(false);
  const renderEditForm = (handleClose) => (
    <MultiStringForm
      refetch={refetch}
      handleClose={handleClose}
      stringArr={stringArr}
      label={label}
      fieldName={fieldName}
      inputType={inputType}
      max={max}
    />
  );

  return (
    <>
      {stringArr.length > 0 ? (
        <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
          <p>{label}s</p>
          {stringArr.map((string, i) => (
            <p key={i}>{string}</p>
          ))}
        </AboutDisplay>
      ) : isCurrentUser ? (
        showForm ? (
          <MultiStringForm
            handleClose={() => setShowForm(false)}
            refetch={refetch}
            fieldName={fieldName}
            label={label}
            inputType={inputType}
            max={max}
          />
        ) : (
          <button onClick={() => setShowForm(true)}>
            Add {/[aeiou]/i.test(label[0]) ? "an" : "a"} {label}
          </button>
        )
      ) : (
        <p>No {label.toLowerCase()}s to show</p>
      )}
    </>
  );
}

function GenderForm({ handleClose, refetch, gender }) {
  const { user } = useOutletContext();
  const [value, setValue] = useState(gender ?? undefined);

  const method = "PUT";
  const url = `/users/${user.id}/about_contact_info`;
  const errMsg = `gender edit error`;
  const loadingMsg = "Updating Gender...";

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
      method={method}
      url={url}
      data={{ gender: value || null }}
      errMsg={errMsg}
      loadingMsg={loadingMsg}
    >
      <div>
        <label htmlFor="value">Gender</label>
        <select
          name="value"
          id="value"
          value={value}
          onChange={(e) => setValue(e.target.value || undefined)}
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

function GenderDisplay({ gender, refetch, isCurrentUser }) {
  const [showForm, setShowForm] = useState(false);
  const renderEditForm = (handleClose) => (
    <GenderForm refetch={refetch} handleClose={handleClose} gender={gender} />
  );

  return (
    <>
      {gender ? (
        <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
          <p>
            {gender.slice(0, 1).toUpperCase() + gender.slice(1).toLowerCase()}
          </p>
          <p>Gender</p>
        </AboutDisplay>
      ) : (
        isCurrentUser &&
        (showForm ? (
          <GenderForm
            handleClose={() => setShowForm(false)}
            refetch={refetch}
          />
        ) : (
          <button onClick={() => setShowForm(true)}>Add your gender</button>
        ))
      )}
    </>
  );
}

function BirthdayForm({ handleClose, refetch, birthday }) {
  const { user } = useOutletContext();
  const [month, setMonth] = useState(birthday?.month ?? undefined);
  const [day, setDay] = useState(birthday?.day ?? undefined);
  const [year, setYear] = useState(birthday?.year ?? undefined);

  const method = "PUT";
  const url = `/users/${user.id}/about_contact_info`;
  const errMsg = "birthday edit error";
  const loadingMsg = "Updating Birthday...";

  return (
    <AboutForm
      handleClose={handleClose}
      refetch={refetch}
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
            onChange={(e) => setDay(+e.target.value || undefined)}
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
          onChange={(e) => setYear(+e.target.value || undefined)}
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

function BirthdayDisplay({ birthday, refetch, isCurrentUser }) {
  const [showForm, setShowForm] = useState(false);
  const renderEditForm = (handleClose) => (
    <BirthdayForm
      refetch={refetch}
      handleClose={handleClose}
      birthday={birthday}
    />
  );

  return (
    <>
      {birthday.month || birthday.year ? (
        <AboutDisplay refetch={refetch} renderEditForm={renderEditForm}>
          <p>
            {birthday.month && MONTHS[birthday.month - 1].name}
            {birthday.day && ` ${birthday.day}`}
            {birthday.month && birthday.year && ", "}
            {birthday.year}
          </p>
          <p>Birthday</p>
        </AboutDisplay>
      ) : (
        isCurrentUser &&
        (showForm ? (
          <BirthdayForm
            handleClose={() => setShowForm(false)}
            refetch={refetch}
          />
        ) : (
          <button onClick={() => setShowForm(true)}>Add your birthday</button>
        ))
      )}
    </>
  );
}

function AboutContactInfo() {
  const { user } = useOutletContext();
  const { auth } = useContext(AuthContext);
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_contact_info`,
  );

  const isCurrentUser = user.id === auth.user.id;

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
            isCurrentUser={isCurrentUser}
            fieldName={"phoneNumbers"}
            label={"Phone Number"}
            inputType={"tel"}
            max={5}
          />
          <MultiStringDisplay
            stringArr={data.emails}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
            fieldName={"emails"}
            label={"Email"}
            inputType={"email"}
            max={5}
          />

          <h3>Websites and social links</h3>
          <MultiStringDisplay
            stringArr={data.websites}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
            fieldName={"websites"}
            label={"Website"}
            inputType={"url"}
            max={5}
          />
          <MultiStringDisplay
            stringArr={data.socialLinks}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
            fieldName={"socialLinks"}
            label={"Social Link"}
            inputType={"url"}
            max={5}
          />

          <h3>Basic info</h3>
          <GenderDisplay
            gender={data.gender}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
          />

          <BirthdayDisplay
            birthday={data.birthday}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
          />

          <MultiStringDisplay
            stringArr={data.languages}
            refetch={refetch}
            isCurrentUser={isCurrentUser}
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
