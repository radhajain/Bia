var appSettings = require("application-settings");


var DAY_IN_MS = 86400000;
var MIN_IN_MS = 60000;
var MINS_IN_DAY = 1440;

/* **********************************
/* * 		USEFUL FUNCTIONS		*
/* **********************************

/* export: setlastTimePillTaken
 * ----------------
 * Sets when pill was last taken.
 */
exports.setlastTimePillTaken = function () {
	var today = new Date();
	today.setHours(9);
	today.setMinutes(11);
	appSettings.setString('lastTimePillTaken', JSON.stringify(today));
}

/* export: getlastTimePillTaken
 * ----------------
 * Sets when pill was last taken.
 */
exports.getlastTimePillTaken = function () {
	var time = new Date(JSON.parse(appSettings.getString('lastTimePillTaken')));
	return time;
}

/* export: getGreeting
 * ----------------
 */

exports.getGreeting = function () {
	var today = new Date();
	var curHr = today.getHours();
	if (curHr < 12) {
		//Can randomize with others too
		return ('Good morning, ')
	} else if (curHr < 18) {
		return ('Good afternoon, ')
	} else {
		return ('Good evening, ')
	}
}


/* export: getCycleDay
 * ----------------
 * Gets the user's day in their cycle
 */
exports.getCycleDay = function () {
	var today = new Date();
	var firstDay = new Date(JSON.parse(appSettings.getString('firstDay')));
	var sinceFirstDay = Math.round(Math.abs((today.getTime() - firstDay.getTime()) / DAY_IN_MS));
	return (sinceFirstDay % 28);
}


/* export: isOnPeriod
 * ----------------
 * Returns whether or not the user is on their period
 */
exports.isOnPeriod = function () {
	if (ComputeUtil.getCycleDay() > exports.getPeriodLength()) {
		return false;
	} else {
		return true;
	}
}

/* export: minsTillBirthControl
 * ----------------
 * Returns the number of minutes until the user has to take their birth control
 */
exports.minsTillBirthControl = function () {
	var birthControlTime = exports.getBirthControlTime();
	var bcToday = new Date();
	bcToday.setHours(birthControlTime.getHours(), birthControlTime.getMinutes(), 0);
	var today = new Date();;
	var minutesTillBirthControl = Math.round((bcToday - today) / MIN_IN_MS);
	console.log("minutes till birth fcontrol " + minutesTillBirthControl);
	return minutesTillBirthControl;
}




/* **********************************
/* * GETTERS AND SETTERS USER INFO	*
/* **********************************
/* Contains: First cycle day, Period length, name, birth control time
*/

/* export: setDoesGetPeriod
 * ----------------
 * Sets whether the user gets the period or not -- boolean
 */
exports.setDoesGetPeriod = function (getsPeriod) {
	appSettings.setBoolean('getsPeriod', getsPeriod);
}

/* export: getDoesGetPeriod
 * ----------------
 * Sets whether the user gets the period or not -- boolean
 */
exports.getDoesGetPeriod = function () {
	return appSettings.getBoolean('getsPeriod');
}



/* export: setFirstCycleDay
 * ----------------
 * Sets the user's first day in their cycle
 */
exports.setFirstCycleDay = function (date) {
	appSettings.setString('firstDay', JSON.stringify(date));
};

/* export: getCycleDay
 * ----------------
 * Returns the user's first day (ever) in their cycle
 */
exports.getFirstCycleDay = function () {
	return new Date(JSON.parse(appSettings.getString('firstDay')));
};

/* export: setPeriodLength
 * ----------------
 * Sets the user's usual period length
 */
exports.setPeriodLength = function (numDays) {
	appSettings.setString('periodLength', JSON.stringify(numDays));
};

/* export: getPeriodLength
 * ----------------
 * Returns the length of a users period (number)
 */
exports.getPeriodLength = function (numDays) {
	return JSON.parse(appSettings.getString('periodLength'));
};

/* export: setBirthControlTime
 * ----------------
 * Sets the user's chosen birthcontrol time
 */
exports.setBirthControlTime = function (time) {
	// new Date(year, month, day, hours, minutes, seconds, milliseconds)
	var dateTime = new Date(2018, 1, 1);
	dateTime.setHours(time.getHours(), time.getMinutes(), 0);
	appSettings.setString('bctime', JSON.stringify(dateTime));
};


/* export: getBirthControlTime
 * ----------------
 * Gets the user's chosen birth control time
 */
exports.getBirthControlTime = function () {
	//what is returned if bctime is not set?
	var BCtime = new Date(JSON.parse(appSettings.getString('bctime')));
	if (BCtime) {
		return BCtime;
	} else {
		var defaultTime = new Date(2018, 1, 1, 9, 30);
		exports.setBirthControlTime(defaultTime);
		return defaultTime;
	}
};

/* export: setBirthControlType
 * ----------------
 * Sets the user's chosen form of contraceptive
 */
exports.setBirthControlType = function (type) {
	appSettings.setString('bctype', type);
};

/* export: getBirthControlTime
 * ----------------
 * Gets the user's chosen form of contraceptive
 */
exports.getBirthControlType = function () {
	return (appSettings.getString('bctype'));
};

/* export: setName
 * ---------------
 * Sets the user's name in memory
 */
exports.setName = function (newName) {
	appSettings.setString('name', newName);
};

/* export: getName
 * ---------------
 * Retrieves the user's name
 */
exports.getName = function () {
	return appSettings.getString('name');
};





/* **********************************
/* * 	BEHIND THE SCENES STUFF		*
/* **********************************



/* export: isOnboardingComplete
 * ---------------
 * Checks if the user has finished in-app onboarding yet
 */
exports.isOnboardingComplete = function () {
	return appSettings.getBoolean('onboardingComplete');
};

/* export: setOnboardingComplete
 * ----------------
 * Sets the boolean 'onboardingComplete' to true which means the user doesn't need to go through pre-app
 * onboarding anymore.
 */
exports.setOnboardingComplete = function () {
	if (exports.getName() && exports.getPeriodLength() && exports.getFirstCycleDay() && exports.getBirthControlType()) {
		appSettings.setBoolean('onboardingComplete', true);
	}
};

/* export: clearData
 * ----------------
 * Clears data in user base
 */
exports.clearData = function () {
	StorageUtil.setName("");
	StorageUtil.setPeriodLength("");
	StorageUtil.setFirstCycleDay("");
}