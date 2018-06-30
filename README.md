# Stripe Web Components

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/morbidick/stripe-elements)
[![Build Status](https://travis-ci.org/morbidick/stripe-elements.svg?branch=master)](https://travis-ci.org/morbidick/stripe-elements)
[![Greenkeeper badge](https://badges.greenkeeper.io/morbidick/stripe-elements.svg)](https://greenkeeper.io/)

Simple component talking directly with the [Stripe](https://stripe.com/) [token backend](https://stripe.com/docs/api#tokens). It doesnt use stripe.js so it doesnt have the same ShadowDOM restrictions. The form is build with paper-elements to fit the Material UI.

## Installation

```bash
npm i @morbidick/stripe-elements
```

## Components

### \<stripe-card\>

<!--
```
<custom-element-demo>
  <template>
    <script src="../@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
    <script type="module" src="stripe-card.js"></script>
    <next-code-block></next-code-block>
  </template>
</custom-element-demo>
```
-->

```html
<stripe-card
  publishableKey="pk_your_key"
  token="{{ token }}"
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
