$(function() {
    if (!localStorage.getItem('token')) { document.location.href = '/' }
    let progress = $('#progress');
    setTimeout(async function() {
        progress.addClass('animated');
        setTimeout(async function() {
            localStorage.removeItem('token');
            document.location.href = '/';
        }, 3000);
    }, 50);
});