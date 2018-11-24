var StorageUtil = require("~/util/StorageUtil");
var InfoUtil = require("~/util/InfoUtil");
var DAY_IN_MS = 86400000;
var MIN_IN_MS = 60000;

//This util does computation on dates/times


//Exports an object to print out the BC time
//usage: pageDate.set("bcTime", "You take your pill at " + simpleTime.hours + ":" + simpleTime.min + simpleTime.ampm)
exports.printSimpleTime = function (hours, min) {
    if (min < 10) {
        min = "0" + min
    }
    var ampm = "am";
    if (hours > 12) {
        hours -= 12;
        ampm = "pm";
    }
    var simpleTime = {
        min: min,
        hours: hours,
        ampm: ampm
    };
    return simpleTime;
}

exports.printSimpleBCTime = function () {
    var bcTime = StorageUtil.getBirthControlTime();
    var min = bcTime.getMinutes();
    console.log("mins is: " + min);
    var hours = bcTime.getHours();
    if (min < 10) {
        min = "0" + min
    }
    var ampm = "am";
    if (hours > 12) {
        hours -= 12;
        ampm = "pm";
    }
    var str = hours + ":" + min + ampm;
    return str;
}

//Helper function returns true if right now is before the designated pill time today.
exports.beforePillTimeToday = function () {
    var birthControlTime = StorageUtil.getBirthControlTime();
    var bcToday = new Date();
    bcToday.setHours(birthControlTime.getHours(), birthControlTime.getMinutes(), 0);
    var today = new Date();
    if (today < bcToday) {
        return true;
    }
    return false;
}


exports.minsTillBCLateEnd = function () {
    var now = new Date();
    var birthControlTime = StorageUtil.getBirthControlTime();
    var bcToday = new Date();
    bcToday.setHours(birthControlTime.getHours() + InfoUtil.getLatePeriod());
    bcToday.setMinutes(birthControlTime.getMinutes());
    return Math.round((bcToday - now) / MIN_IN_MS);
}

exports.PopCloserDose = function () {
    var now = new Date();
    if (exports.tookPillYesterday()) {
        //Then missed pill today
        //Check if closer to dose today or dose tomorrow
        if ((bcTimeOnDay("tomorrow") - now) < (now - bcTimeOnDay("today"))) {
            return "discard";
        } else {
            return "take";
        }
    } else {
        //If closer to dose yesterday then dose today, then take asap
        if ((bcTimeOnDay("today") - now) < (now - bcTimeOnDay("yesterday"))) {
            return "discard";
        } else {
            return "take";
        }
    }
}

function bcTimeOnDay(day) {
    var bcTime = StorageUtil.getBirthControlTime();
    var today = new Date();
    if (day == "today") {
        today.setHours(bcTime.getHours());
        today.setMinutes(bcTime.getMinutes());
        return today;
    } else if (day == "yesterday") {
        var bcYesterday = new Date();
        bcYesterday.setDate(today.getDate() - 1);
        bcYesterday.setHours(bcTime.getHours());
        bcYesterday.setMinutes(bcTime.getMinutes());
        return bcYesterday;
    } else if (day == "tomorrow") {
        var bcTomorrow = new Date();
        bcTomorrow.setDate(today.getDate() + 1);
        bcTomorrow.setHours(bcTime.getHours());
        bcTomorrow.setMinutes(bcTime.getMinutes());
        return bcTomorrow;
    }
}








//Returns true if user took pill today
exports.tookPillToday = function () {
    var lastPillDate = StorageUtil.getlastTimePillTaken();
    console.log("last pill date was..." + lastPillDate);
    var today = new Date();
    if (sameDay(lastPillDate, today)) {
        return true;
    }
    return false;
}

//Returns true if user last took pill yesterday
exports.tookPillYesterday = function () {
    var today = new Date();
    var yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (sameDay(StorageUtil.getlastTimePillTaken(), yesterday)) {
        return true;
    }
    return false;
}

//Returns true if user last took pill yesterday
//TODO: check month too
exports.tookPillDayBeforeYesterday = function () {
    var today = new Date();
    var dayBeforeYesterday = new Date();
    dayBeforeYesterday.setDate(today.getDate() - 2);
    if (sameDay(StorageUtil.getlastTimePillTaken(), dayBeforeYesterday)) {
        return true;
    }
    return false;
}

//Returns true if user last took pill yesterday
exports.tookPillThreeDaysAgo = function () {
    var today = new Date();
    var threeDaysAgo = new Date();
    threeDaysAgo.setDate(today.getDate() - 3);
    if (sameDay(StorageUtil.getlastTimePillTaken(), threeDaysAgo)) {
        return true;
    }
    return false;
}

function sameDay(date1, date2) {
    if (date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getYear() && date2.getYear()) {
        return true;
    }
    return false;
}


/* export: getCycleDay
 * ----------------
 * Gets the user's day in their cycle (e.g. 5)
 */
exports.getCycleDay = function () {
    var today = new Date();
    var firstDay = StorageUtil.getFirstCycleDay();
    var sinceFirstDay = Math.round(Math.abs((today.getTime() - firstDay.getTime()) / DAY_IN_MS)) + 1;
    return (sinceFirstDay % 28);
}

/* export: getCycleDay
 * ----------------
 * Gets the user's day in their cycle (e.g. 5) given a date
 */
exports.getDayInCycle = function (date) {
    var firstDay = StorageUtil.getFirstCycleDay();
    var sinceFirstDay = Math.round(Math.abs((date.getTime() - firstDay.getTime()) / DAY_IN_MS)) + 1;
    return (sinceFirstDay % 28);
}

/* export: getCycleDay
 * ----------------
 * Gets the user's week in their cycle (e.g. 3) for today
 */
exports.getCycleWeek = function () {
    var cycleDay = exports.getCycleDay();
    return (Math.round(cycleDay / 7) + 1);
}

/* export: getCycleDay
 * ----------------
 * Gets the user's week in their cycle (e.g. 3) for a given day
 */
exports.getWeekInCycle = function (day) {
    var cycleDay = exports.getDayInCycle(day);
    return (Math.round(cycleDay / 7) + 1);
}