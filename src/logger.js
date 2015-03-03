/**
 * Created by md on 14-6-8.
 */

var log4js = require('log4js');
//console log is loaded by default, so you won't normally need to do this
//log4js.loadAppender('console');
log4js.loadAppender('file');
//log4js.addAppender(log4js.appenders.console());
log4js.addAppender(log4js.appenders.file('logs/fitment.log'), 'fitment');

var logger = log4js.getLogger('fitment');
logger.setLevel('INFO');  //DEBUG < INFO < WARN < ERROR < FATAL

exports.logger = logger;