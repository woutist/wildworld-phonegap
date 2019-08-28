const dD = () => {
    if (typeof cordova === "object") {
        return (window.cordova.platformId === "android") ? true : false;
    } else {
        return false;
    }
};
export const detectionDevice = dD();