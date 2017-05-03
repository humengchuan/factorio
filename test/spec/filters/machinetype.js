'use strict';

describe('Filter: machineType', function () {

  // load the filter's module
  beforeEach(module('factorioApp'));

  // initialize a new instance of the filter before each test
  var machineType;
  beforeEach(inject(function ($filter) {
    machineType = $filter('machineType');
  }));

  it('should return the input prefixed with "machineType filter:"', function () {
    var text = 'angularjs';
    expect(machineType(text)).toBe('machineType filter: ' + text);
  });

});
