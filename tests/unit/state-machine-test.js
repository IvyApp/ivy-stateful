import Ember from 'ember';
import StateMachine from 'ivy-stateful/state-machine';
import { module, test } from 'qunit';

module('unit/state-machine');

var Vehicle = StateMachine.extend({
  initialState: 'parked',

  isParked: Ember.computed.readOnly('currentState.isParked'),
  speed: Ember.computed.readOnly('currentState.speed'),

  rootState: {
    speed: 0,

    firstGear: {
      speed: 10,

      shiftUp: function(vehicle) {
        vehicle.transitionTo('secondGear');
      }
    },

    secondGear: {
      speed: 20,

      shiftDown: function(vehicle) {
        vehicle.transitionTo('firstGear');
      }
    },

    idling: {
      speed: 0,

      shiftUp: function(vehicle) {
        vehicle.transitionTo('firstGear');
      }
    },

    parked: {
      isParked: true,

      enter: function(vehicle) {
        vehicle.set('seatbeltOn', false);
      },

      exit: function(vehicle) {
        vehicle.set('seatbeltOn', true);
      },

      ignite: function(vehicle) {
        vehicle.transitionTo('idling');
      }
    }
  }
});

test('should send action to current state', function(assert) {
  var vehicle = Vehicle.create();

  assert.equal(vehicle.get('speed'), 0);

  vehicle.send('ignite');
  vehicle.send('shiftUp');
  assert.equal(vehicle.get('speed'), 10);

  vehicle.send('shiftUp');
  assert.equal(vehicle.get('speed'), 20);
});

test('should throw on an invalid transition', function(assert) {
  var vehicle = Vehicle.create();

  vehicle.send('ignite');
  vehicle.send('shiftUp');
  vehicle.send('shiftUp');

  assert.throws(function() {
    vehicle.send('park');
  }, /Attempted to handle event "park" on .*? while in state rootState.secondGear/);
});

test('should fire enter hook when entering a state', function(assert) {
  var vehicle = Vehicle.create();

  assert.equal(vehicle.get('seatbeltOn'), false);
});

test('should fire exit hook when exiting a state', function(assert) {
  var vehicle = Vehicle.create();

  vehicle.send('ignite');
  assert.equal(vehicle.get('seatbeltOn'), true);
});
