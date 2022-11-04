export default {
    beforeMount(el, binding) {
        let iconClass = `fa fa-${binding.value.icon} text-green-400 text-xl` // ovo sad icon na binding.value jeste definisana u v-icon-secondary, odn. objektu koji je vrednost (value) ove direktive

        if (binding.value.right) iconClass += ' float-right' // ovo sad right na binding.value jeste definisana u v-icon-secondary, odn. objektu koji je vrednost (value) ove direktive

        el.innerHTML += `<i class="${iconClass}"></i>`
    }
}

/* 
    Ovu direktivu cemo za razliku od icon.js, ucitati lokalno tamo gde cmo je korititi, a ne globalno. Idemo u HomeView.vue, importujemo je prvo, potom dodamo directives: { 'icon-secondary': IconSecondary }
*/
