// A stored YYYY-MM-DD HH:mm as it is read on screen: 01/11 21:10.
export const formatAccess = (when: string) => {
  const [day, time] = when.split(' ')
  return `${day.split('-').slice(1).reverse().join('/')} ${time}`
}

// A YYYY-MM-DD day as it is written on screen: 08/11/2026.
export const formatDay = (day: string) => day.split('-').reverse().join('/')
