import Ember from 'ember';

function wireState(state, parentState, stateName) {
  state = Ember.mixin(parentState ? Ember.create(parentState) : {}, state);
  state.parentState = parentState;
  state.stateName = stateName;

  for (var prop in state) {
    if (!state.hasOwnProperty(prop) || prop === 'parentState' || prop === 'stateName') { continue; }
    if (typeof state[prop] === 'object') {
      state[prop] = wireState(state[prop], state, stateName + '.' + prop);
    }
  }

  return state;
}

export default Ember.Mixin.create({
  init: function() {
    this._super();

    var rootState = this.get('rootState');
    if (rootState) {
      rootState = wireState(rootState, null, 'rootState');
    } else {
      throw new Ember.Error('No rootState defined on ' + String(this) + '.');
    }

    this.set('currentState', rootState);

    var initialState = this.get('initialState');
    if (!initialState) {
      throw new Ember.Error('No initialState defined on ' + String(this) + '.');
    }

    this.transitionTo(initialState);
  },

  send: function(name) {
    var currentState = this.get('currentState');

    if (!currentState[name]) {
      throw new Ember.Error('Attempted to handle event "' + name +
                            '" on ' + String(this) + ' while in state ' +
                            currentState.stateName + '.');
    }

    var args = [this].concat(Array.prototype.slice.call(arguments, 1));

    return currentState[name].apply(null, args);
  },

  transitionTo: function(name) {
    var pivotName = name.split('.').shift();
    var currentState = this.get('currentState');
    var state = currentState;

    while (state.parentState && !state.hasOwnProperty(pivotName)) {
      if (state.exit) { state.exit(this); }
      state = state.parentState;
    }

    var path = name.split('.');

    for (var i = 0; i < path.length; i++) {
      state = state[path[i]];
      if (state.enter) { state.enter(this); }
    }

    this.set('currentState', state);
  }
});
