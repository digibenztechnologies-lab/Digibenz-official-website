(function () {
  "use strict";

  function removeCookieControls() {
    document.querySelectorAll(".cookie, .cookie-reopen").forEach(function (element) {
      element.remove();
    });
  }

  function loadGoogleTagManager() {
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

  function loadMetaPixel() {
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

  removeCookieControls();
  loadGoogleTagManager();
  loadMetaPixel();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", removeCookieControls, { once: true });
  }
})();
