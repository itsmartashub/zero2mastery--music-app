import { defineStore } from 'pinia'

export default defineStore('modal', {
    state: () => ({
        isOpen: false
    }),

    getters: {
        //* kao computed za store, kesiraju se f-je, i dostupni su iz svake komponente
        hiddenClass(state) {
            return !state.isOpen ? 'hidden' : ''
        }
    }
})
