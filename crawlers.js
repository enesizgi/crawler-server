import fetch from 'node-fetch';
import fs from 'fs';
import { JSDOM } from "jsdom";
import mapSeries from 'async/mapSeries';
import {
  URL, getCourseInfoProperties, getCourseProperties,
  getSectionInfoProperties, getBackToCourseSectionProperties,
  excludeList
} from './constants.js';

const sendRequest = async (url, properties = {}) => {
  try {
    const response = await fetch(url, properties);
    return response;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const getDepartments = async () => {
  const response = await sendRequest(URL);
  if (!response) {
    console.log('departments cannot be fetched');
    return;
  }
  const departments = await response.text();
  if (!departments) return;

  const dom = new JSDOM(departments, { url: URL });
  const { document } = dom.window;
  const options = Array.from(document.querySelectorAll('option'));
  const filteredOptions = options.filter(option => {
    const isBanned = ['Spring', 'Fall', 'Summer School'].reduce((acc, curr) => acc || option.text.includes(curr), false);
    return !isBanned;
  });
  console.log(filteredOptions.length);
  const simplifiedOptions = filteredOptions.map(option => {
    const { value, text } = option;
    return { value, text };
  });
  const optionsJSON = {
    result: simplifiedOptions
  }
  fs.writeFile('departments.json', JSON.stringify(optionsJSON), 'utf8', (err) => {
    if (err) {
      console.log(err);
    }
  });
}

const getCoursesForDepartment = async (department, rawCourses, cookie) => {
  const dom = new JSDOM(rawCourses, { url: URL });
  const { document } = dom.window;
  const coursesTable = Array.from(document.querySelector('table[cellspacing] > tbody')?.children || []);
  if (coursesTable.length === 0) return;

  const coursesTableOnlyCourses = coursesTable.slice(1);
  const courses = coursesTableOnlyCourses.map(course => {
    return {
      courseCode: course.children[1].children[0].textContent.trim(),
      courseName: course.children[2].children[0].textContent.trim(),
      courseECTSCredit: course.children[3].children[0].textContent.trim(),
      courseCredit: course.children[4].children[0].textContent.trim(),
      courseLevel: course.children[5].children[0].textContent.trim(),
      courseType: course.children[6].children[0].textContent.trim()
    }
  });

  const filteredCourses = courses.filter(course => {
    const isCourseInExcludeList = excludeList.reduce((acc, exclude) => {
      return course.courseName.toLowerCase().includes(exclude.toLowerCase()) ? true : acc;
    }, false);
    return !isCourseInExcludeList;
  });

  let erroredCourses = [];
  const coursesWithSections = await Promise.all(filteredCourses.map(async (course) => {
    const properties = getCourseInfoProperties(course.courseCode, cookie);
    const response = await sendRequest(URL, properties);
    if (!response) {
      console.log('course sections cannot be fetched');
      erroredCourses.push(course);
      return;
    }
    const courseInfo = await response.text();

    const dom = new JSDOM(courseInfo, { url: URL });
    const { document } = dom.window;
    const courseInfoTable = Array.from(document.querySelectorAll('#single_content > form > table:nth-child(6) > tbody')[0].children);
    const courseInfoTableSliced = courseInfoTable.slice(2);

    let courseSections = [];
    for (let index = 0; index < courseInfoTableSliced.length; index += 2) {
      const element = courseInfoTableSliced[index];
      const nextElement = courseInfoTableSliced[index + 1];
      const sectionHours = Array.from(nextElement.children[0].children[0].children[0].children).map(dates => {
        const result = Array.from(dates.children).reduce((acc, curr) => {
          return `${acc} ${curr.textContent}`;
        }, '').trim();
        return result;
      });
      const sectionHoursFiltered = sectionHours.filter(hour => hour);
      const section = {
        sectionNumber: element.children[0].children[0].children[0].value.trim(),
        instructor: element.children[1].textContent.trim(),
        sectionHours: sectionHoursFiltered
      }
      courseSections.push(section);
    }

    const courseSectionsWithCriteria = await Promise.all(courseSections.map(async (section) => {
      
      const properties = getSectionInfoProperties(section.sectionNumber, cookie);
      const response = await sendRequest(URL, properties);
      if (!response) {
        console.log('section criteria cannot be fetched');
        erroredCourses.push(course);
        return;
      }
      const sectionInfo = await response.text();

      const dom = new JSDOM(sectionInfo, { url: URL });
      const { document } = dom.window;
      const criteriaTable = Array.from(document.querySelector('#single_content > form > table:nth-child(6) > tbody')?.children || []).slice(1);
      const sectionCriterias = criteriaTable.map(criteria => {
        return {
          givenDept: criteria.children[0]?.textContent.trim(),
          startChar: criteria.children[1]?.textContent.trim(),
          endChar: criteria.children[2]?.textContent.trim(),
          minCumGPA: criteria.children[3]?.textContent.trim(),
          maxCumGPA: criteria.children[4]?.textContent.trim(),
          minYear: criteria.children[5]?.textContent.trim(),
          maxYear: criteria.children[6]?.textContent.trim(),
          startGrade: criteria.children[7]?.textContent.trim(),
          endGrade: criteria.children[8]?.textContent.trim()
        }
      });
      // const getBackProps = getBackToCourseSectionProperties(cookie);
      // const getBackResponse = await sendRequest(URL, getBackProps);
      // // if (!getBackResponse) {
      // //   console.log('section criteria cannot be fetched get back failed');
      // //   erroredCourses.push(course);
      // //   return;
      // // }

      return { section, sectionCriterias };
    }));

    return {
      ...course,
      courseSections: courseSectionsWithCriteria
    };
  }));

  if (erroredCourses.length > 0) {
    console.log(erroredCourses);
  }
  return coursesWithSections;
}


const getCourses = async () => {
  const departments = JSON.parse(fs.readFileSync('departments.json', 'utf8')).result;

  let cookie;
  const courses = await Promise.all(departments.map(async (department) => {
    if (department.value !== '571') return;
    try {
      console.log(department.text);
      const properties = getCourseProperties(department.value, cookie);
      const response = await sendRequest(URL, properties);
      if (!response) {
        console.log('courses cannot be fetched');
        return;
      }
      const rawCourses = await response.text();
      cookie = response.headers.get('set-cookie') || cookie;
      const courses = await getCoursesForDepartment(department, rawCourses, cookie);
      return {
        department,
        courses
      };
    } catch (error) {
      console.log(error);
    }
  }));



  fs.writeFile('courses.json', JSON.stringify(courses), 'utf8', (err) => {
    if (err) {
      console.log(err);
    }
  });

}

const main = async () => {
  // await getDepartments();
  await getCourses();
}

main();