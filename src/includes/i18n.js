import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'
import fr from '@/locales/fr.json'

export default createI18n({
    locale: 'en', // locale predstavlja jezik/origin (https://www.science.co.il/language/Locale-codes.php)
    fallbackLocale: 'en', // ako cemo imati vise jezika, postoji mogucnost da ce nam faliti nekoliko prevoda, u nekim slucajevima korisnik moze da switcuje u locale koji ne postoji, u tom slucaju, vue-i18n ce fallback-ovati u drugi locale. Postoji mogucnost da vremenom obrisemo mozda neki jezik (prevod), a korisnik je mozda koristio taj prevod, i onda kad dodje sl x, dobice blank page. Da bismo to izbegli obavezno treba da stavimo fallbackLocale property
    messages: {
        en, // property ime mora biti ono koje je u locale (en). Napravicemo poseban fajl za prevod: ./src/locales/en.json. en: {} cemo staviti en: en tj en
        fr
    },
    numberFormats: {
        // i ovo mozemo kao i en i fr u poseban fajl, pa da importujemo, ali mi to necemo raditi, jer nece biti mng koda
        en: {
            currency: {
                style: 'currency',
                currency: 'USD' // "currency" | "decimals" | "times" | etc. in18 koristi Intl JS API (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat)
            }
        },
        ja: {
            currency: {
                style: 'currency',
                currency: 'JPY'
            }
        } // japanski locale
    }
})

/* 

001 Language-Codes
https://www.science.co.il/language/Locale-codes.php

001 Vue-I18N
https://vue-i18n.intlify.dev/guide/

003 Pluralization
https://vue-i18n-next.intlify.dev/guide/essentials/pluralization.html

004 Number-Localization
https://vue-i18n-next.intlify.dev/guide/essentials/number.html

004 Number-Format
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat

005 Component-Interpolation
https://vue-i18n-next.intlify.dev/guide/advanced/component.html


en.json
    {
        "home": {
            "listen": "Listen to Great Music!"
        },
        "song": {
            "comment_count": "No comments | 1 comment | {count} comments"
        },
        "register": {
            "accept": "I accept Music's <a>Terms of Service</a>"  ===> kada korsitimo ovo, moze ako doci do XSS hackovanja, zato treba koristiti interpolation tj. placeholdere
        } 
    }


*/
