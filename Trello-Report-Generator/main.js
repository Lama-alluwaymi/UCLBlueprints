
//test API
async function testAPI(boardID, key, token) {

    
    try {
        
        
        const result = await fetchMembers(boardID, key, token)

    
        revealLists();

    } catch (err) {
        
        alert("Invalid Board ID/Key/Token");      
    }

}


//reveal lists
function revealLists() {


    let lists = document.getElementById("listDisplay");

    lists.style.display = "block";

}

//reveal report
function revealSections() {
    let cardsCurrentlyInList = document.getElementById("cardsCurrentlyInList");
    let cardsMovedIntoList = document.getElementById("cardsMovedIntoList");
    let actionsTakenPlaceInList = document.getElementById("actionsTakenPlaceInList");
    let cardsAssignedPerBoardMemberOnList = document.getElementById("cardsAssignedPerBoardMemberOnList");
    let allActionsOnList = document.getElementById("allActionsOnList");

    cardsCurrentlyInList.style.display = "block";
    cardsMovedIntoList.style.display = "block";
    actionsTakenPlaceInList.style.display = "block";
    cardsAssignedPerBoardMemberOnList.style.display = "block";
    allActionsOnList.style.display = "block";
}




//gets all actions that have happened in a board
function getAllActionsInBoard(boardID, key, token) {

    fetch("https://api.trello.com/1/boards/" + boardID + "/actions?key=" + key + "&token=" + token +"&limit=1000").then((data) => {

    return data.json();
    }).then((objectData) => {
        console.log(objectData[0].title);
        let allActionsData="";
        objectData.map((values) => {

             let actionType = values.type;
             let specificAction = "";
             
             if (actionType == "updateCard") {
                 if (values.data.old.hasOwnProperty('dueReminder')) {
                     specificAction = "Reminder change";
                 } else if (values.data.old.hasOwnProperty('desc')) {
                     specificAction = "Description change";
                 } else if (values.data.old.hasOwnProperty('idList')) {
                     specificAction = "Card list change";
                 } else if (values.data.old.hasOwnProperty('idLabels')) {
                     specificAction = "Label change";
                 } else if (values.data.old.hasOwnProperty('due')) {
                     specificAction = "Due date change";
                 } else if (values.data.old.hasOwnProperty('closed')) {
                     specificAction = "Card archived";
                 } else if (values.data.old.hasOwnProperty('pos')) {
                     specificAction = "Position in list change";
                 } else if (values.data.old.hasOwnProperty('name')) {
                    specificAction = "Card name change";
                 } else {
                     specificAction = "Error";
                 }

             } else if (actionType == "createList") {
                 specificAction = "List created";
             } else if (actionType == "createCard") {
                 specificAction = "Card created";
             }

             if (actionType == "commentCard") {
                specificAction = "Comment added";
             }

             if (actionType == "removeMemberFromCard") {
                specificAction = "Member removed from card";
             }

             if (actionType == "addMemberToCard") {
                specificAction = "Member added to card";
             }

             if (actionType == "addChecklistToCard") {
                specificAction = "Checklist added to card";
             }

             if (actionType == "removeChecklistFromCard") {
                specificAction = "Checklist removed from card";
             }

             if (actionType == "addAttachmentToCard") {
                specificAction = "Attachment added to card (" + values.data.attachment.name + ")";
             }

             if (actionType == "createBoard") {
                specificAction = "Board created";
             }

             if (actionType == "addToOrganizationBoard") {
                specificAction = "Add to organizations boards";
             }

             if (actionType == "enablePlugin") {
                specificAction = "Plugin enabled";
             }

             if (actionType == "updateCheckItemStateOnCard") {
                specificAction = "Checklist item state updated";
             }

             if (actionType == "updateList") {
                if (values.data.old.hasOwnProperty('pos')) {
                    specificAction = "List position change";
                } else if (values.data.old.hasOwnProperty('name')) {
                    specificAction = "List name change";
                }
            }



             //updateCheckItemStateOnCard

            let specificName ="testName";
            let shortLink ="";
            let trelloLinkCreation = "https://trello.com/c/";
            
            
            if (values.data.hasOwnProperty('card')) {
                specificName = values.data.card.name;
                shortLink = values.data.card.shortLink;
                trelloLinkCreation = trelloLinkCreation + shortLink;

            } else {
                specificName = "";
                trelloLinkCreation =""
            }

            let dateFormat = new Date(values.date);

            let dateResult = dateFormat.getDate() + "/" +  (dateFormat.getMonth()+1) + "/" + dateFormat.getFullYear();

            allActionsData+= `<tr>
            <td>${specificName}</td>
            <td><a href="${trelloLinkCreation}">${trelloLinkCreation}</a></td>
            <td>${specificAction}</td>
            <td>${dateResult}</td>
            <td>${values.memberCreator.fullName} (${values.memberCreator.username})</td>
            </tr>`;
        });
        document.getElementById("table_body_actions_on_board").innerHTML=allActionsData;
    }).catch((err) => {
        console.log(err);
    })

}




//gets all actions that have happened in a list
function getAllActionsInList(listID, key, token) {

    fetch("https://api.trello.com/1/lists/" + listID + "/actions?key=" + key + "&token=" + token).then((data) => {

    return data.json();
    }).then((objectData) => {
        console.log(objectData[0].title);
        let allActionsData="";
        objectData.map((values) => {

             let actionType = values.type;
             let specificAction = "";
             
             if (actionType == "updateCard") {
                 if (values.data.old.hasOwnProperty('dueReminder')) {
                     specificAction = "Reminder change";
                 } else if (values.data.old.hasOwnProperty('desc')) {
                     specificAction = "Description change";
                 } else if (values.data.old.hasOwnProperty('idList')) {
                     specificAction = "List change";
                 } else if (values.data.old.hasOwnProperty('idLabels')) {
                     specificAction = "Label change";
                 } else if (values.data.old.hasOwnProperty('due')) {
                     specificAction = "Due date change";
                 } else if (values.data.old.hasOwnProperty('closed')) {
                     specificAction = "Card archived";
                 } else if (values.data.old.hasOwnProperty('pos')) {
                        specificAction = "Position in list change";
                 } else if (values.data.old.hasOwnProperty('name')) {
                    specificAction = "Card name change"; 
                 } else {
                     specificAction = "Error";
                 }

             } else if (actionType == "createList") {
                 specificAction = "List created";
             } else if (actionType == "createCard") {
                 specificAction = "Card created";
             }

             if (actionType == "commentCard") {
                specificAction = "Comment added";
             }

             if (actionType == "addAttachmentToCard") {
                specificAction = "Attachment added to card (" + values.data.attachment.name + ")";
             }

             if (actionType == "updateCheckItemStateOnCard") {
                specificAction = "Checklist item state updated";
             }

             if (actionType == "updateList") {
                if (values.data.old.hasOwnProperty('pos')) {
                    specificAction = "List position change";
                } else if (values.data.old.hasOwnProperty('name')) {
                    specificAction = "List name change";
                }
            }




            let specificName ="testName";
            let shortLink ="";
            let trelloLinkCreation = "https://trello.com/c/";
            
            
            if (values.data.hasOwnProperty('card')) {
                specificName = values.data.card.name;
                shortLink = values.data.card.shortLink;
                trelloLinkCreation = trelloLinkCreation + shortLink;

            } else {
                specificName = "";
                trelloLinkCreation =""
            }

            let dateFormat = new Date(values.date);

            let dateResult = dateFormat.getDate() + "/" +  (dateFormat.getMonth()+1) + "/" + dateFormat.getFullYear();

            allActionsData+= `<tr>
            <td>${specificName}</td>
            <td><a href="${trelloLinkCreation}">${trelloLinkCreation}</a></td>
            <td>${specificAction}</td>
            <td>${dateResult}</td>
            <td>${values.memberCreator.fullName} (${values.memberCreator.username})</td>
            </tr>`;
        });
        document.getElementById("table_body_actions_on_list").innerHTML=allActionsData;
    }).catch((err) => {
        console.log(err);
    })

}


//gets all cards that have been moved into specified list
function getActionsInList(listID, key, token) {

    fetch("https://api.trello.com/1/lists/" + listID + "/actions?key=" + key + "&token=" + token + "&filter=updateCard:idList").then((data) => {

    return data.json();
    }).then((objectData) => {
        console.log(objectData[0].title);
        let actionsData="";
        objectData.map((values) => {

            let dateFormat = new Date(values.date);

            let dateResult = dateFormat.getDate() + "/" +  (dateFormat.getMonth()+1) + "/" + dateFormat.getFullYear();

            actionsData+= `<tr>
            <td>${values.data.card.name}</td>
            <td><a href="https://trello.com/c/${values.data.card.shortLink}">https://trello.com/c/${values.data.card.shortLink}</a></td>
            <td>${values.data.listBefore.name}</td>
            <td>${dateResult}</td>
            <td>${values.memberCreator.fullName} (${values.memberCreator.username})</td>
            </tr>`;

            
        });
        document.getElementById("table_body_cards_into_list").innerHTML=actionsData;
    }).catch((err) => {
        console.log(err);
    })

}




//gets all the lists in a board
function getListsForDropdown(boardID, key, token) {

    fetch("https://api.trello.com/1/boards/" + boardID + "/lists?key=" + key + "&token=" + token + "&fields=id,name").then((data) => {

        return data.json();
    }).then((objectData) => {
        console.log(objectData[0].title);
        let dropDownData="";
        objectData.map((values) => {
            dropDownData+= `
            <option value="${values.id}"> ${values.name}</option>
        `   ;
        });
        document.getElementById("listDropDown").innerHTML=dropDownData;
    }).catch((err) => {
        console.log(err);
        
    })

}

//gets cards in a list, all the boards members and records cards currently in a chosen list and who those cards are assigned to
async function buildCountCardsInList(boardID, listID, key, token) {
        const result = await getCardsInList(listID, key, token);
        const result2 = await fetchMembers(boardID, key, token);

        var assignedMembersArray = [];

        

        for(let i = 0; i < result.length; i++) {

            

    
            var assignedMembers = "";
           

            
            for (let j = 0; j < result2.length; j++) {

                
                for(let k = 0; k < result[i]['idMembers'].length; k++) {

                   
                    if (result[i]['idMembers'][k] == result2[j]['id']) {

                        assignedMembers+= result2[j]['fullName'] + " (" + result2[j]['username'] + ") ";
                       
                    }

                }
                
                assignedMembersArray.push(assignedMembers);
                
            }

        }

        let tableData=""
        for(let i = 0; i < result.length; i++) {
            
            let assignedMembersResult = "";

            if (assignedMembersArray[i] == "") {
                assignedMembersResult = "No assigned members";
            } else {
                assignedMembersResult = assignedMembersArray[i];
            }
            
            let descriptionResult = "";

            if (result[i]['desc'] == "") {
                descriptionResult = "No description";
            } else {
                descriptionResult = result[i]['desc'];
            }

            let dateFormat = new Date(result[i]['dateLastActivity']);

            let dateResult = dateFormat.getDate() + "/" +  (dateFormat.getMonth()+1) + "/" + dateFormat.getFullYear();
            
            tableData+=`<tr>
            
            <td>${result[i]['name']}</td>
            <td><a href="${result[i]['shortUrl']}">${result[i]['shortUrl']}</a></td>
            <td>${descriptionResult}</td>
            <td>${dateResult}</td>
            <td>${assignedMembersResult}</td>
            </tr>`;
        }
        document.getElementById("table_body").innerHTML=tableData;

}

//gets all the cards in a list
async function getCardsInList(listID, key, token) {

        const response = await fetch("https://api.trello.com/1/lists/" + listID + "/cards?key=" + key + "&token=" + token + "&fields=name,shortUrl,desc,dateLastActivity,idMembers")

        const data = await response.json();
        return data;
}

//gets all the cards in a list, all the members of a board and counts how many cards are assigned to each member
async function buildCardsAssignedPerBoardMember(boardID, listID, key, token) {

    const result = await getCardsInList(listID, key, token);
    const result2 = await fetchMembers(boardID, key, token);

    var cardCounterArray = new Array(result2.length);

    for(let z = 0; z < cardCounterArray.length; z++) {

        cardCounterArray[z] = 0;

    }
        
        for(let i = 0; i < result.length; i++) {

            for (let j = 0; j < result2.length; j++) {

            
                for(let k = 0; k < result[i]['idMembers'].length; k++) {

                   
            
                    if (result[i]['idMembers'][k] == result2[j]['id']) {

                        
                        cardCounterArray[j] += 1;
                        
                    }

               }
                
            }

        }

        let tableData=""
        for(let i = 0; i < result2.length; i++) {
            tableData+=`<tr>
            
            <td>${result2[i]['fullName']} (${result2[i]['username']})</td>
            <td>${cardCounterArray[i]}</td>
            </tr>`;
        }
        document.getElementById("table_body_cards_assigned_list").innerHTML=tableData;


}





//gets all members of a board
async function fetchMembers(boardID, key, token) {

        
        const response = await fetch("https://api.trello.com/1/boards/" + boardID + "/members?key=" + key + "&token=" + token);

        
        const data = await response.json();

       
            return data;
       
        
    
    
}

async function getCardsMovedIntoListForGraph(listID, key, token) {

        
    const response = await fetch("https://api.trello.com/1/lists/" + listID + "/actions?key=" + key + "&token=" + token + "&filter=updateCard:idList");

    
    const data = await response.json();
    return data;


}


//generate mostCardsIntoList chart

async function generateMostCardsIntoListChart(boardID, listID, key, token) {

   
    const membersResult = await fetchMembers(boardID, key, token);
    const cardsResult = await getCardsMovedIntoListForGraph(listID, key, token)
    

    var cardCounterArray = new Array(membersResult.length);

    for(let z = 0; z < cardCounterArray.length; z++) {

        cardCounterArray[z] = 0;

    }
        
        for(let i = 0; i < cardsResult.length; i++) {

            for (let j = 0; j < membersResult.length; j++) {

            
                //for(let k = 0; k < cardsResult[i]['idMembers'].length; k++) {

                   
            
                    if (cardsResult[i]['idMemberCreator'] == membersResult[j]['id']) {

                        
                        cardCounterArray[j] += 1;
                        
                    }

               //}
                
            }

        }


        var membersArray = new Array(membersResult.length);

        for(let x = 0; x < membersArray.length; x++) {

            
            membersArray[x] = membersResult[x]['fullName'];
            
        }



        //cardCounterArray
        //membersArray
        
        const membersCards = membersArray.map((member, index) => {
            let memberCardObject = {};
            memberCardObject.member = member;
            memberCardObject.cardCount = cardCounterArray[index];

            return memberCardObject;
        })

        console.log(membersCards);

        let myChart = document.getElementById('myChart').getContext('2d');

        let chartStatus = Chart.getChart("myChart"); // <canvas> id
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }
        
        
        let barChart = new Chart(myChart, {
        type:'bar',
        data:{
            //labels:[membersArray.map()],
            datasets:[{
                label:'Cards moved into list',
                data: membersCards,
                backgroundColor: ["red", "blue", "green", "orange", "purple", "yellow", "pink", "cyan", "magenta", "grey"],
                parsing: {
                    xAxisKey: 'member',
                    yAxisKey: 'cardCount'
                }



                }]
            },
            options:{}
        });






}

async function generateCardsAssignedPerBoardMemberOnListChart(boardID, listID, key, token) {

   
    const result = await getCardsInList(listID, key, token);
    const result2 = await fetchMembers(boardID, key, token);

    var cardCounterArray = new Array(result2.length);

    for(let z = 0; z < cardCounterArray.length; z++) {

        cardCounterArray[z] = 0;

    }
        
        for(let i = 0; i < result.length; i++) {

            for (let j = 0; j < result2.length; j++) {

            
                for(let k = 0; k < result[i]['idMembers'].length; k++) {

                   
            
                    if (result[i]['idMembers'][k] == result2[j]['id']) {

                        
                        cardCounterArray[j] += 1;
                        
                    }

               }
                
            }

        }


        var membersArray = new Array(result2.length);

        for(let x = 0; x < membersArray.length; x++) {

            
            membersArray[x] = result2[x]['fullName'];
            
        }



        //cardCounterArray
        //membersArray
        
        const membersCards = membersArray.map((member, index) => {
            let memberCardObject = {};
            memberCardObject.member = member;
            memberCardObject.cardCount = cardCounterArray[index];

            return memberCardObject;
        })

        console.log(membersCards);

        
        
        let myChart = document.getElementById('myChart2').getContext('2d');

        let chartStatus = Chart.getChart("myChart2"); // <canvas> id
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }

        let barChart = new Chart(myChart, {
        type:'bar',
        data:{
            //labels:[membersArray.map()],
            datasets:[{
                label:'Cards assigned per board member on the list',
                data: membersCards,
                backgroundColor: ["red", "blue", "green", "orange", "purple", "yellow", "pink", "cyan", "magenta", "grey"],
                parsing: {
                    xAxisKey: 'member',
                    yAxisKey: 'cardCount'
                }




                }]
            },
            options:{}
        });






}



 

