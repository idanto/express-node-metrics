var helper = require('../src/helper');

describe('helper tests', function(){
    describe('get route test', function(){
        it('should return url if no other url value is present', function(){
            var req = {};
            req.url = '/user/123';
            var route = helper.getRoute(req);
            route.should.equal(req.url);
        })
    })

    describe('should add metrics test', function(){
        it('should return false if no url value is present', function(){
            var req = {};
            var result = helper.shouldAddMetrics(req);
            result.should.equal(false);
        })
    })
})