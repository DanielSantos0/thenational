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
    image.src = 'assets/dota-icon.svg';
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
