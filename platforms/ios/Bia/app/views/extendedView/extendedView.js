"use strict";
var application = require("application");
var observable = require("data/observable");
var pageData = new observable.Observable();
var StorageUtil = require("~/util/StorageUtil");
var ComputeUtil = require("~/util/ComputeUtil");
var InfoUtil = require("~/util/InfoUtil");
var frameModule = require("ui/frame");
var platform = require("platform");
var Label = require("ui/label").Label;
var layout = require("ui/layouts/grid-layout");
var [GridLayout, GridUnitType, ItemSpec] = [layout.GridLayout, layout.GridUnitType, layout.ItemSpec];
var gestures = require("ui/gestures");

var pageData;
var page;
var pageHeight;
var calendar;
var DAYS = ["M", "Tu", "W", "Th", "F", "S", "S"];
var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var currDate;
var cycleDay;
var MONTH_ENUM = 0;
var MINS_IN_DAY = 1440;


exports.pageLoaded = function (args) {
	page = args.object;
	page.bindingContext = pageData;
	pageHeight = platform.screen.mainScreen.heightDIPs;
	cycleDay = ComputeUtil.getCycleDay();
	calendar = page.getViewById("calendar");
	var observer = page.observe(gestures.GestureTypes.swipe, function (args) {
		//If swipe up on the screen, go to home page
		if (args.direction == 8) {
			frameModule.topmost().navigate({
				moduleName: 'views/homeView/homeView',
				animated: true,
				transition: {
					name: "slideBottom",
					duration: 450,
					curve: "easeIn"
				}
			});
		}
	});
	initCalendar();
	initWeek();
	initBirthControl();
	initQuote();
	initFormatting();
	initNumber();
};

function initNumber() {
	str = "res://" + cycleDay + " Small";
	pageData.set("number", str);
}

function initWeek() {
	var week = "You are currently on week " + ComputeUtil.getCycleWeek() + " of your cycle."
	pageData.set("weekDesc", week);
}


//Since page is a scroll view, cannot dynamically set height in CSS
function initFormatting() {
	var stackPage = page.getViewById("stackPage");
	stackPage.height = 1.25 * pageHeight;
}


//Set's up the static aspects of the calendar (e.g. Weekday Labels and arrows)
function initCalendar() {
	calendar = page.getViewById("calendar");
	calendar.height = 0.4 * pageHeight;
	var today = new Date();
	initDayLabels();
	renderCalendar(today);
}

//Column headers (e.g. Monday, Tuesday....)
function initDayLabels() {
	for (var i = 0; i < 7; i++) {
		var dayCell = new Label();
		dayCell.text = DAYS[i];
		dayCell.class = "dayHeaders";
		calendar.addChild(dayCell);
		GridLayout.setRow(dayCell, 1);
		GridLayout.setColumn(dayCell, i);
	}
}


//Sets up the dynamic aspects of calendar (dates, month labels). Recalled by prender prev/next month
function renderCalendar(date) {
	currDate = date;
	var monthIndex = date.getMonth();
	var year = date.getFullYear();
	initMonthTitle(monthIndex, year);
	initDates(monthIndex, year);
}

//Month label
function initMonthTitle(monthIndex, year) {
	var monthTitle = new Label();
	monthTitle.text = MONTHS[monthIndex] + " " + year.toString().substr(-2);
	monthTitle.class = "monthTitle";
	calendar.addChild(monthTitle);
	GridLayout.setRow(monthTitle, 0);
	GridLayout.setColumn(monthTitle, 1);
	GridLayout.setColumnSpan(monthTitle, 5);
}


//Adds dates to the calendar, tracking today's date and the date of the last period
//TODO: change ovulation date to start of cycle
function initDates(monthIndex, year) {
	if (StorageUtil.getDoesGetPeriod()) {
		var periodLength = parseInt(StorageUtil.getPeriodLength(), 10);
		//Current month:
		var periodStartDate = addDays(StorageUtil.getPeriodStartDay(), MONTH_ENUM * 28);
		var periodEndDate = addDays(periodStartDate, periodLength - 1);
		//Next Month:
		var periodStartDate2 = addDays(periodStartDate, 28);
		var periodEndDate2 = addDays(periodStartDate2, periodLength - 1);
		//Previous month:
		var periodStartDate3 = subtractDays(periodStartDate, 28);
		var periodEndDate3 = addDays(periodStartDate3, periodLength - 1);
	}
	//This month?
	console.log("first day of cycle at " + StorageUtil.getFirstCycleDay());
	var cycleStartDate = addDays(StorageUtil.getFirstCycleDay(), MONTH_ENUM * 28);
	var cycleStartDate2 = addDays(cycleStartDate, 28);
	var cycleStartDate3 = subtractDays(cycleStartDate, 28);

	// ---*****Need to log period dates for every month (28-day cycle)***-----

	var monthDay = new Date(year, monthIndex, 1); //The first of the month
	var dateOfFirst = monthDay.getDay(); //e.g. 3 = Wednesday
	var offset = 1 - (dateOfFirst - 1); //Number of days to show prior to the 1st
	var numWeeks;

	if (dateOfFirst === 0) { //if the first falls on a sunday, then include the previous week
		numWeeks = Math.ceil((dateOfFirst + 7 - 1 + daysInMonth(monthIndex + 1, year)) / 7);
		monthDay.setDate(offset - 7);
	} else {
		numWeeks = Math.ceil((dateOfFirst - 1 + daysInMonth(monthIndex + 1, year)) / 7);
		monthDay.setDate(offset);
	}
	var today = new Date();

	for (var week = 2; week < 2 + numWeeks; week++) {
		var row = week;
		for (var i = 0; i < 7; i++) {
			var dayCell = new Label();
			dayCell.text = monthDay.getDate();
			calendar.addChild(dayCell);
			GridLayout.setRow(dayCell, row);
			GridLayout.setColumn(dayCell, i);
			if (monthDay.getMonth() !== monthIndex) {
				dayCell.class = "cell inactive"; //if in the previous/next month, set to inactive.
			} else {
				dayCell.class = "cell active";
			}
			if (StorageUtil.getDoesGetPeriod() && (dateBetween(periodStartDate, periodEndDate, monthDay) ||
					dateBetween(periodStartDate2, periodEndDate2, monthDay) ||
					dateBetween(periodStartDate3, periodEndDate3, monthDay))) {
				dayCell.class += " period";
			}
			if (dateEquals(monthDay, cycleStartDate) ||
				dateEquals(monthDay, cycleStartDate2) ||
				dateEquals(monthDay, cycleStartDate3)) {
				dayCell.class += " ovulation";
			}
			if (dateEquals(monthDay, today)) {
				dayCell.class += " circle";
			}

			monthDay.setDate(monthDay.getDate() + 1);
		}
	}
}

//Left arrow
exports.renderPrevMonth = function () {
	var monthIndex = currDate.getMonth()
	currDate.setMonth(monthIndex - 1);
	MONTH_ENUM -= 1;
	clearCalendar();
	renderCalendar(currDate);
}

//Right arrow
exports.renderNextMonth = function () {
	var monthIndex = currDate.getMonth();
	currDate.setMonth(monthIndex + 1);
	MONTH_ENUM += 1;
	clearCalendar();
	renderCalendar(currDate);
}




/*****************************/
/* CALENDAR HELPER FUNCTIONS */
/*****************************/

function addDays(date, days) {
	var result = new Date(date);
	result.setDate(result.getDate() + days);
	return result;
}

function subtractDays(date, days) {
	var result = new Date(date);
	result.setDate(result.getDate() - days);
	return result;
}

function daysInMonth(month, year) {
	return new Date(year, month, 0).getDate();
}


function dateEquals(firstDate, secondDate) {
	if (firstDate.getFullYear() == secondDate.getFullYear() && firstDate.getMonth() == secondDate.getMonth() && firstDate.getDate() == secondDate.getDate()) {
		return true;
	} else {
		return false;
	}
}

function dateBetween(first, second, between) {
	if (first <= between && between <= second) {
		return true;
	}
	return false;
}

function clearCalendar() {
	console.log("Cleeaing calendar");
	var clearMonth = new Label();
	clearMonth.text = "";
	clearMonth.class = "erase";
	calendar.addChild(clearMonth);
	GridLayout.setRow(clearMonth, 0);
	GridLayout.setColumn(clearMonth, 1);
	GridLayout.setColumnSpan(clearMonth, 5);

	for (var row = 2; row < 8; row++) {
		for (var col = 0; col < 7; col++) {
			var clearCell = new Label();
			clearCell.text = "";
			clearCell.class = "erase";
			calendar.addChild(clearCell);
			GridLayout.setRow(clearCell, row);
			GridLayout.setColumn(clearCell, col);
		}
	}
}



function sameDay(d1, d2) {
	return d1.getMonth() === d2.getMonth() &&
		d1.getDate() === d2.getDate();
}

function yesterday(d1, d2) {
	return d1.getMonth() === d2.getMonth() &&
		(d1.getDate() - 1) === d2.getDate();
}


function printHourMins(countdownMins) {
	var hours = Math.floor(countdownMins / 60);
	var mins = countdownMins % 60;
	var bcTime;
	if (hours > 0) {
		if (mins > 0) {
			bcTime = hours + " hrs " + mins + " mins";
		} else {
			bcTime = hours + " hrs";
		}
	} else {
		bcTime = mins + " mins";
	}
	return bcTime;
}


//TODO: modify so that corresponds with pill state
function initBirthControl() {
	var timeToTakePill = ComputeUtil.printSimpleBCTime();
	var type = StorageUtil.getBirthControlType();
	var msg = "You are currently taking the " + type + " pill, usually taken at " + timeToTakePill + ". \n \n";
	// Countdown element

	//StorageUtil.minsTillBirthControl assumes you took the pill as normal yesterday/today

	var countdownMins = StorageUtil.minsTillBirthControl();
	var bcTime;
	//normal, asap, two-asap, tomorrow, twoToday, newPackToday
	var nextPillState = InfoUtil.nextPillAt();
	if (nextPillState == "normal") {
		msg += "Scheduled to be taken in:";
		bcTime = printHourMins(countdownMins);
	} else if (nextPillState == "asap") {
		msg += "To be protected, take your pill within the next:";
		var minsTillBCLateEnd = ComputeUtil.minsTillBCLateEnd();
		bcTime = printHourMins(minsTillBCLateEnd);
		page.getViewById("countdown").className = "countdownAlert";
	} else if (nextPillState == "two-asap") {
		msg += "Take two pills:";
		bcTime = "ASAP";
		page.getViewById("countdown").className = "countdownAlert";
	} else if (nextPillState == "twoTomorrow" || nextPillState == "twoToday") {
		msg += "Take two pills in:"
		bcTime = printHourMins(countdownMins);
	} else if (nextPillState == "newPackToday") {
		msg += "Take the first pill from your new pack in:"
		bcTime = printHourMins(countdownMins);
	}
	pageData.set("bcTime", bcTime);
	pageData.set("bcText", msg);
}





function initQuote() {
	var fullquote = InfoUtil.getQuote();
	var author = "-" + fullquote.author + "-";
	pageData.set("quote", fullquote.quote);
	pageData.set("author", author);
}


exports.goToSettings = function () {
	frameModule.topmost().navigate('views/settingsView/settingsView');
}