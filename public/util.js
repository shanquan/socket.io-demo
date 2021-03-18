function getUnicode(n){
    n = n.toString(16);
    if(n&&n.length<=4){
        let arr = [];
        while(arr.length<4 - n.length)
        arr.unshift('0')
        n = arr.join('')+n;
    }else{
        return null
    }
    n = "\\u" + n;
    return n;
}
function reveal(str){
    let reg = /[\u0000-\u001F]/;
    let nstr = "";
    for(let i in str){
        if(reg.test(str[i])){
            let n = str.charCodeAt(i);
            n = getUnicode(n);
            nstr += n;
        }else{
            nstr += str[i];
        }
    }
    return nstr;
}
function reveal1(str){
    let reg = /[\u0000-\u001F]/;
    let result;
    do{
        result = str.match(reg);
        if(null!=result && 0!=result.length){
            let nstr = result[0].charCodeAt();
            nstr = getUnicode(nstr);
            str = str.replace(reg,nstr);
        }
    }while(null!=result && 0!=result.length)
    return str;
}
// test
// let str = "abc"+"\u0004"+"\u001d"+"\u001d"+"123";
// console.log(reveal(str));
