import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        VitePWA({
            registerType: 'autoUpdate',
            /*
            PWA apps su parcijalno f-nalne i offline. Da bismo to postigli moramo da dodamo ovaj feature. Browser treba da skine fajlove sa servera i da ih kesira. Kesiranje je feature koji cuva kopiju fajlova u lokalu, u browseru. Ovo moze da bustuje performance sajta. Fajl ne treba da je skinut dva x. Ali ofc, moze da izazove neke issues. Recimo,  sta ako se fajl adpdejtuje? Korisnik bi trebalo da skine poslednju kopiju.
            Kada stavljamo registerType: 'autoUpdate', app ce automatski da se apdejtuje sa poslednjom kopijom */
            devOptions: {
                enabled: true
                /* 
                Ovde ide konfiguracija podesavanja za dev server. DIfoltno, manifest file se ne kreira za dev servere, kreirace se samo za production, zato cemo overvritovati to stavljajuci enabled: true. */
            },
            manifest: {
                // ovde cemo menjati ime, boju teme i ikonice
                name: 'Music App',
                theme_color: '#ff5e3a', // Glavna boja za nase UI elemente, fazon accent
                icons: [
                    // niz ikonica, svaka je za sebe, mozemo vise iknica da imamo ofc, za razlicite uredjaje. source, sizes i type moramo dodati za svaku ikonicu
                    {
                        src: 'assets/img/pwa-192x192.png', // path ka fajlu
                        sizes: '192x192',
                        type: 'image/png'
                    }
                ]
            },
            workbox: {
                // sluzi za kesiranje static assets, ali ne i APi requests
                globPatterns: ['**/*.{js,css,html,png,jpg,}'] // glob. Poznato je za kompjuterske programe da traze fajlove unutar sistema. Medjutim, mi mozda nemamo kompletnu listu fajlova. I umesto da kreiramo kompletnu listu tih fajlova, mozemo kreirati pattern. Ako fajl mecuje patern, bice dodat u results listu. glob je paket koji pretrazuje fajlove zadatim paternima. Pattern ce koristiti da kesira js, css, html i slike. Sad pokrenimo: npm run build, pa potop npm run preview, pa u browseru dohvatimo nasu app, pa odemo offline i ponovo rifresujemo app
            }
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
})
