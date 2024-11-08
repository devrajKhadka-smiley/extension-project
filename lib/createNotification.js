export const createNotification = (openSlot, numberOfSlots, prefs) => {
  const { tzData } = prefs;

  let message = "";
  if (numberOfSlots > 1) {
    message = ` Found an open interview at ${
      openSlot.timestamp
    } (${tzData} timezone)  and ${numberOfSlots - 1} additional open interview`;
  } else {
    message: `Found an open interview at ${openSlot.timestamp} (${tzData} timezone)`;
  }
  chrome.notifications.create({
    title: "Dexter",
    message,
    iconUrl: "/assets/icon-48.png",
    type: "basic",
  });
};

chrome.notifications.onClicked.addListener(() => {
  chrome.tabs.create({ url: "https://www.facebook.com" });
});
