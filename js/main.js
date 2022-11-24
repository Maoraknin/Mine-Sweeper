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
var gOpenBombCount
var gIsHint
var gIsMegaHint
var gStartTime
var gIsManuallyMined
var gMegaHintEndCells
var gMinesCount
var gHighScore = Infinity




function onInit() {
    const elHighScore = document.querySelector('.high-score')
    elHighScore.innerText = localStorage.BestScore
    gIsHint = false
    gIsMegaHint = false
    gIsManuallyMined = false
    gOpenBombCount = 0
    gMinesCount = 0
    gLevel = { SIZE: 4, MINES: 2, LIFE: 1, HINT: 3, SAFE: 3, MEGAHINT:1 }
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
    const isManualMining = manuallyEnterMines(i,j)
    if(isManualMining) return
    if (gGame.isOn && gGame.shownCount === 0) {
        cell.isShown = true
        gGame.shownCount++
        startGame()

    }
    if(gIsMegaHint){
        gMegaHintEndCells.push({i,j})
        if(gMegaHintEndCells.length === 2){
            gIsMegaHint = false
            createMegaHint(gMegaHintEndCells[0], gMegaHintEndCells[1])
            setTimeout(() => {createMegaHint(gMegaHintEndCells[0], gMegaHintEndCells[1])}, 2000)
            gLevel.MEGAHINT--
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
            gLevel.LIFE--
            lifeUpdate()
            gOpenBombCount++
            btn.innerText = MINE
        } else {
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
    if (!gIsManuallyMined) {
        enterMines()
        renderBoard(gBoard, 'tbody')
        startTimer()
    } else {
        switchManualMining()
        renderBoard(gBoard, 'tbody')
        startTimer()
    }
}

function manuallyEnterMines(i,j){
    if (gIsManuallyMined) {
        if (gMinesCount < gLevel.MINES){
            gBoard[i][j].isMine = true
            // console.log('gBoard[i][j]:',gBoard[i][j])
            gMinesCount++
            return true
        }else gIsManuallyMined = false
    }
}

function switchManualMining() {
    if (!gGame.isOn) return
    if (gGame.shownCount !== 0) return
    if (gGame.markedCount !== 0) return
    gIsManuallyMined = true

}

function megaHint(){
    if (!gGame.isOn) return
    if (!gLevel.MEGAHINT) return
    gMegaHintEndCells = []
    gIsMegaHint = true
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
    } else if (level === 'medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 14
        gLevel.LIFE = 2
        gLevel.HINT = 3
        gLevel.SAFE = 3
        gLevel.MEGAHINT = 1
    } else if (level === 'hard') {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        gLevel.LIFE = 3
        gLevel.HINT = 3
        gLevel.SAFE = 3
        gLevel.MEGAHINT = 1
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

