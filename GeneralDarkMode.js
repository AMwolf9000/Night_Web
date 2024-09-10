"use strict";
let allElements = document.getElementsByTagName("*");
let data = [];
let maxColorGap = 50; // controls the max rgb range a color can be for it to still invert color
let darkReducer = 20; // reduces max darkness by adding to rgb values

function saveColors(elements = allElements, array = data) {

    for (let i = 0; i < elements.length; i++) {
        let e = elements[i];
        let backColor, borderColor, color;
        try {
            backColor = getComputedStyle(e).getPropertyValue("background-color");
            borderColor = getComputedStyle(e).getPropertyValue("border-color");
            color = getComputedStyle(e).getPropertyValue("color");
        } catch(error) {
            continue;
        }
        if ( [backColor, borderColor, color].find((value) => value != "rgba(0, 0, 0, 0)") ) { // this is obselte currently unless there is a way to differentiate between default rgb(0, 0, 0) value and a set rgb(0, 0, 0) value (maybe using CSSstylsheets)
            array.push({backColor: backColor, borderColor: borderColor, color: color, index: i});
        }
    }
}
saveColors();


// get rgba values for each element

function getRGBAValues(array = data) {

    for (let i = 0; i < array.length; i++) {
        let rgbaValues = [array[i].backColor.replace(/[rgba()]/g, "").split(", "), array[i].borderColor.replace(/[rgba()]/g, "").split(", "), array[i].color.replace(/[rgba()]/g, "").split(", ")];

        // invert color
        for (let x = 0; x < 3; x++) {

            let newColor = [Number(rgbaValues[x][0]), Number(rgbaValues[x][1]), Number(rgbaValues[x][2]), rgbaValues[x][3] ?? 1];
            decideColorGap(newColor);

            let colorProperty;

            switch (x) {
            case 0: 
                colorProperty = "backColor";
                break;
            case 1: 
                colorProperty = "borderColor";
                break;
            case 2: 
                colorProperty = "color";
                break;
            }
            // replace old color with new color in data array
            array[i][colorProperty] = `rgba(${newColor[0]}, ${newColor[1]}, ${newColor[2]}, ${newColor[3]})`;
        }
    }
}
getRGBAValues();

// change colors to new ones

function makeDark(elements = allElements,array = data) {

    for (let i = 0; i < array.length; i++) {
        for (let i2 = 0; i2 < 3; i2++) {
            let colorProperty;

            switch (i2) {
            case 0: 
                colorProperty = "background-color|backColor";
                break;
            case 1: 
                colorProperty = "border-color|borderColor";
                break;
            case 2: 
                colorProperty = "color|color";
                break;
            }
            if (array[i][colorProperty.split("|")[1]] != "rgba(0, 0, 0, 0)") {
                elements[array[i].index].style.cssText += `${colorProperty.split("|")[0]}: ${array[i][colorProperty.split("|")[1]]} !important;`;
            }
        }
    }
}
makeDark();

// color gap logic
function decideColorGap(rgba) {
    let r, g, b;
    r = rgba[0];
    g = rgba[1];
    b = rgba[2];
    if (Math.abs(r - g) > maxColorGap || Math.abs(r - b) > maxColorGap || Math.abs(g - b) > maxColorGap) {
        return
    }
    for (let x in rgba) {
        if (x == 3) {return};
        rgba[x] = 255 - rgba[x] + darkReducer;
    }
}

function makeNewDark(elements) {
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].nodeType == 3) {
            elements = elements.toSpliced(i, 1);
        }
    }
    if (!elements.length) {
        return
    }
    let newData = [];
    saveColors(elements, newData);
    getRGBAValues(newData);
    makeDark(elements, newData);
}

const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
        if (mutation.addedNodes.length) {
            makeNewDark(Array.from(mutation.addedNodes));
        }
    }
}

const observer = new MutationObserver(callback);

observer.observe(document.documentElement, {attributes: false, childList: true, subtree: true})