import { Form as VeeForm, Field as VeeField, defineRule, ErrorMessage, configure } from 'vee-validate' //!defineRule nam omogucava da registrujemo rule globalno
import {
    required,
    min,
    max,
    alpha_spaces as alphaSpaces,
    email,
    min_value as MinVal,
    max_value as MaxVal,
    confirmed,
    not_one_of as excluded
} from '@vee-validate/rules'

export default {
    // install(app, options) {} // app je referenca na Vue application, imamo pristup istim methods i properties koje bismo imali normalno u vue. Options su podaci prosledjeni iz vue instance u plugin
    install(app) {
        app.component('VeeForm', VeeForm)
        app.component('VeeField', VeeField)
        app.component('ErrorMessage', ErrorMessage)

        defineRule('required', required)
        defineRule('tos', required)
        defineRule('min', min)
        defineRule('max', max)
        defineRule('alpha_spaces', alphaSpaces)
        defineRule('email', email)
        defineRule('email', email)
        defineRule('min_value', MinVal)
        defineRule('max_value', MaxVal)
        defineRule('passwords_mismatch', confirmed)
        defineRule('excluded', excluded)
        defineRule('country_excluded', excluded)

        configure({
            generateMessage: (ctx) => {
                // ova f-ja ce se pozvati svakui x kada god global validator f-ja vrati false
                const messages = {
                    required: `The field ${ctx.field} is required.`, // ime pripertija mora biti i kao i ime pravila tj rule. Preko ctx mozemo da pristupimo imenu fielda preko field propertija (ctx.field)
                    min: `The field ${ctx.field} is too short.`,
                    max: `The field ${ctx.field} is too long.`,
                    alpha_spaces: `The field ${ctx.field} may only contain alphabetical characters and spaces.`,
                    email: `The field ${ctx.field} must be a valid email.`,
                    min_value: `The field ${ctx.field} is too low.`,
                    max_value: `The field ${ctx.field} is too high.`,
                    excluded: `You are not allowed to use this value for the field ${ctx.field}.`,
                    country_excluded: `Due to restrictions, we do not accept users from this location.`,
                    passwords_mismatch: `The passwords don't match.`,
                    tos: 'You must accept the Terms of Services.'
                }

                const message = messages[ctx.rule.name]
                    ? messages[ctx.rule.name]
                    : `The field ${ctx.field} is not valid.`

                return message
            },
            validateOnBlur: true,
            validateOnChange: true,
            validateOnInput: false,
            validateOnModelUpdate: true
        })
    }
}
