// import _ from 'lodash'
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

export default {
    install(app) {
        /*  
       import.meta objekat je dostupan u svim js fajlovima. To je objecat sa informacijama koja se odnose na trenutni module. Vite je extendovao ovaj objekat dodajuci f-ju glob(). Glob je dakle feature za searchovanje fajlova po nekom paternu. Ova f-ja ce importovati fajlove, difoltno glob() f-ja ce lazy loadovati module. U nasem slucaju, nas interesuje importovanje fajlova momentalno. Ne treba nam lazy loading. 

       Dodacmo za drugi parametar objekat u kom stavljamo da property eager bude true, sto omogucava da f-ja loaduje module momentalno. Za prvi argument stavljamo path sa folderom gde ce se nalaziti globalne componente.
       DIfoltno, glob() ce da vrati objekat importovanih fajlova. Logicno, lakse je lupovati kroz Niz nego kroz Objekat. Pa cemo sa Object.entries() da konvertujemo ovaj baseComponents Object u Niz, gde ce prva vrednost u nizu biti key, a druga value. Prvi item u nizu sadrzi path, a drugi module sarzi component data. 
       
       Importovacemo lodash. Vite sadrzi lodash internaly, pa zato ne treba da ga posebno instaliramo. Importujemo lodash jer zelimo da formatiramo ime u pascalCase.
       */

        const baseComponents = import.meta.glob('../components/base/*.vue', {
            eager: true
        }) // {../components/base/Button.vue: Module}

        // console.log(baseComponents)
        /*  
        path ---> ../components/base/Button.vue:
        module ---> Module */

        Object.entries(baseComponents).forEach(([path, module]) => {
            const componentName = upperFirst(
                camelCase(
                    path
                        .split('/')
                        .pop()
                        .replace(/\.\w+$/, '')
                )
            )
            /*
            _.upperFirst() ce uciniti prvo slovo u stringu velikim, a _.camelCase() ce kamelkejsovati string, obvio. Path varijabla ce sadrzati full path do fajla. Medjutim, nas ne zanima citav path, vec samo ime. Zato koristimo .split('/') koji ce da splituje path po / u niz. Poslednji item u tom nizu ce uvek biti ime fajla koje nama treba. Dohvaticemo poslednji item sa .pop() metodom. Regex ce ukloniti file ekstenziju iz fajla (.vue) */

            // console.log(path, componentName)

            // export default
            app.component(`Base${componentName}`, module.default)
        })
    }
}

/* 
U JS-u, mozemo da asajnujemo export vrednost da bude ime ili u okviru nekog namespace. Npr, u _global.js fajlu, exportujemo plugin u okviru default namespace (export default {}). Componente su takodje exportovane kao default namespace zato su component podaci dostupan preko default propertija. Zato dodajemo default na module (module.default). Dakle ako je componenta exportovana kao ddefault namespace, Vite ce dodati konfiguracione opcije unutar nase propertija koji se zove .default.
Dodacemo prefix Base ispred svakog imena komponenti (jer su u base folderu, al ne mora Base, to je samo name convention) */

/* 
Idemo u About.vue da testiramo ovo. Dodacemo <base-button/> ispod <h1> */
