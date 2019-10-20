let appConfig = {};
let nodeMailer = {};

appConfig.port = process.env.PORT || 3001;;
appConfig.allowedCorsOrigin = "*";
appConfig.env = "dev";
appConfig.db = {
  uri: 'mongodb://atmuser:OwchAspOccamLa3@ds235302.mlab.com:35302/atm_db'
  }
appConfig.apiVersion = '/api/v1';

nodeMailer.email="";
nodeMailer.password = "";

module.exports = {
    port: appConfig.port,
    allowedCorsOrigin: appConfig.allowedCorsOrigin,
    environment: appConfig.env,
    db :appConfig.db,
    apiVersion : appConfig.apiVersion,
    email: nodeMailer.email,
    password: nodeMailer.password
};