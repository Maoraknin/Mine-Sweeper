'use strict'


function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

function setMinesNegsCount(cellI, cellJ, mat) {
    var neighborsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue

            if (mat[i][j].isMine === true) neighborsCount++
        }
    }
    return neighborsCount
}

function checkNeighbors(cellI, cellJ, mat) {
    
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            
            if (mat[i][j].minesAroundCount !== 0 && mat[i][j].isShown === false) {
                mat[i][j].isShown = true
                gGame.shownCount++
            }
            if (mat[i][j].minesAroundCount === 0 && mat[i][j].isShown === false){
                mat[i][j].isShown = true
                gGame.shownCount++
  
                checkNeighbors(i, j, mat)
                
            } 
        }
    }
}




function startTimer() {
    if (gGame.isOn && gGame.shownCount === 0){
        gGame.secsPassed = Date.now()
        gInterval = setInterval(() => {
            const seconds = (Date.now() - gGame.secsPassed) / 1000
            // gGame.secsPassed = seconds
            var elH2 = document.querySelector('.time')
            elH2.innerText = seconds.toFixed(1)
        }, 1);
    }
    
}

function resetTime() {
    gGame.secsPassed = 0
    var elH2 = document.querySelector('.time')
    elH2.innerText = '0.0'
}

function renderBoard(mat, selector) {

    var strHTML = ''
    for (var i = 0; i < mat.length; i++) {

        strHTML += '<tr>'
        for (var j = 0; j < mat[0].length; j++) {

            const cell = mat[i][j]
            const className = `cell cell-${i}-${j}`
            const minesCount = setMinesNegsCount(i, j, mat)
            cell.minesAroundCount = minesCount
            if (cell.isShown && cell.isMine) {
                strHTML += `<td class="${className}" onclick="cellClicked(this,${i}, ${j})" oncontextmenu=" return false">${MINE}</td>`
            } else if (cell.isShown && !cell.isMine) {
                strHTML += `<td class="${className}" onclick="cellClicked(this,${i}, ${j})" oncontextmenu=" return false">${cell.minesAroundCount}</td>`
            } else if (cell.isMarked) {
                strHTML += `<td class="${className}" onclick="cellClicked(this,${i}, ${j})" oncontextmenu=" return false">${MARK}</td>`
            } else {
                strHTML += `<td class="${className}" onclick="cellClicked(this,${i}, ${j})" oncontextmenu="cellLeftClicked(this,${i}, ${j}); return false"></td>`
            }

        }
        strHTML += '</tr>'
    }

    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}