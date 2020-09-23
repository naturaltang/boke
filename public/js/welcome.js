window.addEventListener('load', function() {
    clearInterval(m);
    var m = window.setInterval(disptime, 1000);

    function disptime() {
        var today = new Date();
        var YYYY = today.getFullYear();
        var MM = today.getMonth() + 1;
        var DD = today.getDate();
        var h = today.getHours();
        h = h < 10 ? '0' + h : h;
        var m = today.getMinutes();
        m = m < 10 ? '0' + m : m;
        var s = today.getSeconds();
        s = s < 10 ? '0' + s : s;
        var dy = today.getDay();
        var wk = '星期' + '日一二三四五六'.charAt(dy);
        var sd = 'AM';
        if (h > 12) {
            h = h - 12;
            sd = 'PM';
        }
        document.querySelector('.time').innerHTML = YYYY + '年' + MM + '月' + DD + '日' + '\t' + h + ':' + m + ':' + s + ' ' + sd + ' ' + wk;
    }
    // disptime();

})