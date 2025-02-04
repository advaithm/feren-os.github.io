var eng = {},
    current = {},
    fadeDur = 350,
    searchPrefix = "Search ",
    UA = navigator.userAgent;

function setCookie(name, value) {
    let expires = "";
    let policy = "";
    expires = "; expires=Fri, 31 Dec 9999 23:59:59 GMT";
    policy = "; SameSite=Lax; Secure";
    console.log(location.hostname);
    if (location.hostname == "localhost" || "0.0.0.0") {
        console.log("Using Localhost");
        policy = "; SameSite=Lax;";
    }
    document.cookie = name + "=" + (value || "") + expires + policy;
}

function getCookie(cname) {
    var match = document.cookie.match(new RegExp('(^| )' + cname + '=([^;]+)'));
    if (match) return match[2];
}

function loadSP() {
    // Migrate settings if required
    migrateSettings();

    // Create Engine Index
    buildEngineslist()

    // Resize Engines dialog
    calculateEnginesSize()

    // Set up first engine

    current.engine = (getCookie("lastengine") || "duckduckgo");
    selectEngine(current.engine, false);

    // Hover events
    setupHoverEvents();

    // Start clock
    startTime();

    // Load settings
    setSettings();

    // Browser optimisations
    browserOptimisations();

    // Cookies Popup
    cookiesPopup();
}

function browserOptimisations() {
    if (/rv:([^\)]+)\) Gecko\/\d{8}/.test(UA) && /Firefox\/(\S+)/.test(UA)) { /*Firefox*/
        //Switch id of scrollbox to non-chromium
        document.getElementById("shortcutscontainer1").id = "shortcutscontainer1-nonium";
    }
}

function doSearch() {
    var url = eng[current.engine].uri;
    url = url.replace("%query%", encodeURIComponent($("#i").val()));
    if (typeof eng[current.engine].languages == "object")
        url = url.replace("%lang%", eng[current.engine].languages[current.language]);

    window.location.href = url;
    return false;
}

function buildEngineslist() {
    for (e in eng) {
        var searchenginescontaineritem = document.createElement("div");
        searchenginescontaineritem.classList.add("searchenginescontaineritem");
        searchenginescontaineritem.setAttribute("onclick", "selectEngine('" + e + "', true)");

        document.getElementById("searchenginescontainer").appendChild(searchenginescontaineritem);

        var searchengineitem = document.createElement("img");
        searchengineitem.classList.add("searchenginesitem");
        searchengineitem.src = eng[e].logo;

        searchenginescontaineritem.appendChild(searchengineitem);
    }
}

function calculateEnginesSize() {
    var numberofrows = 0;
    var numberofenginesdone = 0;
    for (e in eng) {
        numberofenginesdone += 1
        if (numberofenginesdone !== 0 && numberofenginesdone % 2 !== 0) {
            numberofrows += 1
        }
    }

    var currentboxsize = document.getElementById("searchenginepopup").offsetHeight;
    var calculatedboxsize = 33;

    if (numberofrows != 0) {
        calculatedboxsize += 10
    }
    calculatedboxsize += 100 * numberofrows

    if (numberofrows != 0) {
        calculatedboxsize += 10
    }


    document.getElementById("searchenginepopup").style.height = calculatedboxsize + "px";
}

function nextEngine() {
    selectEngine(findNext(eng, current.engine), true);
}

function prevEngine() {
    selectEngine(findPrevious(eng, current.engine), true);
}


/*  CUSTOM BG SUPPORT
    -----------------------------------------------------  */
function setBG() {
    var bgurl = (getCookie('userbg') || "https://source.unsplash.com/collection/19065423")
    document.getElementById("bgparallax").style.backgroundImage = ("linear-gradient(rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.35)), url(" + bgurl + ")")
}
function UrlExists(url, cb) {
    jQuery.ajax({
        url: url,
        dataType: 'text',
        type: 'GET',
        complete: function (xhr) {
            if (typeof cb === 'function')
                cb.apply(this, [xhr.status]);
        }
    });
}

function setSettings() {
    var bgurl = (getCookie('userbg') || "https://source.unsplash.com/collection/19065423");
    UrlExists(bgurl, function (status) {
        if (status == 200) {
            setBG();
        } else {
            pageLoadedAnim();
        }
    })

}

function pageLoadedAnim() {
    $(".blackscreen").fadeOut(500);
}

/*	TIME
    -----------------------------------------------------  */

function startTime() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    // add a zero in front of numbers less than 10
    m = checkTime(m);

    if (getCookie("12hrclock") == "true") {
        if (h >= 12 && h != 24) {
            h = h - 12
            if (h == 0) {
                h = 12
            }
            timesuffix = "PM"
        } else if (h == 0) {
            h = 12
            timesuffix = "AM"
        } else {
            timesuffix = "AM"
        }
        h = checkTime(h);
        document.getElementById('timeid').innerHTML = h + ":" + m + " " + timesuffix;
    } else {
        if (h == 24) {
            h = 0
        }
        h = checkTime(h);
        document.getElementById('timeid').innerHTML = h + ":" + m;
    }

    t = setTimeout('startTime()', 3000);
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}

/*	KEYBOARD SHORTCUTS
    -----------------------------------------------------  */

var isCtrl = false;
var isCmd = false;

$(document).keyup(function (e) {
    if (e.which == 17) isCtrl = false;
    if (e.which == 91) isCmd = false;
}
).keydown(function (e) {
    if (e.which == 17) isCtrl = true;
    if (e.which == 91) isCmd = true;

    if (e.which == 39 && isCtrl == true) { /* Arrow Right */	nextEngine(); toggleChangeEnginePopup(false); }
});



/*	SHORTCUTS SCROLLING
    -----------------------------------------------------  */
var h_amount = '';
function scroll_h() {
    $('#shortcutscontainer1').animate({
        scrollLeft: h_amount
    }, 100, 'linear', function () {
        if (h_amount != '') {
            scroll_h();
        }
    });
}

function setupHoverEvents() {
    var bottomshortcutsarea = document.getElementById("shortcutscontainer1");
    var leftscrollarea = document.getElementById("direction_left");
    var rightscrollarea = document.getElementById("direction_right");

    bottomshortcutsarea.addEventListener("mouseenter", function (event) {
        $("#shortcutscontainer1").addClass("shownscrollbar");
    }, false);
    bottomshortcutsarea.addEventListener("mouseleave", function (event) {
        $("#shortcutscontainer1").removeClass("shownscrollbar");
    }, false);


    $('.direction_left').hover(function () {
        h_amount = '-=50';
        scroll_h();
    }, function () {
        h_amount = '';
    });
    $('.direction_right').hover(function () {
        h_amount = '+=50';
        scroll_h();
    }, function () {
        h_amount = '';
    });
}
