/**
 * Created by CY on 2014/8/24.
 */

var logger = require('../util/logger').logger;

/**
 * @Author Ken
 * @description copy object
 * @parameter src : source object
 * @parameter dest : destination object
 * @parameter attr : the attributes you want to copy
 * @LastUpdateDate 2014-08-24
 */
var copy = function(src,dest,attrs) {
    if(attrs && attrs.length>0) {
        for(var i in attrs) {
            dest[attrs[i]] = src[attrs[i]];
        }
    }
    else {
        for(var key in src) {
            dest[key] = src[key];
        }
    }
};
exports.copy = copy;


/**
 * @Author Ken
 * @description merge object, if secondaryObj has same attributes with mainObj, ignore them.
 * @LastUpdateDate 2014-08-24
 * @parameter mainObj : main object
 * @parameter secondaryObj : secondary object
 * @return merged object
 */
exports.merge = function(mainObj,secondaryObj) {
    var mergedObj = {};
    copy(secondaryObj,mergedObj);
    copy(mainObj,mergedObj);
    return mergedObj;
};
