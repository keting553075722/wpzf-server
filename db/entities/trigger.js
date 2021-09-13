/**
 * @Description:
 * @author zzh
 * @createTime 2021/4/20
 */

const db = require('../operators')
const DB = require('../db')

module.exports = {
    get(triggerName, callback) {
        db.select(triggerName, {}, function (tag, result) {
                if (tag) {
                    let XDM = []
                    let CDM = []
                    result.forEach(row => {
                        XDM.push(row['XDM'])
                        CDM.push(row['CDM'])
                    })
                    callback(tag, {XDM: [...new Set(XDM)], CDM: [...new Set(CDM)]})
                    return
                }else {
                    callback(false)
                    return;
                }

            }
        )
    },
    clear(triggerName, callback) {
        let sql = `TRUNCATE table ${triggerName}`

        DB.query(sql, function (err, row, fields) {
            if (!err) {
                console.log('status clear success')
                callback(true, row)
                return
            } else {
                console.log('status clear success', err)
                return;
            }
        })
    },
    replace(triggerName, callback) {
        let triggerReplace = `

DELIMITER $$
USE wpzf $$
DROP TRIGGER /*!50032 IF EXISTS */ zj_2019_1_update
$$
CREATE
    /*!50017 DEFINER = 'root'@'localhost' */
    TRIGGER zj_2019_1_update AFTER UPDATE ON zj_2019_1
    FOR EACH ROW BEGIN
      REPLACE INTO zj_2019_1_update VALUES (new.JCBH,new.CDM,new.XDM);
    END;
$$
DELIMITER ;
`
        DB.query(triggerReplace, function (tag, row, fields) {
            if (tag) {
                // console.log(row, fields)
            }
        })
    }
}
