# ivy-stateful

[![Build Status](https://travis-ci.org/IvyApp/ivy-stateful.svg?branch=master)](https://travis-ci.org/IvyApp/ivy-stateful)

Simple [State Machines](http://en.wikipedia.org/wiki/Finite-state\_machine) for
Ember apps, based on Ember Data's `DS.Model` state machine.

## Installation

For Ember CLI >= 0.2.3:

```sh
ember install ivy-stateful
```

For Ember CLI 0.1.5 through 0.2.2:

```sh
ember install:addon ivy-stateful
```

For Ember CLI < 0.1.5:

```sh
npm install --save-dev ivy-stateful
```

## Usage

This addon provides a `StatefulMixin` mixin that makes any Ember.Object into
a finite state machine. After mixing it in, you'll need to define a `rootState`
to serve as the root of your state machine, as well as an `initialState` which
will be transitioned into immediately.

Here's the obligatory Vechicle example:

```javascript
import Ember from 'ember';
import StatefulMixin from 'ivy-stateful/mixins/stateful';

export default Ember.Object.extend(StatefulMixin, {
  initialState: 'parked',

  speed: Ember.computed.readOnly('currentState.speed'),

  rootState: {
    speed: 0,

    parked: {
      enter: function(vehicle) {
        vehicle.takeOffSeatbelt();
      },

      exit: function(vehicle) {
        vehicle.putOnSeatbelt();
      },

      ignite: function(vehicle) {
        vehicle.transitionTo('idling');
      }
    },

    idling: {
      shiftUp: function(vehicle) {
        vehicle.transitionTo('firstGear');
      }
    },

    firstGear: {
      speed: 10,

      idle: function(vehicle) {
        vehicle.transitionTo('idling');
      }
    }
  },

  putOnSeatbelt: function() {
    this.set('seatbeltOn', true);
  },

  takeOffSeatbelt: function() {
    this.set('seatbeltOn', false);
  }
});
```

You can use `send` to send events to the current state:

```javascript
vehicle.get('seatbeltOn') // => false
vehicle.send('ignite');   // puts us in the "idling" state
vehicle.get('seatbeltOn') // => true
vehicle.send('shiftUp');  // puts us in the "firstGear" state
vehicle.get('speed')      // => 10
```

The receiver (the vehicle in this case) is always the first argument to an
event handler, followed by any other arguments passed to `send`.

If you just want an isolated state machine, `ivy-stateful` provides one in the
form of the `StateMachine` class.

```javascript
import StateMachine from 'ivy-stateful/state-machine';

export default StateMachine.extend({
  initialState: 'initial',

  rootState: {
    // ...
  }
});
```

The `StateMachine` class is just `Ember.Object` with `StatefulMixin` already
applied for you.

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
