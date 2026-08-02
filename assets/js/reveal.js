// assets/js/reveal.js
// Menambahkan efek fade-up sederhana saat elemen ber-class "reveal"
// masuk ke area pandang (viewport) ketika di-scroll.

document.addEventListener('DOMContentLoaded', function () {
    var targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;

    if (!('IntersectionObserver' in window)) {
        // Fallback: browser lama, langsung tampilkan semua elemen
        targets.forEach(function (el) { el.classList.add('revealed'); });
        return;
    }

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(function (el) { observer.observe(el); });
});
