(function () {
  'use strict';

  var DAY = 86400000;
  var JST = 9 * 3600000;

  function japanDay(timestamp) {
    return Math.floor((timestamp + JST) / DAY);
  }

  // A seeded shuffle gives every game a turn; consecutive days never repeat.
  // The fixed ordering makes the choice identical for everyone on a given JST day.
  function shuffledGames(games) {
    var result = games.slice().sort(function (a, b) { return a.day - b.day; });
    var seed = 0xa0ba2026;
    function random() {
      seed += 0x6D2B79F5;
      var value = seed;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    }
    for (var i = result.length - 1; i > 0; i--) {
      var j = Math.floor(random() * (i + 1));
      var swap = result[i];
      result[i] = result[j];
      result[j] = swap;
    }
    return result;
  }

  function pickDailyGame(games, timestamp) {
    if (!games.length) return null;
    var ordered = shuffledGames(games);
    var index = ((japanDay(timestamp) % ordered.length) + ordered.length) % ordered.length;
    return ordered[index];
  }

  if (typeof module === 'object' && module.exports) {
    module.exports = { japanDay: japanDay, pickDailyGame: pickDailyGame, shuffledGames: shuffledGames };
    return;
  }

  var grid = document.querySelector('#game-list');
  if (!grid) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-game-card]'));
  var games = cards.map(function (card) {
    var image = card.querySelector('img');
    return { day: Number(card.dataset.day), title: card.dataset.title,
      url: card.querySelector('a').getAttribute('href'), image: image.getAttribute('src'), card: card };
  });
  var daily = document.querySelector('[data-daily-game]');
  var displayedDay;
  var timer;

  function updateDaily() {
    var now = Date.now();
    var day = japanDay(now);
    if (displayedDay !== day) {
      var game = pickDailyGame(games, now);
      daily.querySelector('#daily-heading').textContent = '今日の1本';
      daily.querySelector('[data-daily-number]').textContent = 'No. ' + game.day;
      daily.querySelector('[data-daily-title]').textContent = game.title;
      daily.querySelector('[data-daily-link]').setAttribute('href', game.url);
      var image = daily.querySelector('[data-daily-image]');
      image.setAttribute('src', game.image);
      displayedDay = day;
    }
    clearTimeout(timer);
    timer = setTimeout(updateDaily, (day + 1) * DAY - JST - now + 50);
  }

  updateDaily();
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') updateDaily();
  });

  var sort = document.querySelector('#game-sort');
  document.querySelector('[data-game-controls]').hidden = false;
  sort.addEventListener('change', function () {
    var ordered = games.slice().sort(function (a, b) {
      if (sort.value === 'name') return a.title.localeCompare(b.title, 'ja');
      return sort.value === 'oldest' ? a.day - b.day : b.day - a.day;
    });
    ordered.forEach(function (game) { grid.appendChild(game.card); });
  });
})();
