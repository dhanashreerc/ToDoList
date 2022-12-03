//jshint esversion:6
exports.getDate = function(){
    const day = new Date;
    const options ={weekday:"long", day:"numeric",month:"long"};
    return day.toLocaleDateString("en-US",options);
    
};
