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
const getImageUrl = (title) => {
	switch (true) {
		case title.toLowerCase().includes("linkedin"):
			return "linkedin.jpg";
		case title.toLowerCase().includes("career options"):
			return "career-options.jpg";
		case title.toLowerCase().includes("job search"):
			return "job-search.jpg";
		case title.toLowerCase().includes("interview success"):
			return "interview-success.jpg";
		case title.toLowerCase().includes("strong application"):
			return "strong-application.jpg";
		case title.toLowerCase().includes("beyond the degree"):
			return "beyond-degree.jpg";
		case title.toLowerCase().includes("are you graduating soon?"):
			return "graduating.jpg";
		case title.toLowerCase().includes("coffee meetup"):
			return "coffee-meetup.jpg";
		case title.toLowerCase().includes("looking for casual or part-time work"):
			return "casual-part-time-work.jpg";
		case title.toLowerCase().includes("australian workplace culture"):
			return "australian-work-culture.jpg";
		case title.toLowerCase().includes("know your working rights"):
			return "working-rights.jpg";
		case title.toLowerCase().includes("employer month"):
			return "employer-month.jpg";
		default:
			return "generic-banner.jpg";
	}
};
const fetchEventsFromRssFeed = async (rssFeedUrl) => {
	const response = await fetch(rssFeedUrl);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const str = await response.text();
	const data = new DOMParser().parseFromString(str, "text/html");
	const items = data.querySelectorAll("item");
	if (items.length <= 0) {
		return "No items found";
	}
	const result = [];
	items.forEach((item) => {
		const link = item.querySelector("guid").textContent;
		const title = item.querySelector("title").textContent;
		const details = new DOMParser().parseFromString(
			item.querySelector("description").textContent,
			"text/html"
		).body;
		const startDate = details
			.querySelector(".entry-dynamicstrings_days .feed-entry-value")
			.textContent.split(/ at | - /)[0]
			.split("-")
			.slice(0, 2)
			.join(" ");
		const startTimeStr = details
			.querySelector(".entry-dynamicstrings_days .feed-entry-value")
			.textContent.split(/ at | - /)[1];
		const starTimeWithAustralianTimeZone = convertToLuxonDateTimeObject(
			new Date(startDate + " " + startTimeStr),
			"Australia/Sydney"
		)
			.toFormat("hh:mm a '('ZZZZZ')'")
			.replace("(Australian Eastern Standard Time)", "AEST")
			.replace("(Australian Eastern Daylight Time)", "AEDT");
		const eventTimeStr = details
			.querySelector(".entry-dynamicstrings_days .feed-entry-value")
			.textContent.split(/ at | - /)[2];
		const duration = calculateDurationInMinutes(
			convertTo24HourFormat(startTimeStr),
			convertTo24HourFormat(eventTimeStr)
		);
		const location = details.querySelector(
			".entry-dynamicstrings_location .feed-entry-value"
		).textContent;
		result.push({
			link,
			title,
			startDate,
			starTimeWithAustralianTimeZone,
			duration,
			location,
		});
	});
	return result;
};
