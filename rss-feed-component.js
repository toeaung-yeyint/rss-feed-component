/**
 * Converts a 12-hour time format string to a 24-hour time format.
 *
 * @param {string} timeString - The time string in 12-hour format (e.g., "02:30 PM").
 * @returns {{hours: number, minutes: number}} An object containing the hours and minutes in 24-hour format.
 */
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

/**
 * Calculates the duration in minutes between two given times in 24-hour format.
 *
 * @param {Object} startTimeIn24HourFormat - The start time in 24-hour format.
 * @param {Object} endTimeIn24HourFormat - The end time in 24-hour format.
 * @returns {number} The duration in minutes between the start and end times.
 */
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

/**
 * Converts a JavaScript Date object to a Luxon DateTime object with the specified time zone.
 *
 * @param {Date} originalDateTime - The original JavaScript Date object to be converted.
 * @param {string} zone - The time zone to be applied to the Luxon DateTime object.
 * @returns {luxon.DateTime} The converted Luxon DateTime object with the specified time zone.
 */
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

/**
 * Returns the image URL based on the provided title.
 *
 * @param {string} title - The title to check for specific keywords.
 * @returns {string} The corresponding image URL based on the title.
 */
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

/**
 * Fetches events from an RSS feed URL and parses them into a structured format.
 *
 * @param {string} rssFeedUrl - The URL of the RSS feed to fetch events from.
 * @returns {Promise<Array<Object>|string>} A promise that resolves to an array of event objects or a string message if no items are found.
 * @throws {Error} Throws an error if the HTTP request fails.
 */
const fetchEventsFromRssFeed = async (rssFeedUrl) => {
	const response = await fetch(rssFeedUrl);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	const str = await response.text();
	const data = new DOMParser().parseFromString(str, "text/html");
	const items = data.querySelectorAll("item");
	if (items.length <= 0) {
		return [];
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

/**
 * Creates and appends event cards to the events list.
 *
 * @param {Array} paginatedEvents - An array of event objects to be displayed.
 */
const createEventsCards = async (paginatedEvents) => {
	const fragment = document.createDocumentFragment();
	paginatedEvents.forEach((event) => {
		const eventCard = document.createElement("li");
		eventCard.classList.add("event-card");
		const eventLink = document.createElement("a");
		eventLink.href = event.link;
		eventLink.target = "_blank";
		eventCard.appendChild(eventLink);
		const eventImage = document.createElement("img");
		eventImage.classList.add("event-image");
		eventImage.src = getImageUrl(event.title);
		eventImage.alt = "";
		eventLink.appendChild(eventImage);
		const eventInfo = document.createElement("div");
		eventInfo.classList.add("event-info");
		eventLink.appendChild(eventInfo);
		const eventTitle = document.createElement("h3");
		eventTitle.classList.add("event-title");
		eventTitle.textContent = event.title;
		eventInfo.appendChild(eventTitle);
		const eventDate = document.createElement("p");
		eventDate.classList.add("event-date");
		eventDate.textContent = event.startDate;
		eventInfo.appendChild(eventDate);
		const eventStartTime = document.createElement("p");
		eventStartTime.classList.add("event-start-time");
		eventStartTime.textContent = event.starTimeWithAustralianTimeZone;
		eventInfo.appendChild(eventStartTime);
		const eventDuration = document.createElement("p");
		eventDuration.classList.add("event-duration");
		eventDuration.textContent = `Duration: ${event.duration} minutes`;
		eventInfo.appendChild(eventDuration);
		const eventLocation = document.createElement("p");
		eventLocation.classList.add("event-location");
		eventLocation.textContent = event.location;
		eventInfo.appendChild(eventLocation);
		fragment.appendChild(eventCard);
	});
	const eventsList = document.querySelector(".events-list");
	eventsList.appendChild(fragment);
};

/**
 * Display the range of events currently being shown and the total number of events.
 *
 * @param {Array} allEvents - An array containing all event objects.
 * @param {number} startEventIndex - The index of the first event being displayed.
 * @param {number} endEventIndex - The index of the last event being displayed.
 */
const showResultSummary = (allEvents, startEventIndex, endEventIndex) => {
	const resultSummary = document.querySelector(".results-summary");
	resultSummary.textContent = `Displaying ${startEventIndex + 1} to ${
		endEventIndex < allEvents.length ? endEventIndex : allEvents.length
	} of ${allEvents.length} results`;
};

/**
 * Creates pagination buttons and handles pagination logic for displaying events.
 *
 * @param {Array} allEvents - An array of all event objects.
 * @param {number} cardLimit - The number of events to display per page.
 */
const createPagination = (allEvents, cardLimit) => {
	const paginationList = document.querySelector(".pagination-list");
	const totalPages = Math.ceil(allEvents.length / cardLimit);
	for (let i = 0; i < totalPages; i++) {
		const paginationItem = document.createElement("button");
		paginationItem.classList.add("pagination-item");
		paginationItem.textContent = i + 1;
		paginationList.appendChild(paginationItem);
		if (i === 0) {
			paginationItem.classList.add("active-item");
			paginationItem.setAttribute(
				"aria-label",
				`Page ${i + 1} of ${totalPages}, active page.`
			);
		} else {
			paginationItem.setAttribute(
				"aria-label",
				`Page ${i + 1} of ${totalPages}`
			);
		}
		paginationItem.addEventListener("click", (e) => {
			const activeItem = document.querySelector(".active-item");
			activeItem.classList.remove("active-item");
			e.target.classList.add("active-item");
			currentPage = e.target.textContent;
			const startEventIndex = (currentPage - 1) * cardLimit;
			const endEventIndex = startEventIndex + cardLimit;
			const paginatedEvents = allEvents.slice(startEventIndex, endEventIndex);
			const eventsList = document.querySelector(".events-list");
			eventsList.textContent = "";
			createEventsCards(paginatedEvents);
			showResultSummary(allEvents, startEventIndex, endEventIndex);
		});
	}
};

/**
 * Display the latest fetch time in the format "DD hh:mm a".
 * The fetch time is converted to a Luxon DateTime object before formatting.
 */
const getlatestFetchTime = () => {
	const lastUpdatedElement = document.querySelector(".rss-feed-last-updated");
	const latestFetchTime = convertToLuxonDateTimeObject(new Date()).toFormat(
		"DD hh:mm a"
	);
	lastUpdatedElement.textContent = `Last updated: ${latestFetchTime}`;
};

/**
 * Display a message indicating that no events are available in the results summary and sets the last updated timestamp to "N/A".
 */
const displayNoEventsMessage = () => {
	const resultsSummary = document.querySelector(".results-summary");
	resultsSummary.innerHTML = `No events available. 
    Visit <strong><a class='anchor_underline' href='https://talent.deakin.edu.au/leap/events.html' target='_blank'>our events page</a></strong> to explore what else is on.`;
	const lastUpdatedElement = document.querySelector(".rss-feed-last-updated");
	lastUpdatedElement.textContent = "Last updated: N/A";
};

/**
 * Displays an error message in the results summary and sets the last updated timestamp to "N/A".
 *
 * @param {string} error - The error message to be displayed.
 */
const displayErrorMessage = (error) => {
	const resultsSummary = document.querySelector(".results-summary");
	resultsSummary.textContent = `${error}`;
	const lastUpdatedElement = document.querySelector(".rss-feed-last-updated");
	lastUpdatedElement.textContent = "Last updated: N/A";
};

/**
 * Renders the event section by fetching events from an RSS feed, displaying them, paginating them,
 * and displaying a results summary based on the current page..
 *
 * @param {number} currentPage - The current page number to display.
 * @param {string} rssFeedUrl - The URL of the RSS feed to fetch events from.
 * @param {number} cardLimit - The number of event cards to display per page.
 * @returns {Promise<void>} A promise that resolves when the event section has been rendered.
 *
 * @throws Will throw an error if there is an issue fetching events from the RSS feed.
 */
const renderEventSection = async (currentPage, rssFeedUrl, cardLimit) => {
	try {
		const allEvents = await fetchEventsFromRssFeed(rssFeedUrl);
		if (allEvents.length === 0) {
			displayNoEventsMessage();
			return;
		}
		const startEventIndex = (currentPage - 1) * cardLimit;
		const endEventIndex = startEventIndex + cardLimit;
		const paginatedEvents = allEvents.slice(startEventIndex, endEventIndex);
		createEventsCards(paginatedEvents);
		showResultSummary(allEvents, startEventIndex, endEventIndex);
		createPagination(allEvents, cardLimit);
		getlatestFetchTime();
	} catch (error) {
		displayErrorMessage(error);
	}
};

// Set initial current page number
let currentPage = 1;
// Get RSS feed URL and card limit from the DOM
const rssFeedUrl = document.querySelector(".events-list").dataset.rssUrl;
const cardLimit = Number.parseInt(
	document.querySelector(".events-list").dataset.cardLimit
);
// Render an event section
renderEventSection(currentPage, rssFeedUrl, cardLimit);
