'use strict';
require('../bootstrap');
var pipeline = require('../../lib')();
var sinon = require('sinon');
var AppUser = require('hoist-model').AppUser;
var HoistContext = require('hoist-context');
var errors = require('hoist-errors');
var Application = require('hoist-model').Application;
var BBPromise = require('bluebird');
var expect = require('chai').expect;

describe('UserPipeline', function () {

  describe('#login', function () {
    var application = new Application({
      _id: 'appid'
    });
    var appUser = new AppUser({
      application: 'appid',
      emailAddresses: [{
        address: 'user@hoi.io'
      }]
    });
    before(function () {
      sinon.stub(AppUser, 'findOneAsync').returns(BBPromise.resolve(appUser));
      return appUser.setPassword('Password123');
    });
    afterEach(function () {
      AppUser.findOneAsync.reset();
    });
    after(function () {
      AppUser.findOneAsync.restore();
    });
    describe('with valid username and password', function () {
      var _result;
      before(function (done) {
        HoistContext.namespace.run(function () {
          HoistContext.get().then(function (context) {
            context.application = application;
            pipeline.login('User@hoi.io', 'Password123').then(function (result) {
              _result = result;
              done();
            });
          });
        });
      });
      it('loads the correct user', function () {
        expect(AppUser.findOneAsync)
          .to.have.been.calledWith({
            application: 'appid',
            'emailAddresses.address': 'user@hoi.io'
          });
      });
      it('returns true', function () {
        return expect(_result).to.be.true;
      });
    });
    describe('with invalid username', function () {
      var _error;
      before(function (done) {
        AppUser.findOneAsync.returns(BBPromise.resolve(null));
        HoistContext.namespace.run(function () {
          HoistContext.get().then(function (context) {
            context.application = application;
            pipeline.login('noone@hoi.io', 'Password123', function (error) {
              _error = error;
              done();
            });
          });
        });
      });
      after(function () {
        AppUser.findOneAsync.returns(appUser);
      });
      it('throws incorrect credentials exception', function () {
        expect(_error)
          .to.be.instanceOf(errors.user.credentials.IncorrectError).and.to.have.property('message', 'The username and/or password were not correct');
      });
    });
    describe('with invalid password', function () {
      var _error;
      before(function (done) {
        HoistContext.namespace.run(function () {
          HoistContext.get().then(function (context) {
            context.application = application;
            pipeline.login('User@hoi.io', 'password!@3', function (error) {
              _error = error;
              done();
            });
          });
        });
      });
      it('throws incorrect credentials exception', function () {
        expect(_error)
          .to.be.instanceOf(errors.user.credentials.IncorrectError).and.to.have.property('message', 'The username and/or password were not correct');
      });
    });
  });
});
