export default class formValidator {
    constructor () {
        this.result = [];
    }

    checkFields(obj) {
        this.result = [];

        for (let name in obj) {
            let val = obj[name];
            // if we check a lot of field with one type
            if (Array.isArray(val)) {
                let arr = val;

                arr.forEach(item => {
                    this.result.push(this[name](item));
                })

            } else {
                // if we check one field with this type
                this.result.push(this[name](val));
            }
        }

        return this.checkResult();
    }

    checkResult() {
        let i = 0;
        this.result.forEach(item => {
            if (item) i++;
        });

        if (i === this.result.length) {
            return true;
        }
        return false;
    }

    text(elem) {
        let value = elem.value;
        if (value.length === 0) {
            this.showValidateError(elem, 'This field must be fill!');
            return false;
        } else if (value.length < 3) {
            this.showValidateError(elem, 'Name should have at least 3 characters!');
            return false;
        }
        this.removeValidateError(elem);
        return true;
    }

    email(elem) {
        let value = elem.value;
        let regExp = new RegExp('[-.\\w]+@([\\w-]+\\.)+[\\w-]', 'g');
        let res = value.match(regExp);
        if (value.length === 0) {
            this.showValidateError(elem, 'This field must be fill!');
            return false;
        } else if (!res) {
            this.showValidateError(elem, 'Please type correct email!');
            return false;
        }
        this.removeValidateError(elem);
        return true;
    }

    password(elem) {
        let value = elem.value;
        if (value.length === 0) {
            this.showValidateError(elem, 'This field must be fill!');
            return false;
        } else if (value.length < 6) {
            this.showValidateError(elem, 'Password should have at least 6 characters!');
            return false;
        }
        this.removeValidateError(elem);
        return true;
    }

    showValidateError(elem, message) {
        // delete old error message
        this.removeValidateError(elem);

        // add new error message
        let formGroup = elem.closest('.form-group');
        let span = document.createElement('span');

        elem.style.borderColor = '#e2591b';
        span.className = 'validate-error';
        span.textContent = message;
        span.style.cssText = `
             position: absolute;
             top: 100%;
             left: 0;
             color: #ff9900;
             font-size: 13px;
             font-style: italic;
             line-height: 1.4em;
             z-index: 101;
            `;

        formGroup.appendChild(span);
    }

    removeValidateError(elem) {
        let validateErrorElem = elem.closest('.form-group').querySelector('.validate-error');
        if (!validateErrorElem) return;
        elem.style.borderColor = '#caff00';
        validateErrorElem.remove();
    }
}