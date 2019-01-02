export declare interface FcmNotificaion {
    getBody(): string;
    getBodyLocalizationArgs(): string[];
    getBodyLocalizationKey(): string;
    getClickAction(): string;
    getColor(): string;
    getIcon(): string;
    getSound(): string;
    getTag(): string;
    getTitle(): string;
    getTitleLocalizationArgs(): string[];
    getTitleLocalizationKey(): string;
}
export declare function register(options: {
    senderID: string;
    notificationCallbackAndroid?: (stringifiedData: String, fcmNotification: any) => void;
}, successCallback: (fcmRegistrationToken: string) => void, errorCallback: (errorMessage: string) => void): void;
export declare function unregister(onSuccessCallback: (successMessage: string) => void, onErrorCallback: (errorMessage: string) => void, options: {
    senderID: string;
}): void;
export declare function onMessageReceived(onSuccessCallback: (message: string, stringifiedData: string, fcmNotification: FcmNotificaion) => void): void;
export declare function onTokenRefresh(onSuccessCallback: () => void): void;
export declare function areNotificationsEnabled(onSuccessCallback: (areEnabled: boolean) => void): void;
