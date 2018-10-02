/*
 * Starting point for list of preferences
 *
 *
 * Major
 * STEM
 * Humanities
 * Art
 * Music
 * Athletics
 * Food Places
 * Cool campus trivia/traditions (ie the cannon and proably some other stuff
 * Library (maybe)
 * Nearby (scale 1-5 maybe, how important is it that the next building is close)
 * Dorms
 * Greek Life
 */



// will be callbacks from some action
// interface with backend is not yet ironed out so nothing to do with most of 
// these functions
function add_preferences(prefs) {
    // send prefs to backend to be added (object with 3 fields, major, act, and int, each of which are arrays of strings)
    var xhr = new XMLHttpRequest();
    xhr.open('POST', "/preferences", true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = this.responseText;
            response = JSON.parse(response)
            if (!response.hasOwnProperty("status"))
            {
                localStorage['jumbo_key'] = response.id;
            }
        }
    }
    if (localStorage.getItem("jumbo_key") === null) {
        var params = "prefs=" + JSON.stringify(prefs);
    } else {
        jumbokey = localStorage.getItem("jumbo_key");
        var params = "id=" + jumbokey + "&prefs=" + JSON.stringify(prefs);
    }
    xhr.send(params);
}

function remove_preferences(prefs) {
    // tell backend to remove these preferences (Array)
}

function update_loc(loc) {
    // tell backend current location
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/add_location', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = this.responseText;
            response = JSON.parse(response)
            if (!response.hasOwnProperty("status"))
            {
                localStorage['jumbo_key'] = response.id;
            }
        }
    }
    if (localStorage.getItem("jumbo_key") === null) {
        var params = "loc=" + loc;
    } else {
        jumbokey = localStorage.getItem("jumbo_key");
        var params = "id=" + jumbokey + "&loc=" + loc;
    }
    xhr.send(params);
}

function suggest_loc() {
    // call to backend to suggest location
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/next_loc', true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    
    next_locs = "not ready";

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            next_locs = JSON.parse(xhr.responseText);
            suggest_next(next_locs);
        }
        
    }
    if (localStorage.getItem("jumbo_key") === null) {
        var params = "lat=" + myLat + "&lng=" + myLong;
    } else {
        jumbokey = localStorage.getItem("jumbo_key");
        var params = "lat=" + myLat + "&lng=" + myLong + "&id=" + localStorage["jumbo_key"];
    }
    xhr.send(params);
}

// IMPLEMENT ME
function suggest_next(locs) {
    // pop or something to suggest locations to the user
    var mydiv = $('#preferences .modal-body');
    mydiv.html('')
    for(var i = 0; i < locs.length; i++){
        var to_add = "<div><a id='"+ i + "' href=javascript:void(0) onclick='pop_click(event)'>" + locs[i].name + "</a>" + "</div><hr>";
        mydiv.append(to_add);

    }
}

function pop_click(evt){
     evt.preventDefault();
    var number = evt.target.id;
    nearby_locs(next_locs[number].lat, next_locs[number].lng, next_locs[number].name);
    $('#preferences').modal('hide');
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

var head_pref = "Hello there! Welcome to Jumbo Tour<br>Tell us more about yourself so we can better serve you";
var head_sugg = "Based on your preferences, you should go to one of these next";
var foot_pref = '<button type="button" class="btn btn-primary" data-dismiss="modal" id="submit" onclick = "save()">Save changes</button>';
var foot_sugg = '<button type="button" class="btn btn-primary" data-dismiss="modal">close</button>';
var a = '<form><div class="interests"><label for="interest">Interests</label><select class="form-control" id="major" multiple name="prefs"><option selected="selected">building</option><option value="biology">Biology</option><option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="computers">Computer Science</option><option value="music">Music</option><option value="arts">Arts</option><option value="dance">Dance</option><option value="performance">Performance</option><option value="theatre">Theatre</option><option value="theater">Theater</option><option value="greek">Greek Life</option><option value="fraternity">Fraternity</option><option value="sorority">Sorority</option><option value="athletics">Athletics</option><option value="residence">Residence</option><option value="dormitory">Dormitory</option><option value="sailing">Sailing</option><option value="lab">Research Lab</option><option value="fletcher">Fletcher</option><option value="law">Law</option><option value="diplomacy">Diplomacy</option><option value="lgbt">LGBT spaces</option><option value="mathematics">Mathematics</option><option value="dining">Dining</option><option value="coffee">Coffee</option><option value="supplies">Textbooks and Supplies</option><option value="international relations">International Relations</option><option value="africana house">African American Culture</option><option value="spanish language">Spanish</option><option value="exercise">Work out and Fitness</option><option value="international house">International spaces</option><option value="religion">Faith and Religion</option><option value="languages">Languages</option><option value="engineering">Science Engineering</option><option value="library">Library</option></select></div></form>'

$('#preferences').on('show.bs.modal', function(event){
    var button = $(event.relatedTarget);
    var cont = button.data('content');
    var modal = $(this)
    if(cont == "prefe")
    {
        modal.find('.modal-title').html(head_pref);
        modal.find('.modal-body').html(a);
        modal.find('.modal-footer').html(foot_pref);
        $('#major').select2();
    }
    else
    {
        modal.find('.modal-title').text(head_sugg);
        modal.find('.modal-footer').html(foot_sugg);
        suggest_loc();
    }
})

function save(){
       var prefs = $('#major').val();
       add_preferences(prefs);
}