function generateCourseCode() {
  var letters = 'ABCDEFGHJKMNPQRSTUVWXYZ'.split('');
  var letter = letters[ Math.floor(Math.random() * letters.length) ];
  var code = letter + Math.floor(Math.random()*(999 - 100 + 1) + 100);
  return code;
}

function getGeneratedTitle(code, data) {
  var generatedTitle = data[code + '-new-subject'];

  if (isModernLanguages(code, data)) {
    if (data[code + '-new-second-language']) {
      if (data[code + '-new-further-languages']) {
        generatedTitle = `${generatedTitle} (${data[code + '-new-first-language']}, ${data[code + '-new-second-language']}, ${data[code + '-new-further-languages'].join(', ')})`;
      } else {
        generatedTitle = `${generatedTitle} (${data[code + '-new-first-language']} and ${data[code + '-new-second-language']})`;
      }
    } else {
      generatedTitle = `${generatedTitle} (${data[code + '-new-first-language']})`;
    }
  }

  if (data[code + '-new-sen']) {
    generatedTitle = generatedTitle + ' (with Special educational needs and disabilities)';
  }

  data[code + '-new-generated-title'] = generatedTitle;
  return generatedTitle;
}

function newCourseWizardPaths(currentPath, code, data) {
  var paths = [
    '/',
    `/new/${code}/phase`,
    `/new/${code}/subject`,
    `/new/${code}/languages`,
    `/new/${code}/outcome`,
    ...(data['new-course']['include-fee-or-salary'] ? [`/new/${code}/funding`] : []),
    `/new/${code}/full-time-part-time`,
    ...(data['new-course']['include-locations'] ? [`/new/${code}/training-locations`] : []),
    ...(data['new-course']['include-accredited'] ? [`/new/${code}/accredited-provider`] : []),
    `/new/${code}/eligibility`,
    `/new/${code}/title`,
    `/new/${code}/confirm`,
    `/new/${code}/create`
  ];
  var index = paths.indexOf(currentPath);
  var next = paths[index + 1];
  var back = paths[index - 1];

  if (back == `/new/${code}/languages` && !isModernLanguages(code, data)) {
    back = paths[index - 2];
  }

  return {
    next: next,
    back: back
  }
}

function getCourseOffered(code, data) {
  var courseOffered = data[code + '-new-outcome'];

  if (data[code + '-new-full-part'] == 'Full time or part time') {
    courseOffered = courseOffered + ', full time or part time';
  } else if (data[code + '-new-full-part'])  {
    courseOffered = courseOffered + ' ' + data[code + '-new-full-part'].toLowerCase();
  }

  if (data[code + '-new-type'] == 'Salaried') {
    courseOffered = courseOffered + ' with salary';
  }

  if (data[code + '-new-type'] == 'Teaching apprenticeship') {
    courseOffered = courseOffered + ' teaching apprenticeship';
  }

  data[code + '-new-generated-description'] = courseOffered;
  return courseOffered;
}

function isModernLanguages(code, data) {
  return data[code + '-new-subject'] == 'Modern languages'
}

function subject(req) {
  var accrediting = accreditor(req);
  var subject = accrediting['subjects'].find(function(s) {
    return s.slug == req.params.subject;
  })

  return {
    name: subject.name,
    slug: subject.slug
  };
}

function course(req) {
  var course = req.session.data['ucasCourses'].find(function(a) {
    return a.programmeCode == req.params.code;
  });

  course.salaried = (course.route == 'School Direct training programme (salaried)')
  return course;
}

function validate(data, course, view) {
  var prefix = course.programmeCode;
  var view = view || 'all';
  var errors = [];

  if (view == 'all' || view == 'about-this-course') {
    if (!data[prefix + '-about-this-course']) {
      errors.push({
        title: 'Give details about this course',
        id: `${prefix}-about-this-course`,
        link: `/about-this-course#${prefix}-about-this-course`,
        page: 'about-this-course'
      })
    }

    if (!data[prefix + '-placement-school-policy']) {
      errors.push({
        title: 'Give details about how school placements work',
        id: `${prefix}-placement-school-policy`,
        link: `/about-this-course#${prefix}-placement-school-policy`,
        page: 'about-this-course'
      })
    }
  }

  if (view == 'all' || view == 'requirements') {
    if (!data[prefix + '-qualifications-required']) {
      errors.push({
        title: 'Give details about the qualifications needed',
        id: `${prefix}-qualifications-required`,
        link: `/requirements#${prefix}-qualifications-required`,
        page: 'requirements'
      })
    }
  }

  if (view == 'all' || view == 'fees-and-length') {
    if (!data[prefix + '-duration']) {
      errors.push({
        title: 'Enter a course length',
        id: `${prefix}-duration`,
        link: `/fees-and-length#${prefix}-duration`,
        page: 'fees-and-length'
      })
    }

    if (!course.salaried && !data[prefix + '-fee']) {
      errors.push({
        title: 'Enter course fees for UK and EU students',
        id: `${prefix}-fee`,
        link: `/fees-and-length#${prefix}-fee`,
        page: 'fees-and-length'
      })
    }

    if (course.salaried && !data[prefix + '-salary-details']) {
      errors.push({
        title: 'Give details about the salary for this course',
        id: `${prefix}-salary-details`,
        link: `/fees-and-length#${prefix}-salary-details`,
        page: 'fees-and-length'
      })
    }
  }

  return errors;
}

function validateOrg(data, view) {
  var errors = [];
  var view = view || 'all';

  if (view == 'all' || view == 'about-your-organisation') {
    if (!data['about-organisation']) {
      errors.push({
        title: 'Give details about your organisation',
        id: `about-organisation`,
        link: `/about-your-organisation/edit#about-organisation`,
        page: 'about-your-organisation'
      })
    }

    if (!data['training-with-a-disability']) {
      errors.push({
        title: 'Give details about training with a disability',
        id: `training-with-a-disability`,
        link: `/about-your-organisation/edit#training-with-a-disability`,
        page: 'about-your-organisation'
      })
    }
  }

  if (view == 'all' || view == 'contact-details') {
    if (!data['email-address']) {
      errors.push({
        title: 'Email address is missing',
        id: `email-address`,
        link: `/about-your-organisation/contact#email-address`,
        page: 'contact'
      })
    }

    if (!data['telephone-number']) {
      errors.push({
        title: 'Telephone number is missing',
        id: `telephone-number`,
        link: `/about-your-organisation/contact#telephone-number`,
        page: 'contact'
      })
    }

    if (!data['website']) {
      errors.push({
        title: 'Website is missing',
        id: `website`,
        link: `/about-your-organisation/contact#website`,
        page: 'contact'
      })
    }

    if (!data['building-and-street']) {
      errors.push({
        title: 'Give a building and street name in your contact address',
        id: `building-and-street`,
        link: `/about-your-organisation/contact#building-and-street`,
        page: 'contact'
      })
    }

    if (!data['organisation-town-or-city']) {
      errors.push({
        title: 'Give a town or city in your contact address',
        id: `organisation-town-or-city`,
        link: `/about-your-organisation/contact#organisation-town-or-city`,
        page: 'contact'
      })
    }

    if (!data['postcode']) {
      errors.push({
        title: 'Give a postcode in your contact address',
        id: `postcode`,
        link: `/about-your-organisation/contact#postcode`,
        page: 'contact'
      })
    }

    if (!data['county']) {
      errors.push({
        title: 'Give a county in your contact address',
        id: `county`,
        link: `/about-your-organisation/contact#county`,
        page: 'contact'
      })
    }
  }

  return errors;
}

module.exports = {
  generateCourseCode,
  getGeneratedTitle,
  getCourseOffered,
  isModernLanguages,
  newCourseWizardPaths,
  subject,
  course,
  validate,
  validateOrg
}