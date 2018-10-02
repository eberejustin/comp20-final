/ IMPLEMENT ME
function suggest_next(locs) {
    // pop or something to suggest locations to the user
    console.log(locs);
    var mydiv = $('#suggested .modal-body');

    for(var i = 0; i < locs.length; i++){
        var to_add = "<div><a id='"+ i + "' href=javascript:void(0) onclick='pop_click(event)'>" + locs[i].name + "</a>" + "</div><hr>";
        mydiv.append(to_add);

    }
}

function pop_click(evt){
    console.log('called');
    evt.preventDefault();
    var number = evt.target.id;
    nearby_locs(next_locs[number].lat, next_locs[number].lng, next_locs[number].name);
    $('#suggested').modal('hide');
}



/*
*
*
*
* Styling!!
*
*
*
*
*/

$('#major').select2();
$('#submit').click(function(){

       var prefs = $('#major').val();
       add_preferences(prefs);
});
$('#sugg').click(function(){
    suggest_loc();
    $('#suggest').modal('show');
});

