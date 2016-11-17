module.exports.getRoute = function(req){
    var route = '';
    if (req.baseUrl){
        var route = req.baseUrl
        if (req.swagger) {
            route = req.swagger.apiPath;
        } else if (req.route) {
            route = route + req.route.path;
        }  
    } else {
        route = req.url;
        if (req.route){
            route = req.route.path
        }
    }

    return route;
};

module.exports.shouldAddMetrics = function(req){
    var should = false;
    if (req.originalUrl){
        should = req.originalUrl.includes('metrics');
    }

    if (req.url){
        should = req.url.includes('metrics');
    }

    return should;
};