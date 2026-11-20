/* Optional enhancements; every destination is an ordinary link without JavaScript. */
(() => {
  'use strict';
  const town = document.querySelector('.dev-town');
  if (!town) return;
  const dialog = town.querySelector('.town-dialog__text');
  const welcome = dialog.textContent;
  const messages = {
    apps: '工房へようこそ。日々の「これがほしい」を、アプリにしています。',
    games: 'ゲームセンターへようこそ。気になるゲームを、ひとつどうぞ。',
    blog: '図書館へようこそ。試したこと、作ったことを、ここに書いています。',
    about: 'aomaです。アプリやゲームを作っている人のことも、少しだけ。'
  };
  const links = [...town.querySelectorAll('[data-town-link]')];
  const show = link => {
    town.dataset.active = link.dataset.townLink;
    dialog.textContent = messages[link.dataset.townLink];
  };
  const clear = () => {
    const focused = links.find(link => link === document.activeElement);
    if (focused) return show(focused);
    delete town.dataset.active;
    dialog.textContent = welcome;
  };
  links.forEach(link => {
    link.addEventListener('pointerenter', () => show(link));
    link.addEventListener('pointerleave', clear);
    link.addEventListener('focus', () => show(link));
    link.addEventListener('blur', () => {
      delete town.dataset.active;
      dialog.textContent = welcome;
    });
  });
  const menu = town.querySelector('.town-menu');
  const menuLinks = [...menu.querySelectorAll('a')];
  menu.addEventListener('keydown', event => {
    const current = menuLinks.indexOf(document.activeElement);
    if (current < 0) return;
    let next;
    const columns = window.matchMedia('(max-width: 640px)').matches ? 2 : 4;
    if (event.key === 'ArrowRight') next = (current + 1) % menuLinks.length;
    if (event.key === 'ArrowLeft') next = (current + menuLinks.length - 1) % menuLinks.length;
    if (event.key === 'ArrowDown') next = (current + columns) % menuLinks.length;
    if (event.key === 'ArrowUp') next = (current + menuLinks.length - columns) % menuLinks.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = menuLinks.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    menuLinks[next].focus();
  });
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const motionButton = town.querySelector('.town-motion');
  let paused = false;
  const updateMotion = () => {
    const stopped = paused || motion.matches;
    town.dataset.paused = String(stopped);
    motionButton.hidden = false;
    motionButton.disabled = motion.matches;
    motionButton.setAttribute('aria-pressed', String(stopped));
    motionButton.textContent = motion.matches ? '動き：なし' : (paused ? '動きをつける' : '動きを止める');
    motionButton.title = motion.matches ? '端末の「視差効果を減らす」設定に合わせています' : '';
  };
  motionButton.addEventListener('click', () => { paused = !paused; updateMotion(); });
  motion.addEventListener('change', updateMotion);
  updateMotion();
})();
