import NProgress from 'nprogress'

/* 
Treba da dohvatimo router object. Problem je sto nemamo pristup njemu, a ne mozemo da koristimo navigation guards bez njega. Ovo mozemo da resimo tako sto cemo poslati router object f-ji unutar ovog fajla. Ovde cemo export default f-ju sa router parametrom, a onda idemo u main.js gde cemo importovati progressBar tj ovaj fajl: import progressBar from './includes/progress-bar'. Takodje cemo tamo importovati nprogressov css: import "nprogress/nprogress.css". Ovo je defaultni stajl, i to je opciono, mozemo i mi sami da kreiramo stajl. 

.beforeEach() --- pozove se pre nego sto guard pocne da ucitava komponentu. Ovo smo vec negde koristili, ali nije frka, mozemo vise x da je kor., mozemo vise x da definisemo isti guard. Koristicemo za prikazivanje NProgress bara

.afterEach() --- Inace bismo kao i u beforeEach() prosledili arr f-ju, ali nema potrebe, samo treba da uklonimo progres bar, tj pozovemo NProgress.done. Nismo invokovali done f-ju sa zagradama tj. done(), jer bi to pzvalo f-ju odmah. A mi zelimo da se ona pozove kada se afterEach() guard okine. Btw, za razliku od drugih guard f-ja, .afterEach() guard nema next() f-ju */

export default (router) => {
    router.beforeEach((to, from, next) => {
        NProgress.start()
        next()
    })

    router.afterEach(NProgress.done)
}
