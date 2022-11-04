export default {
    beforeMount(el, binding) {
        // koristimo ovo jer zelimo da insertujemo fontawesome icons pre nego sto se element insertuje u document

        let iconClass = `fa fa-${binding.value} text-xl` // binding Object holduje podatke koje prosledjumemo u direktivu, pristupamo vrednosti putem value propertija. TRenutno, binding argument nismo dodali u fn, moramo dodati kao parametre f-ji beforeMount(). Sad idemo u HomeView.vue da apdejtujemo v-icon, kojoj cemo za vrednost dfa prosledimo ime ikonice koju zelimo: v-icon="'headphones-alt'"

        if (binding.arg === 'full') iconClass = binding.value
        if (binding.modifiers.right) iconClass += ' float-right' // obavezno staviti space na pocetku ' float-right' jer se ono dodaje na ostale klase, inace nece raditi
        if (binding.modifiers.yellow) iconClass += ' text-yellow-400'
        else iconClass += 'text-green-400'

        // Jedna od mana koju modifiers imaju je ta sto ne mogu biti dinamicki kao arguments; arg property ce uvek biti definisana u binding Object, dok modifiers mogu vratiti undefined ukoliko nisu dostupni. Oboje je korisno, u zavisnosti sta zelimo da postignemo.

        el.innerHTML += `<i class="${iconClass}"></i>` // obavezno dodajem plus, tj ne mozeo samo = jer bi to kompletno overwrittovalo sadrzaj na srtanici za ovim html kodom, zelimo da DODAMO ovo na postojeci HTML kod, zato stavljamo +=.

        //! Sada idemo da registrujemo direktivu, i to globalno te idemo u main.js fajl. Direktiva mora biti registrovana PRE nego sto je APPLICATION mounted dakle pre: app.mount('#app'), tuiznad toga stavljamo app.directive()
    }
}

/* 
I LIFECYCLE HOOKS:
    Direktive imaju lifecycle fn slicno kao i komponente. Kada god koristimo u nekom templejtu direktivu, Vue ce pozvati 6 fn-a, one ce se pozvati za razlicite faze direktive. WTF

    1. beforeMount - izvrsi se kada je direktiva prvi put vezana za element i pre nego sto se parent component mount-uje. Ovde ELEMENT JOS NIJE DODAT document-u, iako je DIREKTIVA UCITANA na elementu! Ako zelimo da manipulisemo elementom dok je na stranici, treba da koristimo mounted hook

    2. mounted - kada se element doda na page. DAkle kada se direktiva mount-uje u document.

    3. beforeUpdate - izvrsava se pre nego sto se direktiva apdejtuje

    4. updated - izvrsi se kada je direktiva apdejtovana. NPR. ako koristimo expression ili binding attributes na elementu, i oni se apdejtuju, ova fn ce se izvrsiti

    5. beforeUnmount - pozove se pre nego sto se direktiva ukloni tj. unmountuje iz dokumenta. Recimo ako koristimo direktivu u komponenti koja je unmount-ovana, direktiva ce takodje biti unmountovana. 

    6. unmounted - logicno, izvrsava se kada se direktiva unmount-uje iz dokumenta

II HOOK ARGUMENTS:
    1. el - element na kom se bind-uje (the element the binding sits on). Ovo je element u documentu; Object ce imati isti propertije i metode koje ima i DOM Object: mozemo da promenimo style, kontent, etc.

    2. binding - objekat koji sadrzi argumente koje su prosledjene u hooks. Holduje podatke koje su dodate u direktive, ukljucujuci value i modifiers. Ovo se koristi ne bismo li dali vecu flexibilnosti nasoj direktivi. READ ONLY property - vrsenje modifikacije na ovom propertiju nece imati bas lep rezultat
    
    3. vnode - omogucava nam da se uputimo direktno na node u virtual DOM-u ako je to ono sto nam treba. Vue ce napraviti kopiju DOM-a koji se zove Virtual DOM. OVo se od el argumenta razlikuje sto promene koje izvrsimo u Virtual DOM-u nece se reflektovati na stranici. READ ONLY property - vrsenje modifikacije na ovom propertiju nece imati bas lep rezultat

    4. prevNode - prethodna verzija vnode objecta. Moze da se koristi samo u beforeUpdate i updated hooks
*/
