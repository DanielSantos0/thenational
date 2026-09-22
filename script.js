const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');

if (toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!open));
    nav.classList.toggle('open', !open);
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('visible');
  });
}, { threshold: 0.15 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const countdownElements = {
  months: document.querySelector('[data-countdown="months"]'),
  days: document.querySelector('[data-countdown="days"]'),
  hours: document.querySelector('[data-countdown="hours"]'),
  minutes: document.querySelector('[data-countdown="minutes"]'),
  seconds: document.querySelector('[data-countdown="seconds"]')
};

const eventDate = new Date('2027-05-27T00:00:00-03:00');
const gmtMinusThree = 3 * 60 * 60 * 1000;

function getCountdown(now) {
  if (now >= eventDate) {
    return { months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const zonedNow = new Date(now.getTime() - gmtMinusThree);
  const zonedTarget = new Date(eventDate.getTime() - gmtMinusThree);
  let months = (zonedTarget.getUTCFullYear() - zonedNow.getUTCFullYear()) * 12
    + zonedTarget.getUTCMonth() - zonedNow.getUTCMonth();
  let monthCursor = new Date(zonedNow);
  monthCursor.setUTCMonth(monthCursor.getUTCMonth() + months);

  if (monthCursor > zonedTarget) {
    months -= 1;
    monthCursor = new Date(zonedNow);
    monthCursor.setUTCMonth(monthCursor.getUTCMonth() + months);
  }

  let remaining = zonedTarget - monthCursor;
  const days = Math.floor(remaining / 86400000);
  remaining %= 86400000;
  const hours = Math.floor(remaining / 3600000);
  remaining %= 3600000;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return { months, days, hours, minutes, seconds };
}

function updateCountdown() {
  const countdown = getCountdown(new Date());

  Object.entries(countdown).forEach(([unit, value]) => {
    countdownElements[unit].textContent = String(value).padStart(2, '0');
  });

  return Object.values(countdown).some(Boolean);
}

if (countdownElements.months) {
  updateCountdown();
  const countdownInterval = setInterval(() => {
    if (!updateCountdown()) clearInterval(countdownInterval);
  }, 1000);
}

const membersGrid = document.querySelector('[data-members-grid]');
const accountIds = [
  194586868,
  74114911,
  101269744,
  130053339,
  114403724,
  263774528,
  41146365,
  232033738,
  123652802,
  162539297,
  84702347,
  100874538,
  34354514
];

function createMemberCard(member, index) {
  const card = document.createElement('article');
  const image = document.createElement('img');
  const name = document.createElement('h2');

  card.className = 'member-card';
  image.src = member.avatarfull;
  image.alt = `Foto de perfil de ${member.personaname}`;
  image.width = 184;
  image.height = 184;
  image.loading = index === 0 ? 'eager' : 'lazy';
  image.decoding = 'async';
  image.addEventListener('error', () => {
    image.src = 'assets/icone-dota-2.png';
    image.classList.add('avatar-fallback');
  }, { once: true });
  name.textContent = member.personaname;

  card.append(image, name);
  return card;
}

async function loadMembers() {
  const profiles = await Promise.all(accountIds.map(async accountId => {
    try {
      const response = await fetch(`https://api.opendota.com/api/players/${accountId}`);
      if (!response.ok) throw new Error(`OpenDota respondeu com ${response.status}`);

      const { profile } = await response.json();
      if (!profile?.personaname || !profile?.avatarfull) {
        throw new Error('Perfil sem nome ou avatar');
      }

      return profile;
    } catch (error) {
      console.error(`Nao foi possivel carregar o perfil ${accountId}:`, error);
      return null;
    }
  }));

  const fragment = document.createDocumentFragment();
  profiles.forEach((profile, index) => {
    if (profile) fragment.append(createMemberCard(profile, index));
  });

  membersGrid.replaceChildren(fragment);
  membersGrid.setAttribute('aria-busy', 'false');

  if (!membersGrid.childElementCount) {
    const status = document.createElement('p');
    status.className = 'members-status members-status-error';
    status.setAttribute('role', 'alert');
    status.textContent = 'N\u00e3o foi poss\u00edvel carregar os membros agora.';
    membersGrid.append(status);
  }
}

if (membersGrid) loadMembers();
