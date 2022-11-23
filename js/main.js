'use strict'

const MINE = '💣'
const MARK = '🚩'
const STARTSMILEY = '😃'
const LOSESMILEY = '🤯'
const WINSMILEY = '😎'

var gGame
var gLevel = {SIZE: 4, MINES: 2}
var gBoard
var gStartTime
var gInterval

function onInit() {
    
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gBoard = buildBoard()
    renderBoard(gBoard, 'tbody')
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

    var minesCount = 0
    while (minesCount < gLevel.MINES) {
        const rowNum = getRandomInt(0, size)
        const collNum = getRandomInt(0, size)
        if (board[rowNum][collNum].isMine) continue
        console.log('[rowNum][collNum]:', [rowNum], [collNum])
        board[rowNum][collNum].isMine = true
        minesCount++
    }
    return board
}

function cellClicked(btn, i, j) {
    const cell = gBoard[i][j]
    const elCell = btn
    if (!gGame.isOn && gGame.shownCount !== 0) return
    startTimer()
    if (cell.isShown) return
    if (cell.isMarked) return
    cell.isShown = true
    if (cell.isMine) {
        elCell.innerText = MINE
        const elBtn = document.querySelector('.smiley-btn')
        elBtn.innerText = LOSESMILEY
        endGame()
    } else {
        if(cell.minesAroundCount === 0){
            checkNeighbors(i, j, gBoard)
            renderBoard(gBoard, 'tbody')
        }
        elCell.innerText = cell.minesAroundCount
        gGame.shownCount++
        if (isVictory()) {
            const elBtn = document.querySelector('.smiley-btn')
            elBtn.innerText = WINSMILEY
            endGame()
        }
    }
}

function cellLeftClicked(btn, i, j) {
    if (!gGame.isOn && gGame.shownCount !== 0) return
    startTimer()
    const cell = gBoard[i][j]
    const elCell = btn
    if (!gGame.isOn) gGame.isOn = true
    if (cell.isShown && !cell.isMarked) return
    cell.isMarked ? cell.isMarked = false : cell.isMarked = true
    if (cell.isMarked) {
        gGame.markedCount++
        elCell.innerText = MARK
        if (isVictory()) {
            const elBtn = document.querySelector('.smiley-btn')
            elBtn.innerText = WINSMILEY
            endGame()
        }
    } else {
        gGame.markedCount--
        elCell.innerText = ''
    }
}

function changeLevel(level) {
    if (!gGame.isOn && gGame.shownCount !== 0) return
    if (level === 'easy') {
        gLevel.SIZE = 4
        gLevel.MINES = 2
    } else if (level === 'medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 14
    } else if (level === 'hard') {
        gLevel.SIZE = 12
        gLevel.MINES = 32
    }
    resetTime()
    gBoard = buildBoard()
    renderBoard(gBoard, 'tbody')


}



function isVictory() {
    return (gGame.shownCount === (gLevel.SIZE ** 2) - gLevel.MINES && gGame.markedCount === gLevel.MINES)
}

function endGame() {
    gGame.isOn = false
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            const cell = gBoard[i][j]
            if (cell.isMine) cell.isShown = true
        }
        renderBoard(gBoard, 'tbody')

    }
    clearInterval(gInterval)

}

function restartBtn() {
    const elBtn = document.querySelector('.smiley-btn')
    elBtn.innerText = STARTSMILEY
    endGame()
    resetTime()
    onInit()
}

