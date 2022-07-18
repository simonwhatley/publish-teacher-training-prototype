const courseModel = require('../models/courses')
const organisationModel = require('../models/organisations')
const vacancyModel = require('../models/vacancies')

const vacancyHelper = require('../helpers/vacancies')

exports.vacancy_details = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const course = courseModel.findOne({ organisationId: req.params.organisationId, courseId: req.params.courseId })

  const selectedLocation = []
  if (course && course.locations) {
    course.locations.forEach((location, i) => {
      if (['F','P','B'].includes(location.vacancies)) {
        selectedLocation.push(location.id)
      }
    })

    if (selectedLocation.length) {
      course.hasVacancies = 'yes'
    } else {
      course.hasVacancies = 'no'
    }
  } else {
    course.hasVacancies = 'no'
  }

  const locationOptions = vacancyHelper.getLocationOptions(req.params.organisationId, req.params.courseId, selectedLocation)

  let back = `/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses/${req.params.courseId}`
  if (req.query.referrer === 'description') {
    back += '/description'
  } else if (req.query.referrer === 'list') {
    back = `/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses`
  }

  res.render('../views/vacancies/show', {
    organisation,
    course,
    locationOptions,
    actions: {
      back,
      change: `/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses/${req.params.courseId}/vacancies/edit`
    }
  })
}

exports.edit_vacancies_get = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const course = courseModel.findOne({ organisationId: req.params.organisationId, courseId: req.params.courseId })

  const selectedLocation = []
  if (course && course.locations) {
    course.locations.forEach((location, i) => {
      if (['F','P','B'].includes(location.vacancies)) {
        selectedLocation.push(location.id)
      }
    })

    if (selectedLocation.length) {
      course.hasVacancies = 'yes'
    } else {
      course.hasVacancies = 'no'
    }
  } else {
    course.hasVacancies = 'no'
  }

  const locationOptions = vacancyHelper.getLocationOptions(req.params.organisationId, req.params.courseId, selectedLocation)

  let back = `/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses/${req.params.courseId}`
  if (req.query.referrer === 'description') {
    back += '/description'
  } else if (req.query.referrer === 'list') {
    back = `/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses`
  }

  res.render('../views/vacancies/edit', {
    organisation,
    course,
    locationOptions,
    actions: {
      save: `/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses/${req.params.courseId}/vacancies/edit`,
      back,
      cancel: `/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses/${req.params.courseId}/vacancies`
    }
  })
}

exports.edit_vacancies_post = (req, res) => {
  const organisation = organisationModel.findOne({ organisationId: req.params.organisationId })
  const course = courseModel.findOne({ organisationId: req.params.organisationId, courseId: req.params.courseId })

  course.hasVacancies = req.session.data.course.hasVacancies

  let selectedLocation
  if (req.session.data.course && req.session.data.course.locations) {
    selectedLocation = req.session.data.course.locations
  }

  const locationOptions = vacancyHelper.getLocationOptions(req.params.organisationId, req.params.courseId, selectedLocation)

  const errors = []

  if (course.hasVacancies === 'yes' && req.session.data.locations.vacancies === undefined) {
    const error = {}
    error.fieldName = "locations-vacancies"
    error.href = "#locations-vacancies"
    error.text = "Select which locations have vacancies"
    errors.push(error)
  }

  if (errors.length) {
    res.render('../views/vacancies/edit', {
      organisation,
      course,
      locationOptions,
      errors,
      actions: {
        save: `/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses/${req.params.courseId}/vacancies/edit`,
        back: `/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses/${req.params.courseId}/vacancies`,
        cancel: `/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses/${req.params.courseId}/vacancies`
      }
    })
  } else {

    if (course.hasVacancies === 'yes') {
      vacancyModel.updateOne({
        organisationId: req.params.organisationId,
        courseId: req.params.courseId,
        locations: req.session.data.locations
      })
    } else {
      vacancyModel.updateOne({
        organisationId: req.params.organisationId,
        courseId: req.params.courseId,
        locations: {}
      })
    }

    req.flash('success', 'Vacancies updated')
    res.redirect(`/organisations/${req.params.organisationId}/cycles/${req.params.cycleId}/courses/${req.params.courseId}/vacancies`);
  }
}
