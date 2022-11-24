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
            const cell = mat[i][j]
            
            if (cell.minesAroundCount !== 0 && !cell.isShown) {
                cell.isShown = true
                gGame.shownCount++
            }
            if (cell.minesAroundCount === 0 && !cell.isShown){
                cell.isShown = true
                gGame.shownCount++
                
  
                checkNeighbors(i, j, mat)
                
            } 
        }
    }
}

function createMegaHint(startIdx, endIdx) {
    for (var i = startIdx.i; i <= endIdx.i; i++) {
        for (var j = startIdx.j; j <= endIdx.j; j++) {
            var cell = gBoard[i][j]
            if(!cell.isShown && !cell.isMegaHint && !cell.isMarked){
                cell.isShown = true
                cell.isMegaHint = true
                if(cell.isMine) renderCell(i, j, MINE)
                else renderCell(i, j, cell.minesAroundCount)
            }else if(cell.isShown && cell.isMegaHint){
                cell.isShown = false
                cell.isMegaHint = false
                if(cell.isMine) renderCell(i, j, '')
                else renderCell(i, j, '')
            }
        }
    }
}


function hintNeighborsPlace(cellI, cellJ, mat) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= mat.length) continue

        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            // if (i === cellI && j === cellJ) continue
            if (j < 0 || j >= mat[i].length) continue
            const cell = mat[i][j]
            if(!cell.isShown && !cell.isHint && !cell.isMarked){
                cell.isShown = true
                cell.isHint = true
                if(cell.isMine) renderCell(i, j, MINE)
                else renderCell(i, j, cell.minesAroundCount)
            }else if(cell.isShown && cell.isHint){
                cell.isShown = false
                cell.isHint = false
                if(cell.isMine) renderCell(i, j, '')
                else renderCell(i, j, '')
            }
            
            
        }
    }
    return({i,j})
    // setTimeout(() => {
    //     mat[i][j].isShown = false
    // },1000)
}

function getEmptyCells() {
    const emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            if (currCell.isMine || currCell.isShown) continue
            emptyCells.push({ i, j })
        }
    }
return emptyCells

}

function getHiddenMinedCells() {
    const minedCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard[0].length; j++) {
            const currCell = gBoard[i][j]
            if(currCell.isShown) continue
            if(currCell.isMarked) continue
            if (currCell.isMine) minedCells.push({i,j})
        }
    }
return minedCells
}

function drawRandNum(nums) {
    var randIdx = getRandomInt(0, nums.length)
    return nums.splice(randIdx, 1)[0]

}



function startTimer() {
    
    gStartTime = Date.now()
        gInterval = setInterval(() => {
            // console.log('Date.now() - gGame.secsPassed:',Date.now() - gGame.secsPassed)
            const seconds = (Date.now() - gStartTime) / 1000
            gGame.secsPassed = seconds
            var elH2 = document.querySelector('.time')
            elH2.innerText = seconds.toFixed(3)
        }, 1);
    
    
}

function resetTime() {
    gGame.secsPassed = 0
    const elH2 = document.querySelector('.time')
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
            if(gIsDarkMode){
                if (cell.isShown && cell.isMine) {
                    strHTML += `<td class="${className} td-dark-mode" onclick="cellClicked(this,${i}, ${j})" oncontextmenu=" return false">${MINE}</td>`
                } else if (cell.isShown && !cell.isMine) {
                    strHTML += `<td class="${className} td-dark-mode" onclick="cellClicked(this,${i}, ${j})" oncontextmenu=" return false">${cell.minesAroundCount}</td>`
                } else if (cell.isMarked) {
                    strHTML += `<td class="${className} td-dark-mode" onclick="cellClicked(this,${i}, ${j})" oncontextmenu=" return false">${MARK}</td>`
                } else {
                    strHTML += `<td class="${className} td-dark-mode" onclick="cellClicked(this,${i}, ${j})" oncontextmenu="cellLeftClicked(this,${i}, ${j}); return false"></td>`
                }
            }else{
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
            

        }
        strHTML += '</tr>'
    }

    

    
    const elContainer = document.querySelector(selector)
    elContainer.innerHTML = strHTML
}

function renderCell(i, j, value) {
    const elCell = document.querySelector(`.cell-${i}-${j}`)
    elCell.innerText = value
    return elCell

}

function getIdxs() {
    const cellsIdx = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            cellsIdx.push({i,j})
        }
    }
    return cellsIdx
}