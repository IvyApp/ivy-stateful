import Ember from 'ember';

function wireState(state, parentState, stateName) {
  state = Ember.mixin(parentState ? Object.create(parentState) : {}, state);
  state.parentState = parentState;
  state.stateName = stateName;

  for (let prop in state) {
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

    let rootState = this.get('rootState');
    if (rootState) {
      rootState = wireState(rootState, null, 'rootState');
    } else {
      throw new Ember.Error('No rootState defined on ' + String(this) + '.');
    }

    this.set('currentState', rootState);

    let initialState = this.get('initialState');
    if (!initialState) {
      throw new Ember.Error('No initialState defined on ' + String(this) + '.');
    }

    this.transitionTo(initialState);
  },

  send: function(name) {
    let currentState = this.get('currentState');

    if (!currentState[name]) {
      throw new Ember.Error('Attempted to handle event "' + name +
                            '" on ' + String(this) + ' while in state ' +
                            currentState.stateName + '.');
    }

    let args = [this].concat(Array.prototype.slice.call(arguments, 1));

    return currentState[name].apply(null, args);
  },

  transitionTo: function(name) {
    let pivotName = name.split('.').shift();
    let currentState = this.get('currentState');
    let state = currentState;

    while (state.parentState && !state.hasOwnProperty(pivotName)) {
      if (state.exit) { state.exit(this); }
      state = state.parentState;
    }

    let path = name.split('.');

    for (let i = 0; i < path.length; i++) {
      state = state[path[i]];
      if (state.enter) { state.enter(this); }
    }

    this.set('currentState', state);
  }
});
