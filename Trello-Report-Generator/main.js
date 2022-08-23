//gets all cards that have been moved into specified list
function getActionsInList(listID, key, token) {

    fetch("https://api.trello.com/1/lists/" + listID + "/actions?key=" + key + "&token=" + token + "&filter=updateCard:idList").then((data) => {

    return data.json();
    }).then((objectData) => {
        console.log(objectData[0].title);
        let actionsData="";
        objectData.map((values) => {
            actionsData+= `<tr>
            <td>${values.data.card.name}</td>
            <td><a href="https://trello.com/c/${values.data.card.shortLink}">https://trello.com/c/${values.data.card.shortLink}</a></td>
            <td>${values.data.listBefore.name}</td>
            <td>${values.date}</td>
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

//gets all the cards in the list
function countCardsInList(listID, key, token) {
    fetch("https://api.trello.com/1/lists/" + listID + "/cards?key=" + key + "&token=" + token + "&fields=name,shortUrl,desc,dateLastActivity").then((data) =>{
        return data.json();
    }).then((objectData) => {
        console.log(objectData[0].title);
        let tableData="";
        objectData.map((values) => {
            //values.id is current placeholder for who is assigned to the card, needs to be updated
            tableData+=`<tr>
            <td>${values.name}</td>
            <td><a href="${values.shortUrl}">${values.shortUrl}</a></td>
            <td>${values.desc}</td>
            <td>${values.dateLastActivity}</td>
            <td>${values.id}</td>
            </tr>`;
        });
        document.getElementById("table_body").innerHTML=tableData;
    }).catch((err) => {
        console.log(err);
    })

}

 
