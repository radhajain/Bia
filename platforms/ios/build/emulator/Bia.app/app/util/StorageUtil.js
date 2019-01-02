var appSettings = require("application-settings");
var ComputeUtil = require("~/util/ComputeUtil");
var InfoUtil = require("~/util/InfoUtil");

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
exports.setlastTimePillTaken = function (date) {
	appSettings.setString('lastTimePillTaken', JSON.stringify(date));
}

//Default set the last pill time taken was yesterday if before BC Timte
//Otherwise, to today
exports.setDefaultlastTimePillTaken = function () {
	console.log("setting default last pill date taken...");
	var today = new Date();
	if (!ComputeUtil.beforePillTimeToday()) {
		return appSettings.setString('lastTimePillTaken', JSON.stringify(today));
	} else {
		var bcDate = new Date();
		// this might be broken since using string now not Date object
		bcDate.setDate(today.getDate() - 1);
		appSettings.setString('lastTimePillTaken', JSON.stringify(bcDate));
	}
}

/* export: getlastTimePillTaken
 * ----------------
 * Sets when pill was last taken.
 */
exports.getlastTimePillTaken = function () {
	console.log("getting pill date");
	//not in utc and should be
	var time = new Date(JSON.parse(appSettings.getString('lastTimePillTaken')));
	console.log("last pill taken at " + time);
	return time;
}


/* export: getName
 * ---------------
 * Retrieves the user's name
 */
exports.getPillState = function () {
	return appSettings.getString('pillstate');
};

/* export: getName
 * ---------------
 * Retrieves the user's name
 */
exports.setPillState = function () {
	var BCtime = exports.getBirthControlTime();
	var now = new Date();
	if (exports.getBirthControlType() == "combined") {
		setCombinedPillState(BCtime, now);
	} else {
		setPOPPillState(BCtime, now);
	}
};

function setCombinedPillState(BCtime, now) {
	//If after BCtime today
	if (!ComputeUtil.beforePillTimeToday()) {
		if (ComputeUtil.tookPillToday()) {
			return appSettings.setString('pillstate', "ok");
		}
		if ((now.getHours() - BCtime.getHours()) < InfoUtil.getLatePeriod() && ComputeUtil.tookPillYesterday()) {
			return appSettings.setString('pillstate', "late");
		} else {
			if (ComputeUtil.tookPillYesterday()) {
				return appSettings.setString('pillstate', "missed");
			} else {
				if (ComputeUtil.tookPillDayBeforeYesterday()) {
					return appSettings.setString('pillstate', "missed2");
				} else {
					return appSettings.setString('pillstate', "missed3");
				}
			}
		}
	} else {
		//If before BCTime today
		if (ComputeUtil.tookPillYesterday() || ComputeUtil.tookPillToday()) {
			return appSettings.setString('pillstate', "ok");
		} else {
			if (ComputeUtil.tookPillDayBeforeYesterday()) {
				//Missed yesterday
				return appSettings.setString('pillstate', "missed");
			} else if (ComputeUtil.tookPillThreeDaysAgo()) {
				return appSettings.setString('pillstate', "missed2");
			} else {
				return appSettings.setString('pillstate', "missed3");
			}
		}

	}
}

function setPOPPillState(BCtime, now) {
	if (!ComputeUtil.beforePillTimeToday()) {
		if (ComputeUtil.tookPillToday()) {
			return appSettings.setString('pillstate', "ok");
		}
		if ((now.getHours() - BCtime.getHours()) < InfoUtil.getLatePeriod() && ComputeUtil.tookPillYesterday()) {
			return appSettings.setString('pillstate', "late");
		} else {
			//Did not take pill today
			return appSettings.setString('pillstate', "missed")
		}
	} else {
		//Before pill time today
		if (ComputeUtil.tookPillYesterday()) {
			return appSettings.setString('pillstate', "ok");
		} else {
			return appSettings.setString('pillstate', "missed");
		}
	}
}



/* export: getGreeting
 * ----------------
 * Returns Good Morning, *name* for the appropriate time of day
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



exports.getNotificationEnabled = function () {
	return appSettings.getBoolean("enablePushNotifs");
}


exports.setNotificationEnabled = function (enabled) {
	return appSettings.setBoolean("enablePushNotifs", enabled);
}


exports.setNotificationString = function (msg) {
	return appSettings.setString("notifString", msg);
}

exports.setDefaultNotificationString = function () {
	var msgs = InfoUtil.getNotificationText();
	return appSettings.setString("notifString", msgs[0]);
}

exports.getNotificationString = function (msg) {
	return appSettings.getString("notifString");
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
 * Returns the number of minutes until the user has to take their birth control -- today if before bc time
 * and tomorrow if after bc time
 */
exports.minsTillBirthControl = function () {
	var birthControlTime = exports.getBirthControlTime();
	var bcToday = new Date();
	bcToday.setHours(birthControlTime.getHours(), birthControlTime.getMinutes(), 0);
	var now = new Date();
	var bcTomorrow = new Date();
	bcTomorrow.setHours(birthControlTime.getHours(), birthControlTime.getMinutes(), 0);
	bcTomorrow.setDate(now.getDate() + 1);
	var minutesTillBirthControl = 0;
	if (ComputeUtil.beforePillTimeToday()) {
		//If right now is before I take my birth control today
		minutesTillBirthControl = Math.round((bcToday - now) / MIN_IN_MS);
		//If took pill in the hour before it is due
		if (ComputeUtil.tookPillToday()) {
			minutesTillBirthControl = Math.round((bcTomorrow - now) / MIN_IN_MS);
		}
	} else {
		//If I took my pill today
		minutesTillBirthControl = Math.round((bcTomorrow - now) / MIN_IN_MS);
	}
	console.log("minutes till birth control " + minutesTillBirthControl);
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

/* export: getFirstCycleDay
 * ----------------
 * Returns the user's first date (ever) in their cycle
 */
exports.getFirstCycleDay = function () {
	return new Date(JSON.parse(appSettings.getString('firstDay')));
};


/* export: setPeriodStartDay
 * ----------------
 * Sets the user's first day of their period in their cycle
 */
exports.setPeriodStartDay = function (date) {
	appSettings.setString('firstPeriodDay', JSON.stringify(date));
};

/* export: getPeriodStartDay
 * ----------------
 * Returns the user's first day (ever) of their period in their cycle
 */
exports.getPeriodStartDay = function () {
	return new Date(JSON.parse(appSettings.getString('firstPeriodDay')));
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
exports.getPeriodLength = function () {
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
	var UTCTime = dateTime.toUTCString();
	appSettings.setString('bctimeUTC', JSON.stringify(UTCTime));
	appSettings.setString('bctime', JSON.stringify(dateTime));
};

/* export: setDefaultBCTime
 * ----------------
 * Sets the user's birthcontrol time to 9:00am
 */
exports.setDefaultBCTime = function () {
	var dateTime = new Date(2018, 1, 1);
	dateTime.setHours(9, 0, 0);
	appSettings.setString('bctime', JSON.stringify(dateTime));
}


/* export: getBirthControlTime
 * ----------------
 * Gets the user's chosen birth control time
 */
exports.getBirthControlTime = function () {
	var BCtime = new Date(JSON.parse(appSettings.getString('bctime')));
	var BCtimeUTC = new Date(BCtime.toUTCString());
	if (BCtimeUTC) {
		return BCtimeUTC;
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
	exports.setDefaultlastTimePillTaken();
	console.log("in onborading complete... setting pill state now");
	exports.setPillState();
	// if (exports.getName() && exports.getPeriodLength() && exports.getFirstCycleDay() && exports.getBirthControlType()) {
	appSettings.setBoolean('onboardingComplete', true);
	// }
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
