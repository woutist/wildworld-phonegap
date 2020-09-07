export const detectionDevice = () => {
    if (typeof cordova === "object") {
        return (window.cordova.platformId === "android") ? true : false;
    } else {
        return false;
    }
};

export const detectionWEBGL = () => {
    const canvas = document.createElement("canvas"),
        gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if(gl && gl instanceof WebGLRenderingContext) {
        return true;
    } else {
        return false;
    }
};

export const isEven = (n) => {
    return n == parseFloat(n)? !(n%2) : void 0;
};

export const inArrayObject = (nameArray,myArray,myValue) => {
    let inArrayObject=false;
    for(var i=0, iLength=myArray.length; i<iLength; i++){
        if(nameArray=="intruzi")
        {
            if(myArray[i].randomMove==myValue) inArrayObject=true;
        }
        else if(nameArray=="kladki")
        {
            if(myArray[i].isUp==myValue) inArrayObject=true;
        }
    }
    return inArrayObject;
};

export const inArray = (myArray,myValue) => {
    let inArray = false;
    myArray.map(function(key){
        if (key === myValue){
            inArray=true;
        }
    });
    return inArray;
};

export const isExists = (o) => {
    let isO = false;
    if(typeof  o !== 'undefined') {
        isO = true;
    }
    return isO;
}

export const removeA = (arr) => {
    let what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
};

export const randomBetween = ( min, max ) => {
    min = parseInt( min, 10 );
    max = parseInt( max, 10 );

    if ( min > max ){
        const tmp = min;
        min = max;
        max = tmp;
    }

    return Math.floor( Math.random() * ( max - min + 1 ) + min );
};

export const randomArray = ( arr ) => {
    return arr[Math.floor((Math.random()*arr.length))];
};

export const triggerKeyboardEvent = (el,keyC,typeKey) => {
    const eventObj=document.createEvent("Events");

    eventObj.initEvent(typeKey, true, true);
    eventObj.keyCode = keyC;
    eventObj.which = keyC;

    el.dispatchEvent(eventObj);
};