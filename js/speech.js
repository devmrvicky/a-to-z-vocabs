/* =========================
   SPEECH / PRONUNCIATION
========================= */

/**
 * Speak a word using the Web Speech API.
 */
function speakWord(word) {
  if (!('speechSynthesis' in window)) return;
  const utt = new SpeechSynthesisUtterance(word);
  utt.lang = 'en-US';
  utt.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
}
