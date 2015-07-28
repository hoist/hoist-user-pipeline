'use strict';
var errors = require('@hoist/errors');

function UserPipeline(Model, HoistContext) {
  this.Model = Model;
  this.Context = HoistContext;
}


UserPipeline.prototype = {
  login: function (username, password, callback) {
    return this.Context.get()
      .bind(this)
      .then(function (context) {
        if (!context.application) {
          throw new errors.user.credentials.IncorrectError();
        }
        return this.Model.AppUser.findOneAsync({
          application: context.application._id,
          'emailAddresses.address': username.toLowerCase()
        });
      }).then(function (user) {
        if (!user) {
          throw new errors.user.credentials.IncorrectError();
        }
        return user.verifyPassword(password);
      }).then(function (valid) {
        if (!valid) {
          throw new errors.user.credentials.IncorrectError();
        }
        return valid;
      }).nodeify(callback);
  },
  invite: function () {

  }

};



var creator = function (Model, HoistContext) {
  return new UserPipeline(Model || require('@hoist/model'), HoistContext || require('@hoist/context'));
};


creator.Pipeline = UserPipeline;

module.exports = creator;
