"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("tns-core-modules/application");
var iosApp = app.ios;
var pushHandler;
var pushManager;
var pushSettings;
(function () {
    if (!pushSettings) {
        pushSettings = {};
    }
    if (!pushHandler) {
        pushHandler = Push.alloc().init();
    }
    if (!pushManager) {
        pushManager = PushManager.alloc().init();
    }
})();
var _init = function (settings) {
    if (!!pushSettings.isInitialized)
        return;
    pushSettings.settings = settings;
    pushSettings.notificationCallbackIOS = settings.notificationCallbackIOS;
    _addObserver("notificationReceived", function (context) {
        var userInfo = JSON.parse(context.userInfo.objectForKey('message'));
        pushSettings.notificationCallbackIOS(userInfo);
    });
    pushSettings.isInitialized = true;
};
var _mapCategories = function (interactiveSettings) {
    var categories = [];
    for (var i = 0; i < interactiveSettings.categories.length; i++) {
        var currentCategory = interactiveSettings.categories[i];
        var mappedCategory = {
            identifier: currentCategory.identifier,
            actionsForDefaultContext: [],
            actionsForMinimalContext: []
        };
        for (var j = 0; j < interactiveSettings.actions.length; j++) {
            var currentAction = interactiveSettings.actions[j];
            if (currentCategory.actionsForMinimalContext.indexOf(currentAction.identifier) > -1) {
                mappedCategory.actionsForMinimalContext.push(currentAction);
            }
            if (currentCategory.actionsForDefaultContext.indexOf(currentAction.identifier) > -1) {
                mappedCategory.actionsForDefaultContext.push(currentAction);
            }
        }
        categories.push(mappedCategory);
    }
    return categories;
};
var _addObserver = function (eventName, callback) {
    return iosApp.addNotificationObserver(eventName, callback);
};
var _removeObserver = function (observer, eventName) {
    iosApp.removeNotificationObserver(observer, eventName);
};
function register(settings, success, error) {
    _init(settings);
    if (!pushSettings.didRegisterObserver) {
        pushSettings.didRegisterObserver = _addObserver("didRegisterForRemoteNotificationsWithDeviceToken", function (result) {
            _removeObserver(pushSettings.didRegisterObserver, "didRegisterForRemoteNotificationsWithDeviceToken");
            pushSettings.didRegisterObserver = undefined;
            var token = result.userInfo.objectForKey('message');
            success(token);
        });
    }
    if (!pushSettings.didFailToRegisterObserver) {
        pushSettings.didFailToRegisterObserver = _addObserver("didFailToRegisterForRemoteNotificationsWithError", function (e) {
            _removeObserver(pushSettings.didFailToRegisterObserver, "didFailToRegisterForRemoteNotificationsWithError");
            pushSettings.didFailToRegisterObserver = undefined;
            error(e);
        });
    }
    pushHandler.register(pushSettings.settings);
}
exports.register = register;
function registerUserNotificationSettings(success, error) {
    if (pushSettings.settings && pushSettings.settings.interactiveSettings) {
        var interactiveSettings = pushSettings.settings.interactiveSettings;
        var notificationTypes = [];
        if (pushSettings.settings.alert) {
            notificationTypes.push("alert");
        }
        if (pushSettings.settings.badge) {
            notificationTypes.push("badge");
        }
        if (pushSettings.settings.sound) {
            notificationTypes.push("sound");
        }
        if (!pushSettings.registerUserSettingsObserver) {
            pushSettings.registerUserSettingsObserver = _addObserver("didRegisterUserNotificationSettings", function () {
                _removeObserver(pushSettings.registerUserSettingsObserver, "didRegisterUserNotificationSettings");
                pushSettings.registerUserSettingsObserver = undefined;
                success();
            });
        }
        if (!pushSettings.failToRegisterUserSettingsObserver) {
            pushSettings.failToRegisterUserSettingsObserver = _addObserver("failToRegisterUserNotificationSettings", function (e) {
                _removeObserver(pushSettings.didFailToRegisterObserver, "failToRegisterUserNotificationSettings");
                pushSettings.failToRegisterUserSettingsObserver = undefined;
                error(e);
            });
        }
        pushHandler.registerUserNotificationSettings({
            types: notificationTypes,
            categories: _mapCategories(interactiveSettings)
        });
    }
    else {
        success();
    }
}
exports.registerUserNotificationSettings = registerUserNotificationSettings;
function unregister(done) {
    if (!pushSettings.didUnregisterObserver) {
        pushSettings.didUnregisterObserver = _addObserver("didUnregister", function (context) {
            _removeObserver(pushSettings.didUnregisterObserver, "didUnregister");
            pushSettings.didUnregisterObserver = undefined;
            done(context);
        });
    }
    pushHandler.unregister();
}
exports.unregister = unregister;
function areNotificationsEnabled(done) {
    if (!pushSettings.areNotificationsEnabledObserver) {
        pushSettings.areNotificationsEnabledObserver = _addObserver("areNotificationsEnabled", function (result) {
            var areEnabledStr = result.userInfo.objectForKey('message');
            var areEnabled = areEnabledStr === "true";
            _removeObserver(pushSettings.areNotificationsEnabledObserver, "areNotificationsEnabled");
            pushSettings.areNotificationsEnabledObserver = undefined;
            done(areEnabled);
        });
    }
    pushHandler.areNotificationsEnabled();
}
exports.areNotificationsEnabled = areNotificationsEnabled;
//# sourceMappingURL=push-plugin.ios.js.map