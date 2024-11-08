export const fetchOpenSlots = (result) => {
  return new Promise((resolve, reject) => {
    const { locationId, startDate, endDate } = result;
    if (!locationId || !startDate || !endDate) {
      console.error("Incomplete data for fetchOpenSlots. Details:", {
        locationId,
        startDate,
        endDate,
      });
      return reject(
        "Missing required parameters: locationId, startDate, or endDate."
      );
    }

    const appointmentUrl = `https://ttp.cbp.dhs.gov/schedulerapi/locations/${locationId}/slots?startTimestamp=${startDate}T00:00:00&endTimestamp=${endDate}T00:00:00`;

    fetch(appointmentUrl)
      .then((response) => response.json())
      .then((data) => resolve(data.filter((slot) => slot.active > 0)))
      .catch((error) => {
        console.error("Error fetching open slots:", error);
        reject(error);
      });
  });
};
