/**
 * Generatore universale di UUID compatibile con HTTP, HTTPS, WebViews e browser legacy.
 * Nei contesti non protetti (come HTTP su indirizzo IP), window.crypto.randomUUID non è fornito nativamente dal browser.
 */
export const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && typeof window.crypto.randomUUID === "function") {
    try {
      return window.crypto.randomUUID();
    } catch (e) {}
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Polyfill automatico per proteggere qualsiasi libreria o chiamata a crypto.randomUUID
if (typeof window !== "undefined") {
  if (!window.crypto) {
    window.crypto = {};
  }
  if (!window.crypto.randomUUID) {
    window.crypto.randomUUID = generateUUID;
  }
}
