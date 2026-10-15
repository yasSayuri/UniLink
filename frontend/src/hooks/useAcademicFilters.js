import { useEffect, useState } from 'react';
import { getCampuses, getCourses, getInstitutions } from '../utils/academicCatalogApi';

export default function useAcademicFilters(onError) {
  const [institutions, setInstitutions] = useState([]);
  const [campuses, setCampuses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filterInstitution, setFilterInstitution] = useState('');
  const [filterInstitutionDomain, setFilterInstitutionDomain] = useState('');
  const [filterCampus, setFilterCampus] = useState('');
  const [filterCourse, setFilterCourse] = useState('');
  const [campusesLoading, setCampusesLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getInstitutions(), getCampuses('', ''), getCourses('', '', '')])
      .then(([institutionOptions, campusOptions, courseOptions]) => {
        if (!active) return;
        setInstitutions(institutionOptions);
        setCampuses(campusOptions);
        setCourses(courseOptions);
      })
      .catch((error) => {
        if (active) onError?.(error);
      });
    return () => {
      active = false;
    };
  }, [onError]);

  const handleInstitutionChange = async (value) => {
    setFilterInstitution(value);
    const selected = institutions.find((item) => item.name === value);
    const domain = selected?.domains?.[0] || '';
    setFilterInstitutionDomain(domain);
    setFilterCampus('');
    setFilterCourse('');
    if (!value) {
      setCampusesLoading(true);
      setCoursesLoading(true);
      try {
        const [campusOptions, courseOptions] = await Promise.all([
          getCampuses('', ''),
          getCourses('', '', ''),
        ]);
        setCampuses(campusOptions);
        setCourses(courseOptions);
      } catch (error) {
        onError?.(error);
      } finally {
        setCampusesLoading(false);
        setCoursesLoading(false);
      }
      return;
    }

    setCampusesLoading(true);
    try {
      setCampuses(await getCampuses(value, domain));
    } catch (error) {
      onError?.(error);
    } finally {
      setCampusesLoading(false);
    }
  };

  const handleCampusChange = async (value) => {
    setFilterCampus(value);
    setFilterCourse('');
    if (!value) {
      setCoursesLoading(true);
      try {
        setCourses(await getCourses(filterInstitution, filterInstitutionDomain, ''));
      } catch (error) {
        onError?.(error);
      } finally {
        setCoursesLoading(false);
      }
      return;
    }

    setCoursesLoading(true);
    try {
      setCourses(await getCourses(filterInstitution, filterInstitutionDomain, value));
    } catch (error) {
      onError?.(error);
    } finally {
      setCoursesLoading(false);
    }
  };

  return {
    institutions,
    campuses,
    courses,
    filterInstitution,
    filterCampus,
    filterCourse,
    campusesLoading,
    coursesLoading,
    handleInstitutionChange,
    handleCampusChange,
    setFilterCourse,
    matchesFilters: (post) => (
      (!filterInstitution || post.institutionName === filterInstitution)
      && (!filterCampus || post.campus === filterCampus)
      && (!filterCourse || post.course === filterCourse)
    ),
  };
}
