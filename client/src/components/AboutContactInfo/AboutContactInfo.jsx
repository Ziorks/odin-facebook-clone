import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { FaPhone } from "react-icons/fa6";
import { MdOutlineEmail, MdOutlineWeb } from "react-icons/md";
import { PiLinkSimple } from "react-icons/pi";
import { TbCirclesRelation } from "react-icons/tb";
import { LuCake } from "react-icons/lu";
import { GrLanguage } from "react-icons/gr";
import { YEARS, MONTHS } from "../../utils/constants";
import useDataFetch from "../../hooks/useDataFetch";
import AboutForm from "../AboutForm";
import FormInput from "../FormInput";
import AboutDisplay from "../AboutDisplay";
import LoadingAndError from "../LoadingAndError";
import styles from "./AboutContactInfo.module.css";

function MultiStringForm({
  handleClose,
  onSuccess,
  stringArr,
  label,
  fieldName,
  inputType,
  img,
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
      <div className={styles.formContentContainer}>
        {values.map((value, i) => (
          <FormInput
            key={i}
            type={inputType}
            label={label}
            value={value}
            autoComplete="off"
            onChange={(e) => {
              setValues((prev) => prev.toSpliced(i, 1, e.target.value));
              if (!changesMade) setChangesMade(true);
            }}
          />
        ))}
        {values.length < max && (
          <button
            className={styles.addBtn}
            type="button"
            onClick={() => setValues((prev) => [...prev, ""])}
          >
            {img}
            Add {label}
          </button>
        )}
      </div>
    </AboutForm>
  );
}

function MultiStringDisplay({
  stringArr,
  refetch,
  label,
  fieldName,
  inputType,
  img,
  max,
}) {
  const { isCurrentUser } = useOutletContext();
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
      img={img}
      max={max}
    />
  );
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
          <div className={styles.displayContentContainer}>
            {img}
            <div>
              {stringArr.map((string, i) => (
                <p key={i}>{string}</p>
              ))}
              <p>{label}s</p>
            </div>
          </div>
        </AboutDisplay>
      ) : (
        isCurrentUser &&
        (showForm ? (
          <MultiStringForm
            handleClose={handleClose}
            onSuccess={onSuccess}
            fieldName={fieldName}
            label={label}
            inputType={inputType}
            max={max}
          />
        ) : (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            {img}
            Add {/[aeiou]/i.test(label[0]) ? "an" : "a"} {lowerLabel}
          </button>
        ))
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
      <div className={styles.formContentContainer}>
        <div className={styles.selectInputContainer}>
          <label htmlFor="value">Gender</label>
          <FormInput
            type="select"
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
          </FormInput>
        </div>
      </div>
    </AboutForm>
  );
}

function GenderDisplay({ gender, refetch }) {
  const { isCurrentUser } = useOutletContext();
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
  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };

  return (
    <>
      {gender ? (
        <AboutDisplay renderEditForm={renderEditForm}>
          <div className={styles.displayContentContainer}>
            <TbCirclesRelation />
            <div>
              <p>
                {gender.slice(0, 1).toUpperCase() +
                  gender.slice(1).toLowerCase()}
              </p>
              <p>Gender</p>
            </div>
          </div>
        </AboutDisplay>
      ) : (
        isCurrentUser &&
        (showForm ? (
          <GenderForm handleClose={handleClose} onSuccess={onSuccess} />
        ) : (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <TbCirclesRelation />
            Add your gender
          </button>
        ))
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
      <div className={`${styles.formContentContainer} ${styles.birthdayForm}`}>
        <div className={styles.selectInputContainer}>
          <label htmlFor="month">Month</label>
          <FormInput
            type="select"
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
          </FormInput>
        </div>
        {month && (
          <div className={styles.selectInputContainer}>
            <label htmlFor="day">Day</label>
            <FormInput
              type="select"
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
            </FormInput>
          </div>
        )}
        <div className={styles.selectInputContainer}>
          <label htmlFor="year">Year</label>
          <FormInput
            type="select"
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
          </FormInput>
        </div>
      </div>
    </AboutForm>
  );
}

function BirthdayDisplay({ birthday, refetch }) {
  const { isCurrentUser } = useOutletContext();
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
  const handleClose = () => setShowForm(false);
  const onSuccess = () => {
    refetch();
    handleClose();
  };

  return (
    <>
      {birthday.month || birthday.year ? (
        <AboutDisplay renderEditForm={renderEditForm}>
          <div className={styles.displayContentContainer}>
            <LuCake />
            <div>
              <p>
                {birthday.month && MONTHS[birthday.month - 1].name}
                {birthday.day && ` ${birthday.day}`}
                {birthday.month && birthday.year && ", "}
                {birthday.year}
              </p>
              <p>Birthday</p>
            </div>
          </div>
        </AboutDisplay>
      ) : (
        isCurrentUser &&
        (showForm ? (
          <BirthdayForm handleClose={handleClose} onSuccess={onSuccess} />
        ) : (
          <button className={styles.addBtn} onClick={() => setShowForm(true)}>
            <LuCake />
            Add your birthday
          </button>
        ))
      )}
    </>
  );
}

function AboutContactInfo() {
  const { user, isCurrentUser } = useOutletContext();
  const { data, isLoading, error, refetch } = useDataFetch(
    `/users/${user.id}/about_contact_info`,
  );

  return (
    <div className={styles.primaryContainer}>
      <LoadingAndError
        isLoading={isLoading}
        error={error}
        onTryAgain={refetch}
      />
      {data && (
        <>
          <h3>Contact info</h3>
          <MultiStringDisplay
            stringArr={data.phoneNumbers}
            refetch={refetch}
            fieldName={"phoneNumbers"}
            label={"Phone Number"}
            inputType={"tel"}
            img={<FaPhone />}
            max={5}
          />
          <MultiStringDisplay
            stringArr={data.emails}
            refetch={refetch}
            fieldName={"emails"}
            label={"Email"}
            inputType={"email"}
            img={<MdOutlineEmail />}
            max={5}
          />
          {!isCurrentUser &&
            !data.phoneNumbers.length > 0 &&
            !data.emails.length > 0 && <p>No contact info to show</p>}

          <h3>Websites and social links</h3>
          <MultiStringDisplay
            stringArr={data.websites}
            refetch={refetch}
            fieldName={"websites"}
            label={"Website"}
            inputType={"url"}
            img={<MdOutlineWeb />}
            max={5}
          />
          <MultiStringDisplay
            stringArr={data.socialLinks}
            refetch={refetch}
            fieldName={"socialLinks"}
            label={"Social Link"}
            inputType={"url"}
            img={<PiLinkSimple />}
            max={5}
          />
          {!isCurrentUser &&
            !data.websites.length > 0 &&
            !data.socialLinks.length > 0 && (
              <p>No websites or social links to show</p>
            )}

          <h3>Basic info</h3>
          <GenderDisplay gender={data.gender} refetch={refetch} />
          <BirthdayDisplay birthday={data.birthday} refetch={refetch} />
          <MultiStringDisplay
            stringArr={data.languages}
            refetch={refetch}
            fieldName={"languages"}
            label={"Language"}
            inputType={"text"}
            img={<GrLanguage />}
            max={20}
          />
          {!isCurrentUser &&
            !data.gender &&
            !(data.birthday.month || data.birthday.year) &&
            !data.languages.length > 0 && <p>No basic info to show</p>}
        </>
      )}
    </div>
  );
}

export default AboutContactInfo;
