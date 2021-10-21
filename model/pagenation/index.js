// 服务端分页
module.exports = function (size, pagesize = 15, currentPage = 1) {
    pagesize = Number(pagesize)
    let pages = Math.ceil(size / Number(pagesize))
    if(currentPage > pages) {
        return 'overflow'
    }
    let startIdx = (currentPage-1) * pagesize
    return startIdx
}
