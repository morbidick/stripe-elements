import { LitElement, html } from '@polymer/lit-element/lit-element.js';
import LitNotify from '@morbidick/lit-element-notify/lit-element-notify.js';
import '@polymer/iron-form/iron-form.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-styles/default-theme.js';
import '@polymer/paper-styles/typography.js';

// Stripe api headers Object
const apiHeaders = new Headers({
  "Content-Type": "application/x-www-form-urlencoded",
  "Accept": "application/json",
  // Stripe api version (https://stripe.com/docs/api#versioning)
  // Stripe api changelog (https://stripe.com/docs/upgrades#api-changelog)
  "Stripe-Version": "2018-05-21",
});

// Stripe api endpoint
const apiUrl = 'https://api.stripe.com/v1/tokens';

/**
 * @customElement
 * @extends {LitElement}
 */
class StripeCard extends LitNotify(LitElement) {
  static get is() { return 'stripe-card'; }

  static get properties() {
    return {
      // Your stripe publishable key (https://stripe.com/docs/dashboard#api-keys)
      publishableKey: {
        type: String,
        attribute: 'publishable-key',
      },
      // Stripe token response (https://stripe.com/docs/api#token_object-id)
      token: {
        type: Object,
        notify: true,
      },
      // Whether to show zip-code field
      hideZip: {
        type: Boolean,
        attribute: 'hide-zip',
      },
      // Whether to display the submit button
      hideSubmit: {
        type: Boolean,
        attribute: 'hide-submit',
      },
      // Label for the submit button (defaults to Submit)
      submitLabel: {
        type: String,
        attribute: 'submit-label',
      },
      // the masking character to use, defaults to space
      maskChar: {
        type: String,
        attribute: 'mask-char',
      },
      // Is true when the request is processing
      loading: {
        type: Boolean,
        reflect: true,
        notify: true,
      },
      // error text
      error: {
        type: String,
      },
    };
  }

  constructor() {
    super();

    this.maskChar = ' ';
    this.submitLabel = 'Submit';

    this._boundSubmit = this._submit.bind(this);
    this._boundMaskCard = this._maskCard.bind(this);
  }

  render() {
    return html`
    <style>
      :host {
        display: block;
      }
      .date-separator {
        margin: 0.4em 0.3em 0;
        font-size: 1.3em;
      }
      .horizontal {
        display: flex;
      }
      .wrap {
        flex-wrap: wrap;
      }
      .wrap > *, #error {
        margin: 0 0.5em;
      }
      .small {
        width: 2em;
        flex-shrink: 0;
      }
      .medium {
        flex-grow: 1;
        width: 8em;
      }
      .large {
        flex-grow: 2;
        min-width: 20em;
      }
      #error {
        min-height: 1em;
        color: var(--paper-input-container-invalid-color, var(--error-color));
        @apply --paper-font-caption;
        @apply --paper-input-error;
      }
      /* hide input number selector */
      paper-input[type="number"] {
        --paper-input-container-input: {
          -moz-appearance: textfield;
          appearance: textfield;
        };
        --paper-input-container-input-webkit-spinner: {
          -webkit-appearance: none;
          appearance: none;
          margin: 0;
        };
      }
    </style>

    <iron-form id="form">
      <form>
        <div class="horizontal wrap">
          <paper-input id="cardNumber" class="large" type="tel" allowed-pattern="[0-9 ]" name="number" label="Card number" auto-validate="" required="" no-label-float="" @value-changed=${this._boundMaskCard}></paper-input>
          <div class="horizontal">
            <paper-input class="small" type="tel" name="exp_month" label="MM" min="1" max="12" maxlength="2" auto-validate="" required="" no-label-float=""></paper-input>
            <div class="date-separator">/</div>
            <paper-input class="small" type="tel" name="exp_year" label="YY" maxlength="2" auto-validate="" required="" no-label-float=""></paper-input>
          </div>
          <paper-input class="medium" type="tel" name="cvc" label="CVC" maxlength="4" auto-validate="" required="" no-label-float=""></paper-input>
          <paper-input ?hidden=${this.hideZip} class="medium" type="text" name="address_zip" label="ZIP" no-label-float=""></paper-input>
        </div>
        <div id="error">${this.error}</div>
        <paper-button ?hidden=${this.hideSubmit} @click=${this._boundSubmit}>${this.submitLabel}</paper-button>
      </form>
    </iron-form>
  `;}

  // request token, returns a promise
  async createToken() {
    this.loading = true;

    // some basic client side validation
    if (!this.$form.validate()) {
      throw {
        type: 'form_validation',
      };
    };

    let payload = {
      'key': this.publishableKey,
      'referrer': document.location.href,
      'card': this.$form.serializeForm(),
    };

    let body;
    try {
      let response = await fetch(apiUrl, {
        method: 'POST',
        body: this._nestedQueryString(payload),
        headers: apiHeaders,
      });
      body = await response.json();
    } catch(error) {
      this.loading = false;
      throw {
        type: 'api_connection_error',
        message: 'Connection to Stripe api failed.',
        detail: error,
      };
    }

    this.loading = false;
    this.error = null;

    if (body.id) {
      this.token = body;
      return body;
    } else if (body.error) {
      this.displayError(body.error);
      throw body.error;
    } else {
      throw {
        type: 'api_error',
        message: 'Unknown error',
      };
    }
  }

  reset() {
    this.error = null;
    this.$form.reset();
    this.token = null; // see https://github.com/Polymer/polymer/issues/2565
  }

  _maskCard(event) {
    let input = event.composedPath()[0]._focusableElement;
    let value = input.value;
    let cursor = input.selectionStart;
    let previousCharASpace = value ? String(value).charAt(cursor - 1) == this.maskChar : false;

    // Bail if empty
    if (!value) { return };

    value = value
      // remove all masking characters
      .replace(new RegExp(this.maskChar, 'g'), '')
      // split in parts of 4 digits
      .match(/.{1,4}/g)
      // join by mask char
      .join(this.maskChar);

    // If the character right before the selection is a newly inserted
    // maskChar, we need to advance the selection to maintain the caret position.
    if (!previousCharASpace && value.charAt(cursor - 1) == this.maskChar) {
      cursor = cursor + 1;
    }

    input.value = value;
    // set cursor
    input.selectionStart, input.selectionEnd = cursor;
  }

  _submit() {
    this.createToken().catch((error) => {/* suppress uncaught promise warnings */});
  }

  displayError(error) {
    if (error.type == "card_error" && error.param) {
      let element = this.$form.querySelector(`[name="${error.param}"]`);

      if (element) {
        element.invalid = true;
        if (error.param == "number") {
          element.errorMessage = error.message;
          return;
        }
      }
    }
    this.error = error.message;
  }

  _nestedQueryString(params, parent) {
    var queryParts = [];
    var param;
    var value;
    for (param in params) {
      value = params[param];
      param = window.encodeURIComponent(param);
      if (typeof value === 'object') {
        queryParts.push(this._nestedQueryString(value, param))
      } else if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i++) {
          if (parent) {
            queryParts.push(`${parent}[${param}]=${window.encodeURIComponent(value[i])}`);
          } else {
            queryParts.push(`${param}=${window.encodeURIComponent(value[i])}`);
          }
        }
      } else if (value !== null) {
        if (parent) {
          queryParts.push(`${parent}[${param}]=${window.encodeURIComponent(value)}`);
        } else {
          queryParts.push(`${param}=${window.encodeURIComponent(value)}`);
        }
      } else {
        if (parent) {
          queryParts.push(`${parent}[${param}]`);
        } else {
          queryParts.push(`${param}`);
        }
      }
    }
    return queryParts.join('&');
  }

  /**
   * Cache and expose internal form
   */
  get $form() {
    return this._$form = this._$form || this.shadowRoot.querySelector('#form');
  }
}

customElements.define(StripeCard.is, StripeCard);
