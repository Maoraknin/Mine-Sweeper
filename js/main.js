'use strict'

const MINE = '💣'
const MARK = '🚩'
const STARTSMILEY = '😃'
const LOSESMILEY = '🤯'
const WINSMILEY = '😎'
const HEART = '❤️'
const HINT = '❔'
const USEHINT = '❓'
const SAFE = '✅'
const USESAFE = '☑️'
const SAFECELL = '✔️'


var gGame
var gBoard
var gInterval
var gLevel
var gIsDarkMode = false
var gOpenBombCount
var gIsHint
var gIsMegaHint
var gStartTime
var gIsManuallyMined
var gMegaHintEndCells
var gMinesCount
var gIsSevenBoom
var gHighScore = Infinity




function onInit() {
    const elHighScore = document.querySelector('.high-score')
    elHighScore.innerText = localStorage.BestScore
    gIsHint = false
    gIsMegaHint = false
    gIsSevenBoom = false
    gIsManuallyMined = false
    gOpenBombCount = 0
    gMinesCount = 0
    gLevel = { SIZE: 4, MINES: 2, LIFE: 1, HINT: 3, SAFE: 3, MEGAHINT: 1, EXTERMINATOR: 1 }
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard()
    renderBoard(gBoard, 'tbody')
    lifeUpdate()
    hintUpdate()
    safeUpdate()
    megaHintsUpdate()
    sevenBoomUpdate()
    placeMinesUpdate()
    exterminatorUpdate()
    
}


function buildBoard() {
    const board = []
    const size = gLevel.SIZE
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                isHint: false,
                isMegaHint: false
            }
        }
    }

    return board
}

function enterMines() {
    const size = gLevel.SIZE
    while (gMinesCount < gLevel.MINES) {
        const rowNum = getRandomInt(0, size)
        const collNum = getRandomInt(0, size)
        if (gBoard[rowNum][collNum].isMine) continue
        if (gBoard[rowNum][collNum].isShown) continue
        console.log('[rowNum][collNum]:', [rowNum], [collNum])
        gBoard[rowNum][collNum].isMine = true
        gMinesCount++
        console.log(gMinesCount);
    }
}


function cellClicked(btn, i, j) {
    if (!gGame.isOn) return
    const cell = gBoard[i][j]
    const elCell = btn
    const isManualMining = manuallyEnterMines(i, j)
    if (isManualMining) return
    if (gGame.isOn && gGame.shownCount === 0) {
        cell.isShown = true
        gGame.shownCount++
        startGame()
    } else
        if (gIsMegaHint && gGame.shownCount !== 0) {
            gMegaHintEndCells.push({ i, j })
            if (gMegaHintEndCells.length === 2) {
                gIsMegaHint = false
                createMegaHint(gMegaHintEndCells[0], gMegaHintEndCells[1])
                setTimeout(() => { createMegaHint(gMegaHintEndCells[0], gMegaHintEndCells[1]) }, 2000)
                gLevel.MEGAHINT--
                const elBtn = document.querySelector('.mega-hint')
                // console.log('elBtn:',elBtn)
                elBtn.innerText = 'Used Element'
                elBtn.classList.add('used-element')
            }
            return
        }
    if (cell.isShown) return
    if (cell.isMarked) return
    if (gIsHint) {
        hintNeighborsPlace(i, j, gBoard)
        setTimeout(() => {
            hintNeighborsPlace(i, j, gBoard)
        }, 1000)
        gIsHint = false
        return
    }
    cell.isShown = true
    if (cell.isMine) {
        if (gLevel.LIFE > 0) {
            mineSound()
            gLevel.LIFE--
            lifeUpdate()
            gOpenBombCount++
            btn.innerText = MINE
        } else {
            lastMineSound()
            elCell.innerText = MINE
            endGame(LOSESMILEY)
        }

    } else {
        if (cell.minesAroundCount === 0) {
            checkNeighbors(i, j, gBoard)
            renderBoard(gBoard, 'tbody')
        }
        elCell.innerText = cell.minesAroundCount
        gGame.shownCount++
        if (isVictory()) {
            victorySound()
            endGame(WINSMILEY)
        }
    }
}

function cellLeftClicked(btn, i, j) {
    if (!gGame.isOn) return
    if (gGame.isOn && gGame.shownCount === 0) {
        startTimer()
    }
    const cell = gBoard[i][j]
    const elCell = btn
    if (cell.isShown && !cell.isMarked) return
    if (!cell.isMarked) {
        if (gGame.markedCount >= gLevel.MINES) return
        cell.isMarked = true
        gGame.markedCount++
        elCell.innerText = MARK
        if (isVictory()) {
            endGame(WINSMILEY)
        }
    } else {
        cell.isMarked = false
        gGame.markedCount--
        elCell.innerText = ''
    }
}

function startGame() {
    if (gIsManuallyMined) {
        switchManualMining()
        renderBoard(gBoard, 'tbody')
        startTimer()
    } else if (gIsSevenBoom) {
        sevenBoom()
        renderBoard(gBoard, 'tbody')
        startTimer()
    } else {
        enterMines()
        renderBoard(gBoard, 'tbody')
        startTimer()
    }
}

function sevenBoom(btn) {
    if (!gGame.isOn) return
    if (gGame.shownCount !== 0) return
    if (gGame.markedCount !== 0) return
    btn.innerText = 'Used Element'
    btn.classList.add('used-element')
    gIsSevenBoom = true
    console.log('here');
    const idxs = getIdxs()
    placeMineSevenBoom(idxs)
}

function placeMineSevenBoom(nums) {
    for (var i = 1; i <= nums.length; i++) {
        if (i % 7 === 0 || i % 10 === 7) {
            const cell = nums[i]
            gBoard[cell.i][cell.j].isMine = true
        }
    }

}

function manuallyEnterMines(i, j) {
    if (gIsManuallyMined) {
        if (gMinesCount < gLevel.MINES) {
            gBoard[i][j].isMine = true
            // console.log('gBoard[i][j]:',gBoard[i][j])
            gMinesCount++
            if (gMinesCount === gLevel.MINES) {
                const elBtn = document.querySelector('.manually-create')
                elBtn.innerText = 'Used Element'
                elBtn.classList.add('used-element')
            }
            return true
        } else {
            gIsManuallyMined = false
        }
    }
}

function switchManualMining(btn) {
    btn.innerText = 'Enter Mines'
    if (!gGame.isOn) return
    if (gGame.shownCount !== 0) return
    if (gGame.markedCount !== 0) return
    gIsManuallyMined = true

}



function exterminateMines(mines) {
    if (gLevel.MINES < 3) {
        const currMine = drawRandNum(mines)
        const iIdx = currMine.i
        const jIdx = currMine.j
        console.log('currMine:', currMine)
        gBoard[iIdx][jIdx].isShown = true
        renderCell(iIdx, jIdx, MINE)
        setTimeout(() => {
            gBoard[iIdx][jIdx].isShown = false
            gBoard[iIdx][jIdx].isMine = false
            renderCell(iIdx, jIdx, '')
            console.log('here');
        }, 2000)
    } else {
        for (var i = 0; i < 3; i++) {
            const currMine = drawRandNum(mines)
            const iIdx = currMine.i
            const jIdx = currMine.j
            console.log('currMine:', currMine)
            gBoard[iIdx][jIdx].isShown = true
            renderCell(iIdx, jIdx, MINE)
            setTimeout(() => {
                gBoard[iIdx][jIdx].isShown = false
                gBoard[iIdx][jIdx].isMine = false
                renderCell(iIdx, jIdx, '')
                console.log('here');
            }, 2000)
        }
    }
}

function exterminator(btn) {
    if (!gGame.isOn) return
    if (!gLevel.EXTERMINATOR) return
    if (gGame.shownCount === 0) return
    btn.innerText = 'Used Element'
    btn.classList.add('used-element')
    gLevel.EXTERMINATOR--
    const mines = getHiddenMinedCells()
    exterminateMines(mines)
    renderBoard(gBoard, 'tbody')

}

function megaHint(btn) {
    if (!gGame.isOn) return
    if (!gLevel.MEGAHINT) return
    if (gGame.shownCount === 0) return
    gMegaHintEndCells = []
    gIsMegaHint = true
    btn.innerText = 'Pick Cells'
}

function changeLevel(level) {
    if (!gGame.isOn) return
    if (gGame.isOn && gGame.shownCount > 0) return
    if (level === 'easy') {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        gLevel.LIFE = 1
        gLevel.HINT = 3
        gLevel.SAFE = 3
        gLevel.MEGAHINT = 1
        gLevel.EXTERMINATOR = 1
    } else if (level === 'medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 14
        gLevel.LIFE = 2
        gLevel.HINT = 3
        gLevel.SAFE = 3
        gLevel.MEGAHINT = 1
        gLevel.EXTERMINATOR = 1
    } else if (level === 'hard') {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        gLevel.LIFE = 3
        gLevel.HINT = 3
        gLevel.SAFE = 3
        gLevel.MEGAHINT = 1
        gLevel.EXTERMINATOR = 1
    }
    lifeUpdate()
    
    resetTime()
    gBoard = buildBoard()
    renderBoard(gBoard, 'tbody')


}

function useHint(elHint) {
    if (!gGame.isOn) return
    if (gGame.isOn && gGame.shownCount === 0) return
    elHint.innerText = USEHINT
    gIsHint = true
    setTimeout(() => { elHint.innerText = '' }, 1000)
}

function hintUpdate() {
    const elHints = document.querySelector('.hints')
    elHints.innerHTML = '<span class="hint1" onclick="useHint(this)">❔</span><span class="hint2" onclick="useHint(this)">❔</span><span class="hint3" onclick="useHint(this)">❔</span>'
}

function useSafe(elSafe) {
    if (!gGame.isOn) return
    if (gGame.isOn && gGame.shownCount === 0) return
    elSafe.innerText = USESAFE
    getRandomClearCell()
    setTimeout(() => { elSafe.innerText = '' }, 1000)

}

function safeUpdate() {
    const elSafes = document.querySelector('.safes')
    elSafes.innerHTML = '<p class="safe"><span class="safe1" onclick="useSafe(this)">✅</span><span class="safe2" onclick="useSafe(this)">✅</span><span class="safe3" onclick="useSafe(this)">✅</span></p>'
}

function getRandomClearCell() {
    const emptyCells = getEmptyCells()
    const idx = drawRandNum(emptyCells)
    const cell = gBoard[idx.i][idx.j]
    renderCell(idx.i, idx.j, SAFECELL)
    setTimeout(() => { renderCell(idx.i, idx.j, '') }, 1000)

}

function lifeUpdate() {
    const elSpan = document.querySelector('p span')
    elSpan.innerText = HEART.repeat(gLevel.LIFE)
    if (gLevel.LIFE === 0) {
        elSpan.innerText = '💔'
    }
}

// function unDo() {

// }


function isVictory() {
    return (gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES && gGame.markedCount + gOpenBombCount === gLevel.MINES)

}

function highScoreUpdate() {
    if (gGame.secsPassed < localStorage.BestScore && gGame.secsPassed !== 0) {
        console.log('here');
        gHighScore = gGame.secsPassed
        const elHighScore = document.querySelector('.high-score')
        localStorage.setItem('BestScore', gHighScore)
        elHighScore.innerText = localStorage.BestScore
    }
}

function endGame(sign) {
    highScoreUpdate()
    const elBtn = document.querySelector('.smiley-btn')
    elBtn.innerText = sign
    gGame.isOn = false
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine) cell.isShown = true
        }

    }
    renderBoard(gBoard, 'tbody')
    clearInterval(gInterval)

}

function restartBtn() {
    endGame(STARTSMILEY)
    resetTime()
    onInit()
}

function darkMode(btn){
    console.log('here');
    gIsDarkMode ? gIsDarkMode = false : gIsDarkMode = true
    if(gIsDarkMode){
        console.log('here');
        btn.classList.add('light-mode-btn')
        const elBody = document.querySelector('body')
        elBody.classList.add('body-dark-mode')
        const elTd = document.querySelectorAll('td')
        console.log('elTd:',elTd)
        for(var i = 0; i < elTd.length; i++){
            elTd[i].classList.add('td-dark-mode')
        }
        const elBtn = document.querySelectorAll('button')
        for(var i = 0; i < elBtn.length; i++){
            elBtn[i].classList.add('btn-dark-mode')
        }
        const elSevenBoom = document.querySelector('.seven-boom')
        elSevenBoom.classList.add('seven-boom-dark-mode')
        const elExterminator = document.querySelector('.exterminator')
        elExterminator.classList.add('exterminator-dark-mode')
        const elUndo = document.querySelector('.undo')
        elUndo.classList.add('undo-dark-mode')
        const elMegaHint = document.querySelector('.mega-hint')
        elMegaHint.classList.add('mega-hint-dark-mode')
        const elManualCreate = document.querySelector('.manually-create')
        elManualCreate.classList.add('manually-create-dark-mode')
        
    }else{
        console.log('here');
        btn.classList.remove('light-mode-btn')
        const elBody = document.querySelector('body')
        elBody.classList.remove('body-dark-mode')
        const elTd = document.querySelectorAll('td')
        console.log('elTd:',elTd)
        for(var i = 0; i < elTd.length; i++){
            elTd[i].classList.remove('td-dark-mode')
        }
        const elBtn = document.querySelectorAll('button')
        for(var i = 0; i < elBtn.length; i++){
            elBtn[i].classList.remove('btn-dark-mode')
        }
        const elSevenBoom = document.querySelector('.seven-boom')
        elSevenBoom.classList.remove('seven-boom-dark-mode')
        const elExterminator = document.querySelector('.exterminator')
        elExterminator.classList.remove('exterminator-dark-mode')
        const elUndo = document.querySelector('.undo')
        elUndo.classList.remove('undo-dark-mode')
        const elMegaHint = document.querySelector('.mega-hint')
        elMegaHint.classList.remove('mega-hint-dark-mode')
        const elManualCreate = document.querySelector('.manually-create')
        elManualCreate.classList.remove('manually-create-dark-mode')
        
    }
   

}

function mineSound(){
    var audio = new Audio('sound/mine.wav');
    audio.play();
}

function lastMineSound(){
    var audio = new Audio('sound/lastMine.wav');
    audio.play();
}

function victorySound(){
    var audio = new Audio('sound/victory.mp3');
    audio.play();
}

function megaHintsUpdate(){
    const elBtn =  document.querySelector('.mega-hint')
    elBtn.classList.remove('used-element')
    elBtn.innerText = 'Mega Hint!'
 }
 
 function sevenBoomUpdate(){
     const elBtn =  document.querySelector('.seven-boom')
     elBtn.classList.remove('used-element')
     elBtn.innerText = '7 BOOM!'
  }
 
  function placeMinesUpdate(){
     const elBtn =  document.querySelector('.manually-create')
     elBtn.classList.remove('used-element')
     elBtn.innerText = 'Place Mines'
  }
 
  function exterminatorUpdate(){
     const elBtn =  document.querySelector('.exterminator')
     elBtn.classList.remove('used-element')
     elBtn.innerText = 'Exterminator'
  }



// function left
// undo