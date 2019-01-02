"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app = require("tns-core-modules/application");
(function () {
    var registerLifecycleEvents = function () {
        com.telerik.pushplugin.PushLifecycleCallbacks.registerCallbacks(app.android.nativeApp);
    };
    if (app.android.nativeApp) {
        registerLifecycleEvents();
    }
    else {
        app.on(app.launchEvent, registerLifecycleEvents);
    }
})();
function register(options, successCallback, errorCallback) {
    com.telerik.pushplugin.PushPlugin.register(app.android.context, options.senderID, new com.telerik.pushplugin.PushPluginListener({
        success: function (fcmRegistrationToken) {
            if (options && typeof options.notificationCallbackAndroid === 'function') {
                onMessageReceived(options.notificationCallbackAndroid);
            }
            successCallback(fcmRegistrationToken);
        },
        error: errorCallback
    }));
}
exports.register = register;
function unregister(onSuccessCallback, onErrorCallback, options) {
    com.telerik.pushplugin.PushPlugin.unregister(app.android.context, options.senderID, new com.telerik.pushplugin.PushPluginListener({
        success: onSuccessCallback,
        error: onErrorCallback
    }));
}
exports.unregister = unregister;
function onMessageReceived(onSuccessCallback) {
    com.telerik.pushplugin.PushPlugin.setOnMessageReceivedCallback(new com.telerik.pushplugin.PushPluginListener({
        success: onSuccessCallback
    }));
}
exports.onMessageReceived = onMessageReceived;
function onTokenRefresh(onSuccessCallback) {
    com.telerik.pushplugin.PushPlugin.setOnTokenRefreshCallback(new com.telerik.pushplugin.PushPluginListener({
        success: onSuccessCallback
    }));
}
exports.onTokenRefresh = onTokenRefresh;
function areNotificationsEnabled(onSuccessCallback) {
    var bool = com.telerik.pushplugin.PushPlugin.areNotificationsEnabled();
    onSuccessCallback(bool);
}
exports.areNotificationsEnabled = areNotificationsEnabled;
//# sourceMappingURL=push-plugin.android.js.map