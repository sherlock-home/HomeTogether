import Reflux from 'reflux';
import _ from 'lodash';
import sami from '../lib/sami/samiHelper.js';

export const devices = {
  updateLights : Reflux.createAction(),
  updateLightIntensity : Reflux.createAction(),
  updatePresence : Reflux.createAction(),
  updateTVState : Reflux.createAction()
};

let initPres = {};
_.map(['0', '1', '2', '3', '4', '5'], val =>{
  var obj = {};
  obj[val]={occupant: false, player:false};
  _.assign(initPres, obj);
});

export var ActionStore = Reflux.createStore({
  listenables: devices,
  settings: {lights:{}, presence: initPres, devices: {tv: {power: false}, light_sensor1: {state: 2.5}}},

  onUpdateLights: function(id, color, brightness) {
    this.settings.lights[id]={color: color, brightness: brightness};
    this.trigger(this.settings);
  },
  onUpdateLightIntensity: function(val) {
    if (!_.isUndefined(sami.devices.light_sensor1.ID))
      sami.sendMessageToDevice('light_sensor1', {'state': val});
    this.settings.devices.light_sensor1.state = val;
    this.trigger(this.settings);
  },
  onUpdatePresence: function(entity, id) {
    let obj = {};
    obj[entity]=true;
    let previous = _.findKey(this.settings.presence, obj);
    if (!_.isUndefined(previous) && !_.isUndefined(this.settings.presence[previous]))
      this.settings.presence[previous][entity] = false;
    if (_.isUndefined(this.settings.presence[id]))
      this.settings.presence[id] = {};
    this.settings.presence[id][entity] = true;
    this.trigger(this.settings);
  },
  onUpdateTVState: function(val) {
    if (!_.isUndefined(sami.devices.tv.ID))
      sami.sendMessageToDevice('tv', {'power': val});
    this.settings.devices.tv.power = val;
    this.trigger(this.settings);
  },
  getPresence: function(id) {
    return this.settings.presence[id];
  },
  getLightState: function(id) {
    return this.settings.lights[id];
  },
  getTVState: function() {
    return this.settings.devices.tv.power;
  },
  getPlayerLocation: function() {
    let loc = _.findKey(this.settings.presence, {player: true}) || '';
    return loc;
  },
  getLightIntensity: function() {
    return this.settings.devices.light_sensor1.state;
  },
  getInitialState: function() {
    _.forEach(this.settings.devices, (val, key) => {sami.devices[key].data = val});
    return this.settings;    
  }
});