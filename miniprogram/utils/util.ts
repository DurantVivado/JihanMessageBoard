export const formatTime = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return (
    [year, month, day].map(formatNumber).join('/') +
    ' ' +
    [hour, minute, second].map(formatNumber).join(':')
  )
}

const formatNumber = (n: number) => {
  const s = n.toString()
  return s[1] ? s : '0' + s
}

export const generateUniqueId = () => {
  var timestamp = new Date().getTime().toString(); // 当前时间戳
  var randomStr = Math.random().toString(36).substring(2, 8); // 随机字符串
  return timestamp + randomStr;
}


export const formatTimestamp = (timestamp: number)=>{
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return  `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

export const formatTimestampDay = (timestamp: number)=>{
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return  `${year}-${month}-${day}`;
}

export const formatTimeHuman = (timestamp:number) => {
  const minute = 60 * 1000; // 1分钟的毫秒数
  const hour = 60 * minute; // 1小时的毫秒数
  const day = 24 * hour; // 1天的毫秒数
  const month = 30 * day; // 1个月的毫秒数
  const year = 365 * day; // 1年的毫秒数

  const currentTime = new Date().getTime(); // 当前时间的时间戳
  const timeDiff = currentTime - timestamp; // 时间差

  if (timeDiff < minute) {
    return '1分钟前';
  } else if (timeDiff < hour) {
    const minutes = Math.floor(timeDiff / minute);
    return `${minutes}分钟前`;
  } else if (timeDiff < day) {
    const hours = Math.floor(timeDiff / hour);
    return `${hours}小时前`;
  } else if (timeDiff < month) {
    const days = Math.floor(timeDiff / day);
    if (days === 1) {
      return '昨天';
    } else {
      return `${days}天前`;
    }
  } else if (timeDiff < year) {
    const months = Math.floor(timeDiff / month);
    return `${months}个月前`;
  } else {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
  }
}

export const formatTimeStringHuman = (dateString:string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMilliseconds = now - date;

  // 计算不同粒度的时间差
  const minuteDiff = Math.floor(diffInMilliseconds / (1000 * 60));
  const hourDiff = Math.floor(diffInMilliseconds / (1000 * 60 * 60));
  const dayDiff = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24));
  const weekDiff = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 7));
  const monthDiff = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 30));
  const yearDiff = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 365));

  // 根据时间差返回相应的描述
  if (minuteDiff < 1) {
    return "刚刚";
  } else if (hourDiff < 1) {
    return `${minuteDiff}分钟前`;
  } else if (dayDiff < 1) {
    return `${hourDiff}小时前`;
  } else if (weekDiff < 1) {
    return `${dayDiff}天前`;
  } else if (monthDiff < 1) {
    return `${weekDiff}周前`;
  } else if (yearDiff < 1) {
    return `${monthDiff}个月前`;
  } else {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}-${day}`;
  }
}