'use strict';

describe('Service: pokeapi', function () {

  // load the service's module
  beforeEach(module('pokeloreApp'));

  // instantiate service
  var pokeapi;
  beforeEach(inject(function (_pokeapi_) {
    pokeapi = _pokeapi_;
  }));

  it('should do something', function () {
    expect(!!pokeapi).toBe(true);
  });

});
