// whether apply timeout when overscrolling.
const isTimeOutEnabled = false;

// magic Numbers from main script.
const scale = 50;
// ??
const trigger = 25;
// ??
const timeoutTime = 200;
//timeout time in ms
const wheelScrollMultiplier = 3.5;
const touchScrollMultiplier = 0.1;
const navigationIndicatorToScreenPercentage = 10;
let counter = 0;
let amount = 0;
let timeout = null;
let willNavigate = false;

let lastTouch = null;

let leftIndicator = null;
let rightIndicator = null;

// Base indicator img
const navigationIndicatorImg = document.createElement("img");
navigationIndicatorImg.classList.add("d9a3d1bc405c-navigationIndicator");

// Base indicator
const navigationIndicator = document.createElement("div");
navigationIndicator.classList.add("d9a3d1bc405c-navigationIndicatorContainer");
navigationIndicator.appendChild(navigationIndicatorImg);

function init() {
    console.log("LOADING EXTENSION GOOD SWIPE");
    leftIndicator = navigationIndicator.cloneNode(true);
    leftIndicator.firstChild.src = browser.runtime.getURL("icons/arrow_back.svg");
    leftIndicator.firstChild.alt = "Back";
    leftIndicator.classList.add("d9a3d1bc405c-navigationIndicatorContainerLeft");
    rightIndicator = navigationIndicator.cloneNode(true);
    rightIndicator.firstChild.src = browser.runtime.getURL("icons/arrow_forward.svg");
    rightIndicator.firstChild.alt = "Forward";
    rightIndicator.classList.add("d9a3d1bc405c-navigationIndicatorContainerRight");

    const indicators = document.createElement("div");
    indicators.className = "d9a3d1bc405c-goodswipe";
    indicators.appendChild(leftIndicator);
    indicators.appendChild(rightIndicator);

    document.body.appendChild(indicators);
}

function getBodyWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

function getBodyHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.documentElement.clientHeight
    );
}

function isScrollingX() {
    return (
        window.pageXOffset > 0 &&
        window.pageXOffset + window.innerWidth < getBodyWidth()
    );
}

function isScrollingY() {
    return (
        window.pageYOffset > 0 &&
        window.pageYOffset + window.innerHeight < getBodyHeight()
    );
}

function touchFinishedNavigation(event){
    if (amount > trigger){
        navigate();
    }

    reset();
}

function navigate() {
    if (counter > 0) {
        window.history.forward();
    }
    else {
        window.history.back();
    }
    willNavigate = true;
}


function reset() {
    amount = 0;
    counter = 0;
    timeout = null;
    willNavigate = false;
    update();
}

function update() {
    const direction = Math.sign(counter);
    const progression = amount / trigger;
    // progression: if progression >= 1 then move page.
    // stop direction.

    

    if (progression === 0) {
        leftIndicator.style.left = "0%";
        leftIndicator.style.boxShadow = "0 0 0 0rem rgba(10, 132, 255, 0.5)";
        leftIndicator.style.transition = "left 0.1s ease-in, box-shadow 0.1s ease-in";
        rightIndicator.style.right = "0%";
        rightIndicator.style.boxShadow = "0 0 0 0rem rgba(10, 132, 255, 0.5)";
        rightIndicator.style.transition = "right 0.1s ease-in, box-shadow 0.1s ease-in";
    } else {
        
        const accentColor = progression >= 1 ? `rgba(0, 60, 255, 1)` : `rgba(10, 132, 255, 1)`;
        switch (direction) {
            case -1:
                leftIndicator.style.boxShadow = `0 0 0 1rem ${accentColor}`;
                leftIndicator.style.left = `${navigationIndicatorToScreenPercentage * progression}%`;
                leftIndicator.style.transition = "none";
                rightIndicator.style.boxShadow = "0 0 0 0rem rgba(10, 132, 255, 0.5)";
                rightIndicator.style.right = "0%";
                rightIndicator.style.transition = "right 0.1s ease-in, box-shadow 0.1s ease-in";
                break;
            case 1:
                rightIndicator.style.boxShadow = `0 0 0 1rem ${accentColor}`;
                rightIndicator.style.right = `${navigationIndicatorToScreenPercentage * progression}%`;
                rightIndicator.style.transition = "none";
                leftIndicator.style.boxShadow = "0 0 0 0rem rgba(10, 132, 255, 0.5)";
                leftIndicator.style.left = "0%";
                leftIndicator.style.transition = "left 0.1s ease-in, box-shadow 0.1s ease-in";
            default:
                break;
        }
    }
}

function computeWheel(count){
    compute(count * wheelScrollMultiplier, true);

}

function computeTouch(count){
    compute(count * touchScrollMultiplier, isTimeOutEnabled);
}

function compute(count, isTimeOut) {
    if (
        count === 0 || isScrollingX() ||
        willNavigate
    ) {
        return;
    }


    if (isTimeOut && timeout !== null) {
        clearTimeout(timeout);
        timeout = null;
    }

    counter += count;

    amount = scale * Math.log(Math.abs(counter) + scale) - scale * Math.log(scale);

    update();

    if (isTimeOut && (amount > trigger)) {
        navigate();
    }
    
    if (isTimeOut){
        timeout = setTimeout(reset, timeoutTime);
    }
}

init();

document.addEventListener("wheel", (event) => {
    computeWheel(event.deltaX);
});

document.addEventListener("touchstart", (event) => {
    lastTouch = event.touches[0];
});

document.addEventListener("touchmove", (event) => {
    const touch = event.touches[0];

    if ( event.touches.length === 1 && 
        Math.abs((touch.clientY - lastTouch.clientY) / (touch.clientX - lastTouch.clientX)) < 0.5 &&
        !isScrollingX()
        ) {
        event.preventDefault();
        const count = lastTouch.clientX - touch.clientX;
        computeTouch(count);
    }

    lastTouch = event.touches[0];
});





document.addEventListener("touchend", touchFinishedNavigation);

document.addEventListener("touchcancel", touchFinishedNavigation);
