$(function() {
    let dangerAlert = $('#dangerAlert');
    let loginForm = $('#loginForm');
    let usernameInput = $('#usernameInput');
    let passwordInput = $('#passwordInput');
    let loginButton = $('#loginButton');

    function validate() {
        if (usernameInput.val() != '' && passwordInput.val() != '') { loginButton.attr('disabled', false) }
        else { loginButton.attr('disabled', true) }
        dangerAlert.addClass('hidden');
    }

    validate();

    usernameInput.keyup(validate);
    usernameInput.keydown(validate);
    
    passwordInput.keyup(validate);
    passwordInput.keydown(validate);

    loginForm.submit(async function(event) {
        event.preventDefault();
        
        let username = usernameInput.val();
        let password = passwordInput.val();

        let response = await fetch(`/api/login`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            
            body: JSON.stringify({ username: username, password: password })
        });

        if (response.status == 404) { dangerAlert.removeClass('hidden') }
        else if (response.status == 200) {
            let obj = await response.json();
            localStorage.setItem('token', obj.token);

            document.location.href = '/';
        }
    });
});