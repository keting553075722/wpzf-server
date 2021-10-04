const getRandom = () => {
    let num = Math.floor(Math.random()*10000) // 0-9999
    if(num.length !== 4) {
        let diffLen = 4 - num.length
        num = num.toString() + '0'.repeat(diffLen)
    }
    return num.toString()
}

module.exports = {
    ramdom4 : getRandom()
}
