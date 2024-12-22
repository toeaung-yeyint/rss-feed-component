const convertTo24HourFormat = (timeString) => {
	const [time, modifier] = timeString.split(" ");
	let [hours, minutes] = time.split(":").map(Number);
	if (modifier === "PM" && hours !== 12) {
		hours += 12;
	} else if (modifier === "AM" && hours === 12) {
		hours = 0;
	}
	return { hours, minutes };
};
const calculateDurationInMinutes = (
	startTimeIn24HourFormat,
	endTimeIn24HourFormat
) => {
	const startTotalMinutes =
		startTimeIn24HourFormat.hours * 60 + startTimeIn24HourFormat.minutes;
	const endTotalMinutes =
		endTimeIn24HourFormat.hours * 60 + endTimeIn24HourFormat.minutes;
	let durationInMinutes = endTotalMinutes - startTotalMinutes;
	if (durationInMinutes < 0) {
		durationInMinutes += 24 * 60;
	}
	return durationInMinutes;
};
const convertToLuxonDateTimeObject = (originalDateTime, zone) => {
	return luxon.DateTime.fromObject(
		{
			year: originalDateTime.getFullYear(),
			month: originalDateTime.getMonth() + 1,
			day: originalDateTime.getDate(),
			hour: originalDateTime.getHours(),
			minute: originalDateTime.getMinutes(),
		},
		{ zone }
	);
};
