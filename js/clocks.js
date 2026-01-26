/**
 * World Clocks
 * Analog clocks for Indonesia, New York, San Francisco
 * 50ms tick for smooth second hand animation
 */

(function() {
  'use strict';

  // Timezone offsets from UTC (hours)
  var ZONES = [
    { id: 'indonesia', offset: 7 },
    { id: 'seoul', offset: 9 },
    { id: 'newyork', offset: -5 },
    { id: 'sanfrancisco', offset: -8 }
  ];

  // Cache DOM refs
  var clocks = {};
  ZONES.forEach(function(z) {
    clocks[z.id] = {
      hour: document.getElementById('hour-' + z.id),
      min: document.getElementById('minute-' + z.id),
      sec: document.getElementById('second-' + z.id),
      ampm: document.getElementById('ampm-' + z.id),
      face: document.getElementById('clock-' + z.id),
      offset: z.offset
    };
  });

  // Bail if clocks not found - check at least one clock exists
  var hasClocks = false;
  Object.keys(clocks).forEach(function(id) {
    if (clocks[id] && clocks[id].hour) {
      hasClocks = true;
    }
  });
  if (!hasClocks) return;

  // Is night time? (6pm - 6am)
  function isNight(h) { return h >= 18 || h < 6; }

  // AM/PM
  function ampm(h) { return h >= 12 ? 'PM' : 'AM'; }

  // Main tick
  function tick() {
    var now = new Date();
    var utc = now.getTime() + now.getTimezoneOffset() * 60000;
    var ms = now.getMilliseconds();

    Object.keys(clocks).forEach(function(id) {
      var c = clocks[id];
      var local = new Date(utc + c.offset * 3600000);
      var h = local.getHours();
      var m = local.getMinutes();
      var s = local.getSeconds();

      // Smooth rotation: include sub-second for second hand
      var hourDeg = ((h % 12) * 30) + (m * 0.5);
      var minDeg = (m * 6) + (s * 0.1);
      var secDeg = (s * 6) + (ms * 0.006);

      c.hour.style.transform = 'rotate(' + hourDeg + 'deg)';
      c.min.style.transform = 'rotate(' + minDeg + 'deg)';
      c.sec.style.transform = 'rotate(' + secDeg + 'deg)';
      c.ampm.textContent = ampm(h);

      // Night mode
      if (isNight(h)) {
        c.face.classList.add('night');
      } else {
        c.face.classList.remove('night');
      }
    });
  }

  // Start
  tick();
  setInterval(tick, 50);

})();
