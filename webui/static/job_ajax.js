var imgData;
var scopeData;
var estimateData;
var currentPhotoFolder = "-1";

//**************************Start Photos stuff********************************************************************************************
function photosInit() {
    //things that have to the first time the page loads
    prepPhotos()
    $('#img-loader').hide()
    $("a.gallery").fancybox({
        'transitionIn'  :   'elastic',
        'transitionOut' :   'elastic',
        'speedIn'       :   600, 
        'speedOut'      :   200, 
        'overlayShow'   :   false,
        'cyclic'        :   true,
        'showNavArrows' :   true
    });
    $('#cancelImageFolder').click(function() {
    	$("#folder-name").val("");
    });
    $('#submitImageFolder').click(function() {
        var folderData = {};
        if ($("#folder-name").val() != ""){
        	folderData.name = $("#folder-name").val();
        	folderData.parent_id = currentPhotoFolder;
        	folderData.job_id = $('#jobId').text();
        	$.post("/forward/photoFolder", JSON.stringify(folderData))
            	.done(
                	function(response) {
                    	console.log("response: " + response)
                    	if (apiResponseIsGood(response)) {
                        	createNewPhotoFolder(folderData, response);
                    	};
                	}
            	);
        }
    });
    $("#show-photos").hide();
    $("#show-photos").click(function(){
        $("#show-photos").hide();
        $("#hide-photos").show();
        $("#photos-container").slideDown("slow");   
    });
    $("#hide-photos").click(function(){
        $("#hide-photos").hide();
        $("#show-photos").show();
        $("#photos-container").slideUp("slow");   
    });
    $('.photoFolder').hide()
    $('#photoFolder_-1').show()
}
function createNewPhotoFolder(folderData, folderID) {
	console.log("new folder")
    newFolderButton = $("#imageFolder-template").html()
    newFolderButton = replaceAllSubsting(newFolderButton, "!name!", folderData.name);
    newFolderButton = replaceAllSubsting(newFolderButton, "!id!", folderID);
    //once we've implemented opening and closing folders, this will have to be updated
    if (currentPhotoFolder == "-1") {
    	$('#folderContents_' + currentPhotoFolder + ' > div:first-child').before(newFolderButton);
    } else {
    	$('#folderContents_' + currentPhotoFolder + ' > div:nth-child(2)').before(newFolderButton);
    }
    newFolder = $("#renderedPhotoFolderTemplate").html()
    newFolder = replaceAllSubsting(newFolder, "!name!", folderData.name);
    newFolder = replaceAllSubsting(newFolder, "!id!", folderID);
    newFolder = replaceAllSubsting(newFolder, "!parent_id!", currentPhotoFolder);
    $('#gallery > div:last-child').after(newFolder);
	$("#folder-name").val("");
	prepPhotos();
}

function prepPhotos() {
    //things that have to happen every time a new photo is added
    document.getElementById('img-file').onchange = function (e) {loadPhotoFromInput(e.target);};
    $('#cancelImage').click(function(){
        imgData = {}
        $('#img-preview').removeAttr("src");
        $('#img-preview-container').hide();
        $("#img-file").replaceWith($("#img-file").clone());
        document.getElementById('img-file').onchange = function (e) {loadPhotoFromInput(e.target);};
    });
    $('#submitImage').click(function(){
        $('#img-loader').show()
        $("#img-loader").width($("#img-preview").width());
        $.post("/forward/photo", JSON.stringify(imgData))
            .done(
                function(response) {
                    $('#img-loader').hide()
                    console.log("response: " + response)
                    if (apiResponseIsGood(response)) {
                        createNewPhoto(imgData);
                    };
                }
            );
    });
    $('#img-preview-container').hide()
    $('.photoFolderButton').click(function(){
    	buttonId = $(this).attr('id').split("_")
        itemId = buttonId[buttonId.length -1]
        $('.photoFolder').hide()
        $('#photoFolder_' + itemId).show()
        currentPhotoFolder = itemId;
    });
}
function loadPhotoFromInput(input) {
    var reader; 
    if (input.files && input.files[0]) {
        var file = input.files[0];
        reader = new FileReader();
        reader.readAsDataURL(file);
        //filereaders run on a different thread, so we
        // need to wait for it to finish it's work before we continue
        reader.onload = function (e) {
            imgData = {}
            imgData.folder_id = currentPhotoFolder
            imgData.name = file.name
            imgData.lastModified = file.lastModified
            imgData.type = file.type
            imgData.file_extension = (file.name).substr((file.name).lastIndexOf('.'))
            imgData.job_id = $('#jobId').text()
            imgData.base64_image = reader.result
            console.log(imgData)
            $('#img-preview').attr("src",reader.result);
            $('#img-preview-container').show()
        }
    }
}
function createNewPhoto(photo){
    console.log("new photo")
    newNote = $("#image-template").html()
    newNote = replaceAllSubsting(newNote, "!url!", photo.base64_image);
    newNote = replaceAllSubsting(newNote, "!gallery!", "gallery01");
   	$('#folderContents_' + currentPhotoFolder + ' > div:last-child').after(newNote);
    $("#add-image-card").replaceWith($("#add-image-card").clone());
    prepPhotos();
}

//**************************End Photos stuff********************************************************************************************

function notesInit() {
    $(".add-note-card").removeClass("card-warning card-danger").addClass("card-info");
    makeUsersDropdown("all", "#note-assignee-select")
    $(".daily-report-field").hide()
    $(".action-item-field").hide()
    prepNotes();
}

function prepNotes() {
    $(".date-time-error").hide();
    $(".note-assignee-edit").hide()
    $("#show-notes").hide();
    $("#show-notes").click(function(){
        $("#show-notes").hide();
        $("#hide-notes").show();
        $("#notes-container").slideDown("slow");   
    });
    $("#hide-notes").click(function(){
        $("#hide-notes").hide();
        $("#show-notes").show();
        $("#notes-container").slideUp("slow");   
    });
    $('.note-card').width($('#add-note-card').width())
    $('.note-add-assignee').click(function(){
        buttonId = $(this).attr('id').split("-")
        noteId = buttonId[buttonId.length -1]
        noteTbl = buttonId[buttonId.length -2]
        $("#note-assigned-name-"+noteTbl+"-"+noteId).hide()
        $("#note-add-assignee-"+noteTbl+"-"+noteId).hide()
        $("#note-select-assignee-"+noteTbl+"-"+noteId).show()
        $("#note-save-assignee-"+noteTbl+"-"+noteId).show()
        $("#note-cancel-assignee-"+noteTbl+"-"+noteId).show()
        makeUsersDropdown("all", "#note-select-assignee-"+noteTbl+"-"+noteId)
    });
    $('.note-cancel-assignee').click(function(){
        buttonId = $(this).attr('id').split("-")
        noteId = buttonId[buttonId.length -1]
        noteTbl = buttonId[buttonId.length -2]
        $("#note-assigned-name-"+noteTbl+"-"+noteId).show()
        $("#note-add-assignee-"+noteTbl+"-"+noteId).show()
        $("#note-select-assignee-"+noteTbl+"-"+noteId).hide()
        $("#note-save-assignee-"+noteTbl+"-"+noteId).hide()
        $("#note-cancel-assignee-"+noteTbl+"-"+noteId).hide()
        $("#note-select-assignee-"+noteTbl+"-"+noteId).html("")
    });
    $('.note-save-assignee').click(function(){
        buttonId = $(this).attr('id').split("-")
        noteId = buttonId[buttonId.length -1]
        noteTbl = buttonId[buttonId.length -2]
        assigneeAjax(noteId, noteTbl);
    });
    $('.note-edit').hide();
    $('.note-edit-button').click(function(){
        buttonId = $(this).attr('id').split("-")
        noteId = buttonId[buttonId.length -1]
        noteTbl = buttonId[buttonId.length -2]
        $("#note-"+noteTbl+"-"+noteId+" .note-display").hide()
        $("#note-"+noteTbl+"-"+noteId+" .note-edit").show()
        if (noteTbl == "actionItems") {
            makeUsersDropdown("all", "#note-select-assignee-"+noteTbl+"-"+noteId)
        };
    });
    $('.note-save-button').click(function(){
        buttonId = $(this).attr('id').split("-");
        noteId = buttonId[buttonId.length -1];
        noteTbl = buttonId[buttonId.length -2];
        llq = "-"+noteTbl+"-"+noteId;
        notesAjax(llq);
    });
    $('.note-cancel-button').click(function(){
        buttonId = $(this).attr('id').split("-")
        noteId = buttonId[buttonId.length -1]
        noteTbl = buttonId[buttonId.length -2]
        $("#note-"+noteTbl+"-"+noteId+" .note-display").show()
        $("#note-"+noteTbl+"-"+noteId+" .note-edit").hide()
        resetNote(noteTbl, noteId);
    });
   $('.note-delete-button').click(function(){
            buttonId = $(this).attr('id').split("-")
            noteId = buttonId[buttonId.length -1]
            noteTbl = buttonId[buttonId.length -2]
            noteS = noteTbl + "-" + noteId;
            postData = {}
            postData.id = noteId;
            postData.tbl = noteTbl;
            $.ajax({
                url : "/forward/delete/note",
                dataType:"text",
                method:"POST",
                data: JSON.stringify(postData),
                success:function(response){
                    if (apiResponseIsGood(response)) {
                        console.log("Successful delete")
                        console.log(postData)
                        console.log(response)
                        $("#note-".concat(noteS)).remove()
                    } else {
                        console.log("Unsuccessful delete: " + response);
                        $("#apiResponse").html(response+"note-".concat(noteS));
                    };
                }
            });
        });

    $('.note-complete').click(function(){
        buttonId = $(this).attr('id').split("-")
        noteId = buttonId[buttonId.length -1]
        noteTbl = buttonId[buttonId.length -2]
        $("#note-"+noteTbl+"-"+noteId+" .note-complete").hide()
        $("#note-"+noteTbl+"-"+noteId+" .note-complete-edit").show()
    });
    $('.note-complete-cancel').click(function(){
        buttonId = $(this).attr('id').split("-")
        noteId = buttonId[buttonId.length -1]
        noteTbl = buttonId[buttonId.length -2]
        $("#note-"+noteTbl+"-"+noteId+" .note-complete").show()
        $("#note-"+noteTbl+"-"+noteId+" .note-complete-edit").hide()
    });
    $('.note-complete-confirm').click(function(){
        buttonId = $(this).attr('id').split("-")
        noteId = buttonId[buttonId.length -1]
        noteTbl = buttonId[buttonId.length -2]
        completeAjax(noteId, noteTbl);
    });
    $('.note-complete-edit').hide();
}
function completeAjax(id, tbl){
    var id = id
    postData = {}
    postData.id = id
    postData.complete = "True"
    $.ajax({
        url : "/forward/actionItem",
        dataType:"text",
        method:"POST",
        data: JSON.stringify(postData),
        success:function(response){
            if (apiResponseIsGood(response)) {
                console.log("Successful update")
                console.log(postData)
                console.log(response)
                newCompleter = $("#completion-user-template").html()
                newCompleter = replaceAllSubsting(newCompleter, "!name!", $('#user-name').text());
                newCompleter = replaceAllSubsting(newCompleter, "!time!", getCurrentDateTime());
                $("#note-completer-actionItems-"+noteId).html(newCompleter)
                $("#note-completer-actionItems-"+noteId).removeClass("card-block")
                $("#note-completer-actionItems-"+noteId).addClass("card-footer text-muted small")
                console.log(newCompleter)
                console.log($("#note-completer-actionItems-"+id).html())
                prepNotes();
            } else {
                console.log(JSON.stringify(postData))
                $("#apiResponse").html(response+" assigneeAjax")
            };
        }
    })
}
function resetNote(id, tbl){
    llq = "-"+tbl+"-"+id;
    $('#note-edit-contents'+llq).val($('#note-contents'+llq).text())
    $('#note-edit-people'+llq).val($('#note-people'+llq).text())
    $("#note-select-assignee"+llq).html("")
}
function assigneeAjax(noteId, noteTbl, assigneeId){
    var noteId = noteId
    if ($("#note-select-assignee-"+noteTbl+"-"+noteId).val() >= 0){
        postData = {}
        postData.id = noteId
        if (assigneeId != null){
            postData.assigned_user = assigneeId
        }
        else{
            postData.assigned_user = $("#note-select-assignee-"+noteTbl+"-"+noteId).val() 
        }
        $.ajax({
            url : "/forward/actionItem",
            dataType:"text",
            method:"POST",
            data: JSON.stringify(postData),
            success:function(response){
                if (apiResponseIsGood(response)) {
                    console.log("Successful update")
                    console.log(postData)
                    console.log(response)
                    updateNoteAssignee(response,noteId) 
                } else {
                    $("#apiResponse").html(response+" assigneeAjax")
                };
            }
        })
    }
    else{
        flashRedBackground($("#note-select-assignee-"+noteTbl+"-"+noteId))
    };
}
function updateNoteAssignee(response, noteId){
    assignee = jQuery.parseJSON(response);
    newAssignee = $("#assigned-user-template").html()
    newAssignee = replaceAllSubsting(newAssignee, "!email!", assignee.email);
    newAssignee = replaceAllSubsting(newAssignee, "!phone!", assignee.phone);
    newAssignee = replaceAllSubsting(newAssignee, "!name!", assignee.name);
    newAssignee = replaceAllSubsting(newAssignee, "!id!", noteId);
    $("#note-assignee-actionItems-"+noteId).html(newAssignee)
    prepNotes();
}
function budgetInit(){
    //budget things that have to be run once at page load
    $(".addItemForm").hide();
    $(".edit_row").hide();
    $(".cost-error").hide()
    $("#show-budget").hide();
    $("#show-budget").click(function(){
        $("#show-budget").hide();
        $("#hide-budget").show();
        $("#budget-table-div").slideDown("slow");   
    });
    $("#hide-budget").click(function(){
        $("#hide-budget").hide();
        $("#show-budget").show();
        $("#budget-table-div").slideUp("slow");   
    });
    $("#cancelBudgetAdd").click(function(){
        $("#name").val("");
        $("#type").val("select");
        $("#cost").val("");
        $(".addItemForm").hide()
        $("#showBudgetAdd").show()
    });
    $("#showBudgetAdd").click(function(){
        $(".addItemForm").show()
        $("#showBudgetAdd").hide()
    });
    $("#budgetAdd").click(function(){
        budgetItemAjax()
    });
    prepBudget()
}
function prepBudget(){
    //budget things that have to be run everytime a budget thing is added/modified
    $(".edit_button").click(function(){
        //hide all display cols, show all edit cols
        buttonId = $(this).attr('id').split("_")
        itemId = buttonId[buttonId.length -1]
        //show the edit cols
        console.log("Show " + "#name_edit_".concat(itemId))
        $("#name_edit_".concat(itemId)).show()
        $("#type_edit_".concat(itemId)).show()
        $("#cost_edit_".concat(itemId)).show()
        $("#buttons_edit_".concat(itemId)).show()
        //hide the display cols
        $("#name_".concat(itemId)).hide()
        $("#type_".concat(itemId)).hide()
        $("#cost_".concat(itemId)).hide()
        $("#buttons_".concat(itemId)).hide()
        //hide cost input error message
        //set the select properly
        $("#type_edit_".concat(itemId)).val($("#type_".concat(itemId)).text())
    });
    $(".cancel_button").click(function(){
        //hide all display cols, show all edit cols
        buttonId = $(this).attr('id').split("_")
        itemId = buttonId[buttonId.length -1]
        //hide the edit cols
        $("#name_edit_".concat(itemId)).hide()
        $("#type_edit_".concat(itemId)).hide()
        $("#cost_edit_".concat(itemId)).hide()
        $("#buttons_edit_".concat(itemId)).hide()
        //show the display cols
        $("#name_".concat(itemId)).show()
        $("#type_".concat(itemId)).show()
        $("#cost_".concat(itemId)).show()
        $("#buttons_".concat(itemId)).show()
        //reset the edit rows
        $("#name_edit_".concat(itemId)).val($("#name_".concat(itemId)).text());
        $("#type_edit_".concat(itemId)).val($("#type_".concat(itemId)).text());
        $("#cost_edit_".concat(itemId)).val($("#cost_".concat(itemId)).text());
    });
    $("[id^=save_]").click(function(){
        buttonId = $(this).attr('id').split("_")
        itemId = buttonId[buttonId.length -1]
        budgetItemAjax(itemId)
    });
    $("[id^=delete_]").click(function(){
        buttonId = $(this).attr('id').split("_")
        itemId = buttonId[buttonId.length -1]
        postData = {}
        postData.id = itemId
        $.ajax({
            url : "/forward/delete/budgetItem",
            dataType:"text",
            method:"POST",
            data: JSON.stringify(postData),
            success:function(response){
                if (apiResponseIsGood(response)) {
                    console.log("Successful delete")
                    console.log(postData)
                    console.log(response)
                    $("#item_".concat(itemId)).remove()
                } else {
                    console.log("Unsuccessful delete")
                    $("#apiResponse").html(response+" id^=delete_")
                };
            }
        });
    });
}
function flashRedBackground (div) {
    bg = div.css("background");
    div.css("background", "red");
    setTimeout(function(){
        div.css("background", bg);
    }, 2000);
}

/*Validate Budget Item Cost input*/
function validateCost(itemId){
   if(itemId != null){
        cost = $("#cost_edit_"+itemId).val()
    }
    else{
        cost = $("#cost").val();
    };

    var costTest = new RegExp("^(([1-9][0-9]{0,2}(,[0-9]{3})*)|0)?(.[0-9]{1,2})?$");

    if(costTest.test(cost)){
        return true;
    }
    else{
        return false;
    }
    
}

/*Daily Reports time validation*/
function validateTime(llq) {

    if (llq != null){
        arrival = $('#note-edit-arrival'+llq).val()
        departure = $('#note-edit-departure'+llq).val()
    } else{
        arrival = $("#note-arrivalTime").val()
        departure = $("#note-departureTime").val()
    };
    var validMilTime = new RegExp("^(2[0-3]|[01]?[0-9]):([0-5]?[0-9])$");

    if(validMilTime.test(arrival) && validMilTime.test(departure)){
        return true;
    }
    else{
        console.log("Didn't validate: "+arrival+" - "+departure)
        return false;
    }
    
}


function selectedNote(){
    $(".daily-report-field").hide()
    $(".action-item-field").hide()
    $(".add-note-card").removeClass("card-warning card-danger").addClass("card-info");
}
function selectedDailyReport(){
    $(".daily-report-field").show()
    $(".action-item-field").hide()
    $(".add-note-card").removeClass("card-info card-danger").addClass("card-warning");
}
function selectedActionItem(){
    $(".daily-report-field").hide()
    $(".action-item-field").show()
    $(".add-note-card").removeClass("card-info card-warning").addClass("card-danger");
}
function budgetItemAjax(itemId){
    nameDivId = "#name";
    typeDivId = "#type";
    costDivId = "#cost";
    if (itemId != null){
        nameDivId = nameDivId.concat("_edit_"+itemId);
        typeDivId = typeDivId.concat("_edit_"+itemId);
        costDivId = costDivId.concat("_edit_"+itemId);
    };
    //validate the form
    if ($(nameDivId).val() != "" && $(typeDivId).val() != "select" && $(typeDivId).val() != "" && $(costDivId).val() != "" && validateCost(itemId)) {
        postData = {}
        if (itemId != null){
            postData.id = itemId
        }
        postData.job_id = $("#jobId").text()
        postData.apiKey = $("#apiKey").text()
        postData.name = $(nameDivId).val()
        postData.type = $(typeDivId).val()
        postData.cost = $(costDivId).val()
        $.ajax({
            url : "/forward/budgetItem",
            dataType:"text",
            method:"POST",
            data: JSON.stringify(postData),
            success:function(response){
              if (apiResponseIsGood(response)) {
                console.log("Successful add")
                //respone was only integers, adding was successful
                if (itemId != null){
                    //we're editing
                    updateBudgetItemRow(itemId)
                }
                else{
                    //we're adding
                    newBudgetItemRow(response);
                };
                prepBudget()
              } else{
                console.log("Unsuccessful add")
                console.log(response)
                //response contained non numerics. Something bad happened
                $("#apiResponse").html(response+" budgetItemAjax")
              };
              
            }
        });    
    }
    else{
        //didn't validate. Tell user where they goofed
        if ($(nameDivId).val() == "") {
            flashRedBackground($(nameDivId));
        };
        if ($(typeDivId).val() == "select" || $(typeDivId).val() != "") {
            flashRedBackground($(typeDivId));
        };
        if ($(costDivId).val() == "") {
            flashRedBackground($(costDivId));
        };
         if(!validateCost(itemId)){
            flashRedBackground($(costDivId));
            $(".cost-error").show()
        };
    };        
}
function makeUsersDropdown(type, selectId){
    var selectId = selectId;
    $.get( "/forward/users/type/"+type, function(data){
        $(selectId).html("");
        var data = jQuery.parseJSON(data);
        data.forEach(function(obj) {
            option = "<option value=\""+obj.id+"\">"+obj.name+"</option>";
            $(selectId).append(option);
        });
        option = "<option value=\"0\">Nobody</option>";
        $(selectId).prepend(option);
    });
}
function newBudgetItemRow(itemId){
    //create new row from template
    rowTemplate = $("#budgetRowTemplate").html()
    newRow = replaceAllSubsting(rowTemplate, "!template!", itemId);
    newRow = replaceAllSubsting(newRow, "!name!", $("#name").val());
    newRow = replaceAllSubsting(newRow, "!type!", $("#type").val());
    newRow = replaceAllSubsting(newRow, "!cost!", $("#cost").val());
    $('#budget-table tr:last').before(newRow);
    //hide edit options initially
    //$("#name_edit_".concat(itemId)).hide()
    //$("#type_edit_".concat(itemId)).hide()
    //$("#cost_edit_".concat(itemId)).hide()
    //$("#buttons_edit_".concat(itemId)).hide()
    //empty the form
    $("#name").val("");
    $("#type").val("select");
    $("#cost").val("");
}
function updateBudgetItemRow (itemId) {
    //move new values into display cols
    $("#name_".concat(itemId)).text($("#name_edit_".concat(itemId)).val());
    $("#type_".concat(itemId)).text($("#type_edit_".concat(itemId)).val());
    $("#cost_".concat(itemId)).text($("#cost_edit_".concat(itemId)).val());
    //hide the edit cols
    $("#name_edit_".concat(itemId)).hide()
    $("#type_edit_".concat(itemId)).hide()
    $("#cost_edit_".concat(itemId)).hide()
    $("#buttons_edit_".concat(itemId)).hide()
    //show the display cols
    $("#name_".concat(itemId)).show()
    $("#type_".concat(itemId)).show()
    $("#cost_".concat(itemId)).show()
    $("#buttons_".concat(itemId)).show()
}
function replaceAllSubsting (str, oldSubStr, newSubStr) {
    return str.split(oldSubStr).join(newSubStr);
}
function apiResponseIsGood(response){
    pattStr1 = "^2\\d\\d.*"
    pattStr2 = "^[0-9]*$"
    pattStr3 = "^\\{.*$"
    var pattern1 = new RegExp(pattStr1)
    var pattern2 = new RegExp(pattStr2)
    test1 = pattern1.test(response)
    test2 = pattern2.test(response)
    result = test1 || test2 || (response.charAt(0) == "{")
    if(!result){
        console.log(test1)
        console.log(test2)
    }
    console.log(result)
    return result
}
function notesAjax(llq){
    var llq = llq
    postData = {}
    if (llq != null){
        messageDivId = "#note-edit-contents"+llq;
        arrivalDivId = "#note-edit-arrival"+llq;
        departureDivId = "#note-edit-departure"+llq;
        assigneeDivId = "#note-select-assignee"+llq;
        peopleOnsiteDivId = "#note-edit-people"+llq;
        postData.tbl = llq.split('-')[1];
        postData.id = llq.split('-')[2];
    } else{
        messageDivId = "#note-message";
        assigneeDivId = "#note-assignee-select";
        arrivalDivId = "#note-arrivalTime";
        departureDivId = "#note-departureTime";
        peopleOnsiteDivId = "#note-PeopleOnSite";
        if ($("#note-type-dailyReport").prop("checked")) {
            postData.tbl = "dailyReports"
        } else if ($("#note-type-actionItem").prop("checked")){
            postData.tbl = "actionItems"
        } else {
            postData.tbl = "notes"
        };
    };

    if ((
            postData.tbl == 'dailyReports' &&
            $(messageDivId).val() != "" &&
            $(arrivalDivId).val() != "" &&
            $(departureDivId).val() != "" &&
            validateTime(llq)
        ) ||
        (
            postData.tbl == 'actionItems' &&
            $(messageDivId).val() != ""
        ) ||
        (
            postData.tbl == 'notes' &&
            $(messageDivId).val() != ""
        )
       )
    {
        //form validated
        postData.job_id = $("#jobId").text()
        postData.contents = $(messageDivId).val()
        if (postData.tbl == 'dailyReports') {
            postData.arrival_time = $(arrivalDivId).val()
            postData.departure_time = $(departureDivId).val()
            postData.people_on_site = $(peopleOnsiteDivId).val()
        } else if (postData.tbl == 'actionItems'){
            console.log("in action item")
            if ($(assigneeDivId).val() > 0){
                console.log("has assignee")
                postData.assigned_user = $(assigneeDivId).val()
            }
        };
        $.ajax({
            url : "/forward/note",
            dataType:"text",
            method:"POST",
            data: JSON.stringify(postData),
            success:function(response){
              if (apiResponseIsGood(response)) {
                console.log("Successful Note POST")
                console.log(JSON.stringify(postData))
                console.log(response)
                if (llq != null){
                    updateNote(llq, postData)
                }else{
                    createNewNote(response, postData);
                };
              } else{
                console.log("Unsuccessful Note POST")
                console.log(JSON.stringify(postData))
                console.log(response)
                $("#apiResponse").html(response+" notesAjax")
              };
              
            }
        });
    } else{
        console.log("Note didn't validate")
        if(!validateTime(llq)){
            flashRedBackground($(departureDivId))
            flashRedBackground($(arrivalDivId))
            $(".date-time-error").show()
        };
        if($(arrivalDivId).val() == ""){
            flashRedBackground($(arrivalDivId))
        };
        if($(departureDivId).val() == ""){
            flashRedBackground($(departureDivId))
        };
        if($(messageDivId).val() == ""){
            flashRedBackground($(messageDivId))
        };
    }
    
}  
function updateNote(llq, note){
    $('#note-contents'+llq).text($('#note-edit-contents'+llq).val())
    $('#note-people'+llq).text($('#note-edit-people'+llq).val())
    $('#note-select-assignee'+llq).html($('#note-select-assignee'+llq+' option:selected').text())
    d = new Date()
    date = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()
    $('#note-arrival'+llq).text(date+" "+$('#note-edit-arrival'+llq).val())
    $('#note-departure'+llq).text(date+" "+$('#note-edit-departure'+llq).val())
    if(note.tbl == "actionItems" && note.assigned_user != ""){
        console.log("/forward/user/"+note.assigned_user)
        $.get( "/forward/user/"+note.assigned_user)
            .done(function( response ) {
                response = JSON.parse(response)
                console.log(response)
                newAssignee = $("#assigned-user-template").html()
                newAssignee = replaceAllSubsting(newAssignee, "!tbl!", llq.split('-')[1]);
                newAssignee = replaceAllSubsting(newAssignee, "!id!", llq.split('-')[2]);
                newAssignee = replaceAllSubsting(newAssignee, "!name!", response.name);
                newAssignee = replaceAllSubsting(newAssignee, "!phone!", response.phone);
                newAssignee = replaceAllSubsting(newAssignee, "!email!", response.email);
                $("#note-assignee"+llq).html(newAssignee)
            });
    }
    $("#note"+llq+" .note-display").show()
    $("#note"+llq+" .note-edit").hide()
}
/*NOT WORKING*/
function noteTimeCheck(){

    console.log("timeCheck entered");
   
    $('.get-note').each(function(){
        var getNote = $(this).attr('id').split("-");
        da = new Date();
        noteId = getNote[getNote.length-1];
        noteTbl = getNote[getNote.length-2];
        noteSuff = "#note-entry-time-" + noteTbl + "-" + noteId;
        noteET =  $(noteSuff).text();

        noteTime = noteET.split(" ")[1]
        noteDate = noteET.split(" ")[0]
        noteYear = noteDate.split("-")[0]
        noteMonth = noteDate.split("-")[1]
        noteDay = noteDate.split("-")[2]
        noteHour = noteTime.split(":")[0]
        noteMinute = noteTime.split(":")[1]
        noteDate = new Date(noteYear, noteMonth, noteDay, noteHour, noteMinute)

        noteS = "#note-delete-button-" + noteTbl + "-" + noteId;
        noteE = "#note-edit-button-" + noteTbl + "-" + noteId;

        now = new Date();

        noteConsolidate = (noteDate.getHours()*60) + noteDate.getMinutes();
        console.log("Note consolidate is: " + noteConsolidate);
        //console.log("Note hour time: " + noteConsolidate);
        nowConsolidate = (now.getHours()*60) + now.getMinutes();
        console.log("Now consolidate is: " + nowConsolidate)
        consolidateTime = Math.abs(nowConsolidate - noteConsolidate);
        console.log("now - note = " + consolidateTime);
        consolidateDiffMillis = consolidateTime*60000;
        console.log("The millis left: " + consolidateDiffMillis);
        
        
        if (consolidateTime < 60 && now.getDate() == noteDate.getDate()){
            console.log("true");
            //console.log(noteDate+" < "+now)
            setTimeout(function() {
              $(noteS).hide();
            }, consolidateDiffMillis);
        }
        else{
            $(noteS).hide();
            $(noteE).hide();
        }
    });
}


function getCurrentDateTime(){
    d = new Date()
    date = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()
    time = " "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds()
    datetime = date+time
    return datetime
}
function createNewNote(noteId, note){
    console.log("new note")
    noteSuffix = "-" + note.tbl + "-" + noteId
    console.log(note)
    console.log(note.contents)
    console.log(note.tbl)
    newNote = $("#"+note.tbl+"-template").html()
    newNote = replaceAllSubsting(newNote, "!tbl!", note.tbl);
    newNote = replaceAllSubsting(newNote, "!id!", noteId);


    $('#note-card-group > div:first-child').before(newNote);

    $("#note-contents".concat(noteSuffix)).text(note.contents)
    $("#note-edit-contents".concat(noteSuffix)).val(note.contents)
    $("#note-user-name".concat(noteSuffix)).text($("#user-name").text())
    $("#note-entry-time".concat(noteSuffix)).text(getCurrentDateTime())

    if (note.tbl == "actionItems" && note.assigned_user != "") {
        assigneeAjax(noteId, note.tbl, note.assigned_user)
    }else if (note.tbl == "dailyReports") {
        d = new Date()
        date = d.getFullYear()+"-"+(d.getMonth()+1)+"-"+d.getDate()
        $("#note-arrival".concat(noteSuffix)).text(date+" "+note.arrival_time)
        $("#note-edit-arrival".concat(noteSuffix)).val(note.arrival_time)
        $("#note-departure".concat(noteSuffix)).text(date+" "+note.departure_time)
        $("#note-edit-departure".concat(noteSuffix)).val(note.departure_time)
        $("#note-people".concat(noteSuffix)).text(note.people_on_site)
        $("#note-edit-people".concat(noteSuffix)).val(note.people_on_site)
    };

    //start delete/edit timer - 3600000 milliseconds
    setTimeout(function(){
        noteEdit = "#note-edit-button" + noteSuffix
        noteDelete = "#note-delete-button" + noteSuffix
        $(noteEdit).hide();
        $(noteDelete).hide();
        }, 3600000);

    //empty the form
    $("#note-message").val("")
    $("#note-assignee").val("")
    $("#note-arrivalTime").val("")
    $("#note-departureTime").val("")
    $("#note-PeopleOnSite").val("")
    //make all notes the same size
    $('.note-card').width($('.add-note-card').width())
    //kluge
    $("note-add-assignee".concat(noteSuffix)).show()
    makeUsersDropdown("all", "#note-assignee-select")
    prepNotes();
}

//hides all the fields with the job-edit id
function jobEditInit(){
    if ($("#isNewJob").text() == "true") {
        $(".job-show").hide();
        $("#edit-job-cancel").hide();
    }
    else{
        $(".job-edit").hide();
    }
	
	
	//function to show hidden stuff when ' (edit)' clicked
	$("#edit-job").click(function(){
        $(".job-show").hide();
		$(".job-edit").show(); 
		//fix the phase issue
		$("#edit-job-phase").val($("#job-phase").text());
    });
	
	$("#edit-job-cancel").click(function() {
		$(".job-edit").hide();
		$(".job-show").show();
		//reset all fields
		$("#edit-job-name").val($("#job-name").text());
		$("#edit-job-street").val($("#location-street-address").text());
		$("#edit-job-city").val($("#location-city").text());
		$("#edit-job-state").val($("#location-state").text());
		$("#edit-job-zip").val($("#location-zip").text());
		$("#edit-job-customer").val($("#job-customer").text());
		$("#edit-job-supervisor").val($("#job-supervisor").text());
		$("#edit-job-manager").val($("#job-manager").text());
		$("#edit-job-budgetAvailable").val($("#job-budgetAvailable").text());
		$("#edit-job-budgetAllocated").val($("#job-budgetAllocated").text());
		$("#edit-job-desc").val($("#job-desc").text());
		$("#edit-job-phase").val($("#job-phase").text());
	})
	
	$("#edit-job-save").click(function(){updateJobInfo()});
    makeUsersDropdown("all", "#edit-job-supervisor")
    makeUsersDropdown("all", "#edit-job-manager")
    document.getElementById('estimate-file').onchange = function (e) {loadEstimateFromInput(e.target);};
    document.getElementById('scope-file').onchange = function (e) {loadScopeFromInput(e.target);};
    $("#input-scope").hide();
    $("#add-scope").hide();
    $("#input-estimate").hide();
    $("#add-estimate").hide();
    $("#button-add-scope").click(function(){
        $("#input-scope").show();
    })
    $("#cancel-scope").click(function(){
        $("#input-file").replaceWith($("#input-file").clone());
        $("#input-scope").hide();
        $('#add-scope').hide()
        scopeData = {};
    })
    $("#submit-scope").click(function(){
        $.post("/forward/scope", JSON.stringify(scopeData))
            .done(
                function(response) {
                    console.log("response: " + response)
                    if (apiResponseIsGood(response)) {
                        obj = JSON.parse(response)
                        $("#job-scope").html("<a href="+obj.link+">Current Scope</a>")
                        $("#input-scope").hide();
                        $('#add-scope').hide()
                    };
                }
            );
    })

    $("#button-add-estimate").click(function(){
        $("#input-estimate").show();
    })
    $("#cancel-estimate").click(function(){
        $("#estimate-file").replaceWith($("#estimate-file").clone());
        $("#input-estimate").hide();
        $('#add-estimate').hide()
        scopeData = {};
    })
    $("#submit-estimate").click(function(){
        $.post("/forward/estimate", JSON.stringify(estimateData))
            .done(
                function(response) {
                    console.log("response: " + response)
                    if (apiResponseIsGood(response)) {
                        obj = JSON.parse(response)
                        $("#job-estimate").html("<a href="+obj.link+">Current estimate</a>")
                        $("#input-estimate").hide();
                        $('#add-estimate').hide()
                    };
                }
            );
    })

}
function loadScopeFromInput(input) {
    var reader; 
    if (input.files && input.files[0]) {
        var file = input.files[0];
        reader = new FileReader();
        reader.readAsDataURL(file);
        //filereaders run on a different thread, so we
        // need to wait for it to finish it's work before we continue
        reader.onload = function (e) {
            scopeData = {}
            scopeData.name = file.name
            scopeData.lastModified = file.lastModified
            scopeData.type = file.type
            scopeData.file_extension = (file.name).substr((file.name).lastIndexOf('.'))
            scopeData.job_id = $('#jobId').text()
            scopeData.base64_image = reader.result
            console.log(scopeData)
            $('#add-scope').show()
        }
    }
}
function loadEstimateFromInput(input) {
    var reader; 
    if (input.files && input.files[0]) {
        var file = input.files[0];
        reader = new FileReader();
        reader.readAsDataURL(file);
        //filereaders run on a different thread, so we
        // need to wait for it to finish it's work before we continue
        reader.onload = function (e) {
            estimateData = {}
            estimateData.name = file.name
            estimateData.lastModified = file.lastModified
            estimateData.type = file.type
            estimateData.file_extension = (file.name).substr((file.name).lastIndexOf('.'))
            estimateData.job_id = $('#jobId').text()
            estimateData.base64_image = reader.result
            console.log(estimateData)
            $('#add-estimate').show()
        }
    }
}
//update the job information
function updateJobInfo () {
	jobNameId = "#edit-job-name";
    streetId = "#edit-job-street";
    cityId = "#edit-job-city";
    stateId = "#edit-job-state";
    zipId = "#edit-job-zip";
    customerName = "#edit-job-customer-name";
    customerPhone = "#edit-job-customer-phone";
    customerEmail = "#edit-job-customer-email"
    supervisorId = "#edit-job-supervisor";
    managerId = "#edit-job-manager";
    budgetAvailableId = "#edit-job-budgetAvailable";
    budgetAllocatedId = "#edit-job-budgetAllocated";
    descriptionId = "#edit-job-desc";
    phaseId = $("#edit-job-phase");
	
	//verify that the above are not empty (location ones and name)
	if ($(jobNameId).val() != "" && $(streetId).val() != "" && $(cityId).val() != "" && $(stateId).val() != "" && $(zipId).val() != "") {
		postData = {}
		postData.id = $("#jobId").text()
		postData.name = $(jobNameId).val()
		postData.street_address = $(streetId).val()
		postData.city = $(cityId).val()
		postData.state = $(stateId).val()
		postData.zip = $(zipId).val()
		postData.customer_name = $(customerName).val()
        postData.customer_phone = $(customerPhone).val()
        postData.customer_email = $(customerEmail).val()
        postData.supervisor_id = $(supervisorId).val();
        postData.manager_id = $(managerId).val();
		//postData.budget_available = $(budgetAvailableId).val()
		//postData.budget_allocated = $(budgetAllocatedId).val()
		postData.description = $(descriptionId).val()
		postData.phase = $(phaseId).val()
        if ($("#isNewJob").text() == "true") {
            postUrl = "/forward/job"
        }
        else{
            postUrl = "/forward/job/" + postData.id
        };
		
		$.ajax({
			url : postUrl,
			dataType:"text",
			method:"POST",
			data: JSON.stringify(postData),
			success:function(response){
			  if (apiResponseIsGood(response)) {
				console.log("Successful add")
				console.log(JSON.stringify(postData))
				console.log(response)
                if ($("#isNewJob").text() == "true") { //this is a new job
                    //redirect them to their new job
                    window.location.replace("/job/"+response);
                }
                else{ //we're editing
                    showUpdatedJobInfo();
                }
			  } 
              else{
				console.log("Unsuccessful add")
				console.log(JSON.stringify(postData))
				console.log(response)
				$("#apiResponse").html(response+" updateJobInfo")
			  };
			  
			}
		}); 
	} else {
		//didn't validate. Tell user where they goofed
        if ($(jobNameId).val() == "") {
            flashRedBackground($(jobNameId));
        };
        if ($(streetId).val() == "") {
            flashRedBackground($(streetId));
        };
        if ($(cityId).val() == "") {
            flashRedBackground($(cityId));
        };
		if ($(stateId).val() == "") {
            flashRedBackground($(stateId));
        };
		if ($(zipId).val() == "") {
            flashRedBackground($(zipId));
        };
	};
	
}

//display the updated job information
//but wouldn't the refresh page just get us the updated values?
function showUpdatedJobInfo() {
	//move new values into display cols
	$("#job-name").text($("#edit-job-name").val());  
	$("#job-location").text(($("#edit-job-street").val()+ " ").concat($("#edit-job-city").val()));
	$("#job-customer").text($("#edit-job-customer").val());
	//$("#job-supervisor").text($("#edit-job-supervisor").val());
    $("#job-supervisor").text($("#edit-job-supervisor option[value='"+$("#edit-job-supervisor").val()+"']").text())
	//$("#job-manager").text($("#edit-job-manager").val());
    $("#job-manager").text($("#edit-job-manager option[value='"+$("#edit-job-manager").val()+"']").text());
	$("#job-budgetAvailable").text($("#edit-job-budgetAvailable").val());
	$("#job-budgetAllocated").text($("#edit-job-budgetAllocated").val());
	$("#job-desc").text($("#edit-job-desc").val());
	$("#job-phase").text($("#edit-job-phase").val());
   
	//update the location link
	$("#job-location").attr("href", "http://maps.apple.com/?q=" + $("#edit-job-street").val() + $("#edit-job-city").val() + $("#edit-job-city").val() + $("#edit-job-zip").val());
	
	//update the metadata keys
	$("#location-street-address").text($("#edit-job-street").val());
	$("#location-city").text($("#edit-job-city").val());
	$("#location-state").text($("#location-state").val());
	$("#location-zip").text($("#location-zip").val());
	
    //hide the edit cols
    $(".job-edit").hide()
    
    //show the display cols
    $(".job-show").show()

    //update card color
    $(".job-info").removeClass("card-danger card-warning card-success")
    if ($("#edit-job-phase").val() == "Open"){
        $(".job-info").addClass("card-success")
    }
    else{
        $(".job-info").addClass("card-danger")
    };
    
}

$(document).ready(function(){
    //if we're in a new job, we only care about the job card
    if ($("#isNewJob").text() == "true") {
        jobEditInit()
    }
    else{
        photosInit()
        notesInit()
        budgetInit()
        jobEditInit()
        noteTimeCheck()
    }
    
});
