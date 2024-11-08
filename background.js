/*A Background service worker is loaded when it is needed, and uploaded when it goes IdleDeadline. ie.
* the extension is first installed or updated to a new version
* the background page was listening for an event, and the event is dispatched.
a content script of other extension sends a message.
*/

// ---------------this is like----
// let data = {
//   event: "onstop/onstart",
//   prefs: {
//     locaitonid: "123",
//     startdate: "2023-02-02",
//     endDate: "2023-02-03",
//   },
// };
// ------------------------------------
import { fetchLocations } from "./api/fetchLocation.js";
import { fetchOpenSlots } from "./api/fetchOpenSlots.js";
import { createNotification } from "./lib/createNotification.js";

const ALARM_JOB_NAME = "DROP_ALARM";
let cachedPrefs = {};
let firstAppTimeStamp = null;

chrome.runtime.onInstalled.addListener((details) => {
  handleOnStop();
  fetchLocations();
});

chrome.runtime.onMessage.addListener((data) => {
  const { event, prefs } = data;
  switch (event) {
    case "onStop":
      handleOnStop();
      break;
    case "onStart":
      handleOnStart(prefs);
      break;
    default:
      console.warn("Unknown event type received:", event);
      break;
  }
});

const handleOnStop = () => {
  console.log("Stopping background tasks");
  setRunningStatus(false);
  stopAlarm();
  cachedPrefs = {};
  firstAppTimeStamp = null;
};

const handleOnStart = (prefs) => {
  console.log("Starting with prefs:", prefs);
  cachedPrefs = prefs;
  chrome.storage.local.set({ prefs });
  setRunningStatus(true);
  createAlarm();
};

const setRunningStatus = (isRunning) => {
  chrome.storage.local.set({ isRunning });
};

const createAlarm = () => {
  chrome.alarms.get(ALARM_JOB_NAME, (existingAlarm) => {
    if (!existingAlarm) {
      openSlotsJob();
      chrome.alarms.create(ALARM_JOB_NAME, { periodInMinutes: 1 });
    }
  });
};

const stopAlarm = () => {
  chrome.alarms.clearAll();
};

chrome.alarms.onAlarm.addListener(() => {
  console.log("Scheduled alarm triggered");
  openSlotsJob();
});

const openSlotsJob = () => {
  fetchOpenSlots(cachedPrefs).then((data) => handleOpenSlots(data));
};

const handleOpenSlots = (openSlots) => {
  if (openSlots && openSlots.length > 0) {
    const newTimestamp = openSlots[0].timestamp;
    if (newTimestamp !== firstAppTimeStamp) {
      firstAppTimeStamp = newTimestamp;
      createNotification(openSlots[0], openSlots.length, cachedPrefs);
    }
  }
};
