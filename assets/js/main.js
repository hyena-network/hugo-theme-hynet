const MUSICLIST_JSON = "/music/files.json"
const BASE_SETTINGS = [
    {key: "autoplayMusic", value: false, description: "Autoplay music?"},
    {key: "lightMode", value: false, description: "Enable lightmode?"},
    {key: "noMoreSecrets", value: true, description: "Enable the Sneakers decryption effect?"}
    ]
let localSettings = [];
let musicList = [];

window.addEventListener('load', async function () {
    musicList = await fetchMusicList();
    startRandomTrack(document.getElementById('pageMusic_cont'));
    loadSettings();
    generateSettings(document.getElementById("settings_containter"));
    applySettings();
    await loadProfile();
    checkFragment();

});
function getSetting(key) {
    return localSettings.filter(s => s.key == key)[0].value
}

function applySettings() {
    var audio = document.getElementById("pageMusic");
    getSetting("autoplayMusic") ? audio.play() : audio.pause();
    getSetting("lightMode") ? lightmode() : darkmode();
}
function loadSettings() {
    let settings_str = localStorage.getItem('settings');
    let readPreferences;
    if (IsJsonString(settings_str)) {
        readPreferences = JSON.parse(settings_str);
    } else {
        readPreferences = BASE_SETTINGS;
        readPreferences.filter( s => s.key == "noMoreSecrets")[0].value = !(window.mobileCheck());
    }
    let settings = BASE_SETTINGS;
    readPreferences.forEach( (readSetting) => {
        settings.filter( s => s.key == readSetting.key)[0].value = readSetting.value;
    });
    localSettings = settings;
    applySettings();
}
function updateSettings(el) {
    let key = el.id;
    let value = el.checked;
    let toSave = [];
    localSettings.forEach( (setting) => {
        if (key == setting.key) {
            setting.value = value;
        }
        toSave.push({key: setting.key, value: setting.value});
    })
    localStorage.setItem('settings', JSON.stringify(toSave));
    applySettings();
}

function generateSettings(el) {
    el.innerHTML = "";
    let table = document.createElement('table');
    table.style.width = "100%";
    localSettings.forEach((setting) => {
        let tr = document.createElement('tr');
        let td1 = document.createElement('td');
        td1.textContent = setting.description;
        tr.append(td1);
        let td2 = document.createElement('td');
        let checkbox = document.createElement('input')
        checkbox.style = "float: right; clear: both;";
        checkbox.type = "checkbox";
        checkbox.id = setting.key;
        checkbox.checked = setting.value;
        checkbox.addEventListener("click", function(){ updateSettings(this) });
        td2.append(checkbox);
        tr.append(td2);
        table.append(tr);
    })
    el.append(table);
}

function checkFragment() {
    if (window.location.hash) {
        let fragment = window.location.hash;
        fragment = fragment.replace('#', '');
        callNMS(fragment);
    }
}
function callNMS(_id) {
    if (!getSetting("noMoreSecrets")) return;
    const config =  {
        maxUpdateInterval: 60, // maximum update interval time
        minUpdateInterval: 5,  // minimum update interval time
        maxUpdates: 20,         // number of updates until character decryption ends
        extraDelay: 10,         // small interval addition with .1 chance of happening
        initialDelay: 500,      // delay before the decryption effect start
    }

    let el = document.getElementsByTagName('main')[0];
    nms(el, config);
}

function lightmode() {
    let root = document.documentElement;
    root.style.setProperty('--background-color', '#eeeeee');
    root.style.setProperty('--foreground-color', '#d6d6d6');
    root.style.setProperty('--primary-text-color', '#090909');
    root.style.setProperty('--muted-text-color', '#626262');
    root.style.setProperty('--accent-color', '#4a3c3c');
    root.style.setProperty('--secondary-accent-color', '#544446');
    root.style.setProperty('--tertiary-accent-color', '#322625');
    root.style.setProperty('--star-color', '#322625');
    root.style.setProperty('--primary-space-color', '#ffffff');
    root.style.setProperty('--secondary-space-color', '#c6b8ba');
}
function darkmode() {
    let root = document.documentElement;
    root.style.setProperty('--background-color', '#090909');
    root.style.setProperty('--foreground-color', '#191919');
    root.style.setProperty('--primary-text-color', '#b9b9ba');
    root.style.setProperty('--muted-text-color', '#89898a');
    root.style.setProperty('--accent-color', '#faacac');
    root.style.setProperty('--secondary-accent-color', '#ef727f');
    root.style.setProperty('--tertiary-accent-color', '#ac403f');
    root.style.setProperty('--star-color', '#ffffff');
    root.style.setProperty('--primary-space-color', '#1b2735');
    root.style.setProperty('--secondary-space-color', '#090a0f');
}

async function fetchMusicList () {
    try {
        const res = await window.fetch(MUSICLIST_JSON)
        if (res.ok) {
            return await res.json()
        } else {
            throw (res)
        }
    } catch (e) {
        console.warn("Can't load music list! ")
        console.warn(e)
    }
}

function startRandomTrack(cont) {
    // Set volume to
    let audio = document.getElementById("pageMusic");
    let creditsArtist = document.getElementById("musicArtist");
    let creditsSource = document.getElementById("musicSource");
    let track = musicList[Math.floor(Math.random()*musicList.length)];
    audio.src = track.source;
    audio.volume = track.volume;
    creditsSource.href = track.credits;
    creditsArtist.textContent = track.artist;
}

window.mobileCheck = function() {
    return Math.min(window.screen.width, window.screen.height) < 768 || navigator.userAgent.indexOf("Mobi") > -1;
};
function IsJsonString(str) {
    try {
        if (str == "" || str == null) return false
        JSON.parse(str);

    } catch (e) {
        console.warn(`Cannot parse "${str}"!`)
        return false;
    }
    return true;
}