module.exports.getRoute = function (req) {
    var route = req.baseUrl; //express
    if (req.swagger) { //swagger
        route = req.swagger.apiPath;
    } else if (req.route && route) { //express
        route = route + req.route.path;
    } else if (req.url && !route) { //restify
        route = req.url;
        if (req.route) { 
            route = req.route.path
        }
    }

    return route;
};

module.exports.shouldAddMetrics = function (req) {
    var should = false;
    if (req.originalUrl) {
        should = req.originalUrl.includes('metrics');
    }

    if (req.url) {
        should = req.url.includes('metrics');
    }

    return should;
};
