//ELEMENTS

const locationIdElement = document.getElementById("locationId");
const startDateElement = document.getElementById("startDate");
const endDateElement = document.getElementById("endDate");

//BUTTON ELEMENTS
const startButton = document.getElementById("startButton");
const stopButton = document.getElementById("stopButton");

//SPAN LISTINER
const runningSpan = document.getElementById("runningSpan");
const stoppedSpan = document.getElementById("stoppedSpan");

//Error message
const locationIdError = document.getElementById("locationIdError");
const startDateError = document.getElementById("startDateError");
const endDateError = document.getElementById("endDateError");

const hideElement = (elem) => {
  elem.style.display = "none";
};

const showElement = (elem) => {
  elem.style.display = "";
};

const disableElement = (elem) => {
  elem.disabled = true;
};

const enableElement = (elem) => {
  elem.disabled = false;
};

const handleOnStartState = () => {
  //spans
  showElement(runningSpan);
  hideElement(stoppedSpan);

  //buttons
  disableElement(startButton);
  enableElement(stopButton);

  //Inputs
  disableElement(locationIdElement);
  disableElement(startDateElement);
  disableElement(endDateElement);
};

const handleonStopState = () => {
  //Spans
  showElement(stoppedSpan);
  hideElement(runningSpan);
  //buttons
  disableElement(stopButton);
  enableElement(startButton);

  //inputs
  enableElement(locationIdElement);
  enableElement(startDateElement);
  enableElement(endDateElement);
};

const showDateError = (dateErrorElem, errorMessage) => {
  dateErrorElem.innerHTML = errorMessage;
  showElement(dateErrorElem);
};

const validateStartDate = (today, startDate) => {
  const isAfterToday = !startDate.isBefore(today, "date");
  if (!startDateElement.value) {
    // showElement(startDateError);
    showDateError(startDateError, "please enter a valid start date");
  } else if (!isAfterToday) {
    showDateError(startDateError, "Start date must not be before today");
  } else {
    hideElement(startDateError);
  }
  return startDateElement.value && isAfterToday;
};

const validateEndDate = (today, startDate, endDate) => {
  const isAfterStartDate = endDate.isAfter(startDate, "date");
  const isAfterToday = endDate.isAfter(today, "date");

  if (!endDateElement.value) {
    // showElement(endDateError);
    showDateError(endDateError, "please enter the valid end date");
  } else if (!isAfterStartDate) {
    showDateError(endDateError, "End date must be after the start date");
  } else if (!isAfterToday) {
    showDateError(endDateError, "End dat must be after today");
  } else {
    hideElement(endDateError);
  }
  return endDateElement.value && isAfterStartDate && isAfterToday;
};

const validateDate = () => {
  // today <= start date < end date
  const today = spacetime.now().startOf("day");
  const startDate = spacetime(startDateElement.value).startOf("day");
  const endDate = spacetime(endDateElement.value).startOf("day");

  const isStartDateValid = validateStartDate(today, startDate);
  const isEndDateValid = validateEndDate(today, startDate, endDate);

  return isStartDateValid && isEndDateValid;
};

const performOnStartValidations = () => {
  const isDateValid = validateDate();
  if (!locationIdElement.value) {
    showElement(locationIdError);
  } else {
    hideElement(locationIdError);
  }

  // return (
  //   // locationIdElement.value && startDateElement.value && endDateElement.value
  //   locationIdElement.value
  // );

  return locationIdElement.value && isDateValid;
};

startButton.onclick = () => {
  const allFieldsValid = performOnStartValidations();
  if (allFieldsValid) {
    handleOnStartState();
    const prefs = {
      locationId: locationIdElement.value,
      startDate: startDateElement.value,
      endDate: endDateElement.value,
      tzData:
        locationIdElement.options[locationIdElement.selectedIndex].getAttribute(
          "data-tz"
        ),
    };
    chrome.runtime.sendMessage({ event: "onStart", prefs });
  }
};

stopButton.onclick = () => {
  handleonStopState();
  chrome.runtime.sendMessage({
    event: "onStop",
  });
};

chrome.storage.local.get(
  ["locationId", "startDate", "endDate", "locations", "isRunning"],
  (result) => {
    const { locationId, startDate, endDate, locations, isRunning } = result;

    setLocations(locations);

    if (locationId) {
      locationIdElement.value = locationId;
    }

    if (startDate) {
      startDateElement.value = startDate;
    }

    if (endDate) {
      endDateElement.value = endDate;
    }

    // console.log(locations);
    // console.log("Running Status:", isRunning);
    if (isRunning) {
      handleOnStartState();
    } else {
      handleonStopState();
    }
  }
);

const setLocations = (locations) => {
  locations.forEach((location) => {
    let optionElement = document.createElement("option");
    optionElement.value = location.id;
    optionElement.innerHTML = location.name;
    optionElement.setAttribute("data-tz", location.tzData);
    locationIdElement.appendChild(optionElement);
  });
};

const today = spacetime.now().startOf("day").format();
startDateElement.setAttribute("min", today);
endDateElement.setAttribute("min", today);
