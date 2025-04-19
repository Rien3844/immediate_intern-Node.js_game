const cluster = require('cluster');

if(cluster.isPrimary || cluster.isMaster){
    require('./cluster/master.js');
}else{
    require('./cluster/worker.js');
}