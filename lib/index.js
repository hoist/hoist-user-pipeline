'use strict';
function UserPipeline(Model){
  this.Model = Model;
}


UserPipeline.prototype = {

};



var creator = function(Model){
  return new UserPipeline(Model||require('hoist-model'));
};


creator.Pipeline = UserPipeline;

module.exports = creator;
