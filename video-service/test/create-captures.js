'use strict';

// tests for create-captures
// Generated by serverless-mocha-plugin

const mod = require('../create-captures/index.js');
const mochaPlugin = require('serverless-mocha-plugin');

const lambdaWrapper = mochaPlugin.lambdaWrapper;
const expect = mochaPlugin.chai.expect;
const wrapped = lambdaWrapper.wrap(mod, { handler: 'handler' });

const videoDownloaded = require('./video-uploaded.json');

process.env.FFMPEG = 'ffmpeg'; // use installed ffmpeg

describe('create-captures', () => {
  before((done) => {
//  lambdaWrapper.init(liveFunction); // Run the deployed lambda

    done();
  });

  it('implement tests here', () =>
    wrapped.run(videoDownloaded).then((response) => {
      expect(response).to.not.be(undefined);
    }));
});
