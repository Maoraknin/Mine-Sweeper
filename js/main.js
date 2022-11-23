'use strict'

const MINE = '💣'
const MARK = '🚩'
const STARTSMILEY = '😃'
const LOSESMILEY = '🤯'
const WINSMILEY = '😎'
const HEART = '❤️'
const HINT = '❔'
const USEHINT = '❓'


var gGame
var gBoard
var gStartTime
var gInterval
var gLevel
var gOpenBombCount
var gHint

function onInit() {
    gHint = false
    gOpenBombCount = 0
    gLevel = { SIZE: 4, MINES: 2, LIFE: 3, HINT: 3}
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard()
    renderBoard(gBoard, 'tbody')
    lifeUpdate()
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
                isMarked: false
            }
        }
    }

    // enterMines()
    // var minesCount = 0
    // while (minesCount < gLevel.MINES) {
    //     const rowNum = getRandomInt(0, size)
    //     const collNum = getRandomInt(0, size)
    //     if (board[rowNum][collNum].isMine) continue
    //     if (board[rowNum][collNum].isShown) continue
    //     console.log('[rowNum][collNum]:', [rowNum], [collNum])
    //     board[rowNum][collNum].isMine = true
    //     minesCount++
    // }
    return board
}

function enterMines() {
    const size = gLevel.SIZE
    var minesCount = 0
    while (minesCount < gLevel.MINES) {
        const rowNum = getRandomInt(0, size)
        const collNum = getRandomInt(0, size)
        if (gBoard[rowNum][collNum].isMine) continue
        if (gBoard[rowNum][collNum].isShown) continue
        console.log('[rowNum][collNum]:', [rowNum], [collNum])
        gBoard[rowNum][collNum].isMine = true
        minesCount++
        console.log(minesCount);
    }
}

function cellClicked(btn, i, j) {
    const cell = gBoard[i][j]
    const elCell = btn
    if(gHint){
       hintNeighborsPlace(i, j, gBoard)
    //    setTimeout(()=> cell.isShown = false,1000)
       return
    }
    if (!gGame.isOn) return
    if (gGame.isOn && gGame.shownCount === 0) {
        cell.isShown = true
        gGame.shownCount++
        enterMines()
        renderBoard(gBoard, 'tbody')
        startTimer()
    }
    if (cell.isShown) return
    if (cell.isMarked) return
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
        // enterMines()
        startTimer()
    }
    const cell = gBoard[i][j]
    const elCell = btn
    if (cell.isShown && !cell.isMarked) return
    if (gGame.markedCount < gLevel.MINES) {
        cell.isMarked ? cell.isMarked = false : cell.isMarked = true
    } else return
    console.log(gGame.markedCount);
    if (cell.isMarked) {
        gGame.markedCount++
        elCell.innerText = MARK
        if (isVictory()) {
            endGame(WINSMILEY)
        }
    } else {
        gGame.markedCount--
        elCell.innerText = ''
    }
}

function useHint(elHint){
        elHint.innerText = USEHINT
        gHint = true
}

function changeLevel(level) {
    if (!gGame.isOn) return
    if (gGame.isOn && gGame.shownCount > 0) return
    if (level === 'easy') {
        gLevel.SIZE = 4
        gLevel.MINES = 2
        gLevel.LIFE = 3
        gLevel.HINT = 3
    } else if (level === 'medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 14
        gLevel.LIFE = 3
        gLevel.HINT = 3
    } else if (level === 'hard') {
        gLevel.SIZE = 12
        gLevel.MINES = 32
        gLevel.LIFE = 3
        gLevel.HINT = 3
    }
    lifeUpdate()
    // clearInterval(gInterval)
    // console.log('gInterval:',gInterval)
    resetTime()
    gBoard = buildBoard()
    renderBoard(gBoard, 'tbody')


}

function lifeUpdate() {
    const elSpan = document.querySelector('p span')
    elSpan.innerText = HEART.repeat(gLevel.LIFE)
}



function isVictory() {
    return(gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES && gGame.markedCount + gOpenBombCount === gLevel.MINES)

}

function endGame(sign) {
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

