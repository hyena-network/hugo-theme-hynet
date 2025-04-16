const INSTANCE_DOMAIN = 'soc.hyena.network';
const EMOJI_LIST_URL = '/api/pleroma/emoji.json';
const USER = 'mel'
const ACCOUNTS_URL = '/api/v1/accounts/'

async function loadProfile() {
    const baseurl = "https://" + INSTANCE_DOMAIN;
    const accountheading = document.getElementsByClassName('account-header')[0];
    let userinfo = await fetchUserInfo(baseurl+ACCOUNTS_URL, USER);
    createElements(userinfo, accountheading)
    accountheading.innerHTML = replaceShortcodes(accountheading.innerHTML, userinfo.emojis);
};

async function fetchUserInfo (accounts_api_url, username) {
    try {
        const res = await window.fetch(accounts_api_url + username)
        if (res.ok) {
            return await res.json()
        } else {
            throw (res)
        }
    } catch (e) {
        console.warn("Can't load user info.")
        console.warn(e)
    }
}
function createElements(user_info, el) {
    el.innerHTML = "";
    // Banner
    let ah_b = document.createElement('div');
    ah_b.className = "account-header__banner";
    ah_b.style = `background-image: url('${user_info.header_static}')`;
    el.append(ah_b);
    //Avatar
    let ah_a = document.createElement('div');
    ah_a.className = "account-header__avatar";
    ah_a.style = `background-image: url('${user_info.avatar_static}')`;
    el.append(ah_a);
    // Meta
    let ah_m = document.createElement('div');
    ah_m.className = "account-header__meta";
    let ah_dname = document.createElement('div');
    ah_dname.className = "account-header__display-name";
    ah_dname.textContent = user_info.display_name;
    ah_m.append(ah_dname)
    let ah_nick = document.createElement('a');
    ah_nick.className = "account-header__nickname";
    ah_nick.textContent = `@${user_info.username}@${INSTANCE_DOMAIN}`
    ah_nick.href = `https://${INSTANCE_DOMAIN}/users/${user_info.username}`;
    ah_m.append(ah_nick)
    el.append(ah_m)
}

async function replaceAllShortcodes() {
    var emojis = await getCustomEmoji( "https://" + INSTANCE_DOMAIN + EMOJI_LIST_URL);
    document.body.innerHTML = replaceShortcodes(document.body.innerHTML, emojis);
}

function replaceShortcodes(string, emojis) {
    try {
        if (emojis == null) {
            throw emojis
        }
        const matchOperatorsRegex = /[|\\{}()[\]^$+*?.-]/g
        return emojis.reduce((acc, emoji) => {
            const regexSafeShortCode = emoji.shortcode.replace(matchOperatorsRegex, '\\$&')
            return acc.replace(new RegExp(`:${regexSafeShortCode}:`, 'g'), `<img src='${emoji.url}' alt=':${emoji.shortcode}:' title=':${emoji.shortcode}:' class='emoji' />`)
        }, string)
    }
    catch (e) {
        console.warn("Can't inject custom emojis")
        console.warn(e)
    }
};

async function getFullCustomEmojiList(url) {
    try {
        const res = await window.fetch(url)
        if (res.ok) {
            const result = await res.json()
            const values = Array.isArray(result) ? Object.assign({}, ...result) : result
            const emoji = Object.entries(values).map(([key, value]) => {
                const instance = "https://" + INSTANCE_DOMAIN;
                const imageUrl = value.image_url
                return {
                    shortcode: key,
                    url: imageUrl ? instance + imageUrl : value,
                    tags: imageUrl ? value.tags.sort((a, b) => a > b ? 1 : 0) : ['utf'],
                    replacement: `:${key}: `
                }
            }).sort((a, b) => a.shortcode.toLowerCase() > b.shortcode.toLowerCase() ? 1 : -1)
            return emoji;
        } else {
            throw (res)
        }
    } catch (e) {
        console.warn("Can't load custom emojis")
        console.warn(e)
    }
};