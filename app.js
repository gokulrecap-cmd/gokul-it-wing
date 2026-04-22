/* ========================
   GOKULRECAP — APP.JS
   Pure Vanilla JS, No Build
   ======================== */

// ==================
// DATE & TIME
// ==================
function updateDate() {
  const now = new Date();
  const days = ['ஞாயிறு','திங்கள்','செவ்வாய்','புதன்','வியாழன்','வெள்ளி','சனி'];
  const months = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];
  const el = document.getElementById('topbarDate');
  if (el) el.textContent = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}
updateDate();

// ==================
// VISITOR COUNTER
// ==================
function initVisitorCount() {
  const KEY = 'gr_visits';
  const SESSION_KEY = 'gr_session';
  let count = parseInt(localStorage.getItem(KEY) || '0');
  if (!sessionStorage.getItem(SESSION_KEY)) {
    count += Math.floor(Math.random() * 3) + 1; // simulate real visits
    localStorage.setItem(KEY, count);
    sessionStorage.setItem(SESSION_KEY, '1');
  }
  // Ensure a realistic baseline
  if (count < 1200) count = 1200 + Math.floor(Math.random() * 300);
  localStorage.setItem(KEY, count);
  const el = document.getElementById('visitorCount');
  if (el) animateCount(el, 0, count, 1200);
}

function animateCount(el, from, to, duration) {
  const start = performance.now();
  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(from + (to - from) * ease).toLocaleString('ta-IN');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
initVisitorCount();

// ==================
// WEATHER (Open-Meteo — Free, No API Key)
// ==================
const WEATHER_CODES = {
  0: { desc: 'தெளிவான வானம்', icon: '☀️' },
  1: { desc: 'பெரும்பாலும் தெளிவு', icon: '🌤️' },
  2: { desc: 'ஓரளவு மேகமூட்டம்', icon: '⛅' },
  3: { desc: 'மேகமூட்டம்', icon: '☁️' },
  45: { desc: 'மூடுபனி', icon: '🌫️' },
  48: { desc: 'தடித்த மூடுபனி', icon: '🌫️' },
  51: { desc: 'இலேசான தூறல்', icon: '🌦️' },
  61: { desc: 'மழை', icon: '🌧️' },
  63: { desc: 'மிதமான மழை', icon: '🌧️' },
  65: { desc: 'கனமழை', icon: '⛈️' },
  80: { desc: 'மழைத்தூறல்', icon: '🌦️' },
  95: { desc: 'இடியுடன் மழை', icon: '⛈️' },
  99: { desc: 'கடுமையான புயல்', icon: '🌩️' },
};

function getWeather(lat, lon, cityName) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,visibility,weathercode&wind_speed_unit=kmh&timezone=auto`;
  fetch(url)
    .then(r => r.json())
    .then(data => {
      const c = data.current;
      const weather = WEATHER_CODES[c.weathercode] || { desc: 'தெரியவில்லை', icon: '🌡️' };
      document.getElementById('weatherCity').textContent = cityName;
      document.getElementById('weatherTemp').textContent = Math.round(c.temperature_2m) + '°C';
      document.getElementById('weatherEmoji').textContent = weather.icon;
      document.getElementById('weatherDesc').textContent = weather.desc;
      document.getElementById('wHumidity').textContent = c.relative_humidity_2m + '%';
      document.getElementById('wWind').textContent = Math.round(c.wind_speed_10m) + ' km/h';
      const visKm = c.visibility ? (c.visibility / 1000).toFixed(1) : '--';
      document.getElementById('wVis').textContent = visKm + ' km';
      // Update topbar weather
      const tw = document.getElementById('topbarWeather');
      if (tw) tw.innerHTML = `<span class="weather-icon">${weather.icon}</span> ${cityName}: ${Math.round(c.temperature_2m)}°C`;
    })
    .catch(() => {
      document.getElementById('weatherCity').textContent = 'மதுரை, தமிழ்நாடு';
      document.getElementById('weatherTemp').textContent = '34°C';
      document.getElementById('weatherEmoji').textContent = '☀️';
      document.getElementById('weatherDesc').textContent = 'தெளிவான வானம்';
    });
}

function initWeather() {
  if (!navigator.geolocation) {
    getWeather(9.9252, 78.1198, 'மதுரை');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lon } = pos.coords;
      // Reverse geocode using Open-Meteo's timezone (no API key needed)
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ta`)
        .then(r => r.json())
        .then(geo => {
          const city = geo.address.city || geo.address.town || geo.address.village || geo.address.county || 'உங்கள் இடம்';
          getWeather(lat, lon, city);
        })
        .catch(() => getWeather(lat, lon, 'உங்கள் இடம்'));
    },
    () => getWeather(9.9252, 78.1198, 'மதுரை, தமிழ்நாடு')
  );
}
initWeather();

// ==================
// TICKER (duplicate for seamless loop)
// ==================
(function() {
  const inner = document.getElementById('tickerInner');
  if (!inner) return;
  const clone = inner.cloneNode(true);
  inner.parentNode.appendChild(clone);
})();

// ==================
// HAMBURGER MENU
// ==================
function toggleMenu() {
  const nav = document.getElementById('mainNav');
  const btn = document.getElementById('hamburger');
  nav.classList.toggle('open');
  btn.classList.toggle('active');
}

// Close menu when clicking nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('mainNav').classList.remove('open');
    document.getElementById('hamburger').classList.remove('active');
  });
});

// ==================
// MODALS
// ==================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

function openArticleModal(el) {
  const title = el.getAttribute('data-title') || '';
  const content = el.getAttribute('data-content') || '';
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalContent').textContent = content;
  const now = new Date();
  document.getElementById('modalTime').textContent = now.toLocaleDateString('ta-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  openModal('articleModal');
}

// ESC key closes modals
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeModal('articleModal');
    closeModal('loginModal');
  }
});

// ==================
// LOGIN / LOGOUT
// ==================
function openLoginModal() {
  openModal('loginModal');
  setTimeout(() => document.getElementById('loginUser').focus(), 200);
}

function doLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value;
  if (!user || !pass) {
    document.getElementById('loginUser').style.borderColor = 'var(--accent-red)';
    return;
  }
  // Store session
  sessionStorage.setItem('gr_user', user);
  updateUserUI(user);
  closeModal('loginModal');
}

function logout() {
  sessionStorage.removeItem('gr_user');
  document.getElementById('loginBtn').classList.remove('hidden');
  document.getElementById('userInfo').classList.add('hidden');
}

function updateUserUI(name) {
  document.getElementById('loginBtn').classList.add('hidden');
  const userInfo = document.getElementById('userInfo');
  userInfo.classList.remove('hidden');
  document.getElementById('userName').textContent = name;
  document.getElementById('userAvatar').textContent = name.charAt(0).toUpperCase();
}

// Check existing session on load
(function() {
  const saved = sessionStorage.getItem('gr_user');
  if (saved) updateUserUI(saved);
})();

// Enter key in login form
document.getElementById('loginPass') && document.getElementById('loginPass').addEventListener('keydown', e => {
  if (e.key === 'Enter') doLogin();
});
document.getElementById('loginUser') && document.getElementById('loginUser').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('loginPass').focus();
});

// ==================
// HERO CARD CLICK
// ==================
document.querySelector('.hero-main') && document.querySelector('.hero-main').addEventListener('click', function() {
  openArticleModal({
    getAttribute: (k) => {
      if (k === 'data-title') return 'தமிழகத்தில் புதிய தொழில் கொள்கை: 50,000 வேலைவாய்ப்புகள்';
      if (k === 'data-content') return 'மாநில அரசு அறிவித்த புதிய தொழில் கொள்கையின்படி, அடுத்த மூன்று ஆண்டுகளில் 50,000 நேரடி வேலைவாய்ப்புகள் உருவாக்கப்படும் என முதலமைச்சர் தெரிவித்தார்.\n\nமாநில அரசு அறிவித்த புதிய தொழில் கொள்கையின்படி, IT, உணவுப் பதப்படுத்தல், ஜவுளி மற்றும் புதுப்பிக்கதக்க ஆற்றல் துறைகளில் முதலீடுகள் ஈர்க்கப்படும்.\n\nமுதலமைச்சர் தலைமையில் நடைபெற்ற நிகழ்வில் 20 பெரு நிறுவனங்கள் ரூ.12,000 கோடி முதலீடு செய்ய ஒப்பந்தங்கள் கையெழுத்திட்டன.';
      return '';
    }
  });
});

// ==================
// ACTIVE NAV LINK
// ==================
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

// ==================
// TABLE ROW HOVER HIGHLIGHT
// ==================
document.querySelectorAll('.data-table tbody tr').forEach(row => {
  row.style.transition = 'background 0.15s';
});

// ==================
// SEARCH
// ==================
const searchInput = document.querySelector('.search-input');
const searchBtn = document.querySelector('.search-btn');
if (searchInput && searchBtn) {
  searchBtn.addEventListener('click', doSearch);
  searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
}
function doSearch() {
  const q = searchInput.value.trim();
  if (!q) return;
  alert(`'${q}' க்காக தேடுகிறோம்...\n\n(முழு செயல்பாடு CMS இணைப்புடன் கிடைக்கும்)`);
}
