/**
 * @name: randomChar
 * @author: zzhe
 * @date: 2021/11/8 12:44
 * @description: randomChar
 * @update: 2021/11/8 12:44
 */
/**
 * 获取指定长度的随机字母
 * @param len 随机字母数量，默认是4
 * @param upperCase 大写字母数量 默认是2
 * @returns {string}
 */
const getRandomChar = (len = 4, upperCase = 2) => {
  let result = []
  for (let i = 0; i < upperCase; i++) {
    let ranNum = Math.ceil(Math.random() * 25); //生成一个0到25的数字
    //大写字母'A'的ASCII是65,A~Z的ASCII码就是65 + 0~25;然后调用String.fromCharCode()传入ASCII值返回相应的字符并push进数组里
    result.push(String.fromCharCode(65 + ranNum));
  }
  for (let i = 0; i < len - upperCase; i++) {
    let ranNum = Math.ceil(Math.random() * 25); //生成一个0到25的数字
    //大写字母'a'的ASCII是97,a~z的ASCII码就是97 + 0~25;然后调用String.fromCharCode()传入ASCII值返回相应的字符并push进数组里
    result.push(String.fromCharCode(97 + ranNum));
  }
  return result.join('');
}

const getRandomNum = (len = 2) => {
  let number = '';
  for (let i = 0; i < len; i++) {
    number += Math.floor(Math.random() * 10);
  }
  return number;
}

const getRandom = (len = 6, charLen = 4) => {
  return getRandomNum(len - charLen) + getRandomChar(charLen)
}


module.exports = {getRandomChar, getRandomNum, getRandom}