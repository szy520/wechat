$(function () {
    var i = 0 ;
    $(".fAjax").click(function () {
        i++;
        var obj={
            value:i,
            type:0,
            sensorId:'s001'
        };
        ajaxPost('POST','/users/records',obj,function (result) {
            console.log(result)
        })
    });
    $(".del").click(function () {
        var obj ={
           id:'0fc0619e888b403bb827a56af0048afa'
        };
        ajaxPost('Delete','/users/records',obj,function (result) {
            console.log(result)
        })
    });
});
function ajaxPost(method, url, data,callback){
    $.ajax({
        type: method,
        url: url,
        contentType: "application/json",
        data:JSON.stringify(data),
        success: function (data) {
            callback(data);
        },
        error: function (error) {
            callback(error);
        }
    });
}