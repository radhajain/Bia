var application = require("application");
var observable = require("data/observable");
var frameModule = require("ui/frame");
var pageData = new observable.Observable();
const DatePicker = require("tns-core-modules/ui/date-picker").DatePicker;
var StorageUtil = require("~/util/StorageUtil");
var gestures = require("ui/gestures");
var dialogs = require("ui/dialogs");

var page;
var pageData;
var currChoice;

exports.pageNavigating = function (args) {
	page = args.object;
	page.bindingContext = pageData;
	pageData.set("showTimePicker", false);
	pageData.set("showDatePicker", false);
	pageData.set("showSave", true);
	initName();
	initPeriodLength();
	initPeriodStart();
	initPeriodOptions();
}

/*********************
INITIATION FUNCTIONS*
*********************/

function initName() {
	var name = StorageUtil.getName();
	pageData.set("name", name);
}

function initPeriodLength() {
	var periodLength = StorageUtil.getPeriodLength();
	pageData.set("periodLength", periodLength);
}

function initPeriodOptions() {
	var doesGetPeriod = StorageUtil.getDoesGetPeriod();
	if (doesGetPeriod) {
		page.getViewById("Yes").className = 'buttonSelected';
	} else {
		page.getViewById("No").className = 'buttonSelected';
	}
}

function initPeriodStart() {
	// TO DO: Should show most recent period start day *******
	var lastPeriodStart = StorageUtil.getFirstCycleDay().toDateString();
	pageData.set("periodStartDay", lastPeriodStart);
	var today = new Date();
	pageData.set("maxDate", today);
}

function initFormatting() {
	var stackPage = page.getViewById("stackPage");
	stackPage.height = 1.7 * pageHeight;
}


/********************
   USER INTERACTIONS
*********************/

exports.selectPillTime = function (args) {
	pageData.set("showTimePicker", true);
	//Don't let the user go back until the dateTime picker is closed 
	pageData.set("showSave", false);
}

exports.onPickerLoaded = function (args) {
	//Auto load picker to the current stored birth control time
	var timePicker = args.object;
	var previousTime = StorageUtil.getBirthControlTime();
	var prevHour = previousTime.getHours();
	var prevMins = previousTime.getMinutes();
	pageData.set("pillTime", prevHour + ":" + prevMins.toString());
	timePicker.hour = prevHour;
	timePicker.minute = prevMins;
}

exports.setTime = function (args) {
	var timePicker = page.getViewById("timePicker");
	pageData.set("pillTime", timePicker.hour + ":" + timePicker.minute.toString());
	var newTime = new Date();
	newTime.setHours(timePicker.hour);
	newTime.setMinutes(timePicker.minute);
	StorageUtil.setBirthControlTime(newTime);
	pageData.set("showTimePicker", false);
	pageData.set("showSave", true);
}


exports.selectPeriodStart = function () {
	pageData.set("showDatePicker", true);
	pageData.set("showSave", false);
}

exports.setDate = function (args) {
	var datePicker = page.getViewById("datePicker");
	pageData.set('showDatePicker', false);
	pageData.set("periodStartDay", datePicker.date.toDateString());
	StorageUtil.setFirstCycleDay(datePicker.date);
	pageData.set("showSave", true);
}

/*********************
SET WHETHER GETS PERIOD*
*********************/


exports.setPeriod = function () {
	var settingsGetsPeriod = StorageUtil.getDoesGetPeriod();
	if (!settingsGetsPeriod) {
		StorageUtil.setDoesGetPeriod(true);
	}
	clearSelected();
	page.getViewById("Yes").className = "buttonSelected";
}


exports.setNoPeriod = function () {
	var settingsGetsPeriod = StorageUtil.getDoesGetPeriod();
	if (settingsGetsPeriod) {
		StorageUtil.setDoesGetPeriod(false);
	}
	clearSelected();
	page.getViewById("No").className = "buttonSelected";
}


function clearSelected() {
	page.getViewById("Yes").className = "buttonOption";
	page.getViewById("No").className = "buttonOption";

}



/*********************
UPDATE & SAVE CHANGES*
*********************/

exports.updateName = function () {
	var enteredName = page.getViewById("name").text;
	StorageUtil.setName(enteredName);
}

exports.updatePeriodLength = function () {
	var enteredPdLength = page.getViewById("periodLength").text;
	StorageUtil.setPeriodLength(enteredPdLength);
}

exports.updateBCTime = function () {
	var timePicker = page.getViewById("timePicker");
	var newTime = new Date();
	newTime.setHours(timePicker.hour);
	newTime.setMinutes(timePicker.minute);
	console.log(newTime.toString());
	StorageUtil.setBirthControlTime(newTime);

}

exports.goToExtendedView = function () {
	exports.updateName();
	exports.updatePeriodLength();
	exports.updateBCTime();

	frameModule.topmost().navigate('views/extendedView/extendedView');
}