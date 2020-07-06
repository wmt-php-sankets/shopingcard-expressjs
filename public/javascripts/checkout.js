// var Stripe = Stripe('pk_test_51GriJ9BSyXTIYhYy6RcrsUOOXPDIkN8q0VzzyH0e7Hv99g3bKLYYzdq3M48cVqT8UNHcDyfNHNl1uqTznSj7F5QV00LVVWlGrR');
Stripe.setPublishableKey('pk_test_51GsNXYGyCztClCHGsjRVqN0SNqViX0nyptR8OJB0AnPBeGn85xRGwqFUZL8oxtpvNzpJAWan8hSDXUZDdQKLUk8K00MYyCMWIC');
var $form = $('#checkout-form');

$form.submit(function (event) {
    $('#charge-error').addClass('hidden');
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val(),
        name: $('#card-name').val()
    }, stripeResponseHandler);
    return false;
});

function stripeResponseHandler(status, response) {
    console.log("Hii",response)
    try{
    console.log('run');
    if (response.error) {
        console.log('run in');
        console.log(response);
        // Show the errors on the form 
        $('#charge-error').text(response.error.message);
        
        $('#charge-error').removeClass('hidden');
        $form.find('button').prop('disabled', false); // Re-enable submission
    } else { // Token was created!
        // Get the token ID:
        var token = response.id;
        // Insert the token into the form so it gets submitted to the server:
        $form.append($('<input type="hidden" name="stripeToken" />').val(token));        
        // Submit the form:
        // console.log( $form.get(0))
        $form.get(0).submit();  
    }
}
catch(error){
    console.log(error)
}
}