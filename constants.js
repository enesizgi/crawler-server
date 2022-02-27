export const viewProgramCourseDetailsURL = 'https://oibs2.metu.edu.tr/View_Program_Course_Details_64/main.php';
export const viewProgramDetailsURL = 'https://oibs.metu.edu.tr/cgi-bin/View_Program_Details_58/View_Program_Details_58.cgi';

export const excludeList = [
  'SUMMER PRACTICE',
  'YAZ STAJI',
  'YÜKSEK LİSANS TEZ',
  'DOKTORA TEZ',
  'M.S. THESIS',
  'PH.D. THESIS'
];

export const getCourseProperties = (department, cookie) => {
  return {
    headers: {
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Connection": "Keep-Alive",
      "Keep-Alive": "timeout=15, max=98"
    },
    body: `textWithoutThesis=1&select_dept=${department}&select_semester=20212&submit_CourseList=Submit&hidden_redir=Login`,
    method: "POST"
  };
}

export const getCourseInfoProperties = (courseCode, cookie) => {
  return {
    headers: {
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Connection": "Keep-Alive",
      "Keep-Alive": "timeout=15, max=98"
    },
    body: `SubmitCourseInfo=Course+Info&text_course_code=${courseCode}&hidden_redir=Course_List`,
    method: "POST"
  };
}

export const getSectionInfoProperties = (sectionNumber, cookie) => {
  return {
    headers: {
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Connection": "Keep-Alive",
      "Keep-Alive": "timeout=15, max=98"
    },
    body: `submit_section=${sectionNumber}&hidden_redir=Course_Info`,
    method: "POST"
  };
}

export const getBackToCourseSectionProperties = (cookie) => {
  return {
    headers: {
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Connection": "Keep-Alive",
      "Keep-Alive": "timeout=15, max=98"
    },
    body: "SubmitBack=Back&hidden_redir=Course_Sections",
    method: "POST"
  };
}

export const getBackToCourseListProperties = (cookie) => {
  return {
    headers: {
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
      "Cookie": cookie,
      "Connection": "Keep-Alive",
      "Keep-Alive": "timeout=15, max=98"
    },
    body: "SubmitBack=Back&hidden_redir=Course_Info",
    method: "POST"
  };
}

export const getDepAbbreviationsProperties = () => {
  return {
    headers: {
      "cache-control": "max-age=0",
      "content-type": "application/x-www-form-urlencoded",
    },
    body: "SubmitName=Submit&SaFormName=action_index__Findex_html",
    method: "POST"
  };
}