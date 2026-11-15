(function () {
  "use strict";
  var choiceKey = "digibenz-cookie-choice";

  function readChoice() { try { return window.localStorage.getItem(choiceKey); } catch (error) { return null; } }
  function saveChoice(value) { try { window.localStorage.setItem(choiceKey, value); } catch (error) {} }

  function injectGoogleTagManager() {
    if (window.__digibenzGtmLoaded) return;
    window.__digibenzGtmLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    var gtm = document.createElement("script");
    gtm.async = true;
    gtm.src = "https://www.googletagmanager.com/gtm.js?id=GTM-PZKPDH8Z";
    document.head.appendChild(gtm);
  }

  function injectMetaPixel() {
    if (window.__digibenzMetaPixelLoaded) return;
    window.__digibenzMetaPixelLoaded = true;
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n; n.loaded = true; n.version = "2.0"; n.queue = [];
      t = b.createElement(e); t.async = true; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", "2380121729604813");
    window.fbq("track", "PageView");
  }

  function startOptionalTracking() { injectGoogleTagManager(); injectMetaPixel(); }

  function ensureBanner() {
    var banner = document.querySelector(".cookie");
    if (!banner) {
      banner = document.createElement("div");
      banner.className = "cookie";
      banner.innerHTML = '<b>Cookie preferences</b><p></p><div class="cookie-actions"><button class="accept" type="button" data-cookie="all">Accept all</button><button type="button" data-cookie="essential">Reject non-essential</button><button type="button" data-cookie="custom" aria-expanded="false">Customize</button></div>';
      document.body.appendChild(banner);
    }
    var message = banner.querySelector("p");
    if (message) message.textContent = "Essential storage supports the site. Google Tag Manager and Meta Pixel load only if you allow optional analytics and advertising tracking.";
    var actions = banner.querySelector(".cookie-actions");
    if (!actions) { actions = document.createElement("div"); actions.className = "cookie-actions"; banner.appendChild(actions); }
    if (!actions.querySelector('[data-cookie="all"]')) {
      var accept = document.createElement("button"); accept.className = "accept"; accept.type = "button"; accept.dataset.cookie = "all"; accept.textContent = "Accept all"; actions.appendChild(accept);
    }
    if (!actions.querySelector('[data-cookie="essential"]')) {
      var reject = document.createElement("button"); reject.type = "button"; reject.dataset.cookie = "essential"; reject.textContent = "Reject non-essential"; actions.appendChild(reject);
    }
    if (!actions.querySelector('[data-cookie="custom"]')) {
      var customize = document.createElement("button"); customize.type = "button"; customize.dataset.cookie = "custom"; customize.setAttribute("aria-expanded", "false"); customize.textContent = "Customize"; actions.appendChild(customize);
    }
    var settings = banner.querySelector(".cookie-settings");
    if (!settings) {
      settings = document.createElement("div"); settings.className = "cookie-settings";
      settings.innerHTML = '<label><input type="checkbox" data-cookie-optional> Allow optional tracking (Google Tag Manager and Meta Pixel)</label><button type="button" data-cookie-save>Save preferences</button>';
      banner.appendChild(settings);
    }
    var reopen = document.querySelector(".cookie-reopen");
    if (!reopen) {
      reopen = document.createElement("button"); reopen.type = "button"; reopen.className = "cookie-reopen"; reopen.textContent = "Cookie settings"; reopen.setAttribute("aria-label", "Open cookie settings"); document.body.appendChild(reopen);
    }
    return { banner: banner, actions: actions, settings: settings, reopen: reopen };
  }

  function setBannerVisibility(elements, show) {
    elements.banner.classList.toggle("show", show);
    elements.reopen.hidden = show;
  }

  function selectChoice(elements, nextChoice) {
    var previousChoice = readChoice();
    saveChoice(nextChoice);
    setBannerVisibility(elements, false);
    elements.settings.classList.remove("open");
    var customize = elements.actions.querySelector('[data-cookie="custom"]');
    if (customize) customize.setAttribute("aria-expanded", "false");
    if (nextChoice === "all") startOptionalTracking();
    window.dispatchEvent(new CustomEvent("digibenz:consent", { detail: { choice: nextChoice } }));
    if (previousChoice === "all" && nextChoice !== "all") window.location.reload();
  }

  function initialize() {
    var elements = ensureBanner();
    var currentChoice = readChoice();
    if (currentChoice === "all") { setBannerVisibility(elements, false); startOptionalTracking(); }
    else if (currentChoice === "essential") setBannerVisibility(elements, false);
    else setBannerVisibility(elements, true);

    elements.actions.addEventListener("click", function (event) {
      var button = event.target.closest("[data-cookie]");
      if (!button) return;
      var selected = button.dataset.cookie;
      if (selected === "custom") {
        var open = !elements.settings.classList.contains("open");
        elements.settings.classList.toggle("open", open);
        button.setAttribute("aria-expanded", String(open));
        var checkbox = elements.settings.querySelector("[data-cookie-optional]");
        if (checkbox) checkbox.checked = readChoice() === "all";
        return;
      }
      selectChoice(elements, selected);
    });

    elements.settings.querySelector("[data-cookie-save]").addEventListener("click", function () {
      var checkbox = elements.settings.querySelector("[data-cookie-optional]");
      selectChoice(elements, checkbox && checkbox.checked ? "all" : "essential");
    });

    elements.reopen.addEventListener("click", function () {
      setBannerVisibility(elements, true); elements.settings.classList.add("open");
      var customize = elements.actions.querySelector('[data-cookie="custom"]');
      if (customize) customize.setAttribute("aria-expanded", "true");
      var checkbox = elements.settings.querySelector("[data-cookie-optional]");
      if (checkbox) checkbox.checked = readChoice() === "all";
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
