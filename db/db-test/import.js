const tuban = require('../entities/tuban')

let status = tuban.importTuban('zj_2021_8',[{JCBH:'kkkkkkk',XZQDM:'330102'}])
status.then(res=>{
    console.log(res)
})
