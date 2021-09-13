// 服务端分页
module.exports = function (totalData, pagesize = 15, currentPage = 1) {
    pagesize = Number(pagesize)
    let size = totalData.length
    let pages = Math.ceil(size / Number(pagesize))
    if(currentPage > pages) {
        return {size,pageData: []}
    }
    let startIdx = (currentPage-1) * pagesize
    let endIdx = currentPage * pagesize
    let pageData = endIdx > size ?  totalData.slice(startIdx) : totalData.slice(startIdx,endIdx)
    return {
        size,
        pageData
    }
}
