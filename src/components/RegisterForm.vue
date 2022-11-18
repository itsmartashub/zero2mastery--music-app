<template>
    <div class="text-white text-center font-bold p-4 rounded mb-4" v-if="reg_show_alert" :class="reg_alert_variant">
        {{ reg_alert_msg }}
    </div>

    <vee-form :validation-schema="schema" @submit="register" :initial-values="userData">
        <!-- Name -->
        <div class="mb-3">
            <label class="inline-block mb-2">Name</label>
            <vee-field
                type="text"
                name="name"
                class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                placeholder="Enter Name"
            />
            <ErrorMessage class="text-red-600" name="name" />
            <!-- ovo name u ErrorMessage mora biti kao vrednost za name u gore u vee-field -->
        </div>
        <!-- Email -->
        <div class="mb-3">
            <label class="inline-block mb-2">Email</label>
            <vee-field
                type="email"
                name="email"
                class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                placeholder="Enter Email"
            />
            <ErrorMessage class="text-red-600" name="email" />
        </div>
        <!-- Age -->
        <div class="mb-3">
            <label class="inline-block mb-2">Age</label>
            <vee-field
                name="age"
                type="number"
                class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            />
            <ErrorMessage class="text-red-600" name="age" />
        </div>
        <!-- Password -->
        <div class="mb-3">
            <label class="inline-block mb-2">Password</label>
            <vee-field name="password" :bails="false" v-slot="{ field, errors }">
                <!-- ! ovaj errors ce biti dostupan samo ako je :bails="false", jer onda mozemo da imamo vise errora -->
                <input
                    type="password"
                    class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                    placeholder="Password"
                    v-bind="field"
                />
                <div class="text-red-600" v-for="error in errors" :key="error">{{ error }}</div>
            </vee-field>
            <!-- <ErrorMessage class="text-red-600" name="password" /> -->
        </div>
        <!-- Confirm Password -->
        <div class="mb-3">
            <label class="inline-block mb-2">Confirm Password</label>
            <vee-field
                type="password"
                name="confirm_password"
                class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
                placeholder="Confirm Password"
            />
            <ErrorMessage class="text-red-600" name="confirm_password" />
        </div>
        <!-- Country -->
        <div class="mb-3">
            <label class="inline-block mb-2">Country</label>
            <vee-field
                as="select"
                name="country"
                class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            >
                <option value="USA">USA</option>
                <option value="Mexico">Mexico</option>
                <option value="Germany">Germany</option>
                <option value="Antarktik">Antarktik</option>
            </vee-field>
            <ErrorMessage class="text-red-600" name="country" />
        </div>
        <!-- TOS -->
        <div class="mb-3 pl-6">
            <vee-field type="checkbox" name="tos" value="1" class="w-4 h-4 float-left -ml-6 mt-1 rounded" />
            <!-- <label class="inline-block">Accept terms of service</label> -->
            <!-- 
                //! menjamo <label> element sa <i18n-t> Komponentom, jer ovaj prevod vucemo iz en.json. Za atribut stavljamo keypath="register.accept" koji gadja koji tacno prevod. Ovo treba da se wrappuje u neki real HTML tag, pa stavljamo jos jedan atribut, koji se zove tag="label".
                //! Text ili element (content) koji stavimo unutar <i18n-t> komponente ce zameniti placeholder koji smo naveli za register.accept path
                https://vue-i18n-next.intlify.dev/guide/advanced/component.html
             -->
            <i18n-t class="inline-block" keypath="register.accept" tag="label">
                <a href="#"> {{ $t('register.tos') }}</a>
            </i18n-t>
            <ErrorMessage class="text-red-600 block" name="tos" />
        </div>
        <button
            type="submit"
            class="block w-full bg-purple-600 text-white py-1.5 px-3 rounded transition hover:bg-purple-700"
            :disabled="reg_in_submission"
        >
            Submit
        </button>
    </vee-form>
</template>

<script>
import { mapActions } from 'pinia'
import useUserStore from '@/stores/user'

export default {
    name: 'RegisterForm',
    data() {
        return {
            tab: 'login',
            schema: {
                name: 'required|min:3|max:100|alpha_spaces',
                email: 'required|min:3|max:100|email',
                age: 'required|min_value:18|max_value:100',
                password: 'required|min:9|max:100|excluded:password',
                confirm_password: 'passwords_mismatch:@password',
                country: 'required|country_excluded:Antarktik',
                tos: 'tos'
            },
            userData: {
                //? initial values
                country: 'USA'
            },
            reg_in_submission: false,
            reg_show_alert: false,
            reg_alert_variant: 'bg-blue-500',
            reg_alert_msg: 'Please wait! Your account is being created.'
        }
    },

    methods: {
        ...mapActions(useUserStore, {
            //! mapActions nisu predvidjene da budu computed, zato ih stavljamo u methods
            createUser: 'register'
        }),

        async register(values) {
            this.reg_show_alert = true
            this.reg_in_submission = true
            this.reg_alert_variant = 'bg-blue-500'
            this.reg_alert_msg = 'Please wait! Your account is being created.'

            try {
                await this.createUser(values)
            } catch (error) {
                this.reg_in_submission = false
                this.reg_alert_variant = 'bg-red-500'
                this.reg_alert_msg = 'An unexpected error occured. Please try again later.'
                return
            }

            this.reg_alert_variant = 'bg-green-500'
            this.reg_alert_msg = 'Success! Your account has been created.'

            window.location.reload()
        }
    }
}
</script>
