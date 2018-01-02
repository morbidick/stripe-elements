# Polymer 2 Stripe Elements

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/morbidick/stripe-elements)
[![Build Status](https://travis-ci.org/morbidick/stripe-elements.svg?branch=master)](https://travis-ci.org/morbidick/stripe-elements)

Simple component talking directly with the [Stripe](https://stripe.com/) [token backend](https://stripe.com/docs/api#tokens). It doesnt use stripe.js so it doesnt have the same ShadowDOM restrictions. The form is build with paper-elements to fit the Material UI.

## Components

### \<stripe-card\>

<!--
```
<custom-element-demo>
  <template>
    <script src="../webcomponentsjs/webcomponents-lite.js"></script>
    <link rel="import" href="stripe-card.html">
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->

```html
<stripe-card
  publishable-key="pk_your_key"
  token="{{ token }}"
  mask-card
></stripe-card>
```

#### Styling

You can use the paper-style variables to change the look and feel of the form.

## Development

```bash
# Get dependencies
$ npm install

# Demo site
$ npm start

# Run tests
$ npm test
```
