module.exports = {
    status: false,
    msg: '',
    data: {},
    msgType() {
        return {
            'common': {
                '1': '无访问权限',
                '2': '请求参数错误',
            },
            'report': {},
            'dispatch': {},
            'login': {}
        }
    },
    clear() {
        this.status = false
        this.msg = ''
        this.data = {}
    },
    /**
     * 消息格式化
     * @param data
     * @param res
     * @param msg
     * @param fns data的处理函数数组，并且第一个参数是要输入处理的data,返回处理后的data
     */
    responseSuccess(data, res, msg = 'success', fns) {
        let responseData
        if (fns && fns.length != 0) {
            let tempData
            fns.forEach(fn => {
                if (fn && typeof fn == 'function') {
                    tempData = tempData ? fn(tempData) : fn(data)
                }
            })
            responseData = tempData
        } else {
            responseData = data
        }

        this.status = true
        this.msg = msg
        this.data = responseData
        res.send(this)
        this.clear()
    },

    /**
     *  失败消息格式化
     * @param res
     * @param msg
     */
    responseFailed(res, msg = 'failed') {
        this.status = false
        this.msg = msg
        this.data = {}
        res.send(this)
        this.clear()
    }
}
