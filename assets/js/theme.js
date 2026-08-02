// assets/js/theme.js
// Menentukan tema (dark/light) sedini mungkin agar tidak ada "kedipan"
// warna saat halaman pertama kali dimuat, lalu menyediakan fungsi toggle
// yang dipakai oleh tombol matahari/bulan di navbar.

(function () {
    var stored = null;
    try {
        stored = localStorage.getItem('theme');
    } catch (e) {
        /* localStorage tidak tersedia, abaikan */
    }
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (stored === 'dark' || (!stored && prefersDark)) {
        document.documentElement.classList.add('dark');
    }
})();

function toggleTheme() {
    var html = document.documentElement;
    var isDark = html.classList.toggle('dark');
    try {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
        /* localStorage tidak tersedia, abaikan */
    }
    updateThemeIcons();
}

function updateThemeIcons() {
    var isDark = document.documentElement.classList.contains('dark');
    document.querySelectorAll('[data-theme-icon]').forEach(function (el) {
        el.textContent = isDark ? 'light_mode' : 'dark_mode';
    });
}

document.addEventListener('DOMContentLoaded', updateThemeIcons);
