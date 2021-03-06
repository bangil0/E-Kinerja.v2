(function(){
    'use strict';

    angular.module('eKinerja')
        .service('MemorandumService', MemorandumService);

    function MemorandumService(API, $http, $q){
        var service = {};

        service.save = function(data){
            var deferred = $q.defer();
            $http.post(API + 'create-memorandum/', data).then(
                function (response){
                    deferred.resolve(response.data);
                },
                function(errResponse){
                    deferred.reject(errResponse);
                }
            );
            return deferred.promise;
        }

        return service;
    }
})();