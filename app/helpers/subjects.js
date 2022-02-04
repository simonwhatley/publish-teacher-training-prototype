exports.getSubjectLevelOptions = (selectedItem) => {
  const items = []
  const subjectLevels = require('../data/subject-levels')

  subjectLevels.forEach((subjectLevel, i) => {
    const item = {}

    item.text = subjectLevel.name
    item.value = subjectLevel.code
    item.id = subjectLevel.id
    item.checked = (selectedItem && selectedItem.includes(subjectLevel.code)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getSubjectLevelLabel = (code) => {
  const subjectLevels = require('../data/subject-levels')
  const label = subjectLevels.find(subjectLevel => subjectLevel.code === code).name
  return label
}

exports.getSubjectOptions = (subjectLevel, selectedItem) => {
  const items = []

  let subjects = require('../data/subjects')
  subjects = subjects.filter(subject => subject.level === subjectLevel
    && subject.code !== '24'
    && subject.parentCode === undefined)

  subjects.forEach((subject, i) => {
    const item = {}

    item.text = subject.name
    // item.text += ' (' + subject.code + ')'
    item.value = subject.code
    item.id = subject.id
    item.checked = (selectedItem && selectedItem.includes(subject.code)) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getSubjectLabel = (code) => {
  const subjects = require('../data/subjects')
  const label = subjects.find(subject => subject.code === code).name
  return label
}

exports.getChildSubjectOptions = (parentSubjectCode, selectedItem) => {
  const items = []

  let subjects = require('../data/subjects')
  subjects = subjects.filter(subject => subject.level === 'secondary'
    && subject.parentCode === parentSubjectCode)

  let lastItem
  subjects.forEach((subject, i) => {
    if (subject.code === '24') {
      lastItem = {}
      lastItem.text = subject.name
      // lastItem.text += ' (' + subject.code + ')'
      lastItem.value = subject.code
      lastItem.id = subject.id
      lastItem.checked = (selectedItem && selectedItem.includes(subject.code)) ? 'checked' : ''
    } else {
      const item = {}

      item.text = subject.name
      // item.text += ' (' + subject.code + ')'
      item.value = subject.code
      item.id = subject.id
      item.checked = (selectedItem && selectedItem.includes(subject.code)) ? 'checked' : ''

      items.push(item)
    }
  })

  items.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  if (lastItem) {
    items.push(lastItem)
  }

  return items
}